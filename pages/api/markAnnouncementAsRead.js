import admin from 'firebase-admin';

// Initialize admin Firebase app for admin database
let adminApp;
try {
  // Parse the admin service account from environment variable
  const adminServiceAccount = JSON.parse(process.env.ADMIN_SERVICE_ACCOUNT);
  
  // Check if admin app already exists
  adminApp = admin.apps.find(app => app.name === 'admin-app');
  
  if (!adminApp) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(adminServiceAccount),
    }, 'admin-app');
  }
} catch (error) {
  // Error initializing admin Firebase app
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, announcementId, internId } = req.body;

    // Validate required parameters
    if (!companyId || !announcementId || !internId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: companyId, announcementId, internId' 
      });
    }

    if (!adminApp) {
      return res.status(500).json({ 
        error: 'Admin Firebase app not initialized' 
      });
    }

    const adminDb = adminApp.firestore();

    // Check if announcement exists and get current views count
    const announcementRef = adminDb.doc(`users/${companyId}/announcement/${announcementId}`);
    const announcementDoc = await announcementRef.get();

    if (!announcementDoc.exists) {
      return res.status(404).json({ 
        error: 'Announcement not found in admin database' 
      });
    }

    const announcementData = announcementDoc.data();
    const currentViews = announcementData.views || 0;

    // Update views count by incrementing by 1
    await announcementRef.update({
      views: currentViews + 1,
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ 
      success: true,
      message: 'Views count updated successfully',
      newViewsCount: currentViews + 1
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to update views count',
      details: error.message 
    });
  }
}
