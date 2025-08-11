import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const imsConfig = {
  apiKey: process.env.NEXT_PUBLIC_IMS_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_IMS_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_IMS_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_IMS_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_IMS_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_IMS_APP_ID,
};

// Prevent re-initialisation in dev hot-reload
const imsApp = getApps().find(a => a.name === "imsApp") || initializeApp(imsConfig, "imsApp");

export const db = getFirestore(imsApp);