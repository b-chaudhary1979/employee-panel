import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

export default function useFetchAssignedTasks(companyId, employeeId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignedTasks = useCallback(async () => {
    if (!companyId || !employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch tasks from the employee's intern_tasks collection
      const tasksRef = collection(
        db,
        "users",
        companyId,
        "employees",
        employeeId,
        "intern_tasks"
      );

      const tasksSnapshot = await getDocs(tasksRef);
      const allTasks = [];

      // For each intern, fetch their pending_tasks
      for (const internDoc of tasksSnapshot.docs) {
        const internId = internDoc.id;
        const pendingTasksRef = collection(
          db,
          "users",
          companyId,
          "employees",
          employeeId,
          "intern_tasks",
          internId,
          "pending_tasks"
        );

        const pendingTasksSnapshot = await getDocs(
          query(pendingTasksRef, orderBy("assignedAt", "desc"))
        );

        pendingTasksSnapshot.forEach((taskDoc) => {
          const taskData = taskDoc.data();
          
          // Use the intern details that are now stored directly in the task document
          allTasks.push({
            id: taskDoc.id,
            internId: internId,
            internName: taskData.internName || `Intern ${internId}`,
            internEmail: taskData.internEmail || `intern${internId}@company.com`,
            internRole: taskData.internRole || "Intern",
            ...taskData,
          });
        });
      }

      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching assigned tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  return { tasks, loading, error, refetch: fetchAssignedTasks };
}
