/**
 * Централизирана Firebase иницијализација.
 *
 * Сите `VITE_FIREBASE_*` варијабли мораат да бидат дефинирани во `.env`
 * (види `.env.example`). Во dev, ако недостасуваат — фрла јасна грешка.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Application namespace за Firestore колекциски патеки. */
export const APP_ID = 'makedo-test-v6-ultimate';

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0 && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    `[firebase] Недостасуваат env варијабли: ${missing.join(', ')}. ` +
      `Копирај .env.example во .env и пополни ги вредностите.`
  );
}

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
