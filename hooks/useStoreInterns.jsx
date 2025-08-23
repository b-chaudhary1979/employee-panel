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

const useStoreInterns = (cid) => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch interns with API call to intern Firebase database
  const fetchInterns = useCallback(() => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/interns/fetchInterns?companyId=${cid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch interns: ${response.statusText}`);
        }

        const responseData = await response.json();
        // Make sure we're setting the interns array, not the whole response object
        if (responseData.interns && Array.isArray(responseData.interns)) {
          // Add sNo property to each intern for consistency with the original code
          const internsWithSNo = responseData.interns.map((intern, index) => ({
            ...intern,
            sNo: index + 1
          }));
          setInterns(internsWithSNo);
          
          // Trigger a sync to ensure admin panel is up to date
          // We do this silently in the background without blocking
          try {
            triggerInternSync(null, null);
          } catch (syncErr) {
            console.error('Background sync failed:', syncErr);
            // Don't set error state for background sync
          }
        } else {
          // If the response doesn't have the expected structure, set an empty array
          console.error('Unexpected response structure:', responseData);
          setInterns([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    
    // Since we're not using onSnapshot anymore, we return an empty function
    return () => {};
  }, [cid]);

  useEffect(() => {
    const unsubscribe = fetchInterns();
    
    // Initial sync with admin panel when component mounts
    if (cid) {
      try {
        triggerInternSync(null, null);
      } catch (syncErr) {
        console.error('Initial sync failed:', syncErr);
        // Don't set error state for background sync
      }
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchInterns, cid]);

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
      // First sync with the admin panel
      const adminSyncData = {
        cid: cid,
        system: 'IMS',
        newData: internData,
        internId: internId
      };

      try {
        // Call the sync API to update the admin panel
        const adminResponse = await fetch('/api/user-management/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminSyncData),
          signal: AbortSignal.timeout(15000) // 15 second timeout for sync
        });
      } catch (adminSyncError) {
        // Log but continue if admin sync fails
        console.error('Admin sync error:', adminSyncError);
        // Continue with IMS sync even if admin sync fails
      }

      try {
        // Then sync with the IMS database
        const imsData = {
          cid: cid,
          system: 'IMS'
        };

        const imsResponse = await fetch('/api/user-management/sync-on-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imsData),
          signal: AbortSignal.timeout(15000) // 15 second timeout for sync
        });

        if (imsResponse.ok) {
          return await imsResponse.json();
        }
        // If response is not OK, log but don't throw
        const errorText = await imsResponse.text();
        console.warn(`IMS sync warning: ${imsResponse.status} ${imsResponse.statusText} - ${errorText}`);
      } catch (imsSyncError) {
        // Log but continue if IMS sync fails
        console.error('IMS sync error:', imsSyncError);
      }
      
      // Return a default success response even if syncs fail
      return { success: true, message: 'Operation completed on intern database' };
    } catch (error) {
      // Don't throw error - sync failure shouldn't prevent intern addition to admin panel
      console.error('Sync error:', error);
      return { success: true, message: 'Operation completed but sync failed' };
    }
  };

  // Add a new intern
  const addIntern = async (internData) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      // Save to intern Firebase database using API endpoint
      const response = await fetch('/api/interns/addInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: cid,
          internData: {
            ...internData,
            status: internData.status || 'Active',
            dateRegistered: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add intern: ${response.statusText}`);
      }

      const result = await response.json();
      const internId = result.internId;

      // Sync the intern to the admin panel
      await triggerInternSync(internData, internId);

      // Also fetch the interns to update the local state
      fetchInterns();
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Update an intern
  const updateIntern = async (id, updatedData) => {
    if (!cid || !id) return;
    setLoading(true);
    setError(null);
    try {
      // Update intern in the intern Firebase database using API endpoint
      const response = await fetch('/api/interns/updateInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: cid,
          internId: id,
          updates: updatedData
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update intern: ${response.statusText}`);
      }
      
      // Update task arrays with new intern info
      await updateTaskArraysWithInternInfo(id, updatedData);
      
      // Sync the updated intern to the admin panel
      await triggerInternSync(updatedData, id);
      
      // Also fetch the interns to update the local state
      fetchInterns();
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
      // Get the intern data before deletion for sync purposes
      const internData = interns.find(intern => intern.id === id);
      
      // Delete intern from the intern Firebase database using API endpoint
      const response = await fetch('/api/interns/deleteInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: cid,
          internId: id
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete intern: ${response.statusText}`);
      }

      // Sync the deletion to the admin panel
      if (internData) {
        // For deletion, we'll use the sync-on-login endpoint which handles deletions
        await triggerInternSync(internData, id);
      }
      
      // Also fetch the interns to update the local state
      fetchInterns();
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
    fetchInterns, // in case you want to refetch manually
  };
};

export default useStoreInterns;