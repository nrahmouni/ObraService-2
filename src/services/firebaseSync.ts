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
  Unsubscribe,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, testFirebaseConnection } from './firebase';
import { obraStore } from './store';
import { AuditEvent, Company, DailyReport, DeliveryNote, Project, User, Worker, TimeLog, Invitation, NotificationItem } from '../types';
import { enqueueOfflineItem, sanitizeForFirestore, flushOfflineQueue } from '../utils/offlineQueue';

let activeUnsubscribers: Unsubscribe[] = [];
let isSyncInitialized = false;

/**
 * Initialize Firebase listeners, connection probe, and auth watcher.
 */
export function initializeFirebaseSync() {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  // Configure local persistence so users stay logged in across browser restarts
  if (auth) {
    try {
      setPersistence(auth, browserLocalPersistence).catch(err => {
        console.warn('[FirebaseSync] Error setting local persistence:', err);
      });
    } catch (err) {
      console.warn('[FirebaseSync] Exception setting persistence:', err);
    }
  }

  // Run connection test probe as required by Firebase skill
  testFirebaseConnection();

  // Wire outgoing mutations to Firestore
  obraStore.setSyncAdapter((entity, item) => {
    switch (entity) {
      case 'company':
        persistCompanyToFirestore(item as Company);
        break;
      case 'project':
        persistProjectToFirestore(item as Project);
        break;
      case 'worker':
        persistWorkerToFirestore(item as Worker);
        break;
      case 'dailyReport':
        persistDailyReportToFirestore(item as DailyReport);
        break;
      case 'deliveryNote':
        persistDeliveryNoteToFirestore(item as DeliveryNote);
        break;
      case 'auditEvent':
        persistAuditEventToFirestore(item as AuditEvent);
        break;
      case 'user':
        persistUserToFirestore(item as User);
        break;
      case 'timeLog':
        persistTimeLogToFirestore(item as TimeLog);
        break;
      case 'invitation':
        persistInvitationToFirestore(item as Invitation);
        break;
      case 'notification':
        persistNotificationToFirestore(item as NotificationItem);
        break;
    }
  });

  if (auth) {
    try {
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
            role: existingUser?.role || 'SITE_MANAGER',
            companyId: existingUser?.companyId || '',
            companyName: existingUser?.companyName || '',
            active: existingUser?.active ?? true,
            assignedProjectIds: existingUser?.assignedProjectIds || [],
            createdAt: existingUser?.createdAt || new Date().toISOString(),
          };

          // Persist / update user profile in Firestore (Single Source of Truth)
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), mappedUser, { merge: true });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
          }

          obraStore.setAuthenticatedFirebaseUser(mappedUser);

          // Attach real-time listeners to Firestore collections with tenant isolation
          attachCollectionListeners(mappedUser);

          // Flush any queued offline mutations now that Firebase user is verified
          flushOfflineQueue().catch(err => {
            console.warn('[FirebaseSync] Queue flush on auth completed with notes:', err);
          });
        } else {
          console.log('Firebase User signed out.');
          stopFirebaseSync();
        }
      }, (error) => {
        console.warn('[FirebaseSync] Auth state change warning:', error?.message || error);
      });
    } catch (err) {
      console.warn('[FirebaseSync] Exception attaching auth observer:', err);
    }
  }
}

/**
 * Detach all active Firestore listeners to prevent memory leaks and cross-tenant data leaks.
 */
export function stopFirebaseSync() {
  if (activeUnsubscribers.length > 0) {
    activeUnsubscribers.forEach(unsub => {
      try {
        unsub();
      } catch (err) {
        console.warn('[FirebaseSync] Error unsubscribing listener:', err);
      }
    });
    activeUnsubscribers = [];
  }
}

