import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function useAnnouncements(cid, aid) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readStatus, setReadStatus] = useState({});

  // Fetch announcements with real-time updates
  const fetchAnnouncements = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, "users", cid, "announcement");
      const q = query(ref, orderBy("lastUpdated", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const announcementsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            announcementsData.push({
              id: doc.id,
              title: data.title,
              content: data.content,
              type: data.type || 'General',
              date: data.lastUpdated?.toDate?.() || data.lastUpdated,
              author: data.author,
              link: data.link,
              subtitle: data.subtitle,
              image: data.image,
              tags: data.tags,
              active: data.active,
              audience: data.audience,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              customQA: data.customQA,
              expiryDate: data.expiryDate,
              markasread: data.markasread || false
            });
          });
          setAnnouncements(announcementsData);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [cid]);

  // Fetch read status for current employee
  const fetchReadStatus = useCallback(async () => {
    if (!cid || !aid || announcements.length === 0) {
      return;
    }

    try {
      const readStatusMap = {};
      
      // Check read status for each announcement
      for (const announcement of announcements) {
        const readerRef = doc(db, `users/${cid}/announcement/${announcement.id}/readers/${aid}`);
        const readerDoc = await getDoc(readerRef);
        readStatusMap[announcement.id] = readerDoc.exists();
      }
      
      setReadStatus(readStatusMap);
    } catch (error) {
      setReadStatus({});
    }
  }, [cid, aid, announcements]);

  // Mark announcement as read
  const markAsRead = useCallback(async (announcementId) => {
    if (!cid || !aid) {
      return;
    }

    // Check if already read
    if (readStatus[announcementId]) {
      return;
    }

    try {
      // Operation 1: Create reader document in employee database
      const readerRef = doc(db, `users/${cid}/announcement/${announcementId}/readers/${aid}`);
      await setDoc(readerRef, {
        employeeId: aid,
        readAt: serverTimestamp(),
        markasread: true
      });

      // Update local state immediately for better UX
      setReadStatus(prev => ({
        ...prev,
        [announcementId]: true
      }));

      // Operation 2: Call API to update views count in admin database
      const response = await fetch('/api/markAnnouncementAsRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: cid,
          announcementId: announcementId,
          internId: aid // Using internId field for compatibility with existing API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update views count in admin database');
      }

      const result = await response.json();

    } catch (error) {
      // Rollback Operation 1 if Operation 2 failed
      try {
        const readerRef = doc(db, `users/${cid}/announcement/${announcementId}/readers/${aid}`);
        await deleteDoc(readerRef);
        
        // Revert local state
        setReadStatus(prev => ({
          ...prev,
          [announcementId]: false
        }));
        
              } catch (rollbackError) {
          // Silent rollback error
        }
    }
  }, [cid, aid, readStatus]);

  // Mark all announcements as read
  const markAllAsRead = useCallback(async () => {
    for (const announcement of announcements) {
      if (!readStatus[announcement.id]) {
        await markAsRead(announcement.id);
      }
    }
  }, [announcements, readStatus, markAsRead]);


  useEffect(() => {
    const unsubscribe = fetchAnnouncements();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchAnnouncements]);

  useEffect(() => {
    fetchReadStatus();
  }, [fetchReadStatus]);

  return {
    announcements,
    loading,
    error,
    readStatus,
    markAsRead,
    markAllAsRead,
    fetchAnnouncements,
  };
}