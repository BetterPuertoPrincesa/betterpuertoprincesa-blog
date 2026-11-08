import 'server-only';
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Server-side Firebase. Uses a service account from env vars so it works
// the same locally and on Vercel. Returns null when unconfigured so the
// site still builds (with no posts) before Firebase is set up.
function getAdminApp(): App | null {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel stores multi-line values fine, but pasted keys often carry
  // literal "\n" sequences instead of newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) return null;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let warned = false;

export function getAdminDb() {
  const app = getAdminApp();
  if (!app) {
    if (!warned) {
      console.warn(
        'Firebase admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
      );
      warned = true;
    }
    return null;
  }
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase admin is not configured.');
  return getAuth(app);
}
