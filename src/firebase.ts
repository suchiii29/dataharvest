import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyBpvqDTEvSXKBoBNWseqrMDCSXwkB4pn2E",
  authDomain: "harvest-328ff.firebaseapp.com",
  projectId: "harvest-328ff",
  storageBucket: "harvest-328ff.firebasestorage.app",
  messagingSenderId: "305450106084",
  appId: "1:305450106084:web:51aeb5bbe6c121676a00f1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ THIS IS WHAT YOU NEED
export default app;
