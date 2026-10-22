import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtSJAs5nt9zEVV0wxdPxgKDSo1BuA3d5M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dms-grimoire.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://dms-grimoire-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dms-grimoire",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dms-grimoire.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "198175915063",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:198175915063:web:9115cd0543caccb9f853b2"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor instance Auth dan Database agar bisa dipakai di file lain (seperti Register.jsx)
export const auth = getAuth(app);
export const db = getDatabase(app);