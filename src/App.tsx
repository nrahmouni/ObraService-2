import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { obraStore } from './services/store';
import { initializeFirebaseSync } from './services/firebaseSync';
import { AppState, Role } from './types';
import { AppDataProvider } from './context/AppDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginView } from './views/LoginView';
import { InviteAcceptanceView } from './views/InviteAcceptanceView';
import { AdminShell } from './components/AdminShell';
import { MobileShell } from './components/MobileShell';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster, toast } from 'react-hot-toast';
import { PublicEntryView } from './views/PublicEntryView';
import { MasterDashboardView } from './views/MasterDashboardView';
import { OnboardingView } from './views/OnboardingView';
import { NotFoundView } from './views/NotFoundView';
import { useIsMobile } from './hooks/useIsMobile';

const DemoEntryRedirect: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const navigate = useNavigate();
  useEffect(() => {
    obraStore.enterDemoMode();
    navigate(isMobile ? '/mobile/dashboard' : '/admin/dashboard', { replace: true });
  }, [navigate, isMobile]);
  return null;
};

const RootRouteElement: React.FC<{ currentUser: any; isMobile: boolean }> = ({ currentUser, isMobile }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const inviteCode = searchParams.get('invite') || searchParams.get('code') || searchParams.get('invitation') || searchParams.get('token');

  if (inviteCode) {
    return <Navigate to={`/invitation?code=${encodeURIComponent(inviteCode)}`} replace />;
  }

  if (currentUser) {
    if (currentUser.role === Role.WORKER) {
      return <Navigate to="/mobile/dashboard" replace />;
    }
    return <Navigate to={isMobile ? "/mobile/dashboard" : "/admin/dashboard"} replace />;
  }

  return (
    <PublicEntryView 
      onOpenLogin={() => navigate('/login')}
      onOpenRegister={() => navigate('/onboarding')}
      onOpenJoinCode={() => navigate('/invitation')}
      onDemoAccess={() => {
        obraStore.enterDemoMode();
        toast.success('🚀 Entorno Demo CRM Pro Max activado. Has iniciado sesión como Director General.');
        navigate(isMobile ? '/mobile/dashboard' : '/admin/dashboard');
      }}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>(obraStore.getState());
  
  // Robust media query detection forcing mobile layout under 768px
  const isMobile = useIsMobile(768);

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

  // Neumorphic Soft UI
  useEffect(() => {
    if (appState.uiStyle !== 'standard') {
      document.documentElement.classList.add('theme-neumorphic');
      document.body.classList.add('theme-neumorphic');
    } else {
      document.documentElement.classList.remove('theme-neumorphic');
      document.body.classList.remove('theme-neumorphic');
    }
  }, [appState.uiStyle]);

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
            currentUser.role === Role.WORKER || isMobile ? 
              <Navigate to="/mobile/dashboard" replace /> : 
              <Navigate to="/admin/dashboard" replace />
          ) : <LoginView />
        } />

        {/* Instant Demo Entry */}
        <Route path="/demo" element={<DemoEntryRedirect isMobile={isMobile} />} />

        {/* Invite Acceptance Routes */}
        <Route path="/invitation" element={<InviteAcceptanceView />} />
        <Route path="/invitation/:code" element={<InviteAcceptanceView />} />
        <Route path="/invite" element={<InviteAcceptanceView />} />
        <Route path="/invite/:code" element={<InviteAcceptanceView />} />

        {/* Onboarding & Company Registration */}
        <Route path="/onboarding" element={<OnboardingView onComplete={() => navigate(isMobile ? '/mobile/dashboard' : '/admin/dashboard')} />} />
        <Route path="/register" element={<OnboardingView onComplete={() => navigate(isMobile ? '/mobile/dashboard' : '/admin/dashboard')} />} />

        {/* King Master Admin Panel */}
        <Route path="/admin/master" element={
          <ProtectedRoute currentUser={currentUser}>
            <MasterDashboardView />
          </ProtectedRoute>
        } />
        <Route path="/master" element={<Navigate to="/admin/master" replace />} />

        {/* Admin / Manager Experience: Forces MobileShell on viewports < 768px */}
        <Route path="/admin/*" element={
          <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
            {isMobile ? <MobileShell state={appState} /> : <AdminShell state={appState} />}
          </ProtectedRoute>
        } />

        {/* Mobile Field / Worker Experience */}
        <Route path="/mobile/*" element={
          <ProtectedRoute currentUser={currentUser}>
            <MobileShell state={appState} />
          </ProtectedRoute>
        } />

        {/* Root Route Element with invitation interceptor and responsive landing */}
        <Route path="/" element={<RootRouteElement currentUser={currentUser} isMobile={isMobile} />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AppDataProvider>
  );
}
