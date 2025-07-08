import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function useStoreDemoQuries() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const storeDemoQuery = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addDoc(collection(db, "Demo"), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { storeDemoQuery, loading, error, success };
} 