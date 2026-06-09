// ═══════════════════════════════════════════════════════════════
// Firebase Configuration — Placeholder
// Replace with your actual Firebase project credentials
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, type DatabaseReference } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBl9gDQLfrMuTJTPLkPyBBCB2qTq0BqxoM",
  authDomain: "riverpulse-e15de.firebaseapp.com",
  databaseURL: "https://riverpulse-e15de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "riverpulse-e15de",
  storageBucket: "riverpulse-e15de.firebasestorage.app",
  messagingSenderId: "830884163247",
  appId: "1:830884163247:web:83b3bf55b9cdfb3d7a6e5a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// ── Sensor data listener ───────────────────────────────────
export interface SensorReading {
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  do_level: number;
  conductivity: number;
  timestamp: number;
}

export function subscribeSensorData(
  lakeId: string,
  callback: (data: SensorReading | null) => void
): () => void {
  const sensorRef: DatabaseReference = ref(db, `sensors/${lakeId}/latest`);
  const unsubscribe = onValue(sensorRef, (snapshot) => {
    const val = snapshot.val();
    callback(val as SensorReading | null);
  }, (error) => {
    console.warn(`Firebase listener error for ${lakeId}:`, error);
    callback(null);
  });
  return () => unsubscribe();
}
