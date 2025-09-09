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

  const { companyId, internId, taskId, collection, updates } = req.body || {};
  if (!companyId || !internId || !taskId || !updates) return res.status(400).json({ error: 'companyId, internId, taskId and updates are required' });

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

    // sanitize updates - only allow specific fields
    const allowed = ['title','taskName','description','dueDate','priority','messageToIntern','status','links','category'];
    const clean = {};
    for (const key of Object.keys(updates)) {
      if (allowed.includes(key)) clean[key] = updates[key];
    }

    if (Object.keys(clean).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    await taskRef.update({ ...clean, syncedAt: new Date().toISOString() });

    return res.status(200).json({ success: true, message: 'Task updated' });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
}
