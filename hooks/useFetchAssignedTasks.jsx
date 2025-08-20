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
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
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
      const internsCollectionRef = collection(
        db,
        "users",
        companyId,
        "employees",
        employeeId,
        "intern_tasks"
      );

      const internsSnapshot = await getDocs(internsCollectionRef);
      const aggregatedPendingTasks = [];
      const aggregatedCompletedTasks = [];

      for (const internDoc of internsSnapshot.docs) {
        const internId = internDoc.id;
        const internData = internDoc.data();

        // Pending tasks
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
          aggregatedPendingTasks.push({
            id: taskDoc.id,
            internId,
            internName: internData.name || `Intern ${internId}`,
            internEmail: internData.email || `intern${internId}@company.com`,
            internRole: internData.role || "Intern",
            status: taskData.status || "pending",
            ...taskData,
          });
        });

        // Completed tasks
        const completedTasksRef = collection(
          db,
          "users",
          companyId,
          "employees",
          employeeId,
          "intern_tasks",
          internId,
          "completed_tasks"
        );

        // Not all documents may have sortable fields; keep simple getDocs to avoid query errors
        const completedTasksSnapshot = await getDocs(completedTasksRef);

        completedTasksSnapshot.forEach((taskDoc) => {
          const taskData = taskDoc.data();
          aggregatedCompletedTasks.push({
            id: taskDoc.id,
            internId,
            internName: internData.name || `Intern ${internId}`,
            internEmail: internData.email || `intern${internId}@company.com`,
            internRole: internData.role || "Intern",
            status: taskData.status || "completed",
            ...taskData,
          });
        });
      }

      setPendingTasks(aggregatedPendingTasks);
      setCompletedTasks(aggregatedCompletedTasks);
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

  return { pendingTasks, completedTasks, loading, error, refetch: fetchAssignedTasks };
}
