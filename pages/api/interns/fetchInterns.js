import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for intern database
let internApp;
let internDb;

const initializeInternFirebase = () => {
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
      throw new Error('Failed to initialize intern database connection');
    }
  }
  return internDb;
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get companyId from query params for GET requests or from body for POST requests
    const companyId = req.method === 'GET' ? req.query.companyId : req.body.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const db = initializeInternFirebase();
    const internsRef = db.collection('users').doc(companyId).collection('interns');
    const snapshot = await internsRef.get();

    const interns = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure all ID fields are consistent
      const internId = data.internId || doc.id;
      interns.push({
        ...data,
        // Ensure all ID fields have the same value
        id: internId,
        originalId: internId,
        internId: internId
      });
    });

    return res.status(200).json({ 
      success: true,
      interns 
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch interns',
      details: error.message 
    });
  }
}
