import { useState, useCallback } from 'react';

export default function useDataSyncToAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncStatus, setLastSyncStatus] = useState(null);

  // Sync data to admin database
  const syncToAdmin = useCallback(async ({
    companyId,
    collectionName,
    documentId,
    data,
    operation = 'set' // 'set' for add/update, 'delete' for delete
  }) => {
    
    if (!companyId || !collectionName || !documentId) {
      setError('Missing required parameters for admin sync');
      return { success: false, error: 'Missing required parameters' };
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        companyId,
        collectionName,
        documentId,
        data,
        operation
      };
     
      const response = await fetch('/api/sync-to-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
    
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync to admin database');
      }

      setLastSyncStatus({
        success: true,
        timestamp: new Date().toISOString(),
        operation,
        documentId,
        collectionName
      });

      setLoading(false);
      return { success: true, message: result.message };

    } catch (err) {
      const errorMessage = err.message || 'Failed to sync to admin database';
     
      setError(errorMessage);
      setLastSyncStatus({
        success: false,
        timestamp: new Date().toISOString(),
        operation,
        documentId,
        collectionName,
        error: errorMessage
      });
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sync media data (images, videos, audios, documents)
  const syncMediaToAdmin = useCallback(async ({
    companyId,
    employeeId,
    documentId,
    data,
    mediaType, // 'images', 'videos', 'audios', 'documents'
    operation = 'set'
  }) => {
    const collectionName = `data_${mediaType}`;
    return await syncToAdmin({
      companyId,
      collectionName,
      documentId,
      data,
      operation
    });
  }, [syncToAdmin]);

  // Sync links data
  const syncLinkToAdmin = useCallback(async ({
    companyId,
    employeeId,
    documentId,
    data,
    operation = 'set'
  }) => {
    return await syncToAdmin({
      companyId,
      collectionName: 'data_links',
      documentId,
      data,
      operation
    });
  }, [syncToAdmin]);


  // Delete data from admin database
  const deleteFromAdmin = useCallback(async ({
    companyId,
    collectionName,
    documentId
  }) => {
    
    const result = await syncToAdmin({
      companyId,
      collectionName,
      documentId,
      data: {}, // Not needed for delete operation
      operation: 'delete'
    });
    
   
    return result;
  }, [syncToAdmin]);

  // Delete media from admin database
  const deleteMediaFromAdmin = useCallback(async ({
    companyId,
    documentId,
    mediaType
  }) => {
    if (!companyId || !documentId || !mediaType) {
      setError('Missing required parameters for admin media delete');
      return { success: false, error: 'Missing required parameters' };
    }

    return await deleteFromAdmin({
      companyId,
      collectionName: `data_${mediaType}`,
      documentId
    });
  }, [deleteFromAdmin]);

  // Delete link from admin database
  const deleteLinkFromAdmin = useCallback(async ({
    companyId,
    documentId
  }) => {
       
    if (!companyId || !documentId) {
     
      setError('Missing required parameters for admin link delete');
      return { success: false, error: 'Missing required parameters' };
    }

    const result = await deleteFromAdmin({
      companyId,
      collectionName: 'data_links',
      documentId
    });
    
    
    return result;
  }, [deleteFromAdmin]);

  // Retry failed syncs (useful when user visits data page)
  const retryFailedSyncs = useCallback(async (failedSyncs) => {
    if (!Array.isArray(failedSyncs) || failedSyncs.length === 0) {
      return { success: true, message: 'No failed syncs to retry' };
    }

    setLoading(true);
    setError(null);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const sync of failedSyncs) {
      try {
        const result = await syncToAdmin(sync);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (err) {
        results.push({ success: false, error: err.message });
        failureCount++;
      }
    }

    setLoading(false);

    return {
      success: failureCount === 0,
      results,
      summary: {
        total: failedSyncs.length,
        successful: successCount,
        failed: failureCount
      }
    };
  }, [syncToAdmin]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear last sync status
  const clearLastSyncStatus = useCallback(() => {
    setLastSyncStatus(null);
  }, []);

  return {
    // Main sync function
    syncToAdmin,
    
    // Specific sync functions
    syncMediaToAdmin,
    syncLinkToAdmin,
    deleteFromAdmin,
    deleteMediaFromAdmin,
    deleteLinkFromAdmin,
    
    // Retry functionality
    retryFailedSyncs,
    
    // State
    loading,
    error,
    lastSyncStatus,
    
    // Utility functions
    clearError,
    clearLastSyncStatus
  };
} 