// /hooks/useStoreApiKeys.js
import { useCallback, useState } from "react";
import Papa from "papaparse";
import CryptoJS from "crypto-js";

import { doc, setDoc, collection, getDocs, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Encryption/decryption functions
const encrypt = (plaintext, key) =>
  CryptoJS.AES.encrypt(plaintext, key).toString();

const decrypt = (encryptedText, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};
/**
 * Converts a File (CSV, JSON, or Excel) to an array of key objects
 * Expected columns / props:  keyName, rawKey, environment, status, ...extras
 */
const fileToKeyArray = async (file) => {
  try {
    // CSV
    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (errors.length > 0) {
      throw new Error(
        `CSV parsing errors: ${errors.map((e) => e.message).join(", ")}`
      );
    }
    return data;
  } catch (error) {
    throw new Error(`File parsing failed: ${error.message}`);
  }
};

/* ------------------------------------------------------------------ hook */
export default function useStoreApiKeys(companyId, user) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [fetchingKeys, setFetchingKeys] = useState(false);

  /* ---------- fetch keys ---------- */
  const fetchKeys = useCallback(async () => {
    if (!companyId || !user?.id) return;

    setFetchingKeys(true);
    setError(null);
    try {
      // Get the employee ID from the user object
      const employeeId = user?.id || user?.uniqueId;
      
      // Query Firestore directly using the new path structure
      const keysCollectionRef = collection(db, 'users', companyId, 'employees', employeeId, 'api-keys');
      const keysSnapshot = await getDocs(keysCollectionRef);
      
      const fetchedKeys = [];
      keysSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedKeys.push({
          id: doc.id,
          keyName: data.keyName,
          encryptedKey: data.encryptedKey,
          environment: data.environment,
          status: data.status,
          platform: data.platform,
          description: data.description,
          expiryDate: data.expiryDate,
          linkedProject: data.linkedProject,
          usageLimit: data.usageLimit,
          custom: data.custom || {},
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          createdBy: data.createdBy,
        });
      });
      
      setKeys(fetchedKeys);
    } catch (err) {
      console.error("Error fetching keys:", err);
      setError(err);
      throw err;
    } finally {
      setFetchingKeys(false);
    }
  }, [companyId, user?.id]);

  /* ---------- decrypt key ---------- */
  const decryptKey = useCallback(
    async (keyId, vaultKey) => {
      if (!companyId || !keyId || !vaultKey || !user?.id) {
        throw new Error("Company ID, key ID, vault key, and user ID are required");
      }

      try {
        const employeeId = user?.id || user?.uniqueId;
        const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
        const keySnap = await getDoc(keyRef);
        
        if (!keySnap.exists()) {
          throw new Error("Key not found");
        }
        
        const keyData = keySnap.data();
        
        // Attempt decryption with provided vaultKey first if given
        let decryptedKey = vaultKey ? decrypt(keyData.encryptedKey, vaultKey) : null;
        
        // Fallback to employeeId
        if (!decryptedKey) {
          decryptedKey = decrypt(keyData.encryptedKey, employeeId);
        }
        
        // Final fallback to companyId (for legacy keys)
        if (!decryptedKey) {
          decryptedKey = decrypt(keyData.encryptedKey, companyId);
        }
        
        if (!decryptedKey) {
          throw new Error("Decryption failed. Incorrect password.");
        }
        
        return decryptedKey;
      } catch (err) {
        console.error("Error decrypting key:", err);
        setError(err);
        throw err;
      }
    },
    [companyId, user?.id]
  );

  /* ---------- single/manual key ---------- */
  function generateKeyId() {
    return 'key_' + Math.random().toString(36).substr(2, 9);
  }

  const addKey = async (keyData) => {
    if (!companyId || !user?.id) {
      throw new Error("Company ID and user ID are required");
    }
    
    try {
      const employeeId = user?.id || user?.uniqueId; // get employee id
      const keyId = generateKeyId(); // generate unique key id
      const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
      
      // Extract rawKey from keyData and encrypt it
      const { rawKey, ...restKeyData } = keyData;
      
      if (!rawKey) {
        throw new Error("Raw key is required");
      }
      
      // Encrypt the raw key with companyId (for backward compatibility)
      // In a production app, you might want to use a more secure key
      const encryptedKey = encrypt(rawKey, employeeId);
      
      await setDoc(keyRef, {
        ...restKeyData,
        encryptedKey, // Store the encrypted key
        createdAt: Date.now(),
        createdBy: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      });
      
      // Refresh the keys list after adding
      await fetchKeys();
      return { success: true, keyId };
    } catch (err) {
      console.error("Error adding key:", err);
      setError(err);
      throw err;
    }
  };

  /* ---------- bulk upload (file) ---------- */
  const importFromFile = useCallback(
    async (file) => {
      if (!companyId || !user?.id) {
        throw new Error("Company ID and user ID are required");
      }
      
      setLoading(true);
      setError(null);
      try {
        const rows = await fileToKeyArray(file);

        // Validate required columns
        const invalid = rows.findIndex((r) => !r.keyName || !r.rawKey);
        if (invalid !== -1) {
          throw new Error(`Row ${invalid + 1} missing keyName/rawKey`);
        }

        // Check for duplicates in the file itself
        const keyNames = rows.map((r) => r.keyName.trim());
        const uniqueKeyNames = new Set(keyNames);
        if (uniqueKeyNames.size !== keyNames.length) {
          throw new Error("Duplicate key names found in the file");
        }

        // Process in batches
        const chunkSize = 50; // Smaller chunks for API calls
        const chunks = [];
        for (let i = 0; i < rows.length; i += chunkSize) {
          chunks.push(rows.slice(i, i + chunkSize));
        }

        const employeeId = user?.id || user?.uniqueId;
        
        for (const batchRows of chunks) {
          const promises = batchRows.map(async (r) => {
            const keyId = generateKeyId();
            const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
            
            // Prepare key data
            const keyData = {
              keyName: r.keyName.trim(),
              encryptedKey: encrypt(r.rawKey.trim(), employeeId), // Default encryption with companyId
              environment: r.environment || "prod",
              status: r.status || "active",
              createdAt: Date.now(),
              createdBy: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              // Include any other custom fields
              platform: r.platform || "",
              description: r.description || "",
              expiryDate: r.expiryDate || "",
              linkedProject: r.linkedProject || "",
              usageLimit: r.usageLimit || "",
              custom: { ...r } // Store all original fields in custom
            };
            
            return setDoc(keyRef, keyData);
          });

          await Promise.all(promises);
        }

        // Refresh the keys list after importing
        await fetchKeys();
        return true;
      } catch (err) {
        console.error("Error importing keys:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchKeys, user]
  );

  /* ---------- delete key ---------- */
  const deleteKey = useCallback(
    async (keyId, vaultKey) => {
      if (!companyId || !keyId || !vaultKey || !user?.id) {
        throw new Error("Company ID, key ID, user ID, and vault key are required");
      }
      setLoading(true);
      setError(null);
      try {
        // Verify vault key (in a real app, you'd want to verify this securely)
        if (vaultKey !== (user?.id || user?.uniqueId)) {
          throw new Error("Invalid vault key");
        }
        
        const employeeId = user?.id || user?.uniqueId;
        const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
        
        // Delete the document
        await deleteDoc(keyRef);
        
        // Refresh the keys list
        await fetchKeys();
        return true;
      } catch (err) {
        console.error("Error deleting key:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchKeys, user?.id]
  );

  /* ---------- update key encryption ---------- */
  const updateKeyEncryption = useCallback(
    async (keyId, rawKey, vaultKey) => {
      if (!companyId || !keyId || !rawKey || !user?.id) {
        throw new Error("Company ID, key ID, rawKey, and user ID are required");
      }
      setLoading(true);
      setError(null);
      try {
        // Encrypt the key with employeeId to be consistent with addKey function
        const employeeId = user?.id || user?.uniqueId;
        const encryptedKey = encrypt(rawKey, employeeId);
        const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
        
        // Update only the encryptedKey field
        await updateDoc(keyRef, { encryptedKey });
        
        // Refresh the keys list
        await fetchKeys();
        return true;
      } catch (err) {
        console.error("Error updating key encryption:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchKeys, user?.id]
  );

  /* ---------- update key status ---------- */
  const updateKeyStatus = useCallback(
    async (keyId, newStatus) => {
      if (!companyId || !keyId || !newStatus || !user?.id) {
        throw new Error("Company ID, key ID, new status, and user ID are required");
      }
      setLoading(true);
      setError(null);
      try {
        const employeeId = user?.id || user?.uniqueId;
        const keyRef = doc(db, 'users', companyId, 'employees', employeeId, 'api-keys', keyId);
        
        // Update only the status field
        await updateDoc(keyRef, { status: newStatus });
        
        // Refresh the keys list
        await fetchKeys();
        return true;
      } catch (err) {
        console.error("Error updating key status:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchKeys, user?.id]
  );

  return {
    addKey,
    importFromFile,
    fetchKeys,
    decryptKey,
    deleteKey, // <-- export deleteKey
    updateKeyEncryption, // <-- export updateKeyEncryption
    updateKeyStatus, // <-- export updateKeyStatus
    keys,
    loading,
    error,
    fetchingKeys,
  };
}
