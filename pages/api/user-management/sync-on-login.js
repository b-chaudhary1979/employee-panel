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

// Get all employees from admin panel
async function getAdminPanelEmployees(cid) {
  try {
    const employeesSnapshot = await adminPanelDb.collection('users').doc(cid).collection('employees').get();
    const employees = [];
    employeesSnapshot.forEach(doc => {
      employees.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return employees;
  } catch (error) {
    return [];
  }
}

// Get all employees from EMS
async function getEMSEmployees(cid) {
  try {
    const employeesSnapshot = await systemDb.collection('users').doc(cid).collection('employees').get();
    const employees = [];
    employeesSnapshot.forEach(doc => {
      employees.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return employees;
  } catch (error) {
    return [];
  }
}

// Sync employees between admin panel and EMS
async function syncEmployees(cid) {
  try {
    // Get employees from both systems
    const adminEmployees = await getAdminPanelEmployees(cid);
    const emsEmployees = await getEMSEmployees(cid);
    
    const batch = systemDb.batch();
    let addedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    
    // Create sets for easy comparison
    const adminEmployeeIds = new Set(adminEmployees.map(emp => emp.id));
    const emsEmployeeIds = new Set(emsEmployees.map(emp => emp.id));
    
    // Add missing employees to EMS
    for (const adminEmployee of adminEmployees) {
      if (!emsEmployeeIds.has(adminEmployee.id)) {
        const migratedData = {
          ...adminEmployee,
          migratedFrom: 'admin-panel',
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          originalId: adminEmployee.id
        };
        
        const newRef = systemDb.collection('users').doc(cid).collection('employees').doc(adminEmployee.id);
        batch.set(newRef, migratedData);
        addedCount++;
      }
    }
    
    // Remove employees from EMS that don't exist in admin panel
    for (const emsEmployee of emsEmployees) {
      if (!adminEmployeeIds.has(emsEmployee.id)) {
        const deleteRef = systemDb.collection('users').doc(cid).collection('employees').doc(emsEmployee.id);
        batch.delete(deleteRef);
        deletedCount++;
      }
    }
    
    // Update existing employees if they have different data
    for (const adminEmployee of adminEmployees) {
      if (emsEmployeeIds.has(adminEmployee.id)) {
        const emsEmployee = emsEmployees.find(emp => emp.id === adminEmployee.id);
        // Simple comparison - you might want more sophisticated comparison
        if (JSON.stringify(adminEmployee) !== JSON.stringify(emsEmployee)) {
          const migratedData = {
            ...adminEmployee,
            migratedFrom: 'admin-panel',
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            originalId: adminEmployee.id
          };
          
          const updateRef = systemDb.collection('users').doc(cid).collection('employees').doc(adminEmployee.id);
          batch.set(updateRef, migratedData);
          updatedCount++;
        }
      }
    }
    
    // Commit all changes
    await batch.commit();
    
    return {
      success: true,
      message: 'Employee sync completed successfully',
      addedCount,
      updatedCount,
      deletedCount,
      totalAdminEmployees: adminEmployees.length,
      totalEMSEmployees: emsEmployees.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all interns from admin panel
async function getAdminPanelInterns(cid) {
  try {
    const internsSnapshot = await adminPanelDb.collection('users').doc(cid).collection('interns').get();
    const interns = [];
    internsSnapshot.forEach(doc => {
      interns.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return interns;
  } catch (error) {
    return [];
  }
}

// Get all interns from IMS
async function getIMSInterns(cid) {
  try {
    const internsSnapshot = await systemDb.collection('users').doc(cid).collection('interns').get();
    const interns = [];
    internsSnapshot.forEach(doc => {
      interns.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return interns;
  } catch (error) {
    return [];
  }
}

// Sync interns between admin panel and IMS
async function syncInterns(cid) {
  try {
    // Get interns from both systems
    const adminInterns = await getAdminPanelInterns(cid);
    const imsInterns = await getIMSInterns(cid);
    
    const batch = systemDb.batch();
    let addedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    
    // Create sets for easy comparison
    const adminInternIds = new Set(adminInterns.map(intern => intern.id));
    const imsInternIds = new Set(imsInterns.map(intern => intern.id));
    
    // Add missing interns to IMS
    for (const adminIntern of adminInterns) {
      if (!imsInternIds.has(adminIntern.id)) {
        const migratedData = {
          ...adminIntern,
          migratedFrom: 'admin-panel',
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          originalId: adminIntern.id
        };
        
        const newRef = systemDb.collection('users').doc(cid).collection('interns').doc(adminIntern.id);
        batch.set(newRef, migratedData);
        addedCount++;
      }
    }
    
    // Remove interns from IMS that don't exist in admin panel
    for (const imsIntern of imsInterns) {
      if (!adminInternIds.has(imsIntern.id)) {
        const deleteRef = systemDb.collection('users').doc(cid).collection('interns').doc(imsIntern.id);
        batch.delete(deleteRef);
        deletedCount++;
      }
    }
    
    // Update existing interns if they have different data
    for (const adminIntern of adminInterns) {
      if (imsInternIds.has(adminIntern.id)) {
        const imsIntern = imsInterns.find(intern => intern.id === adminIntern.id);
        // Simple comparison - you might want more sophisticated comparison
        if (JSON.stringify(adminIntern) !== JSON.stringify(imsIntern)) {
          const migratedData = {
            ...adminIntern,
            migratedFrom: 'admin-panel',
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            originalId: adminIntern.id
          };
          
          const updateRef = systemDb.collection('users').doc(cid).collection('interns').doc(adminIntern.id);
          batch.set(updateRef, migratedData);
          updatedCount++;
        }
      }
    }
    
    // Commit all changes
    await batch.commit();
    
    return {
      success: true,
      message: 'Intern sync completed successfully',
      addedCount,
      updatedCount,
      deletedCount,
      totalAdminInterns: adminInterns.length,
      totalIMSInterns: imsInterns.length
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

    // Perform sync based on system type
    const syncResult = await syncInterns(cid);

    if (!syncResult.success) {
      return res.status(500).json({ 
        error: 'Sync failed',
        details: syncResult.error 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sync-on-login completed successfully',
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