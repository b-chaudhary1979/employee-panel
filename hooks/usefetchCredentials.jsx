import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * usefetchCredentials - Hook to authenticate user by companyId and uniqueId
 *
 * Usage:
 *   const { authenticate, loading, error, user } = usefetchCredentials();
 *   await authenticate(companyId, uniqueId);
 */
export default function usefetchCredentials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Authenticate user by companyId and uniqueId
  const authenticate = async (companyId, uniqueId) => {
    setLoading(true);
    setError(null);
    setUser(null);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('companyId', '==', companyId),
        where('uniqueId', '==', uniqueId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
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