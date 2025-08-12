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
      console.error('Error initializing intern Firebase:', error);
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
    const { companyId, internId, updates } = req.body;

    if (!companyId || !internId || !updates) {
      return res.status(400).json({ error: 'Company ID, intern ID, and updates are required' });
    }

    const db = initializeInternFirebase();
    const internRef = db.collection('users').doc(companyId).collection('interns').doc(internId);
    
    const updateData = {
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    await internRef.update(updateData);

    return res.status(200).json({ 
      success: true,
      message: 'Intern updated successfully'
    });

  } catch (error) {
    console.error('Error updating intern:', error);
    return res.status(500).json({ 
      error: 'Failed to update intern',
      details: error.message 
    });
  }
}
