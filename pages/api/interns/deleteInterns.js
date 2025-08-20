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
    const { companyId, internId } = req.body;

    if (!companyId || !internId) {
      return res.status(400).json({ error: 'Company ID and intern ID are required' });
    }

    const db = initializeInternFirebase();
    const internRef = db.collection('users').doc(companyId).collection('interns').doc(internId);
    
    await internRef.delete();

    return res.status(200).json({ 
      success: true,
      message: 'Intern deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to delete intern',
      details: error.message 
    });
  }
}
