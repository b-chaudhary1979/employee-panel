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
    selectedInternIds: req.body.selectedInternIds,
    assignmentDataKeys: Object.keys(req.body.assignmentData || {}),
  });

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

    // Fetch intern details for each selected intern
    const internDetails = [];
    for (const internId of selectedInternIds) {
      try {
        // Fetch intern details from intern database
        const internResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/interns/fetchInterns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId }),
        });

        if (internResponse.ok) {
          const internData = await internResponse.json();
          const intern = internData.interns.find(i => i.id === internId);
          if (intern) {
            internDetails.push({
              internId: internId,
              internName: `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unknown Intern",
              internEmail: intern.email || `intern${internId}@company.com`,
              internRole: "Intern"
            });
          } else {
            // Fallback if intern not found
            internDetails.push({
              internId: internId,
              internName: `Intern ${internId}`,
              internEmail: `intern${internId}@company.com`,
              internRole: "Intern"
            });
          }
        } else {
          // Fallback if API call fails
          internDetails.push({
            internId: internId,
            internName: `Intern ${internId}`,
            internEmail: `intern${internId}@company.com`,
            internRole: "Intern"
          });
        }
      } catch (error) {
        console.error(`Error fetching intern ${internId} details:`, error);
        // Fallback if any error occurs
        internDetails.push({
          internId: internId,
          internName: `Intern ${internId}`,
          internEmail: `intern${internId}@company.com`,
          internRole: "Intern"
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
      syncedAt: new Date().toISOString()
    };

    let employeeSuccess = false;
    let internSuccess = false;
    let adminSuccess = false;
    let generatedDocIds = []; // Store generated document IDs - moved outside try block

                                       // 1. Save to Employee Database (current project) - Generate document IDs
       try {
         console.log('Starting employee database save...');
         
         if (selectedInternIds && selectedInternIds.length > 0) {
           console.log(`Creating assignments for ${selectedInternIds.length} interns:`, selectedInternIds);
            // Create assignment for each selected intern
           for (const internId of selectedInternIds) {
             // Find the intern details for this specific intern
             const internDetail = internDetails.find(detail => detail.internId === internId);
             const internData = { 
               ...standardizedData,
               internId: internId,
               internName: internDetail?.internName || `Intern ${internId}`,
               internEmail: internDetail?.internEmail || `intern${internId}@company.com`,
               internRole: internDetail?.internRole || "Intern"
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
         } else {
           return res.status(400).json({ 
             error: 'No interns provided',
             details: 'Please provide at least one intern to assign the task to'
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
         if (selectedInternIds && selectedInternIds.length > 0 && internDb) {
          try {
            // Use the generated document IDs from employee database
            for (const { docId, internId } of generatedDocIds.filter(item => item.type === 'intern')) {
              // Find the intern details for this specific intern
              const internDetail = internDetails.find(detail => detail.internId === internId);
              const internData = { 
                ...standardizedData,
                internId: internId,
                internName: internDetail?.internName || `Intern ${internId}`,
                internEmail: internDetail?.internEmail || `intern${internId}@company.com`,
                internRole: internDetail?.internRole || "Intern"
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
            if (selectedInternIds && selectedInternIds.length > 0) {
              // Use the generated document IDs from employee database
              for (const { docId, internId } of generatedDocIds.filter(item => item.type === 'intern')) {
                // Find the intern details for this specific intern
                const internDetail = internDetails.find(detail => detail.internId === internId);
                const adminData = { 
                  ...standardizedData,
                  internId: internId,
                  internName: internDetail?.internName || `Intern ${internId}`,
                  internEmail: internDetail?.internEmail || `intern${internId}@company.com`,
                  internRole: internDetail?.internRole || "Intern"
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
