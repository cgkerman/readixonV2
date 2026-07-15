import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: any = null;

function getFirebaseAdminApp() {
  if (app) return app;
  
  if (!getApps().length) {
    try {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
        }),
      });
      console.log('Firebase Admin SDK initialized lazily successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK lazy initialization error:', error);
      throw error;
    }
  } else {
    app = getApp();
  }
  return app;
}

export const getAdminDb = () => getFirestore(getFirebaseAdminApp());
export const getAdminAuth = () => getAuth(getFirebaseAdminApp());

// Backward compatibility for routes that don't need to be lazy immediately, but this might crash if top-level. 
// We will change the email route to use getters.
export const adminDb: any = new Proxy({}, {
  get: (target, prop) => {
    const db = getFirestore(getFirebaseAdminApp());
    return (db as any)[prop];
  }
});

export const adminAuth: any = new Proxy({}, {
  get: (target, prop) => {
    const auth = getAuth(getFirebaseAdminApp());
    return (auth as any)[prop];
  }
});
