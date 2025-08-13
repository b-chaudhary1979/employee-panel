import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import CryptoJS from 'crypto-js';

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

// Department code mapping
const getDepartmentCode = (department) => {
  const departmentMap = {
    'Software Development': 'SDE',
    'SEO': 'SEO',
    'UI/UX Design': 'UIX',
    'Content Writing': 'CON',
    'Social Media Management': 'SMM',
    'Sales': 'SAL',
    'Digital Marketing': 'DIG'
  };
  return departmentMap[department] || 'GEN';
};

// Format date to DDMMYY
const formatDateToDDMMYY = (dateString) => {
  if (!dateString) return '000000';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
};

// Generate SHA-256 hash and get first 4 characters
const generateHash = (name, email, phone, startDate) => {
  const dataString = `${name}${email}${phone}${startDate}`;
  const hash = CryptoJS.SHA256(dataString).toString();
  return hash.substring(0, 4).toUpperCase();
};

// Generate new intern ID
const generateInternId = (internData) => {
  const { name, email, phone, department, startDate } = internData;
  
  // Get department code
  const deptCode = getDepartmentCode(department);
  
  // Format date
  const dateCode = formatDateToDDMMYY(startDate);
  
  // Generate hash
  const hashCode = generateHash(name, email, phone, startDate);
  
  // Combine to form ID
  return `IID-${deptCode}-${dateCode}-${hashCode}`;
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
    const { companyId, internData } = req.body;

    if (!companyId || !internData) {
      return res.status(400).json({ error: 'Company ID and intern data are required' });
    }

    const db = initializeInternFirebase();
    
    // Generate new intern ID using the new pattern
    const newId = generateInternId(internData);
    
    const internToAdd = {
      ...internData,
      id: newId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await db.collection('users').doc(companyId).collection('interns').doc(newId).set(internToAdd);

    return res.status(200).json({ 
      success: true,
      internId: newId,
      message: 'Intern added successfully'
    });

  } catch (error) {
    console.error('Error adding intern:', error);
    return res.status(500).json({ 
      error: 'Failed to add intern',
      details: error.message 
    });
  }
}
