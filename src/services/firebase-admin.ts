import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let firebaseConfigPlaceholder: Record<string, any> = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    firebaseConfigPlaceholder = JSON.parse(raw);
  }
} catch (err) {
  // Safe fallback if config file is absent
}

const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfigPlaceholder.projectId || 'obra-service-app';

if (!getApps().length) {
  initializeApp({
    projectId,
  });
}

export const adminAuth = getAuth();

