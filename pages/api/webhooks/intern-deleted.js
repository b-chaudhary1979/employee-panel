import admin from 'firebase-admin';
import pathModule from 'path';

// Initialize Firebase Admin for admin panel
let systemDb = null;

function initializeSystem() {
  try {
    // Check if any Firebase app is already initialized
    const existingApps = admin.apps;
    
    let app;
    const appName = 'ims-system';
    
    try {
      app = admin.app(appName);
    } catch (appError) {
      // Load service account
      const serviceAccountPath = pathModule.join(process.cwd(), 'keys', 'intern-service-account.json');
      const fs = require('fs');
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'intern-management-system-5df18'
      }, appName);
    }
    
    systemDb = app.firestore();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get company ID from the intern document path
function extractCompanyIdFromPath(path) {
  // Path format: users/{companyId}/interns/{internId}
  const pathParts = path.split('/');
  if (pathParts.length >= 2 && pathParts[0] === 'users') {
    const companyId = pathParts[1];
    return companyId;
  }
  return null;
}

// Check if company document exists in IMS
async function checkCompanyExists(cid) {
  try {
    const companyDoc = await systemDb.collection('users').doc(cid).get();
    const exists = companyDoc.exists;
    return exists;
  } catch (error) {
    return false;
  }
}

// Delete intern from IMS
async function deleteInternFromIMS(companyId, internId) {
  try {
    const internRef = systemDb.collection('users').doc(companyId).collection('interns').doc(internId);
    await internRef.delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  try {
    // Test Firebase Admin import
  } catch (importError) {
    return res.status(500).json({ error: 'Failed to load required modules' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, companyId, internId } = req.body;

  if (!path) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    // Initialize IMS system
    const systemInitResult = initializeSystem();
    
    if (!systemInitResult.success) {
      return res.status(500).json({ 
        error: 'Failed to initialize IMS connection',
        details: systemInitResult.error 
      });
    }

    // Extract company ID from the path if not provided
    let extractedCompanyId = companyId;
    if (!extractedCompanyId) {
      extractedCompanyId = extractCompanyIdFromPath(path);
      
      if (!extractedCompanyId) {
        return res.status(400).json({ 
          error: 'Invalid path format - could not extract company ID',
          path: path
        });
      }
    }

    // Extract intern ID from the path if not provided
    let extractedInternId = internId;
    if (!extractedInternId) {
      const pathParts = path.split('/');
      extractedInternId = pathParts[3]; // users/{companyId}/interns/{internId}
      
      if (!extractedInternId) {
        return res.status(400).json({ 
          error: 'Invalid path format - could not extract intern ID',
          path: path
        });
      }
    }

    // Check if company exists in IMS
    const companyExists = await checkCompanyExists(extractedCompanyId);
    
    if (!companyExists) {
      return res.status(200).json({
        success: true,
        message: 'Company not set up in IMS yet, deletion skipped',
        skipped: true,
        companyId: extractedCompanyId,
        internId: extractedInternId,
        timestamp: new Date().toISOString()
      });
    }

    // Delete intern from IMS
    const deleteResult = await deleteInternFromIMS(extractedCompanyId, extractedInternId);
    
    if (!deleteResult.success) {
      return res.status(500).json({ 
        error: 'Deletion failed',
        details: deleteResult.error 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Intern deleted webhook processed successfully',
      companyId: extractedCompanyId,
      internId: extractedInternId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      path: path
    });
  }
} 