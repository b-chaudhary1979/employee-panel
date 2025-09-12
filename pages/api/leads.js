import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, collectionGroup, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const payload = req.body;
      const companyId = payload.companyId || payload.cid || null;
      const employeeId = payload.employeeId || payload.assignedTo || null;
      if (!companyId || !employeeId) {
        return res.status(400).json({ message: 'companyId and employeeId are required in payload' });
      }

      const colRef = collection(db, 'users', companyId, 'employees', employeeId, 'leads');
      const docRef = await addDoc(colRef, payload);
      return res.status(200).json({ id: docRef.id, ...payload });
    }

    if (req.method === 'PUT') {
      // Update an existing lead. Expect body: { id, ...fields, companyId, employeeId }
      const payload = req.body;
      const id = payload.id;
      const companyId = payload.companyId || payload.cid || null;
      const employeeId = payload.employeeId || payload.assignedTo || null;
      if (!id || !companyId || !employeeId) return res.status(400).json({ message: 'id, companyId and employeeId are required for update' });

      const docRef = doc(db, 'users', companyId, 'employees', employeeId, 'leads', id);
      const toUpdate = { ...payload };
      delete toUpdate.id;
      await updateDoc(docRef, toUpdate);
      return res.status(200).json({ id, ...toUpdate });
    }

    if (req.method === 'GET') {
      // GET /api/leads?companyId=xxx            -> company-wide leads (collectionGroup)
      // GET /api/leads?companyId=xxx&employeeId=yyy -> specific employee leads
      const companyId = req.query.companyId || req.query.cid || null;
      const employeeId = req.query.employeeId || null;
      if (!companyId) return res.status(400).json({ message: 'companyId query param is required' });

      if (employeeId) {
        const colRef = collection(db, 'users', companyId, 'employees', employeeId, 'leads');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ leads: items });
      }

      // company-wide: use collectionGroup on 'leads' and filter by companyId
      const cg = collectionGroup(db, 'leads');
      const q = query(cg, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ leads: items });
    }

    if (req.method === 'DELETE') {
      // DELETE /api/leads?id=xxx&companyId=yyy&employeeId=zzz
      const id = req.query.id || null;
      const companyId = req.query.companyId || req.query.cid || null;
      const employeeId = req.query.employeeId || null;
      if (!id || !companyId || !employeeId) return res.status(400).json({ message: 'id, companyId and employeeId are required for delete' });
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, 'leads', id);
      await deleteDoc(docRef);
      return res.status(200).json({ id });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Leads API error', err);
    return res.status(500).json({ message: err.message || 'Internal error' });
  }
}
