import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _auth: ReturnType<typeof getAuth> | undefined;
let _db: ReturnType<typeof getFirestore> | undefined;

function getAdminApp() {
  const apps = getApps();
  if (apps.length) return apps[0];

  if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf-8");
    const serviceAccount = JSON.parse(decoded);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 env var is required");
}

export function getAdminAuth() {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}

export function getAdminDb() {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}
