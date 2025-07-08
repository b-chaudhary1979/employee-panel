import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function useStoreContactUs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const storeContactUs = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addDoc(collection(db, "contact us"), {
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

  return { storeContactUs, loading, error, success };
}
