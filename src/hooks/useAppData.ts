import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Project, DailyReport, DeliveryNote } from '../types';
import { obraStore } from '../services/store';

// Helper to load cache from localStorage
const getCachedData = <T>(key: string, fallback: T): T => {
  try {
    const cached = localStorage.getItem(`obraservice_offline_cache_${key}`);
    return cached ? JSON.parse(cached) : fallback;
  } catch (error) {
    console.warn(`[useAppData] Cache retrieval error for ${key}:`, error);
    return fallback;
  }
};

// Helper to write cache to localStorage
const setCachedData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`obraservice_offline_cache_${key}`, JSON.stringify(data));
  } catch (error) {
    console.warn(`[useAppData] Cache write error for ${key}:`, error);
  }
};

export function useAppData(companyId: string | null | undefined) {
  const storeState = obraStore.getState();
  const [projects, setProjects] = useState<Project[]>(() => storeState.projects || getCachedData('projects', []));
  const [reports, setReports] = useState<DailyReport[]>(() => storeState.reports || getCachedData('reports', []));
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(() => storeState.deliveryNotes || getCachedData('deliveryNotes', []));
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Sync network status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    // If no companyId or running in demo mode or without a Firebase Auth session,
    // rely directly on store state and offline cache
    if (!companyId || storeState.isDemoMode || !auth.currentUser) {
      setProjects(storeState.projects || []);
      setReports(storeState.reports || []);
      setDeliveryNotes(storeState.deliveryNotes || []);
      setLoading(false);
      return;
    }

    setLoading(true);

    // --- 1. Projects Real-Time Listener ---
    const projectsCol = collection(db, 'projects');
    const projectsQuery = query(projectsCol, where('companyId', '==', companyId));

    const unsubProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const list: Project[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Project);
        });

        setProjects(list);
        setCachedData('projects', list);
        obraStore.syncRemoteProjects(list);
        setLoading(false);
      },
      (error) => {
        console.warn('[useAppData] Projects sync warning (using offline cache):', error.message);
        const cached = getCachedData<Project[]>('projects', storeState.projects || []);
        setProjects(cached);
        setLoading(false);
      }
    );

    // --- 2. Daily Reports Real-Time Listener ---
    const reportsCol = collection(db, 'dailyReports');
    const reportsQuery = query(reportsCol, where('companyId', '==', companyId));

    const unsubReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const list: DailyReport[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as DailyReport);
        });

        setReports(list);
        setCachedData('reports', list);
        obraStore.syncRemoteReports(list);
      },
      (error) => {
        console.warn('[useAppData] Daily Reports sync warning (using offline cache):', error.message);
        const cached = getCachedData<DailyReport[]>('reports', storeState.reports || []);
        setReports(cached);
      }
    );

    // --- 3. Delivery Notes Real-Time Listener ---
    const deliveryNotesCol = collection(db, 'deliveryNotes');
    const deliveryNotesQuery = query(deliveryNotesCol, where('companyId', '==', companyId));

    const unsubDeliveryNotes = onSnapshot(
      deliveryNotesQuery,
      (snapshot) => {
        const list: DeliveryNote[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as DeliveryNote);
        });

        setDeliveryNotes(list);
        setCachedData('deliveryNotes', list);
        obraStore.syncRemoteDeliveryNotes(list);
      },
      (error) => {
        console.warn('[useAppData] Delivery Notes sync warning (using offline cache):', error.message);
        const cached = getCachedData<DeliveryNote[]>('deliveryNotes', storeState.deliveryNotes || []);
        setDeliveryNotes(cached);
      }
    );

    return () => {
      unsubProjects();
      unsubReports();
      unsubDeliveryNotes();
    };
  }, [companyId, storeState.isDemoMode]);

  return {
    projects,
    reports,
    deliveryNotes,
    loading,
    isOffline,
  };
}
