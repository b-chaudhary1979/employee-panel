import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin for different management systems
let systemDb = null;

const SYSTEMS = {
  IMS: {
    projectId: 'intern-management-system-5df18',
    serviceAccount: 'intern-service-account.json',
    name: 'Intern Management System'
  }
};

function initializeSystem(systemType) {
  try {
    const system = SYSTEMS[systemType];
    if (!system) {
      throw new Error(`Invalid system type: ${systemType}`);
    }

    // Check if already initialized for this system
    const appName = `${systemType.toLowerCase()}-app`;
    let app = admin.apps.find(app => app.name === appName);
    
    if (!app) {
      const serviceAccountPath = path.join(process.cwd(), 'keys', system.serviceAccount);
      
      try {
        const serviceAccount = require(serviceAccountPath);
        
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: system.projectId
        }, appName);
      } catch (serviceError) {
        throw serviceError;
      }
    }
    
    systemDb = app.firestore();
    return { success: true, system: system.name, projectId: system.projectId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system } = req.query;

  if (!system) {
    return res.status(400).json({ 
      error: 'System parameter is required',
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
    // Initialize the specified system
    const initResult = initializeSystem(system);
    
    if (!initResult.success) {
      return res.status(500).json({ 
        error: `Failed to initialize ${system}`,
        details: initResult.error 
      });
    }

    if (!systemDb) {
      return res.status(500).json({ error: 'Database connection not established' });
    }

    // Test the connection by attempting to access a collection
    const testRef = systemDb.collection('test');
    await testRef.doc('connection-test').get();
    
    return res.status(200).json({ 
      success: true, 
      message: `${initResult.system} connected successfully`,
      system: system,
      projectId: initResult.projectId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ 
      error: `Failed to connect to ${system}`,
      details: error.message,
      system: system
    });
  }
}