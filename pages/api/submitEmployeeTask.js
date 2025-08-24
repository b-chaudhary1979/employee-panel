import { getFirestore, doc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://intern-management-system-2.vercel.app',
    'https://intern-management-system-2-five.vercel.app/',
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

    // Filter out empty submission links
    const validSubmissionLinks = submissionLinks.filter(link => link.trim() !== '');
    if (validSubmissionLinks.length === 0) {
      return res.status(400).json({ 
        error: 'At least one valid submission link is required' 
      });
    }

    const firestore = getFirestore();
    const batch = writeBatch(firestore);

    // Step 1: Add/Update task in completed_tasks collection
    const completedTaskRef = doc(firestore, 'users', companyId, 'employees', employeeId, 'tasks', 'task-data', 'completed_tasks', taskId);
    
    const completedTaskData = {
      ...taskData,
      submissionLinks: validSubmissionLinks,
      submittedAt: submittedAt || new Date().toISOString(),
      status: status,
      lastUpdated: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    batch.set(completedTaskRef, completedTaskData, { merge: true });

    // Step 2: Remove from pending_tasks collection
    const pendingTaskRef = doc(firestore, 'users', companyId, 'employees', employeeId, 'tasks', 'task-data', 'pending_tasks', taskId);
    batch.delete(pendingTaskRef);

    // Commit the batch operations
    await batch.commit();

    // Step 3: Sync to admin database
    try {
      // Initialize admin Firebase
      let adminApp;
      let adminDb;
      
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
          adminDb = getAdminFirestore(adminApp);
        } catch (error) {
          throw new Error('Failed to initialize admin database connection');
        }
      }

      // Prepare the task data for admin database
      const { companyId: _omitCompanyIdFromTask, ...sanitizedTaskData } = completedTaskData || {};
      const adminTaskData = {
        ...sanitizedTaskData,
        submissionLinks: validSubmissionLinks,
        submittedAt: completedTaskData.submittedAt,
        status: status,
        employeeId: employeeId,
        originalTaskId: taskId,
        syncedAt: new Date().toISOString(),
        source: 'employee-panel',
        lastUpdated: new Date().toISOString()
      };

      // Ensure parent documents exist in admin database
      try {
        const userDocRef = adminDb.collection('users').doc(companyId);
        await userDocRef.set({ 
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });

        const employeeTasksDocRef = userDocRef.collection('employee_tasks').doc(employeeId);
        await employeeTasksDocRef.set({ 
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
      }

      // Remove from admin pending_tasks collection if it exists
      try {
        const adminPendingCollectionRef = adminDb
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
              const batch = adminDb.batch();
              byOriginalIdSnap.forEach((docSnap) => batch.delete(docSnap.ref));
              await batch.commit();
            
            }
          } catch (qErr) {
           
          }

          // Try by taskName as a fallback
          if (taskData?.taskName) {
            try {
             
              const byNameSnap = await adminPendingCollectionRef
                .where('taskName', '==', taskData.taskName)
                .get();
              if (!byNameSnap.empty) {
                const batch = adminDb.batch();
                byNameSnap.forEach((docSnap) => batch.delete(docSnap.ref));
                await batch.commit();
               
              }
            } catch (qErr) {
             
            }
          }
        }
      } catch (error) {
       
      }

      // Store in admin database
      const adminTaskRef = adminDb
        .collection('users')
        .doc(companyId)
        .collection('employee_tasks')
        .doc(employeeId)
        .collection('completed_tasks')
        .doc(taskId);

      await adminTaskRef.set(adminTaskData);

      // Also store in general completed tasks collection
      const generalCompletedTaskRef = adminDb
        .collection('completed_tasks')
        .doc(`${companyId}_${employeeId}_${taskId}`);

      await generalCompletedTaskRef.set({
        ...adminTaskData,
        compositeId: `${companyId}_${employeeId}_${taskId}`,
        taskType: 'employee_task'
      });

    } catch (adminError) {
     
    }

    return res.status(200).json({ 
      success: true,
      message: 'Task successfully submitted and synced',
      taskId: taskId,
      employeePath: `users/${companyId}/employees/${employeeId}/tasks/task-data/completed_tasks/${taskId}`,
      submittedAt: completedTaskData.submittedAt,
      submissionLinks: validSubmissionLinks
    });

  } catch (error) {
   
    return res.status(500).json({ 
      error: 'Failed to submit task',
      details: error.message 
    });
  }
}
