import { useState, useCallback } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app, db } from '../firebase';

export default function useStoreUserInfoEdit(cid, aid) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data by cid and aid
  const fetchUser = useCallback(async () => {
    if (!cid || !aid) return;

    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', cid, 'employees', aid);
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
  }, [cid, aid]);

  // Update all fields at once
  const updateAllFields = async (fields) => {
    if (!cid || !aid) return;
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', cid, 'employees', aid);
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