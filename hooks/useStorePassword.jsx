import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!"; // Should be more secure in production

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}
function decrypt(cipher) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

export default function useStorePassword(ci) {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firestore path: companies/{ci}/passwords
  function passwordsColRef() {
    return collection(db, "users", ci, "passwords");
  }

  // Fetch and listen to passwords for this company
  useEffect(() => {
    if (!ci) return;
    setLoading(true);
    const colRef = passwordsColRef();
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          // Decrypt password field
          let password = d.password;
          if (password) password = decrypt(password);
          return { ...d, password, id: doc.id };
        });
        setPasswords(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line
  }, [ci]);

  // Add password
  const addPassword = useCallback(
    async (data) => {
      try {
        setError(null);
        const encrypted = {
          ...data,
          password: encrypt(data.password),
          createdAt: data.createdAt || new Date().toISOString(),
        };
        await addDoc(passwordsColRef(), encrypted);
      } catch (err) {
        setError(err.message);
      }
    },
    [ci]
  );

  // Update password
  const updatePassword = useCallback(
    async (id, data) => {
      try {
        setError(null);
        const ref = doc(db, "users", ci, "passwords", id); // FIXED: was 'companies', should be 'users'
        const encrypted = {
          ...data,
          password: encrypt(data.password),
        };
        await updateDoc(ref, encrypted);
      } catch (err) {
        setError(err.message);
      }
    },
    [ci]
  );

  // Delete password
  const deletePassword = useCallback(async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, "users", ci, "passwords", id)); // FIXED: was 'companies', should be 'users'
    } catch (err) {
      setError(err.message);
    }
  }, [ci]);

  // Manual fetch (if needed)
  const fetchPasswords = useCallback(async () => {
    if (!ci) return [];
    setLoading(true);
    try {
      const colRef = passwordsColRef();
      const snap = await getDocs(colRef);
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        let password = d.password;
        if (password) password = decrypt(password);
        return { ...d, password, id: doc.id };
      });
      setPasswords(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [ci]);

  return {
    passwords,
    loading,
    error,
    addPassword,
    updatePassword,
    deletePassword,
    fetchPasswords,
  };
} 