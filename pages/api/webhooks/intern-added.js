import admin from 'firebase-admin';
import pathModule from 'path';

// Initialize Firebase Admin for admin panel
let adminPanelDb = null;

function initializeAdminPanel() {
  try {
    // Check if any Firebase app is already initialized
    const existingApps = admin.apps;
    
    let app;
    const appName = 'admin-panel';
    
    try {
      app = admin.app(appName);
    } catch (appError) {
      // Load service account
      const serviceAccountPath = pathModule.join(process.cwd(), 'keys', 'admin-service-account.json');
      const fs = require('fs');
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'admin-panel-bae8d'
      }, appName);
    }
    
    adminPanelDb = app.firestore();
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

// Get intern data from admin panel
async function getInternData(companyId, internId) {
  try {
    const internDoc = await adminPanelDb.collection('users').doc(companyId).collection('interns').doc(internId).get();
    if (internDoc.exists) {
      const internData = internDoc.data();
      return internData;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Trigger sync to migrate intern data
async function triggerSync(companyId, internData) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user-management/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid: companyId,
        system: 'IMS',
        newData: internData
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, result };
    } else {
      return { success: false, error: `Sync failed: ${response.status}` };
    }
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

  const { path, value, oldValue } = req.body;

  if (!path) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  try {
    // Initialize admin panel
    const adminInitResult = initializeAdminPanel();
    
    if (!adminInitResult.success) {
      return res.status(500).json({ 
        error: 'Failed to initialize admin panel connection',
        details: adminInitResult.error 
      });
    }

    // Extract company ID from the path
    const companyId = extractCompanyIdFromPath(path);
    
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Invalid path format - could not extract company ID',
        path: path
      });
    }

    // Extract intern ID from the path
    const pathParts = path.split('/');
    const internId = pathParts[3]; // users/{companyId}/interns/{internId}
    
    if (!internId) {
      return res.status(400).json({ 
        error: 'Invalid path format - could not extract intern ID',
        path: path
      });
    }

    // Get the intern data
    const internData = await getInternData(companyId, internId);
    
    if (!internData) {
      return res.status(404).json({ 
        error: 'Intern data not found',
        companyId: companyId,
        internId: internId
      });
    }

    // Trigger sync to migrate the new intern data
    const syncResult = await triggerSync(companyId, internData);
    
    if (!syncResult.success) {
      return res.status(500).json({ 
        error: 'Sync failed',
        details: syncResult.error 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Intern added webhook processed successfully',
      companyId: companyId,
      internId: internId,
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