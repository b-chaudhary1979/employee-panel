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
  const { companyId, employeeId, date } = req.body || {};
  if (!companyId || !employeeId || !date) return res.status(400).json({ error: 'companyId, employeeId, date required' });

  try {
    const { adminDb } = initAdmin();
    const docRef = adminDb.collection('users').doc(companyId).collection('employees').doc(employeeId).collection('DWR').doc(date);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(200).json({ success: true, doc: null });
    return res.status(200).json({ success: true, doc: snap.data() });
  } catch (error) {
    console.error('DWR get error:', error);
    return res.status(500).json({ error: 'Failed to fetch DWR', details: error.message });
  }
}
