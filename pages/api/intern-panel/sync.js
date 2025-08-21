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

    const internPanelRef = collection(db, 'users', cid, 'interns');
    const internDocRef = doc(internPanelRef, internData.internId);

    await setDoc(internDocRef, internData);

    return res.status(200).json({ message: 'Intern synced to intern panel successfully' });
  } catch (error) {
    console.error('Error syncing to intern panel:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}