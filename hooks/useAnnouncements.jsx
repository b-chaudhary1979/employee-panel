import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function useAnnouncements(cid) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, "users", cid, "announcements");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setAnnouncements(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cid]);

  // Add announcement
  const addAnnouncement = useCallback(
    async (data) => {
      if (!cid) return;
      setLoading(true);
      setError(null);
      try {
        const ref = collection(db, "users", cid, "announcements");
        await addDoc(ref, {
          ...data,
          createdAt: serverTimestamp(),
        });
        await fetchAnnouncements();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchAnnouncements]
  );

  // Update announcement
  const updateAnnouncement = useCallback(
    async (id, updates) => {
      if (!cid || !id) return;
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "users", cid, "announcements", id);
        await updateDoc(ref, updates);
        await fetchAnnouncements();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchAnnouncements]
  );

  // Delete announcement
  const deleteAnnouncement = useCallback(
    async (id) => {
      if (!cid || !id) return;
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "users", cid, "announcements", id);
        await deleteDoc(ref);
        await fetchAnnouncements();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchAnnouncements]
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}