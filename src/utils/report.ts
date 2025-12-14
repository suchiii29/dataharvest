import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export const generateReport = async () => {
  await addDoc(collection(db, "reports"), {
    generatedAt: serverTimestamp(),
    type: "farm-dashboard",
    status: "completed"
  });
};
