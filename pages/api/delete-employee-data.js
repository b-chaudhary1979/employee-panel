import admin from 'firebase-admin';

// Initialize Firebase Admin for employee management system
let employeeSystemDb = null;

function initializeEmployeeSystem() {
  try {
    // Check if any Firebase app is already initialized
    const existingApps = admin.apps;
    
    let app;
    const appName = 'employee-system-delete';
    
    try {
      app = admin.app(appName);
    } catch (appError) {
      // Use environment variable instead of JSON file
      const serviceAccount = JSON.parse(process.env.EMPLOYEE_SERVICE_ACCOUNT);
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'employee-panel-7a54c'
      }, appName);
    }
    
    employeeSystemDb = app.firestore();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { companyId, employeeId, documentId, collectionName, cloudinaryPublicId, cloudinaryResourceType } = req.body;

  if (!companyId || !employeeId || !documentId || !collectionName) {
    return res.status(400).json({ 
      error: 'Missing required fields: companyId, employeeId, documentId, collectionName' 
    });
  }

  try {
    // Initialize EMS system
    const systemInitResult = initializeEmployeeSystem();
    
    if (!systemInitResult.success) {
      return res.status(500).json({ 
        error: 'Failed to initialize EMS connection',
        details: systemInitResult.error 
      });
    }

    // Delete from employee database
    const employeeDocRef = employeeSystemDb
      .collection('users')
      .doc(companyId)
      .collection('employees')
      .doc(employeeId)
      .collection(`data_${collectionName}`)
      .doc(documentId);

    await employeeDocRef.delete();

    // Handle Cloudinary deletion if publicId is provided
    let cloudinaryResult = null;
    if (cloudinaryPublicId) {
      try {
        const cloudinaryResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://cyberclipper-admin-panel-ochre.vercel.app/'}/api/cloudinary-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId: cloudinaryPublicId,
            resourceType: cloudinaryResourceType || 'auto',
          }),
        });

        if (cloudinaryResponse.ok) {
          cloudinaryResult = await cloudinaryResponse.json();
        }
      } catch (cloudinaryError) {
      
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Employee data deleted successfully',
      cloudinaryDeleted: cloudinaryResult ? cloudinaryResult.success : null
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to delete employee data',
      details: error.message 
    });
  }
}

