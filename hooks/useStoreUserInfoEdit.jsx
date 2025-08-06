import { useState, useCallback, useMemo } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app, db } from '../firebase';

export default function useStoreUserInfoEdit(cid, aid) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize the parameters to prevent unnecessary re-renders
  const memoizedCid = useMemo(() => cid, [cid]);
  const memoizedAid = useMemo(() => aid, [aid]);

  // Fetch user data by cid and aid
  const fetchUser = useCallback(async () => {
    if (!memoizedCid || !memoizedAid) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', memoizedCid, 'employees', memoizedAid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() };
        setUser(userData);
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
  }, [memoizedCid, memoizedAid]);

  // Update all fields at once
  const updateAllFields = useCallback(async (fields) => {
    if (!memoizedCid || !memoizedAid) return;
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', memoizedCid, 'employees', memoizedAid);
      await updateDoc(userRef, fields);
      setUser((prev) => prev ? { ...prev, ...fields } : prev);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [memoizedCid, memoizedAid]);

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => ({
    user,
    setUser,
    loading,
    error,
    fetchUser,
    updateAllFields,
  }), [user, loading, error, fetchUser, updateAllFields]);

  return result;
}