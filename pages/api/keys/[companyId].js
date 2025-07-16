import {
  doc,
  collection,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebase";
import CryptoJS from "crypto-js";

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

export default async function handler(req, res) {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ error: "Company ID is required" });
  }

  if (req.method === "GET") {
    // Fetch API keys for the company
    try {
      const keysColRef = collection(doc(db, "apiKeys", companyId), "keys");
      const keysSnapshot = await getDocs(keysColRef);

      const keys = [];
      keysSnapshot.forEach((doc) => {
        const data = doc.data();
        keys.push({
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
          // Don't send the actual key for security - only encrypted version
        });
      });

      res.status(200).json({ keys });
    } catch (error) {
      console.error("API Keys fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    // Add new API key
    try {
      const keysColRef = collection(doc(db, "apiKeys", companyId), "keys");
      const {
        keyName,
        rawKey,
        environment = "prod",
        status = "active",
        platform,
        description,
        expiryDate,
        linkedProject,
        usageLimit,
        vaultKey, // <-- get vaultKey from request
        ...custom
      } = req.body;

      // Validate required fields
      if (!keyName || !rawKey) {
        return res
          .status(400)
          .json({ error: "keyName and rawKey are required" });
      }

      // Check for duplicates
      const dupSnap = await getDocs(
        query(keysColRef, where("keyName", "==", keyName))
      );

      if (!dupSnap.empty) {
        return res
          .status(409)
          .json({ error: `Key name "${keyName}" already exists` });
      }

      // Use vaultKey for encryption if provided, else fallback to company CID
      const encryptionKey = vaultKey || companyId;
      const encryptedKey = encrypt(rawKey, encryptionKey);

      const payload = {
        keyName,
        encryptedKey,
        environment,
        status,
        platform,
        description,
        expiryDate,
        linkedProject,
        usageLimit,
        custom,
        createdAt: serverTimestamp(),
        createdBy: req.body.createdBy || "system",
      };

      await setDoc(doc(keysColRef, keyName), payload);

      res.status(201).json({ success: true, keyName });
    } catch (error) {
      console.error("API Key creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Decrypt a specific key
    try {
      const { keyId, vaultKey } = req.body;

      if (!keyId || !vaultKey) {
        return res
          .status(400)
          .json({ error: "keyId and vaultKey are required" });
      }

      // For now, we'll use the vault key as the decryption key
      // In a real implementation, you might want to store the vault key with each encrypted key
      const keysColRef = collection(doc(db, "apiKeys", companyId), "keys");
      const keyDoc = await getDocs(
        query(keysColRef, where("keyName", "==", keyId))
      );

      if (keyDoc.empty) {
        return res.status(404).json({ error: "Key not found" });
      }

      const keyData = keyDoc.docs[0].data();

      // Try to decrypt using the vault key
      let decryptedKey;
      try {
        const bytes = CryptoJS.AES.decrypt(keyData.encryptedKey, vaultKey);
        decryptedKey = bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        // If vault key doesn't work, try with company CID (for backward compatibility)
        decryptedKey = decrypt(keyData.encryptedKey, companyId);
      }

      if (!decryptedKey) {
        return res
          .status(400)
          .json({ error: "Decryption failed. Incorrect password." });
      }

      res.status(200).json({
        success: true,
        decryptedKey,
        keyName: keyData.keyName,
      });
    } catch (error) {
      console.error("API Key decryption error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PATCH") {
    // Update key status or re-encrypt a specific key
    try {
      const { keyId, rawKey, vaultKey, status } = req.body;
      const keysColRef = collection(doc(db, "apiKeys", companyId), "keys");
      if (status && keyId) {
        // Update only the status field
        await setDoc(doc(keysColRef, keyId), { status }, { merge: true });
        return res.status(200).json({ success: true, keyId, status });
      }
      if (!keyId || !rawKey || !vaultKey) {
        return res.status(400).json({ error: "keyId, rawKey, and vaultKey are required" });
      }
      // Use vaultKey for encryption
      const encryptedKey = encrypt(rawKey, vaultKey);
      await setDoc(doc(keysColRef, keyId), { encryptedKey }, { merge: true });
      res.status(200).json({ success: true, keyId });
    } catch (error) {
      console.error("API Key patch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // Delete a specific key
    try {
      const { keyId, vaultKey } = req.body;
      if (!keyId || !vaultKey) {
        return res.status(400).json({ error: "keyId and vaultKey are required" });
      }
      // For now, use companyId as the vault key check (can be improved)
      if (vaultKey !== companyId) {
        return res.status(403).json({ error: "Invalid vault key." });
      }
      const keysColRef = collection(doc(db, "apiKeys", companyId), "keys");
      // Delete by keyName (which is used as doc ID)
      await setDoc(doc(keysColRef, keyId), {}, { merge: false }); // Overwrite with empty object
      await (await import("firebase/firestore")).deleteDoc(doc(keysColRef, keyId));
      res.status(200).json({ success: true, deleted: keyId });
    } catch (error) {
      console.error("API Key delete error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
