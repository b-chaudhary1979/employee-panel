// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpBnzyXF_GcSvu5VN1pEus5sa818Pmx1c",
  authDomain: "admin-panel-bae8d.firebaseapp.com",
  projectId: "admin-panel-bae8d",
  storageBucket: "admin-panel-bae8d.firebasestorage.app",
  messagingSenderId: "516496008943",
  appId: "1:516496008943:web:d63f1218d27a5ae713dd1a",
  measurementId: "G-6NWQS1VBKT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);
const storage = getStorage(app);
export { db, storage };