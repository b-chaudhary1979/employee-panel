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

  const { companyId, employeeId, date, points } = req.body || {};
  if (!companyId || !employeeId || !date || !Array.isArray(points)) return res.status(400).json({ error: 'companyId, employeeId, date and points[] are required' });

  try {
    const { adminDb } = initAdmin();

    const docRef = adminDb.collection('users').doc(companyId).collection('employees').doc(employeeId).collection('DWR').doc(date);
    const existing = await docRef.get();
    const now = new Date().toISOString();

    if (existing.exists) {
      const data = existing.data() || {};
      const createdAt = data.createdAt ? new Date(data.createdAt) : null;
      if (createdAt) {
        const hours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hours > 48) {
          return res.status(403).json({ error: 'DWR older than 48 hours cannot be edited' });
        }
      }
      await docRef.update({ points, updatedAt: now });
      return res.status(200).json({ success: true, message: 'DWR updated' });
    }

    await docRef.set({ points, createdAt: now, updatedAt: now });
    return res.status(200).json({ success: true, message: 'DWR saved' });
  } catch (error) {
    console.error('DWR save error:', error);
    return res.status(500).json({ error: 'Failed to save DWR', details: error.message });
  }
}
