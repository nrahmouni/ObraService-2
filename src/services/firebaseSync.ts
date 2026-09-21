/**
 * ObraService - Firebase Cloud Firestore Synchronization Engine
 * Handles bidirectional real-time synchronization, defensive validation,
 * onSnapshot reactive listeners, and Firestore audit compliance.
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  Unsubscribe 
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, testFirebaseConnection } from './firebase';
import { obraStore } from './store';
import { AuditEvent, Company, DailyReport, DeliveryNote, Project, User, Worker } from '../types';
import { enqueueOfflineItem, sanitizeForFirestore, flushOfflineQueue } from '../utils/offlineQueue';

let activeUnsubscribers: Unsubscribe[] = [];
let isSyncInitialized = false;

/**
 * Initialize Firebase listeners, connection probe, and auth watcher.
 */
export function initializeFirebaseSync() {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  // Run connection test probe as required by Firebase skill
  testFirebaseConnection();

  // Wire outgoing mutations to Firestore
  obraStore.setSyncAdapter((entity, item) => {
    switch (entity) {
      case 'company':
        persistCompanyToFirestore(item);
        break;
      case 'project':
        persistProjectToFirestore(item);
        break;
      case 'worker':
        persistWorkerToFirestore(item);
        break;
      case 'dailyReport':
        persistDailyReportToFirestore(item);
        break;
      case 'deliveryNote':
        persistDeliveryNoteToFirestore(item);
        break;
      case 'auditEvent':
        persistAuditEventToFirestore(item);
        break;
      case 'user':
        persistUserToFirestore(item);
        break;
      case 'timeLog':
        persistTimeLogToFirestore(item);
        break;
      case 'invitation':
        persistInvitationToFirestore(item);
        break;
    }
  });

  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    // Teardown previous collection listeners
    activeUnsubscribers.forEach(unsub => unsub());
    activeUnsubscribers = [];

    if (firebaseUser) {
      console.log('Firebase Authenticated:', firebaseUser.email);
      // Switch store to production / synced mode
      const currentState = obraStore.getState();
      
      const existingUser = currentState.users.find(u => u.id === firebaseUser.uid);

      const mappedUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario ObraService',
        email: firebaseUser.email || '',
        role: existingUser?.role || (firebaseUser.email === 'naimrahmouni1998@gmail.com' ? 'MAIN_CONTRACTOR_ADMIN' : 'SITE_MANAGER'),
        companyId: existingUser?.companyId || '',
        companyName: existingUser?.companyName || '',
        active: existingUser?.active ?? true,
        assignedProjectIds: existingUser?.assignedProjectIds || [],
        createdAt: existingUser?.createdAt || new Date().toISOString(),
      };

      // Persist / update user profile in Firestore
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), mappedUser, { merge: true });
        
        // --- Sync to Cloud SQL ---
        const token = await firebaseUser.getIdToken();
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: mappedUser.name,
            role: mappedUser.role
          })
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }

      obraStore.setAuthenticatedFirebaseUser(mappedUser);

      // Attach real-time listeners to Firestore collections
      attachCollectionListeners();

      // Flush any queued offline mutations now that Firebase user is verified
      flushOfflineQueue().catch(err => {
        console.warn('[FirebaseSync] Queue flush on auth completed with notes:', err);
      });
    } else {
      console.log('Firebase User signed out.');
    }
  });
}

