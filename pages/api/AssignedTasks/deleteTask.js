import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp;
let adminDb;

const initAdmin = () => {
  if (adminDb) return { adminDb };
  const existing = getApps().find((a) => a.name === 'admin-database');
  if (existing) adminApp = existing;
  else {
    const serviceAccount = JSON.parse(process.env.ADMIN_SERVICE_ACCOUNT || '{}');
    adminApp = initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id }, 'admin-database');
  }
  adminDb = getFirestore(adminApp);
  return { adminDb };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { companyId, internId, taskId, collection } = req.body || {};
  if (!companyId || !internId || !taskId) return res.status(400).json({ error: 'companyId, internId and taskId are required' });

  try {
    const { adminDb } = initAdmin();

    const collName = collection === 'completed_tasks' ? 'completed_tasks' : 'pending_tasks';
    const taskRef = adminDb
      .collection('users')
      .doc(companyId)
      .collection('interns')
      .doc(internId)
      .collection('tasks')
      .doc('task-data')
      .collection(collName)
      .doc(taskId);

    const snap = await taskRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Task not found' });

    await taskRef.delete();

    return res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
}
