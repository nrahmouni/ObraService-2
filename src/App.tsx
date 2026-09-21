import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { obraStore } from './services/store';
import { initializeFirebaseSync } from './services/firebaseSync';
import { AppState, Role } from './types';
import { AppDataProvider } from './context/AppDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginView } from './views/LoginView';
import { InviteAcceptanceView } from './views/InviteAcceptanceView';
import { AdminShell } from './components/AdminShell';
import { MobileShell } from './components/MobileShell';
import { DailyReportWizard } from './views/DailyReportWizard';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [appState, setAppState] = useState<AppState>(obraStore.getState());

  useEffect(() => {
    initializeFirebaseSync();
    const unsubscribe = obraStore.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const currentUser = appState.currentUser;

  // Dark Mode
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  return (
    <AppDataProvider companyId={currentUser?.companyId}>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        {/* Public Login */}
        <Route path="/login" element={
          currentUser ? (
            currentUser.role === Role.WORKER ? 
              <Navigate to="/mobile/dashboard" replace /> : 
              <Navigate to="/admin/dashboard" replace />
          ) : <LoginView />
        } />

        {/* Invite Acceptance */}
        <Route path="/invitation" element={<InviteAcceptanceView />} />
        <Route path="/invite" element={<InviteAcceptanceView />} />

        {/* Admin / Manager Desktop Experience */}
        <Route path="/admin/*" element={
          <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
            <AdminShell state={appState} />
          </ProtectedRoute>
        } />

        {/* Mobile Field / Worker Experience */}
        <Route path="/mobile/dashboard" element={
          <ProtectedRoute currentUser={currentUser}>
            <MobileShell state={appState} />
          </ProtectedRoute>
        } />

        <Route path="/mobile/nuevo-parte" element={
          <ProtectedRoute currentUser={currentUser}>
            <DailyReportWizard state={appState} />
          </ProtectedRoute>
        } />

        {/* Root Redirect */}
        <Route path="/" element={
          currentUser ? (
            currentUser.role === Role.WORKER ? 
              <Navigate to="/mobile/dashboard" replace /> : 
              <Navigate to="/admin/dashboard" replace />
          ) : <Navigate to="/login" replace />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppDataProvider>
  );
}
