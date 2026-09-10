import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _auth: ReturnType<typeof getAuth> | undefined;
let _db: ReturnType<typeof getFirestore> | undefined;

function getAdminApp() {
  const apps = getApps();
  if (apps.length) return apps[0];

  // Try base64 env var first (Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decoded);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback to local JSON file
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require('../serviceAccountKey.json');
    return initializeApp({ credential: cert(serviceAccount) });
  } catch {
    throw new Error('Firebase admin credentials not found. Set FIREBASE_SERVICE_ACCOUNT_B64 env var.');
  }
}

export function getAdminAuth() {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}

export function getAdminDb() {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}
