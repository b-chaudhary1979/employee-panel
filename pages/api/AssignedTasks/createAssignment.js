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

  console.log('createAssignment API called with:', {
    companyId: req.body.companyId,
    assigneeType: req.body.assigneeType,
    selectedInternIds: req.body.selectedInternIds,
    assignmentDataKeys: Object.keys(req.body.assignmentData || {}),
    employeeIds: req.body.assignmentData?.employeeIds
  });

  try {
    const { 
      companyId, 
      assignmentData, 
      selectedInternIds, 
      assigneeType 
    } = req.body;

    if (!companyId || !assignmentData) {
      return res.status(400).json({ error: 'Company ID and assignment data are required' });
    }

    const { employeeDb, internDb, adminDb } = initializeDatabases();

    // Standardize the assignment data structure
    const standardizedData = {
      taskName: assignmentData.title,
      description: assignmentData.description || '',
      status: 'pending',
      links: assignmentData.links || assignmentData.resources || [], // Handle both links and resources
      assignedBy: assignmentData.employeeName || '',
      assignedById: assignmentData.employeeId || '',
      assignedByRole: 'Employee', // Hardcoded to "Employee" for all databases
      assignedAt: assignmentData.assignedAt || new Date().toISOString(),
      dueDate: assignmentData.dueDate || '',
      priority: assignmentData.priority || 'Medium',
      category: assignmentData.department || '',
      syncedAt: new Date().toISOString(),
      mentor: assignmentData.mentorName || '',
      requirements: assignmentData.requirements || [],
      evaluationCriteria: assignmentData.evaluationCriteria || [],
      mentorFeedback: assignmentData.mentorFeedback || '',
      message: assignmentData.message || '',
      assigneeType: assigneeType
    };

    let employeeSuccess = false;
    let internSuccess = false;
    let adminSuccess = false;
    let generatedDocIds = []; // Store generated document IDs - moved outside try block

                                       // 1. Save to Employee Database (current project) - Generate document IDs
       try {
         console.log('Starting employee database save...');
         
         if (assigneeType === 'intern' && selectedInternIds && selectedInternIds.length > 0) {
           console.log(`Creating assignments for ${selectedInternIds.length} interns:`, selectedInternIds);
           // Create assignment for each selected intern
           for (const internId of selectedInternIds) {
             const internData = {
               ...standardizedData,
               internId,
               internName: assignmentData.internName || 'Unknown Intern'
             };
             
             // Debug: Log the data being saved
             console.log(`Data to be saved for intern ${internId}:`, JSON.stringify(internData, null, 2));
             
             let docId;
             if (uuidv4) {
               // Use UUID if available
               docId = uuidv4();
               console.log(`Using UUID for intern: ${internId} with docId: ${docId}`);
               
               // Validate data before saving
               if (!internData.taskName || !internData.description) {
                 console.error(`Missing required fields for intern ${internId}:`, {
                   taskName: !!internData.taskName,
                   description: !!internData.description
                 });
                 throw new Error(`Missing required fields for intern ${internId}`);
               }
               
               try {
                 // First, check if the employee document exists
                 const employeeDoc = await employeeDb
                   .collection('users')
                   .doc(companyId)
                   .collection('employees')
                   .doc(assignmentData.employeeId)
                   .get();
                 
                 if (!employeeDoc.exists) {
                   console.log(`Employee document does not exist: ${assignmentData.employeeId}, creating it...`);
                   await employeeDb
                     .collection('users')
                     .doc(companyId)
                     .collection('employees')
                     .doc(assignmentData.employeeId)
                     .set({
                       employeeId: assignmentData.employeeId,
                       createdAt: new Date().toISOString()
                     });
                 }
                 
                 // Check if intern_tasks document exists
                 const internTasksDoc = await employeeDb
                   .collection('users')
                   .doc(companyId)
                   .collection('employees')
                   .doc(assignmentData.employeeId)
                   .collection('intern_tasks')
                   .doc(internId)
                   .get();
                 
                 if (!internTasksDoc.exists) {
                   console.log(`Intern tasks document does not exist for intern: ${internId}, creating it...`);
                   await employeeDb
                     .collection('users')
                     .doc(companyId)
                     .collection('employees')
                     .doc(assignmentData.employeeId)
                     .collection('intern_tasks')
                     .doc(internId)
                     .set({
                       internId: internId,
                       createdAt: new Date().toISOString()
                     });
                 }
                 
                 // Now write the actual task data
                 await employeeDb
                   .collection('users')
                   .doc(companyId)
                   .collection('employees')
                   .doc(assignmentData.employeeId)
                   .collection('intern_tasks')
                   .doc(internId)
                   .collection('pending_tasks')
                   .doc(docId)
                   .set(internData);
                 console.log(`Successfully wrote data to employee DB for intern ${internId}`);
               } catch (writeError) {
                 console.error(`Error writing to employee DB for intern ${internId}:`, writeError);
                 throw writeError;
               }
                            } else {
                 // Use Firestore auto-generated ID
                 console.log(`Using Firestore auto-generated ID for intern: ${internId}`);
                 try {
                   const docRef = await employeeDb
                     .collection('users')
                     .doc(companyId)
                     .collection('employees')
                     .doc(assignmentData.employeeId)
                     .collection('intern_tasks')
                     .doc(internId)
                     .collection('pending_tasks')
                     .add(internData);
                   docId = docRef.id;
                   console.log(`Successfully wrote data to employee DB for intern ${internId} with auto-generated ID: ${docId}`);
                 } catch (writeError) {
                   console.error(`Error writing to employee DB for intern ${internId}:`, writeError);
                   throw writeError;
                 }
               }
             
             generatedDocIds.push({ docId, internId, type: 'intern' });
             console.log(`Saved to employee DB for intern: ${internId} with docId: ${docId}`);
           }
         } else if (assigneeType === 'employee') {
           // Create assignment for employees
           console.log('Processing employee assignment with employeeIds:', assignmentData.employeeIds);
           
           // Handle case where employeeIds might be undefined, null, or empty
           const employeeIds = assignmentData.employeeIds || [];
           if (employeeIds.length === 0) {
             console.log('No employee IDs provided, skipping employee assignment');
             return res.status(400).json({ 
               error: 'No employee IDs provided for employee assignment',
               details: 'Please provide at least one employee ID'
             });
           }
           
           for (const employeeId of employeeIds) {
             if (employeeId && employeeId.trim()) {
               const employeeData = {
                 ...standardizedData,
                 employeeId: employeeId.trim()
               };
               
               let docId;
               if (uuidv4) {
                 // Use UUID if available
                 docId = uuidv4();
                 console.log(`Using UUID for employee: ${employeeId.trim()} with docId: ${docId}`);
                 await employeeDb
                   .collection('users')
                   .doc(companyId)
                   .collection('employees')
                   .doc(employeeId.trim())
                   .collection('pending_tasks')
                   .doc(docId)
                   .set(employeeData);
               } else {
                 // Use Firestore auto-generated ID
                 console.log(`Using Firestore auto-generated ID for employee: ${employeeId.trim()}`);
                 const docRef = await employeeDb
                   .collection('users')
                   .doc(companyId)
                   .collection('employees')
                   .doc(employeeId.trim())
                   .collection('pending_tasks')
                   .add(employeeData);
                 docId = docRef.id;
               }
               
               generatedDocIds.push({ docId, employeeId: employeeId.trim(), type: 'employee' });
               console.log(`Saved to employee DB for employee: ${employeeId.trim()} with docId: ${docId}`);
             }
           }
         } else {
           // Handle case where assigneeType is neither 'intern' nor 'employee'
           console.log('Invalid assigneeType:', assigneeType);
           return res.status(400).json({ 
             error: 'Invalid assignee type',
             details: `Assignee type must be 'intern' or 'employee', received: ${assigneeType}`
           });
         }
         
         // Check if we actually created any documents
         if (generatedDocIds.length === 0) {
           console.log('No documents were created in employee database');
           return res.status(400).json({ 
             error: 'No documents created',
             details: 'No valid assignments were created in the employee database'
           });
         }
         
         employeeSuccess = true;
         console.log('Successfully saved to employee database with generated docIds:', generatedDocIds);
       } catch (error) {
         console.error('Error saving to employee database:', error);
         return res.status(500).json({ 
           error: 'Failed to save to employee database',
           details: error.message 
         });
       }

                                                                             // 2. Save to Intern Database (if assignee type is intern) - Use same document IDs
        if (assigneeType === 'intern' && selectedInternIds && selectedInternIds.length > 0 && internDb) {
          try {
            // Use the generated document IDs from employee database
            for (const { docId, internId } of generatedDocIds.filter(item => item.type === 'intern')) {
              const internData = {
                ...standardizedData,
                internId,
                internName: assignmentData.internName || 'Unknown Intern'
              };
              
              console.log(`Saving to intern DB for intern: ${internId} with docId: ${docId}`);
              
              // Since users/{companyId}/interns/{internId} always exists,
              // we only need to ensure task-data document exists
              const taskDataRef = internDb
                .collection('users')
                .doc(companyId)
                .collection('interns')
                .doc(internId)
                .collection('tasks')
                .doc('task-data');
              
              // Check if task-data document exists, if not create it
              const taskDataDoc = await taskDataRef.get();
              if (!taskDataDoc.exists) {
                console.log(`Creating task-data document for intern: ${internId}`);
                await taskDataRef.set({
                  createdAt: new Date().toISOString(),
                  internId: internId
                });
              }
              
              // Use the same document ID from employee database
              await taskDataRef
                .collection('pending_tasks')
                .doc(docId)
                .set(internData);
            }
            internSuccess = true;
            console.log('Successfully saved to intern database with same document IDs');
          } catch (error) {
            console.error('Error saving to intern database:', error);
            // Continue execution - don't fail the request
          }
        }

                                                                                                                                                                                                                                                                                                                               // 3. Save to Admin Database - Use same document IDs
        if (adminDb) {
          try {
            if (assigneeType === 'intern' && selectedInternIds && selectedInternIds.length > 0) {
              // Use the generated document IDs from employee database
              for (const { docId, internId } of generatedDocIds.filter(item => item.type === 'intern')) {
                const adminData = {
                  ...standardizedData,
                  internId,
                  internName: assignmentData.internName || 'Unknown Intern'
                };
                
                console.log(`Saving to admin DB for intern: ${internId} with docId: ${docId}`);
                
                // First, check if the company document exists in admin DB
                const companyDoc = await adminDb
                  .collection('users')
                  .doc(companyId)
                  .get();
                
                if (!companyDoc.exists) {
                  console.log(`Company document does not exist in admin DB: ${companyId}, creating it...`);
                  await adminDb
                    .collection('users')
                    .doc(companyId)
                    .set({
                      companyId: companyId,
                      createdAt: new Date().toISOString()
                    });
                }
                
                // Check if intern_tasks document exists
                const internTasksDoc = await adminDb
                  .collection('users')
                  .doc(companyId)
                  .collection('intern_tasks')
                  .doc(internId)
                  .get();
                
                if (!internTasksDoc.exists) {
                  console.log(`Intern tasks document does not exist in admin DB for intern: ${internId}, creating it...`);
                  await adminDb
                    .collection('users')
                    .doc(companyId)
                    .collection('intern_tasks')
                    .doc(internId)
                    .set({
                      internId: internId,
                      createdAt: new Date().toISOString()
                    });
                }
                
                // Now write the actual task data
                await adminDb
                  .collection('users')
                  .doc(companyId)
                  .collection('intern_tasks')
                  .doc(internId)
                  .collection('pending_tasks')
                  .doc(docId)
                  .set(adminData);
                  
                console.log(`Successfully wrote data to admin DB for intern ${internId}`);
              }
            }
            adminSuccess = true;
            console.log('Successfully saved to admin database with same document IDs');
          } catch (error) {
            console.error('Error saving to admin database:', error);
            // Continue execution - don't fail the request
          }
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
