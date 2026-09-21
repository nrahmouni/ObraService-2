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
    obraStore.syncRemoteCompanies(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, companiesPath);
  });
  activeUnsubscribers.push(unsubCompanies);

  // 2. Projects Listener
  const projectsPath = 'projects';
  const unsubProjects = onSnapshot(collection(db, projectsPath), (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Project);
    });
    obraStore.syncRemoteProjects(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, projectsPath);
  });
  activeUnsubscribers.push(unsubProjects);

  // 3. Workers Listener
  const workersPath = 'workers';
  const unsubWorkers = onSnapshot(collection(db, workersPath), (snapshot) => {
    const list: Worker[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Worker);
    });
    obraStore.syncRemoteWorkers(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, workersPath);
  });
  activeUnsubscribers.push(unsubWorkers);

  // 4. Daily Reports Listener
  const reportsPath = 'dailyReports';
  const unsubReports = onSnapshot(collection(db, reportsPath), (snapshot) => {
    const list: DailyReport[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DailyReport);
    });
    obraStore.syncRemoteReports(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, reportsPath);
  });
  activeUnsubscribers.push(unsubReports);

  // 5. Delivery Notes Listener
  const deliveryNotesPath = 'deliveryNotes';
  const unsubDeliveryNotes = onSnapshot(collection(db, deliveryNotesPath), (snapshot) => {
    const list: DeliveryNote[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DeliveryNote);
    });
    obraStore.syncRemoteDeliveryNotes(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, deliveryNotesPath);
  });
  activeUnsubscribers.push(unsubDeliveryNotes);

  // 6. Audit Events Listener
  const auditEventsPath = 'auditEvents';
  const unsubAudit = onSnapshot(collection(db, auditEventsPath), (snapshot) => {
    const list: AuditEvent[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AuditEvent);
    });
    obraStore.syncRemoteAuditEvents(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, auditEventsPath);
  });
  activeUnsubscribers.push(unsubAudit);

  // 7. Users Listener
  const usersPath = 'users';
  const unsubUsers = onSnapshot(collection(db, usersPath), (snapshot) => {
    const list: User[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as User);
    });
    obraStore.syncRemoteUsers(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, usersPath);
  });
  activeUnsubscribers.push(unsubUsers);
}

// --- Outgoing Firestore Mutations ---

export async function persistCompanyToFirestore(company: Company) {
  const path = `companies/${company.id}`;
  try {
    await setDoc(doc(db, 'companies', company.id), company, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistProjectToFirestore(project: Project) {
  const path = `projects/${project.id}`;
  try {
    await setDoc(doc(db, 'projects', project.id), project, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistWorkerToFirestore(worker: Worker) {
  const path = `workers/${worker.id}`;
  try {
    await setDoc(doc(db, 'workers', worker.id), worker, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistDailyReportToFirestore(report: DailyReport) {
  const path = `dailyReports/${report.id}`;
  try {
    await setDoc(doc(db, 'dailyReports', report.id), report, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistDeliveryNoteToFirestore(note: DeliveryNote) {
  const path = `deliveryNotes/${note.id}`;
  try {
    await setDoc(doc(db, 'deliveryNotes', note.id), note, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistAuditEventToFirestore(event: AuditEvent) {
  const path = `auditEvents/${event.id}`;
  try {
    await setDoc(doc(db, 'auditEvents', event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistUserToFirestore(user: User) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
