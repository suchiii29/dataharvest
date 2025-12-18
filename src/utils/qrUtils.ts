// src/utils/qrUtils.ts

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Logs QR code scans to Firebase
 * This can be used to track when and where animals are scanned
 */
export const logQRScan = async (
  animalId: string,
  animalData: {
    owner: string;
    type: string;
    breed: string;
    amuLevel: string;
    amuScore: number;
    mrlStatus: string;
  }
) => {
  try {
    await addDoc(collection(db, "qrScans"), {
      animalId,
      owner: animalData.owner,
      type: animalData.type,
      breed: animalData.breed,
      amuLevel: animalData.amuLevel,
      amuScore: animalData.amuScore,
      mrlStatus: animalData.mrlStatus,
      scannedAt: serverTimestamp(),
    });
    console.log("QR scan logged successfully");
  } catch (error) {
    console.error("Error logging QR scan:", error);
  }
};

/**
 * Parse QR code data
 */
export const parseQRData = (qrString: string) => {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    console.error("Invalid QR code data:", error);
    return null;
  }
};

/**
 * Generate QR code data string
 */
export const generateQRData = (animalData: {
  id: string;
  owner: string;
  type: string;
  breed: string;
  amu: string;
  amuScore: number;
  mrl: string;
}) => {
  return JSON.stringify({
    ...animalData,
    scannedAt: new Date().toISOString(),
  });
};
