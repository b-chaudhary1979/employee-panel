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

export default function useNotesTasks(companyId, uniqueId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTasksRef = () => {
    if (!companyId || !uniqueId) return null;
    return collection(db, "users", companyId, "employees", uniqueId, "notes-tasks");
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    const notesRef = getTasksRef();
    if (!notesRef) return;

    setLoading(true);
    try {
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
  }, [companyId, uniqueId]);

  // Add a new task
  const addTask = useCallback(
    async (taskData) => {
      const notesRef = getTasksRef();
      if (!notesRef) return;

      setLoading(true);
      try {
        await addDoc(notesRef, {
          ...taskData,
          createdAt: serverTimestamp(),
        });
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [fetchTasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId) => {
      if (!companyId || !uniqueId || !taskId) return;

      setLoading(true);
      try {
        const taskRef = doc(db, "users", companyId, "employees", uniqueId, "notes-tasks", taskId);
        await deleteDoc(taskRef);
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [companyId, uniqueId, fetchTasks]
  );

  // Update a task
  const updateTask = useCallback(
    async (taskId, updates) => {
      if (!companyId || !uniqueId || !taskId) return;

      setLoading(true);
      try {
        const taskRef = doc(db, "users", companyId, "employees", uniqueId, "notes-tasks", taskId);
        await updateDoc(taskRef, updates);
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    },
    [companyId, uniqueId, fetchTasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, addTask, fetchTasks, deleteTask, updateTask };
}
