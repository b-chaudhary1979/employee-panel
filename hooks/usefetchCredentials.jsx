import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function usefetchCredentials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const authenticate = async (companyId, uniqueId) => {
    setLoading(true);
    setError(null);
    setUser(null);
    try {
      const employeeRef = doc(db, 'users', companyId, 'employees', uniqueId);
      const employeeSnap = await getDoc(employeeRef);
      if (employeeSnap.exists()) {
        setUser({ id: employeeSnap.id, ...employeeSnap.data() });
        return { id: employeeSnap.id, ...employeeSnap.data() };
      } else {
        setError('Invalid credentials');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { authenticate, loading, error, user };
}