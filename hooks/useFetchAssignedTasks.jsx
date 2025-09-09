import { useState, useEffect, useCallback } from "react";


// We'll call a server endpoint that reads from admin Firestore

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
      console.log('Fetching assigned tasks for companyId:', companyId);
      const resp = await fetch('/api/AssignedTasks/getAssignedTasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, employeeId })
      });

      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        console.error('Server returned error when fetching assigned tasks', e);
        throw new Error(e.error || 'Failed to fetch assigned tasks from server');
      }

      const data = await resp.json();
      console.log('Assigned tasks fetched:', { pending: (data.pendingTasks || []).length, completed: (data.completedTasks || []).length });
      setPendingTasks(data.pendingTasks || []);
      setCompletedTasks(data.completedTasks || []);
    } catch (err) {
      console.error('Error in fetchAssignedTasks:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  return { pendingTasks, completedTasks, loading, error, refetch: fetchAssignedTasks };
}
