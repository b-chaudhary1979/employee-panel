import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp;
let adminDb;

const initAdmin = () => {
  if (adminDb) return { adminDb };
  try {
    const existing = getApps().find((a) => a.name === 'admin-database');
    if (existing) {
      adminApp = existing;
    } else {
      const serviceAccount = JSON.parse(process.env.ADMIN_SERVICE_ACCOUNT || '{}');
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      }, 'admin-database');
    }
    adminDb = getFirestore(adminApp);
    return { adminDb };
  } catch (error) {
    throw new Error('Failed to initialize admin database: ' + (error.message || error));
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { companyId, employeeId } = req.body || {};
  console.log('getAssignedTasks called for companyId:', companyId, 'employeeId:', employeeId);
  if (!companyId) {
    console.warn('getAssignedTasks missing companyId');
    return res.status(400).json({ error: 'companyId is required' });
  }
  if (!employeeId) {
    console.warn('getAssignedTasks missing employeeId');
    return res.status(400).json({ error: 'employeeId is required' });
  }

  try {
    const { adminDb } = initAdmin();

  const internsRef = adminDb.collection('users').doc(companyId).collection('interns');
  const internsSnap = await internsRef.get();
  console.log(`Found ${internsSnap.size} interns in admin DB for company ${companyId}`);

    const pendingTasks = [];
    const completedTasks = [];

    for (const internDoc of internsSnap.docs) {
      const internId = internDoc.id;
      const internData = internDoc.data() || {};

      const pendingRef = internDoc.ref.collection('tasks').doc('task-data').collection('pending_tasks');
      const pendingSnap = await pendingRef.orderBy('assignedAt', 'desc').get().catch(() => null);
      if (pendingSnap && !pendingSnap.empty) {
        pendingSnap.forEach((taskDoc) => {
          const t = taskDoc.data() || {};
          // Only include tasks assigned by the requested employeeId
          const assignedById = (t.assignedById || t.assignedBy || '').toString();
          if (assignedById !== String(employeeId)) return;
          pendingTasks.push({
            id: taskDoc.id,
            internId,
            internName: internData.name || `${internId}`,
            internEmail: internData.email || `intern${internId}@company.com`,
            internRole: internData.role || 'Intern',
            status: t.status || 'pending',
            ...t
          });
        });
      }

      const completedRef = internDoc.ref.collection('tasks').doc('task-data').collection('completed_tasks');
      const completedSnap = await completedRef.get().catch(() => null);
      if (completedSnap && !completedSnap.empty) {
        completedSnap.forEach((taskDoc) => {
          const t = taskDoc.data() || {};
          const assignedById = (t.assignedById || t.assignedBy || '').toString();
          if (assignedById !== String(employeeId)) return;
          completedTasks.push({
            id: taskDoc.id,
            internId,
            internName: internData.name || `${internId}`,
            internEmail: internData.email || `intern${internId}@company.com`,
            internRole: internData.role || 'Intern',
            status: t.status || 'completed',
            ...t
          });
        });
      }
    }

  console.log(`Returning ${pendingTasks.length} pending and ${completedTasks.length} completed tasks`);
  return res.status(200).json({ success: true, pendingTasks, completedTasks });
  } catch (error) {
    console.error('getAssignedTasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned tasks', details: error.message });
  }
}
