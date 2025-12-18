// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpvqDTEvSXKBoBNWseqrMDCSXwkB4pn2E",
  authDomain: "harvest-328ff.firebaseapp.com",
  projectId: "harvest-328ff",
  storageBucket: "harvest-328ff.firebasestorage.app",
  messagingSenderId: "305450106084",
  appId: "1:305450106084:web:51aeb5bbe6c121676a00f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
