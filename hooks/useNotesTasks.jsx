import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function useNotesTasks(cid) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const notesRef = collection(db, "users", cid, "notes-tasks");
      const q = query(notesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [cid]);

  // Add a new task
  const addTask = useCallback(
    async (taskData) => {
      if (!cid) return;
      setLoading(true);
      try {
        const notesRef = collection(db, "users", cid, "notes-tasks");
        await addDoc(notesRef, {
          ...taskData,
          createdAt: serverTimestamp(),
        });
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchTasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId) => {
      if (!cid || !taskId) return;
      setLoading(true);
      try {
        const taskRef = doc(db, "users", cid, "notes-tasks", taskId);
        await deleteDoc(taskRef);
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchTasks]
  );

  // Update a task
  const updateTask = useCallback(
    async (taskId, updates) => {
      if (!cid || !taskId) return;
      setLoading(true);
      try {
        const taskRef = doc(db, "users", cid, "notes-tasks", taskId);
        await updateDoc(taskRef, updates);
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [cid, fetchTasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, addTask, fetchTasks, deleteTask, updateTask };
} 