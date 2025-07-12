// /hooks/useStoreApiKeys.js
import { useCallback, useState } from "react";
import Papa from "papaparse";

/**
 * Converts a File (CSV or JSON) to an array of key objects
 * Expected columns / props:  keyName, rawKey, environment, status, ...extras
 */
const fileToKeyArray = async (file) => {
  try {
    const text = await file.text();

    // JSON
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      return JSON.parse(text);
    }

    // CSV
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
export default function useStoreApiKeys(companyId, currentUser) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [fetchingKeys, setFetchingKeys] = useState(false);

  /* ---------- fetch keys ---------- */
  const fetchKeys = useCallback(async () => {
    if (!companyId) return;

    setFetchingKeys(true);
    setError(null);
    try {
      const response = await fetch(`/api/keys/${companyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch keys");
      }

      const data = await response.json();
      setKeys(data.keys || []);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setFetchingKeys(false);
    }
  }, [companyId]);

  /* ---------- decrypt key ---------- */
  const decryptKey = useCallback(
    async (keyId, vaultKey) => {
      if (!companyId || !keyId || !vaultKey) {
        throw new Error("Company ID, key ID, and vault key are required");
      }

      try {
        const response = await fetch(`/api/keys/${companyId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyId, vaultKey }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to decrypt key");
        }

        const data = await response.json();
        return data.decryptedKey;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [companyId]
  );

  /* ---------- single/manual key ---------- */
  const addKey = useCallback(
    async ({
      keyName,
      rawKey,
      environment = "prod",
      status = "active",
      vaultKey, // <-- accept vaultKey
      ...custom
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/keys/${companyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyName,
            rawKey,
            environment,
            status,
            vaultKey, // <-- send vaultKey
            ...custom,
            createdBy: currentUser?.uid || "system",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add key");
        }

        // Refresh the keys list after adding
        await fetchKeys();
        return await response.json();
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, currentUser, fetchKeys]
  );

  /* ---------- bulk upload (file) ---------- */
  const importFromFile = useCallback(
    async (file) => {
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

        for (const batchRows of chunks) {
          const promises = batchRows.map(async (r) => {
            return addKey({
              keyName: r.keyName.trim(),
              rawKey: r.rawKey.trim(),
              environment: r.environment || "prod",
              status: r.status || "active",
              ...r, // extras fall into custom
            });
          });

          await Promise.all(promises);
        }

        // Refresh the keys list after importing
        await fetchKeys();
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addKey, fetchKeys]
  );

  return {
    addKey,
    importFromFile,
    fetchKeys,
    decryptKey,
    keys,
    loading,
    error,
    fetchingKeys,
  };
}
