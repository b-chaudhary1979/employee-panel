import { useState, useEffect, useCallback } from "react";

// For client-side, we need to use API endpoints to fetch from the intern database
// since we can't use service accounts on the client side

export default function useFetchInterns(companyId) {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    // Fetch interns from API
  const fetchInterns = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/interns/fetchInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInterns(data.interns || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching interns:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Fetch interns on mount and when companyId changes
  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  // Add a new intern
  const addIntern = useCallback(async (internData) => {
    if (!companyId) throw new Error("Company ID is required");
    
    try {
             const response = await fetch('/api/interns/addInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId, 
          internData: {
            ...internData,
            status: "Active"
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Refresh the interns list
      await fetchInterns();
      
      return result.internId;
    } catch (err) {
      console.error("Error adding intern:", err);
      throw err;
    }
  }, [companyId, fetchInterns]);

  // Update an intern
  const updateIntern = useCallback(async (internId, updates) => {
    if (!companyId || !internId) throw new Error("Company ID and Intern ID are required");
    
    try {
             const response = await fetch('/api/interns/updateInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId, 
          internId, 
          updates 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the interns list
      await fetchInterns();
    } catch (err) {
      console.error("Error updating intern:", err);
      throw err;
    }
  }, [companyId, fetchInterns]);

  // Delete an intern
  const deleteIntern = useCallback(async (internId) => {
    if (!companyId || !internId) throw new Error("Company ID and Intern ID are required");
    
    try {
             const response = await fetch('/api/interns/deleteInterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId, 
          internId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the interns list
      await fetchInterns();
    } catch (err) {
      console.error("Error deleting intern:", err);
      throw err;
    }
  }, [companyId, fetchInterns]);

  return {
    interns,
    loading,
    error,
    fetchInterns,
    addIntern,
    updateIntern,
    deleteIntern
  };
}
