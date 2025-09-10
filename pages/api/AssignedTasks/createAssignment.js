import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Try to import uuid, fallback to null if not available
let uuidv4 = null;
try {
  const uuid = require('uuid');
  uuidv4 = uuid.v4;
} catch (error) {
  console.log('UUID package not available, will use Firestore auto-generated IDs');
}

// Initialize Firebase Admin SDK for different databases
let employeeApp, internApp, adminApp;
let employeeDb, internDb, adminDb;

const initializeDatabases = () => {
  // Employee Database (current project)
  if (!employeeApp) {
    try {
      const existing = getApps().find((a) => a.name === 'employee-database');
      if (existing) {
        employeeApp = existing;
      } else {
        const serviceAccount = JSON.parse(process.env.EMPLOYEE_SERVICE_ACCOUNT);
        employeeApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'employee-database');
      }
      employeeDb = getFirestore(employeeApp);
    } catch (error) {
      console.error('Error initializing employee Firebase:', error);
    }
  }

  // Intern Database
  if (!internApp) {
    try {
      const existing = getApps().find((a) => a.name === 'intern-database');
      if (existing) {
        internApp = existing;
      } else {
        const serviceAccount = JSON.parse(process.env.INTERN_SERVICE_ACCOUNT);
        internApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'intern-database');
      }
      internDb = getFirestore(internApp);
    } catch (error) {
      console.error('Error initializing intern Firebase:', error);
    }
  }

  // Admin Database
  if (!adminApp) {
    try {
      const existing = getApps().find((a) => a.name === 'admin-database');
      if (existing) {
        adminApp = existing;
      } else {
        const serviceAccount = JSON.parse(process.env.ADMIN_SERVICE_ACCOUNT);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'admin-database');
      }
      adminDb = getFirestore(adminApp);
    } catch (error) {
      console.error('Error initializing admin Firebase:', error);
    }
  }

  return { employeeDb, internDb, adminDb };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // createAssignment API called

  try {
    const { 
      companyId, 
      assignmentData, 
      selectedInternIds
    } = req.body;

    if (!companyId || !assignmentData) {
      return res.status(400).json({ error: 'Company ID and assignment data are required' });
    }

    const { employeeDb, internDb, adminDb } = initializeDatabases();

    // Prepare and sanitize data (no undefined values)
    const cleanLinks = Array.isArray(assignmentData.links)
      ? assignmentData.links.filter((l) => typeof l === 'string' && l.trim() !== '')
      : [];

    // Fetch intern details for each selected intern directly from intern Firebase
    const internDetails = [];
    for (const internId of selectedInternIds) {
      try {
        if (!internDb) throw new Error('Intern database not initialized');
        const internDocRef = internDb.collection('users').doc(companyId).collection('interns').doc(internId);
        const internSnap = await internDocRef.get();
        if (internSnap.exists) {
          const data = internSnap.data() || {};
          // Construct name from available fields
          const first = (data.firstName || data.first_name || '').toString().trim();
          const last = (data.lastName || data.last_name || '').toString().trim();
          const fullName = (data.name || `${first} ${last}`.trim() || `Intern ${internId}`).toString();
          const email = (data.email || data.emailAddress || data.contact?.email || '').toString() || `intern${internId}@company.com`;

          internDetails.push({
            internId: internId,
            internName: fullName,
            internEmail: email,
            internRole: data.role || data.internRole || 'Intern'
          });
        } else {
          // If doc doesn't exist, push fallback
          internDetails.push({
            internId: internId,
            internName: `Intern ${internId}`,
            internEmail: `intern${internId}@company.com`,
            internRole: 'Intern'
          });
        }
      } catch (error) {
        // On any error, fallback with sensible defaults
        internDetails.push({
          internId: internId,
          internName: `Intern ${internId}`,
          internEmail: `intern${internId}@company.com`,
          internRole: 'Intern'
        });
      }
    }

    const standardizedData = {
      taskName: assignmentData.title || '',
      description: assignmentData.description || '',
      status: 'pending',
      links: cleanLinks,
      assignedBy: assignmentData.employeeName || '',
      assignedById: assignmentData.employeeId || '',
      assignedByRole: 'Employee',
      assignedAt: assignmentData.assignedAt || new Date().toISOString(),
      dueDate: assignmentData.dueDate || '',
      priority: assignmentData.priority || 'Medium',
      category: assignmentData.department || '',
      messageToIntern: assignmentData.messageToIntern || '',
      syncedAt: new Date().toISOString()
    };

    // Only save intern tasks to Admin Database under: users/{companyId}/interns/{internId}/tasks/task-data
    let employeeSuccess = false;
    let internSuccess = false;
    let adminSuccess = false;
    const generatedDocIds = [];

    if (!adminDb) {
      console.error('Admin database is not initialized');
      return res.status(500).json({ error: 'Admin database not available' });
    }

    try {
      if (!selectedInternIds || selectedInternIds.length === 0) {
        return res.status(400).json({ error: 'No interns provided', details: 'Please provide at least one intern to assign the task to' });
      }

      // Ensure company document exists and then write tasks under the requested admin path
      for (const internId of selectedInternIds) {
        const internDetail = internDetails.find(detail => detail.internId === internId);
        const adminData = {
          ...standardizedData,
          internId: internId,
          internName: internDetail?.internName || `Intern ${internId}`,
          internEmail: internDetail?.internEmail || `intern${internId}@company.com`,
          internRole: internDetail?.internRole || 'Intern'
        };

        // Ensure parent company doc
        const companyDocRef = adminDb.collection('users').doc(companyId);
        const companyDoc = await companyDocRef.get();
        if (!companyDoc.exists) {
          await companyDocRef.set({ companyId, createdAt: new Date().toISOString() });
        }

        // Ensure intern doc under users/{companyId}/interns/{internId}
        const internDocRef = companyDocRef.collection('interns').doc(internId);
        const internDoc = await internDocRef.get();
        if (!internDoc.exists) {
          await internDocRef.set({
            internId,
            role: 'Intern',
            email: internDetail?.internEmail || `intern${internId}@company.com`,
            name: internDetail?.internName || `Intern ${internId}`,
            createdAt: new Date().toISOString()
          });
        }

        // Ensure task-data doc exists at users/{companyId}/interns/{internId}/tasks/task-data
        const taskDataDocRef = internDocRef.collection('tasks').doc('task-data');
        const taskDataDoc = await taskDataDocRef.get();
        if (!taskDataDoc.exists) {
          await taskDataDocRef.set({
            createdAt: new Date().toISOString(),
            internId,
            role: 'Intern',
            email: internDetail?.internEmail || `intern${internId}@company.com`,
            name: internDetail?.internName || `Intern ${internId}`
          });
        }

        let docId = null;
        if (uuidv4) {
          docId = uuidv4();
          await taskDataDocRef.collection('pending_tasks').doc(docId).set(adminData);
        } else {
          const added = await taskDataDocRef.collection('pending_tasks').add(adminData);
          docId = added.id;
        }

        generatedDocIds.push({ docId, internId });
      }

      adminSuccess = true;
      console.log('Successfully saved intern tasks to admin DB at users/{companyId}/interns/{internId}/tasks/task-data');
    } catch (error) {
      console.error('Error saving intern tasks to admin DB:', error);
      return res.status(500).json({ error: 'Failed to save intern tasks to admin DB', details: error.message });
    }

    // Return success response (only employee database success matters for user feedback)
    return res.status(200).json({
      success: true,
      message: 'Assignment created successfully',
      databaseStatus: {
        employee: employeeSuccess,
        intern: internSuccess,
        admin: adminSuccess
      }
    });

  } catch (error) {
    console.error('Error in createAssignment:', error);
    return res.status(500).json({
      error: 'Failed to create assignment',
      details: error.message
    });
  }
}
