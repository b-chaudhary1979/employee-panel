import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  runTransaction,
  serverTimestamp, // Add this import
} from 'firebase/firestore';

const useStoreInterns = (cid, isEmployeePanel = false) => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch interns for the given company id (as subcollection)
  const fetchInterns = useCallback(() => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    const internsRef = collection(db, 'users', cid, isEmployeePanel ? 'employeeInterns' : 'interns');
    // Real-time updates
    const unsubscribe = onSnapshot(
      internsRef,
      (querySnapshot) => {
        const interns = [];
        let sNo = 1;
        querySnapshot.forEach((doc) => {
          interns.push({ sNo: sNo++, id: doc.id, ...doc.data() });
        });
        setInterns(interns);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [cid, isEmployeePanel]);

  useEffect(() => {
    const unsubscribe = fetchInterns();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchInterns]);

  // Update task arrays when intern information changes
  const updateTaskArraysWithInternInfo = async (internId, updatedData) => {
    if (!cid) return;
    
    try {
      const dataRef = doc(db, 'users', cid, 'data');
      const dataSnap = await getDoc(dataRef);
      
      if (dataSnap.exists()) {
        const data = dataSnap.data();
        
        // Update task arrays
        const updatedTask = data.task?.map(task => {
          if (task.assignedTo === internId) {
            return {
              ...task,
              assignedToName: `${updatedData.firstName} ${updatedData.lastName}`,
              assignedToEmail: updatedData.email,
              assignedToRole: updatedData.role
            };
          }
          return task;
        }) || [];
        
        const updatedCompleted = data.completed?.map(task => {
          if (task.assignedTo === internId) {
            return {
              ...task,
              assignedToName: `${updatedData.firstName} ${updatedData.lastName}`,
              assignedToEmail: updatedData.email,
              assignedToRole: updatedData.role
            };
          }
          return task;
        }) || [];
        
        const updatedReported = data.reported?.map(task => {
          if (task.assignedTo === internId) {
            return {
              ...task,
              assignedToName: `${updatedData.firstName} ${updatedData.lastName}`,
              assignedToEmail: updatedData.email,
              assignedToRole: updatedData.role
            };
          }
          return task;
        }) || [];
        
        // Update the document
        await updateDoc(dataRef, {
          task: updatedTask,
          completed: updatedCompleted,
          reported: updatedReported
        });
      }
    } catch (error) {
      // Don't throw error - task array update failure shouldn't prevent intern update
    }
  };

  // Trigger sync-on-login to add intern to IMS database
  const triggerInternSync = async (internData, internId) => {
    try {
      const syncData = {
        cid: cid,
        system: 'IMS'
      };

      const response = await fetch('/api/user-management/sync-on-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData),
        signal: AbortSignal.timeout(15000) // 15 second timeout for sync
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(`Intern sync failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      // Don't throw error - sync failure shouldn't prevent intern addition to admin panel
      return;
    }
  };

  // Add a new intern
  const syncInternToPanels = async (internData) => {
    try {
      // Sync to Intern Panel
      const internPanelData = {
        ...internData,
        panel: 'Intern'
      };
      const internPanelResponse = await fetch('/api/intern-panel/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internPanelData)
      });
  
      if (!internPanelResponse.ok) {
        throw new Error(`Intern Panel sync failed: ${internPanelResponse.status} ${internPanelResponse.statusText}`);
      }
  
      // Sync to Admin Panel
      const adminPanelData = {
        ...internData,
        panel: 'Admin'
      };
      const adminPanelResponse = await fetch('/api/admin-panel/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminPanelData)
      });
  
      if (!adminPanelResponse.ok) {
        throw new Error(`Admin Panel sync failed: ${adminPanelResponse.status} ${adminPanelResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error syncing intern to panels:', error);
      throw error; // Propagate error for better debugging
    }
  };
  
  // Modify addIntern to include syncInternToPanels
  const addIntern = async (internData) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const internsRef = collection(db, 'users', cid, isEmployeePanel ? 'employeeInterns' : 'interns');
      const internId = internData.internId;
      const dataToSave = {
        ...internData,
        status: internData.status || 'Active',
        dateRegistered: serverTimestamp(),
      };
      await setDoc(doc(internsRef, internId), dataToSave);
      await triggerInternSync(dataToSave, internId);
      await syncInternToPanels(dataToSave); // Added sync function
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Modify updateIntern to include syncInternToPanels
  const updateIntern = async (id, updatedData) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const internRef = doc(db, 'users', cid, 'interns', id);
      await updateDoc(internRef, updatedData);
  
      // Update task arrays with new intern info
      await updateTaskArraysWithInternInfo(id, updatedData);
  
      // Trigger webhook to update intern in IMS database
      try {
        const webhookData = {
          path: `users/${cid}/interns/${id}`,
          companyId: cid,
          internId: id,
          updatedData: updatedData
        };
  
        const response = await fetch('/api/webhooks/intern-updated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
  
        if (response.ok) {
          const result = await response.json();
          
        }
      } catch (error) {
        // Don't throw error - webhook failure shouldn't prevent intern update in admin panel
      }
  
      await syncInternToPanels(updatedData); // Added sync function
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Delete an intern (hard delete)
  const deleteIntern = async (id) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      const internRef = doc(db, 'users', cid, 'interns', id);
      await deleteDoc(internRef);
      
      // Trigger webhook to delete intern from IMS database
      try {
        
        const webhookData = {
          path: `users/${cid}/interns/${id}`,
          companyId: cid,
          internId: id
        };

        const response = await fetch('/api/webhooks/intern-deleted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });

        if (response.ok) {
          const result = await response.json();
          
        }
      } catch (error) {
        // Don't throw error - webhook failure shouldn't prevent intern deletion from admin panel
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    interns,
    loading,
    error,
    addIntern,
    updateIntern,
    deleteIntern,
    fetchInterns,
  };
};

export default useStoreInterns;