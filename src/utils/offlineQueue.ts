import localforage from 'localforage';
import { toast } from 'react-hot-toast';
import { db, auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Initialize dedicated localforage store for our offline queue
const syncQueueStore = localforage.createInstance({
  name: 'obraservice_pwa',
  storeName: 'offline_sync_queue'
});

export interface QueueItem {
  id: string; // Entity ID (e.g., dr_12345)
  entity: 'dailyReport' | 'deliveryNote' | 'timeLog' | 'project' | 'worker' | 'machinery' | 'auditEvent' | 'user' | 'company' | 'invitation';
  data: any;
  timestamp: number;
  retryCount?: number;
  lastError?: string;
}

/**
 * Recursively strips undefined values from an object, which Firestore rejects.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return data;
}

/**
 * Add an item to the offline sync queue.
 */
export async function enqueueOfflineItem(entity: QueueItem['entity'], data: any): Promise<void> {
  const sanitized = sanitizeForFirestore(data);
  const id = sanitized?.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const item: QueueItem = {
    id,
    entity,
    data: sanitized,
    timestamp: Date.now(),
    retryCount: 0
  };

  await syncQueueStore.setItem(id, item);
  console.log(`[OfflineQueue] Item queued successfully for ${entity}:`, id);
  toast.success(`Modo sin conexión: Cambios guardados localmente (${entity.toUpperCase()}). Se sincronizarán al recuperar cobertura.`, {
    id: `offline-queued-${id}`,
    duration: 4000
  });
}

/**
 * Retrieve all pending items from the queue.
 */
export async function getPendingItems(): Promise<QueueItem[]> {
  const items: QueueItem[] = [];
  await syncQueueStore.iterate((value: QueueItem) => {
    items.push(value);
  });
  // Sort by timestamp to preserve chronological ordering
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Remove an item from the queue after successful synchronization.
 */
export async function dequeueItem(id: string): Promise<void> {
  await syncQueueStore.removeItem(id);
  console.log('[OfflineQueue] Dequeued item:', id);
}

/**
 * Flush and synchronize the entire queue with Firebase Firestore when network is restored.
 */
export async function flushOfflineQueue(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  // Defer cloud sync if not yet authenticated with Firebase
  if (!auth.currentUser) {
    console.log('[OfflineQueue] User not authenticated with Firebase. Deferring queue flush until auth is ready.');
    return;
  }

  const pending = await getPendingItems();
  if (pending.length === 0) return;

  toast.loading(`Sincronizando ${pending.length} acciones guardadas sin conexión...`, { id: 'flush-queue' });

  let successCount = 0;
  for (const item of pending) {
    try {
      let collectionName = '';
      switch (item.entity) {
        case 'company':
          collectionName = 'companies';
          break;
        case 'project':
          collectionName = 'projects';
          break;
        case 'worker':
          collectionName = 'workers';
          break;
        case 'dailyReport':
          collectionName = 'dailyReports';
          break;
        case 'deliveryNote':
          collectionName = 'deliveryNotes';
          break;
        case 'auditEvent':
          collectionName = 'auditEvents';
          break;
        case 'user':
          collectionName = 'users';
          break;
        case 'timeLog':
          collectionName = 'time_logs';
          break;
        case 'invitation':
          collectionName = 'invitations';
          break;
        default:
          collectionName = 'unknown';
      }

      if (collectionName && collectionName !== 'unknown') {
        const sanitizedData = sanitizeForFirestore(item.data);

        if (item.entity === 'auditEvent') {
          if (auth.currentUser?.uid && (!sanitizedData.actorId || sanitizedData.actorId.startsWith('usr_'))) {
            sanitizedData.actorId = auth.currentUser.uid;
          }
          await setDoc(doc(db, collectionName, item.id), sanitizedData);
        } else {
          await setDoc(doc(db, collectionName, item.id), sanitizedData, { merge: true });
        }
        await dequeueItem(item.id);
        successCount++;
      } else {
        await dequeueItem(item.id);
      }
    } catch (err: any) {
      console.error(`[OfflineQueue] Error syncing item ${item.id}:`, err);
      const retries = ((item as any).retryCount || 0) + 1;
      if (retries >= 3) {
        console.warn(`[OfflineQueue] Discarding unrecoverable queue item ${item.id} after 3 failed attempts.`);
        await dequeueItem(item.id);
      } else {
        await syncQueueStore.setItem(item.id, {
          ...item,
          retryCount: retries,
          lastError: err?.message || String(err)
        });
      }
    }
  }

  toast.dismiss('flush-queue');
  if (successCount > 0) {
    toast.success(`¡Sincronización completada! ${successCount} registros subidos a la nube.`, {
      id: 'flush-success',
      duration: 5000
    });
  }
}

// Wire automatic synchronization on network online trigger
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Connection restored. Flushing queue...');
    flushOfflineQueue().catch(err => {
      console.error('[OfflineQueue] Auto-flush error:', err);
    });
  });

  // Flush on initial startup if online
  if (navigator.onLine) {
    flushOfflineQueue().catch(err => {
      console.error('[OfflineQueue] Initial startup flush error:', err);
    });
  }
}
