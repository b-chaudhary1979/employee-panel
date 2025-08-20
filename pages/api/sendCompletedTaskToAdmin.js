import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for admin database
let adminApp;
let adminDb;

const initializeAdminFirebase = () => {
  if (!adminApp) {
    try {
      const existing = getApps().find((a) => a.name === 'admin-database');
      if (existing) {
        adminApp = existing;
      } else {
        const adminServiceAccount = JSON.parse(process.env.ADMIN_SERVICE_ACCOUNT);
        adminApp = initializeApp({
          credential: cert(adminServiceAccount),
          projectId: adminServiceAccount.project_id
        }, 'admin-database');
      }

      adminDb = getFirestore(adminApp);
    } catch (error) {
      throw new Error('Failed to initialize admin database connection');
    }
  }
  return adminDb;
};

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://intern-management-system-2.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      companyId, 
      employeeId, 
      taskId, 
      taskData, 
      submissionLinks, 
      submittedAt,
      status = 'completed'
    } = req.body;

    // Validate required parameters
    if (!companyId || !employeeId || !taskId || !taskData || !submissionLinks) {
      return res.status(400).json({ 
        error: 'Missing required parameters: companyId, employeeId, taskId, taskData, submissionLinks' 
      });
    }

    // Initialize admin database
    const adminFirestore = initializeAdminFirebase();

    // Prepare the task data for admin database
    const { companyId: _omitCompanyIdFromTask, ...sanitizedTaskData } = taskData || {};
    const adminTaskData = {
      ...sanitizedTaskData,
      submissionLinks: submissionLinks,
      submittedAt: submittedAt || new Date().toISOString(),
      status: status,
      employeeId: employeeId,
      originalTaskId: taskId,
      syncedAt: new Date().toISOString(),
      source: 'employee-panel',
      lastUpdated: new Date().toISOString()
    };

    // Ensure parent documents and collections exist in admin database
    try {
      // Create users/{companyId} document if it doesn't exist
      const userDocRef = adminFirestore.collection('users').doc(companyId);
      await userDocRef.set({ 
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Create users/{companyId}/employee_tasks/{employeeId} document if it doesn't exist
      const employeeTasksDocRef = userDocRef.collection('employee_tasks').doc(employeeId);
      await employeeTasksDocRef.set({ 
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
              // Warning: Could not ensure parent documents in admin database
    }

    // Remove from admin pending_tasks collection if it exists
    try {
      const adminPendingCollectionRef = adminFirestore
        .collection('users')
        .doc(companyId)
        .collection('employee_tasks')
        .doc(employeeId)
        .collection('pending_tasks');

      const byIdRef = adminPendingCollectionRef.doc(taskId);
      const byIdSnap = await byIdRef.get();
      if (byIdSnap.exists) {
        await byIdRef.delete();
      } else {
        // Try by originalTaskId
        try {
          const byOriginalIdSnap = await adminPendingCollectionRef
            .where('originalTaskId', '==', taskId)
            .get();
          if (!byOriginalIdSnap.empty) {
            const batch = adminFirestore.batch();
            byOriginalIdSnap.forEach((docSnap) => batch.delete(docSnap.ref));
            await batch.commit();
          }
        } catch (qErr) {
          // Warning: query by originalTaskId failed
        }

        // Try by taskName as a fallback
        if (taskData?.taskName) {
          try {
            const byNameSnap = await adminPendingCollectionRef
              .where('taskName', '==', taskData.taskName)
              .get();
            if (!byNameSnap.empty) {
              const batch = adminFirestore.batch();
              byNameSnap.forEach((docSnap) => batch.delete(docSnap.ref));
              await batch.commit();
            }
          } catch (qErr) {
            // Warning: query by taskName failed
          }
        }
      }
    } catch (error) {
              // Warning: Could not delete from admin
    }

    // Store in admin database
    // Path: users/{companyId}/employee_tasks/{employeeId}/completed_tasks/{taskId}
    const adminTaskRef = adminFirestore
      .collection('users')
      .doc(companyId)
      .collection('employee_tasks')
      .doc(employeeId)
      .collection('completed_tasks')
      .doc(taskId);

    await adminTaskRef.set(adminTaskData);

    // Also store in a general completed tasks collection for easy querying
    const generalCompletedTaskRef = adminFirestore
      .collection('completed_tasks')
      .doc(`${companyId}_${employeeId}_${taskId}`);

    await generalCompletedTaskRef.set({
      ...adminTaskData,
      compositeId: `${companyId}_${employeeId}_${taskId}`,
      taskType: 'employee_task'
    });

   
    return res.status(200).json({ 
      success: true,
      message: 'Task successfully sent to admin database',
      taskId: taskId,
      adminPath: `users/${companyId}/employee_tasks/${employeeId}/completed_tasks/${taskId}`,
      submittedAt: adminTaskData.submittedAt
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to send task to admin database',
      details: error.message 
    });
  }
}
