// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtxcVs8MG1LbP5wQ5Y35WdTibvBdXi4Nc",
  authDomain: "chaaaaat-619a3.firebaseapp.com",
  projectId: "chaaaaat-619a3",
  storageBucket: "chaaaaat-619a3.firebasestorage.app",
  messagingSenderId: "211085697059",
  appId: "1:211085697059:web:9a72f0c5013bda77419196",
  measurementId: "G-DCHMF8ZJ9J",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { firebaseConfig };
