import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { PublicEntryView } from './views/PublicEntryView';
import { MasterDashboardView } from './views/MasterDashboardView';
import { OnboardingView } from './views/OnboardingView';
import { NotFoundView } from './views/NotFoundView';
import { toast } from 'react-hot-toast';

export default function App() {
  const navigate = useNavigate();
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
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#ea580c',
              secondary: '#ffffff',
            },
          },
        }} 
      />
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

        {/* Onboarding & Company Registration */}
        <Route path="/onboarding" element={<OnboardingView onComplete={() => navigate('/admin/dashboard')} />} />
        <Route path="/register" element={<OnboardingView onComplete={() => navigate('/admin/dashboard')} />} />

        {/* King Master Admin Panel */}
        <Route path="/admin/master" element={
          <ProtectedRoute currentUser={currentUser}>
            <MasterDashboardView />
          </ProtectedRoute>
        } />
        <Route path="/master" element={<Navigate to="/admin/master" replace />} />

        {/* Admin / Manager Desktop Experience */}
        <Route path="/admin/*" element={
          <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
            <AdminShell state={appState} />
          </ProtectedRoute>
        } />

        {/* Mobile Field / Worker Experience */}
        <Route path="/mobile/*" element={
          <ProtectedRoute currentUser={currentUser}>
            <MobileShell state={appState} />
          </ProtectedRoute>
        } />

        {/* Root Redirect to Landing Page or Dashboard */}
        <Route path="/" element={
          currentUser ? (
            currentUser.role === Role.WORKER ? 
              <Navigate to="/mobile/dashboard" replace /> : 
              <Navigate to="/admin/dashboard" replace />
          ) : (
            <PublicEntryView 
              onOpenLogin={() => navigate('/login')}
              onOpenRegister={() => navigate('/onboarding')}
              onOpenJoinCode={() => navigate('/invitation')}
              onDemoAccess={() => {
                obraStore.enterDemoMode();
                toast.success('Entorno Demo de ObraService activado con éxito.');
                navigate('/login');
              }}
            />
          )
        } />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AppDataProvider>
  );
}
