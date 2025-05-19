import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAd-0njqTx5Sk0NBR3-81RGzMpuQWKY9h4",
  authDomain: "neurogestion-57d30.firebaseapp.com",
  projectId: "neurogestion-57d30",
  storageBucket: "neurogestion-57d30.appspot.com",
  messagingSenderId: "636983413517",
  appId: "1:636983413517:web:3c1bbafa0ab9659c9c7e44",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
