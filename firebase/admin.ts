import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  type: "service_account",
  project_id: "aimockinterviews-85ace-a8817",
  private_key_id: "31b0752cd9fd14e78a92e7b78f533c1100431004",
  private_key: "-----BEGIN PRIVATE KEY-----\n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\nXvcX/Q72J/+owPf42Gshy20=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@aimockinterviews-85ace-a8817.iam.gserviceaccount.com",
  client_id: "114797874106543523907",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aimockinterviews-85ace-a8817.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

let _auth: ReturnType<typeof getAuth> | undefined;
let _db: ReturnType<typeof getFirestore> | undefined;

function getAdminApp() {
  const apps = getApps();
  return apps.length ? apps[0] : initializeApp({ credential: cert(serviceAccount) });
}

export function getAdminAuth() {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}

export function getAdminDb() {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}
