import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin for different management systems
let systemDb = null;
let adminPanelDb = null;

const SYSTEMS = {
  IMS: {
    projectId: 'intern-management-system-5df18',
    serviceAccount: 'intern-service-account.json',
    name: 'Intern Management System',
    collection: 'interns'
  }
};

// Initialize admin panel database (main admin panel)
function initializeAdminPanel() {
  try {
    // Check if any Firebase app is already initialized
    const existingApps = admin.apps;
    
    let app;
    if (existingApps.length === 0) {
      // Use the dedicated admin panel service account
      try {
        const serviceAccountPath = path.join(process.cwd(), 'keys', 'admin-service-account.json');
        const fs = require('fs');
        const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountContent);
        
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: "admin-panel-bae8d"
        });
      } catch (serviceError) {
        throw serviceError;
      }
    } else {
      app = existingApps[0];
    }
    
    adminPanelDb = app.firestore();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function initializeSystem(systemType) {
  try {
    const system = SYSTEMS[systemType];
    if (!system) {
      throw new Error(`Invalid system type: ${systemType}`);
    }

    // Load service account
    const serviceAccountPath = path.join(process.cwd(), 'keys', system.serviceAccount);
    
    try {
      // Use fs to read the file instead of require
      const fs = require('fs');
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      // Create a new Firebase app for this system
      const appName = `${systemType.toLowerCase()}-system`;
      
      // Check if app already exists
      let app;
      try {
        app = admin.app(appName);
      } catch (appError) {
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: system.projectId
        }, appName);
      }
      
      systemDb = app.firestore();
      
      return { success: true, system: system.name, projectId: system.projectId, collection: system.collection };
    } catch (serviceError) {
      throw serviceError;
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check if company document exists in management system
async function checkCompanyExists(cid, systemType) {
  try {
    const companyDoc = await systemDb.collection('users').doc(cid).get();
    const exists = companyDoc.exists;
    return exists;
  } catch (error) {
    return false;
  }
}

// Migrate new data to management system and admin panel
async function migrateNewData(cid, systemType, collection, newData) {
  try {
    // Write to systemDb (intern Firebase)
    const systemBatch = systemDb.batch();
    const idField = 'internId';
    const documentId = newData[idField] || newData.id || admin.firestore.FieldValue.serverTimestamp();
    const migratedData = {
      ...newData,
      migratedFrom: 'admin-panel',
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      originalId: documentId
    };
    const systemRef = systemDb.collection('users').doc(cid).collection(collection).doc(documentId);
    systemBatch.set(systemRef, migratedData);
    await systemBatch.commit();

    // Write to adminPanelDb (admin Firebase)
    const adminBatch = adminPanelDb.batch();
    const adminRef = adminPanelDb.collection('users').doc(cid).collection(collection).doc(documentId);
    adminBatch.set(adminRef, migratedData);
    await adminBatch.commit();

    return {
      success: true,
      message: 'New data migrated successfully to both intern and admin Firebase',
      migratedCount: 2
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handle new data addition (webhook handler)
async function handleNewData(cid, systemType, newData) {
  try {
    // 1. Check if company document exists in management system
    const companyExists = await checkCompanyExists(cid, systemType);
    
    if (companyExists) {
      // 2a. Company is set up - migrate normally
      const system = SYSTEMS[systemType];
      const result = await migrateNewData(cid, systemType, system.collection, newData);
      return result;
    } else {
      // 2b. Company not set up yet - silently ignore
      // No error thrown - just log and continue
      return {
        success: true,
        message: 'Company not set up yet, migration skipped',
        skipped: true
      };
    }
  } catch (error) {
    // Only log, don't show error to user
    return {
      success: true,
      message: 'Migration skipped due to setup status',
      skipped: true,
      error: error.message
    };
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

  const { cid, system, newData } = req.body;

  if (!cid || !system) {
    return res.status(400).json({ 
      error: 'CID and system are required',
      availableSystems: Object.keys(SYSTEMS)
    });
  }

  if (!SYSTEMS[system]) {
    return res.status(400).json({ 
      error: 'Invalid system type',
      availableSystems: Object.keys(SYSTEMS),
      providedSystem: system
    });
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

    // Initialize management system
    const systemInitResult = initializeSystem(system);
    
    if (!systemInitResult.success) {
      return res.status(500).json({ 
        error: `Failed to initialize ${system}`,
        details: systemInitResult.error 
      });
    }

    // Handle new data migration
    const syncResult = await handleNewData(cid, system, newData);
    
    if (syncResult.skipped) {
      // Company not set up yet - return success but indicate skipped
      return res.status(200).json({
        success: true,
        message: 'Migration skipped - company not set up yet',
        skipped: true,
        system: system,
        companyId: cid,
        timestamp: new Date().toISOString()
      });
    } else if (!syncResult.success) {
      return res.status(500).json({ 
        error: 'Data migration failed',
        details: syncResult.error 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      system: system,
      companyId: cid,
      sync: syncResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      system: system,
      companyId: cid
    });
  }
}