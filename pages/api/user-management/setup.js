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

// Verify CID exists in admin panel
async function verifyCID(cid) {
  try {
    const userDoc = await adminPanelDb.collection('users').doc(cid).get()
    if (!userDoc.exists) {
      return { success: false, error: 'Company ID not found in admin panel' };
    }
    
    const userData = userDoc.data();
    return { 
      success: true, 
      companyData: userData,
      message: 'Company ID verified successfully'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check if management system already has data for this company
async function checkExistingData(cid, collection) {
  try {
    const dataSnapshot = await systemDb.collection('users').doc(cid).collection(collection).get();
    return {
      exists: !dataSnapshot.empty,
      count: dataSnapshot.size
    };
  } catch (error) {
    return { exists: false, count: 0 };
  }
}

// Migrate data from admin panel to management system
async function migrateData(cid, systemType, collection, companyData) {
  try {
    // Get data from admin panel
    const adminDataSnapshot = await adminPanelDb.collection('users').doc(cid).collection(collection).get();
    
    if (adminDataSnapshot.empty) {
      return { 
        success: true, 
        message: 'No data to migrate',
        migratedCount: 0
      };
    }

    let migratedCount = 0;
    const batch = systemDb.batch();

    // Create the company document in management system if it doesn't exist
    const companyRef = systemDb.collection('users').doc(cid);
    
    // Use the passed company data parameter
    
    // Create company document with all company fields (excluding migration fields)
    const companyDocument = {
      company: companyData.company || "CyberClipper Solutions",
      companyId: cid,
      companySize: companyData.companySize || "1-10",
      country: companyData.country || "IN",
      createdAt: companyData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      department: companyData.department || "Development",
      designation: companyData.designation || "SDE",
      dob: companyData.dob || "2003-03-23",
      email: companyData.email || "manishmaurya6128@gmail.com",
      hearAboutUs: companyData.hearAboutUs || "Online Advertisement",
      location: companyData.location || "Dehradun",
      name: companyData.name || "Manish Maurya",
      phone: companyData.phone || "+91-7983960143",
      plan: companyData.plan || "Pro",
      purpose: companyData.purpose || "Employee Management",
      status: companyData.status || "active",
      uniqueId: companyData.uniqueId || "AID-MAN-AFID-232",
      updatedAt: companyData.updatedAt || admin.firestore.FieldValue.serverTimestamp()
    };
    
    batch.set(companyRef, companyDocument, { merge: true });

    // Migrate each document
    adminDataSnapshot.forEach(doc => {
      const data = doc.data();
      
      const migratedData = {
        ...data,
        migratedFrom: 'admin-panel',
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        originalId: doc.id
      };

      const newRef = systemDb.collection('users').doc(cid).collection(collection).doc(doc.id);
      batch.set(newRef, migratedData);
      migratedCount++;
    });

    await batch.commit();

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} ${collection}`,
      migratedCount: migratedCount
    };
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

  const { cid, system } = req.body;

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

    // Verify CID exists in admin panel
    const cidVerification = await verifyCID(cid);
    
    if (!cidVerification.success) {
      return res.status(404).json({ 
        error: 'Company ID verification failed',
        details: cidVerification.error 
      });
    }

    // Check if management system already has data for this company
    const existingData = await checkExistingData(cid, systemInitResult.collection);
    
    if (existingData.exists) {
      return res.status(409).json({ 
        error: 'Company already has data in management system',
        details: `Found ${existingData.count} existing records`,
        system: system,
        companyId: cid
      });
    }

    // Migrate data from admin panel to management system
    const migrationResult = await migrateData(cid, system, systemInitResult.collection, cidVerification.companyData);
    
    if (!migrationResult.success) {
      return res.status(500).json({ 
        error: 'Data migration failed',
        details: migrationResult.error 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Migration completed successfully',
      system: system,
      companyId: cid,
      migration: migrationResult,
      companyData: cidVerification.companyData,
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