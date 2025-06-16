import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAd-0njqTx5Sk0NBR3-81RGzMpuQWKY9h4",
  authDomain: "neurogestion-57d30.firebaseapp.com",
  projectId: "neurogestion-57d30",
  storageBucket: "neurogestion-57d30.appspot.com",
  messagingSenderId: "636983413517",
  appId: "1:636983413517:web:3c1bbafa0ab9659c9c7e44",
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; // ✅ Exporta auth aquí

