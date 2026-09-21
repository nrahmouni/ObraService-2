import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfigPlaceholder from '../../firebase-applet-config.json';

const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfigPlaceholder.projectId;

if (!getApps().length) {
  initializeApp({
    projectId,
  });
}

export const adminAuth = getAuth();
