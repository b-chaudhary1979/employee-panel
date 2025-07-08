import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * useFetchUser - Hook to store user signup info in Firestore (users collection)
 *
 * Usage:
 *   const { storeUser, loading, error, success } = useFetchUser();
 *   storeUser(userData, companyId);
 */
export default function useFetchUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // userData: all form values, companyId: string
  const storeUser = async (userData, companyId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const docRef = doc(db, 'users', companyId);
      await setDoc(docRef, {
        ...userData,
        companyId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to store user');
    } finally {
      setLoading(false);
    }
  };

  return { storeUser, loading, error, success };
} 