function attachCollectionListeners(user?: User | null) {
  // Always unsubscribe previous listeners before attaching new ones
  stopFirebaseSync();

  const currentUser = user || obraStore.getState().currentUser;
  const companyId = currentUser?.companyId;
  const isSubcontractor = currentUser?.role === 'SUBCONTRACTOR_USER';

  // 1. Companies Listener
  const companiesPath = 'companies';
  const unsubCompanies = onSnapshot(collection(db, companiesPath), (snapshot) => {
    const list: Company[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Company);
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteCompanies(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${companiesPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${companiesPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubCompanies);

  // 2. Projects Listener (Tenant isolated if companyId is set)
  const projectsPath = 'projects';
  const projectsQuery = (companyId && !isSubcontractor)
    ? query(collection(db, projectsPath), where('companyId', '==', companyId))
    : collection(db, projectsPath);

  const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Project);
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteProjects(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${projectsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${projectsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubProjects);

  // 3. Workers Listener (Tenant isolated if companyId is set)
  const workersPath = 'workers';
  const workersQuery = companyId
    ? query(collection(db, workersPath), where('companyId', '==', companyId))
    : collection(db, workersPath);

  const unsubWorkers = onSnapshot(workersQuery, (snapshot) => {
    const list: Worker[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Worker);
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteWorkers(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${workersPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${workersPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubWorkers);

  // 4. Daily Reports Listener (Tenant isolated to owning company - ordered & paginated)
  const reportsPath = 'dailyReports';
  const reportsQuery = (companyId && !isSubcontractor)
    ? query(collection(db, reportsPath), where('companyId', '==', companyId), orderBy('date', 'desc'), limit(100))
    : query(collection(db, reportsPath), orderBy('date', 'desc'), limit(100));

  const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
    const list: DailyReport[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DailyReport);
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteReports(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${reportsPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${reportsPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubReports);

  // 5. Delivery Notes Listener (Tenant isolated for both Subcontractor and Main Contractor - ordered & paginated)
  const deliveryNotesPath = 'deliveryNotes';
  const deliveryNotesQuery = isSubcontractor
    ? (companyId ? query(collection(db, deliveryNotesPath), where('subcontractorCompanyId', '==', companyId), orderBy('date', 'desc'), limit(100)) : query(collection(db, deliveryNotesPath), orderBy('date', 'desc'), limit(100)))
    : (companyId ? query(collection(db, deliveryNotesPath), where('companyId', '==', companyId), orderBy('date', 'desc'), limit(100)) : query(collection(db, deliveryNotesPath), orderBy('date', 'desc'), limit(100)));

  const unsubDeliveryNotes = onSnapshot(deliveryNotesQuery, (snapshot) => {
    const list: DeliveryNote[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DeliveryNote);
    });
    obraStore.setSyncError(null);
    obraStore.syncRemoteDeliveryNotes(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${deliveryNotesPath}:`, error);
    obraStore.setSyncError(`Error al sincronizar ${deliveryNotesPath}: ${error.message}`);
  });
  activeUnsubscribers.push(unsubDeliveryNotes);

  // 6. Audit Events Listener (Limited for scaling performance)
  const auditEventsPath = 'auditEvents';
  const auditEventsQuery = query(collection(db, auditEventsPath), orderBy('timestamp', 'desc'), limit(150));
  const unsubAudit = onSnapshot(auditEventsQuery, (snapshot) => {
    const list: AuditEvent[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AuditEvent);
    });
    obraStore.setSyncError(null);
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
    obraStore.setSyncError(null);
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

  // 10. Notifications Listener
  const notificationsPath = 'notifications';
  const notificationsQuery = companyId
    ? query(collection(db, notificationsPath), where('userId', '==', currentUser?.id || ''))
    : collection(db, notificationsPath);

  const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
    const list: NotificationItem[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as NotificationItem);
    });
    obraStore.syncRemoteNotifications(list);
  }, (error) => {
    console.error(`[FirebaseSync] Error syncing ${notificationsPath}:`, error);
  });
  activeUnsubscribers.push(unsubNotifications);
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

export async function persistTimeLogToFirestore(log: TimeLog) {
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

export async function persistInvitationToFirestore(invitation: Invitation) {
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

export async function persistNotificationToFirestore(notification: NotificationItem) {
  const sanitized = sanitizeForFirestore(notification);
  if (!auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueOfflineItem('notification', sanitized);
    return;
  }
  const path = `notifications/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'notifications', sanitized.id), sanitized, { merge: true });
  } catch (error) {
    await enqueueOfflineItem('notification', sanitized);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
