import { db } from '../../../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { internData, cid } = req.body;

    if (!internData || !cid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const adminPanelRef = collection(db, 'users', cid, 'adminInterns');
    const internDocRef = doc(adminPanelRef, internData.internId);

    await setDoc(internDocRef, internData);

    return res.status(200).json({ message: 'Intern synced to admin panel successfully' });
  } catch (error) {
    console.error('Error syncing to admin panel:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}