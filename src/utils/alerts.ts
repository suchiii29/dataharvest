import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

export const fetchAlerts = async () => {
  const snapshot = await getDocs(collection(db, "alerts"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const dismissAlert = async (id: string) => {
  await deleteDoc(doc(db, "alerts", id));
};
