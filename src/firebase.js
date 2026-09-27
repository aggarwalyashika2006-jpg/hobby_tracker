import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVT5wUtEe2bcfmLgcXSeV0JswdAKQDHEM",
  authDomain: "hobby-tracker-5a43d.firebaseapp.com",
  projectId: "hobby-tracker-5a43d",
  storageBucket: "hobby-tracker-5a43d.firebasestorage.app",
  messagingSenderId: "487419542605",
  appId: "1:487419542605:web:b66fd293510eea988d3004",
  measurementId: "G-6R3JBBGPMZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);