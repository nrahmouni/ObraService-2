import { useState, useEffect, useMemo } from 'react';
import { Project, DailyReport, DeliveryNote } from '../types';
import { obraStore } from '../services/store';

export function useAppData(companyId: string | null | undefined) {
  const [storeState, setStoreState] = useState(() => obraStore.getState());
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

  // Subscribe to authoritative reactive store (synchronized by firebaseSync)
  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const isSubcontractor = storeState.currentUser?.role === 'SUBCONTRACTOR_USER';

  const projects = useMemo(() => {
    if (!companyId) return storeState.projects;
    return storeState.projects.filter(
      p => p.companyId === companyId || (isSubcontractor && p.assignedSubcontractorIds?.includes(companyId))
    );
  }, [storeState.projects, companyId, isSubcontractor]);

  const reports = useMemo(() => {
    if (!companyId) return storeState.reports;
    return storeState.reports.filter(r => r.companyId === companyId);
  }, [storeState.reports, companyId]);

  const deliveryNotes = useMemo(() => {
    if (!companyId) return storeState.deliveryNotes;
    return storeState.deliveryNotes.filter(
      dn => dn.companyId === companyId || dn.subcontractorCompanyId === companyId
    );
  }, [storeState.deliveryNotes, companyId]);

  return {
    projects,
    reports,
    deliveryNotes,
    loading: false,
    isOffline,
  };
}

