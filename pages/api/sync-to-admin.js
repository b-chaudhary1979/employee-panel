import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK for admin database
let adminApp;
let adminDb;

try {
  // Check if admin app is already initialized
  const apps = getApps();
  adminApp = apps.find(app => app.name === 'admin-db');
  
  if (!adminApp) {
    // Path to your service account key file
    const serviceAccountPath = path.join(process.cwd(), 'keys', 'admin-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Admin service account file not found');
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id
    }, 'admin-db');
  }
  
  adminDb = getFirestore(adminApp);
} catch (error) {
  
}

export default async function handler(req, res) {
 
  if (req.method !== 'POST') {
  
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      companyId, 
      collectionName, 
      documentId, 
      data, 
      operation = 'set' // 'set' for add/update, 'delete' for delete
    } = req.body;
    
   

    // Validate required fields
    if (!companyId || !collectionName || !documentId) {
     
      return res.status(400).json({ 
        error: 'Missing required fields: companyId, collectionName, documentId' 
      });
    }

    if (!adminDb) {
     
      return res.status(500).json({ 
        error: 'Admin database not initialized' 
      });
    }

    const docRef = adminDb
      .collection('users')
      .doc(companyId)
      .collection(collectionName)
      .doc(documentId);

    if (operation === 'delete') {
     
      await docRef.delete();
     
      
    } else {
     
      // Add/Update document in admin database
      await docRef.set(data, { merge: true });
     
     
    }

    const message = `Data ${operation === 'delete' ? 'deleted' : 'synced'} to admin database`;
   
    return res.status(200).json({ 
      success: true, 
      message 
    });

  } catch (error) {
   
    return res.status(500).json({ 
      error: 'Failed to sync to admin database',
      details: error.message 
    });
  }
} 