
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log('============================================================');
console.log('[Firebase Init] Attempting to load src/lib/firebase.ts...');
console.log('NodeJS Environment:', process.env.NODE_ENV);
console.log('Vercel Environment:', process.env.VERCEL_ENV);
console.log('============================================================');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log(`[Firebase Init] NEXT_PUBLIC_FIREBASE_API_KEY found (length): ${firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 'NOT FOUND'}`);
console.log(`[Firebase Init] NEXT_PUBLIC_FIREBASE_PROJECT_ID found: ${firebaseConfig.projectId ? 'Yes' : 'NO'}`);


if (!firebaseConfig.apiKey) {
  const errorMessage = `
CRITICAL_FIREBASE_STARTUP_ERROR: The 'NEXT_PUBLIC_FIREBASE_API_KEY' environment variable is MISSING.
This key is ESSENTIAL for Firebase services (Auth, Firestore) to work.
Your Next.js server, when deployed, WILL NOT START or function correctly without this key.

SOLUTION:
1. Ensure you have a .env.local file with NEXT_PUBLIC_FIREBASE_API_KEY set for local development.
2. For deployment (e.g., on Vercel):
   - Go to your Vercel project settings.
   - Navigate to the 'Environment Variables' section.
   - ADD a new environment variable:
     - Name: NEXT_PUBLIC_FIREBASE_API_KEY
     - Value: YOUR_ACTUAL_FIREBASE_API_KEY (from your Firebase project settings)
   - Redeploy your application.

The application server will now terminate or fail to initialize Firebase services properly.`;
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(errorMessage);
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // Throw an error to ensure the server process stops or logs this critical failure.
  throw new Error("CRITICAL_FIREBASE_STARTUP_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing.");
}

if (!firebaseConfig.projectId) {
  // This is critical for Firestore
   const errorMessage = `
CRITICAL_FIREBASE_STARTUP_ERROR: The 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' environment variable is MISSING.
This key is ESSENTIAL for Firestore to work.
Check your Vercel environment variables.

The application server will now terminate or fail to initialize Firebase services properly.`;
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(errorMessage);
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  throw new Error("CRITICAL_FIREBASE_STARTUP_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
}


if (!firebaseConfig.authDomain) {
  console.warn("WARNING: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing. This might affect Firebase Auth.");
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

console.log('[Firebase Init] Firebase initialized successfully.');

export { app, auth, db };
