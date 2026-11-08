import 'server-only';
import { getAdminAuth, getAdminDb } from './firebase/admin';

// Thrown when the sign-in is valid but the person hasn't been approved.
export class NotEditorError extends Error {
  constructor() {
    super('Your account is not on the editors list yet.');
    this.name = 'NotEditorError';
  }
}

// Shared by the server actions and the image upload route. Verifies the
// caller's Firebase ID token and checks the `editors` collection. Add an
// editor by creating editors/{uid} in the Firebase console.
export async function requireEditor(idToken: string) {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase is not configured on the server.');
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const editor = await db.collection('editors').doc(decoded.uid).get();
  if (!editor.exists) {
    throw new NotEditorError();
  }
  return { db, uid: decoded.uid, name: decoded.name as string | undefined };
}
