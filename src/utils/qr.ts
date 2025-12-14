import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export const logQRScan = async (animal: string, status: string) => {
  await addDoc(collection(db, "qrScans"), {
    animal,
    status,
    scannedAt: serverTimestamp()
  });
};
