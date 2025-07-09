import { useState, useCallback } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import app from '../firebase';

const db = getFirestore(app);

export default function useStoreUserInfoEdit(cid) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data by cid
  const fetchUser = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', cid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({ id: userSnap.id, ...userSnap.data() });
      } else {
        setUser(null);
        setError('User not found');
      }
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [cid]);

  // Update all fields at once
  const updateAllFields = async (fields) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', cid);
      await updateDoc(userRef, fields);
      setUser((prev) => prev ? { ...prev, ...fields } : prev);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    setUser,
    loading,
    error,
    fetchUser,
    updateAllFields,
  };
} 