function attachCollectionListeners() {
  // 1. Companies Listener
  const companiesPath = 'companies';
  const unsubCompanies = onSnapshot(collection(db, companiesPath), (snapshot) => {
    const list: Company[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Company);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteCompanies(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${companiesPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${companiesPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubCompanies);

  // 2. Projects Listener
  const projectsPath = 'projects';
  const unsubProjects = onSnapshot(collection(db, projectsPath), (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Project);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteProjects(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${projectsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${projectsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubProjects);

  // 3. Workers Listener
  const workersPath = 'workers';
  const unsubWorkers = onSnapshot(collection(db, workersPath), (snapshot) => {
    const list: Worker[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Worker);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteWorkers(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${workersPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${workersPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubWorkers);

  // 4. Daily Reports Listener
  const reportsPath = 'dailyReports';
  const unsubReports = onSnapshot(collection(db, reportsPath), (snapshot) => {
    const list: DailyReport[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DailyReport);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteReports(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${reportsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${reportsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubReports);

  // 5. Delivery Notes Listener
  const deliveryNotesPath = 'deliveryNotes';
  const unsubDeliveryNotes = onSnapshot(collection(db, deliveryNotesPath), (snapshot) => {
    const list: DeliveryNote[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DeliveryNote);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteDeliveryNotes(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${deliveryNotesPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${deliveryNotesPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubDeliveryNotes);

  // 6. Audit Events Listener
  const auditEventsPath = 'auditEvents';
  const unsubAudit = onSnapshot(collection(db, auditEventsPath), (snapshot) => {
    const list: AuditEvent[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AuditEvent);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteAuditEvents(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${auditEventsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${auditEventsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubAudit);

  // 7. Users Listener
  const usersPath = 'users';
  const unsubUsers = onSnapshot(collection(db, usersPath), (snapshot) => {
    const list: User[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as User);
    });
    obraStore.setSyncError(null); // Clear error on successful sync
    obraStore.syncRemoteUsers(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${usersPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${usersPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubUsers);

  // 8. Time Logs Listener
  const timeLogsPath = 'time_logs';
  const unsubTimeLogs = onSnapshot(collection(db, timeLogsPath), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteTimeLogs(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${timeLogsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${timeLogsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubTimeLogs);

  // 9. Invitations Listener
  const invitationsPath = 'invitations';
  const unsubInvitations = onSnapshot(collection(db, invitationsPath), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data());
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteInvitations(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${invitationsPath}:`, error);
  });
  activeUnsubscribers.push(unsubInvitations);
}

// --- Outgoing Firestore Mutations ---

export async function persistCompanyToFirestore(company: Company) {
  const sanitized = sanitizeForFirestore(company);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('company', sanitized);
    return;
  }
  const path = `companies/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'companies', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('company', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistProjectToFirestore(project: Project) {
  const sanitized = sanitizeForFirestore(project);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('project', sanitized);
    return;
  }
  const path = `projects/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'projects', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('project', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistWorkerToFirestore(worker: Worker) {
  const sanitized = sanitizeForFirestore(worker);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('worker', sanitized);
    return;
  }
  const path = `workers/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'workers', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('worker', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistDailyReportToFirestore(report: DailyReport) {
  const sanitized = sanitizeForFirestore(report);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('dailyReport', sanitized);
    return;
  }
  const path = `dailyReports/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'dailyReports', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('dailyReport', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistDeliveryNoteToFirestore(note: DeliveryNote) {
  const sanitized = sanitizeForFirestore(note);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('deliveryNote', sanitized);
    return;
  }
  const path = `deliveryNotes/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'deliveryNotes', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('deliveryNote', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistAuditEventToFirestore(event: AuditEvent) {
  const sanitized = sanitizeForFirestore(event);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('auditEvent', sanitized);
    return;
  }
  const path = `auditEvents/${sanitized.id}`;
  try {
    if (auth.currentUser?.uid && (!sanitized.actorId || sanitized.actorId.startsWith('usr_'))) {
      sanitized.actorId = auth.currentUser.uid;
    }
    await setDoc(doc(db, 'auditEvents', sanitized.id), sanitized);
  } catch (error) {
    await enqueueOfflineItem('auditEvent', sanitized);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistUserToFirestore(user: User) {
  const sanitized = sanitizeForFirestore(user);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('user', sanitized);
    return;
  }
  const path = `users/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'users', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('user', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistTimeLogToFirestore(log: any) {
  const sanitized = sanitizeForFirestore(log);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('timeLog', sanitized);
    return;
  }
  const path = `time_logs/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'time_logs', sanitized.id), sanitized);
  } catch (error) {
    await enqueueOfflineItem('timeLog', sanitized);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistInvitationToFirestore(invitation: any) {
  const sanitized = sanitizeForFirestore(invitation);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('invitation', sanitized);
    return;
  }
  const path = `invitations/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'invitations', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('invitation', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
