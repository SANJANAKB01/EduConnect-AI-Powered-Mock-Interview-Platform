import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Parse the .env format string from Vercel
function parseEnvString(envStr: string) {
  const result: Record<string, string> = {};
  const lines = envStr.split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)="(.*)"/);
    if (match) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

const initFirebaseAdmin = () => {
    const apps = getApps();

    if (!apps.length) {
        let projectId = process.env.FIREBASE_PROJECT_ID;
        let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

        // Fallback: Read from the combined Vercel variable if individual ones are missing
        if (!projectId && process.env.FIREBASE_ADMIN_CONFIG) {
            const parsed = parseEnvString(process.env.FIREBASE_ADMIN_CONFIG);
            projectId = parsed.FIREBASE_PROJECT_ID;
            clientEmail = parsed.FIREBASE_CLIENT_EMAIL;
            privateKey = parsed.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        }

        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
};

export const { auth, db } = initFirebaseAdmin();
