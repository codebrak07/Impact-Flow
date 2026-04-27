import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzwNKcYDrBtJFfE0TJv5Jx7CiNp26zHLc",
  authDomain: "troika-6e566.firebaseapp.com",
  projectId: "troika-6e566",
  storageBucket: "troika-6e566.firebasestorage.app",
  messagingSenderId: "916002120909",
  appId: "1:916002120909:web:3470b83b7571c5c44df584"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services and Export
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
