import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const useStoreEmployees = (cid) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employees for the given company id (as subcollection)
  const fetchEmployees = useCallback(() => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    const employeesRef = collection(db, 'users', cid, 'employees');
    // Real-time updates
    const unsubscribe = onSnapshot(
      employeesRef,
      (querySnapshot) => {
        const emps = [];
        let sNo = 1;
        querySnapshot.forEach((doc) => {
          emps.push({ sNo: sNo++, id: doc.id, ...doc.data() });
        });
        setEmployees(emps);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [cid]);

  useEffect(() => {
    const unsubscribe = fetchEmployees();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchEmployees]);

  // Add a new employee
  const addEmployee = async (employeeData) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const employeesRef = collection(db, 'users', cid, 'employees');
      const empId = employeeData.employeeId;
      const dataToSave = { ...employeeData, status: employeeData.status || 'Active' };
      await setDoc(doc(employeesRef, empId), dataToSave);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Update an employee
  const updateEmployee = async (id, updatedData) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const empRef = doc(db, 'users', cid, 'employees', id);
      await updateDoc(empRef, updatedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Delete an employee (hard delete)
  const deleteEmployee = async (id) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const empRef = doc(db, 'users', cid, 'employees', id);
      await deleteDoc(empRef);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees, // in case you want to refetch manually
  };
};

export default useStoreEmployees; 