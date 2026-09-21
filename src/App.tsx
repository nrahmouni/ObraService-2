import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { obraStore } from './services/store';
import { initializeFirebaseSync } from './services/firebaseSync';
import { AppState, User, Role } from './types';
import { AppDataProvider } from './context/AppDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicEntryView } from './views/PublicEntryView';
import { AuthModal } from './views/AuthModal';
import { OnboardingView } from './views/OnboardingView';
import { AppShell, TabKey } from './components/AppShell';
import { MainLayout } from './components/MainLayout';
import { MobileLayout } from './components/MobileLayout';
import { DashboardView } from './views/DashboardView';
import { DailyReportsView } from './views/DailyReportsView';
import { DeliveryNotesView } from './views/DeliveryNotesView';
import { ProjectsView } from './views/ProjectsView';
import { MapView } from './views/MapView';
import { TeamView } from './views/TeamView';
import { ChatView } from './views/ChatView';
import { AuditTrailView } from './views/AuditTrailView';
import { SettingsView } from './views/SettingsView';
import { IntegrationsView } from './views/IntegrationsView';
import { DocsView } from './views/DocsView';
import { NewReportModal } from './views/NewReportModal';
import { NotFoundView } from './views/NotFoundView';
import { InviteAcceptanceView } from './views/InviteAcceptanceView';
import { PublicLayout } from './components/PublicLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { DemoProfileSelector } from './components/DemoProfileSelector';

// Marketing Views
import { 
  ProductAgilizeView, 
  ProductHowItWorksView, 
  ProductSecurityView, 
  PricingPage 
} from './views/marketing/ProductViews';
import { 
  CompanyAboutView, 
  CompanyBlogView, 
  CompanyPressView, 
  CompanyContactView 
} from './views/marketing/CompanyViews';
import { 
  ResourcesApiView, 
  ResourcesGuideView, 
  ResourcesIntegrationsView, 
  LegalPrivacyView 
} from './views/marketing/ResourceViews';

import { Toaster } from 'react-hot-toast';

export default function App() {
  const [appState, setAppState] = useState<AppState>(obraStore.getState());
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'join_code' | null>(null);
  const [newReportModalOpen, setNewReportModalOpen] = useState(false);
  const [demoProfileSelectorOpen, setDemoProfileSelectorOpen] = useState(false);

  useEffect(() => {
    initializeFirebaseSync();
    const unsubscribe = obraStore.subscribe((newState) => {
      setAppState({ ...newState });
      if (!newState.currentUser) {
        setAuthModalMode(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentUser = appState.currentUser;
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const inviteParam = queryParams.get('invite') || queryParams.get('code');
  const [activeInviteCode, setActiveInviteCode] = useState<string | null>(inviteParam);

  useEffect(() => {
    const code = queryParams.get('invite') || queryParams.get('code');
    if (code) {
      setActiveInviteCode(code);
    }
  }, [location.search]);

  // Dark Mode Toggle
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  // Automatic redirect to app if logged in and on public routes
  useEffect(() => {
    const isPublicRoute = 
      location.pathname === '/' || 
      location.pathname.startsWith('/producto') || 
      location.pathname.startsWith('/empresa') ||
      location.pathname.startsWith('/recursos') ||
      location.pathname.startsWith('/blog') ||
      location.pathname.startsWith('/precios') ||
      location.pathname.startsWith('/legal');

    if (currentUser && isPublicRoute) {
      navigate('/app');
    }
  }, [currentUser, location.pathname, navigate]);

  const handleDemoAccess = () => {
    obraStore.enterDemoMode();
    obraStore.login('javier.ortiz@construccionesnorte.es');
    navigate('/app');
  };

  // Internal App Routing Wrapper
  const AuthenticatedApp = () => {
    if (!currentUser) return <Navigate to="/" />;
    
    if (!currentUser.companyId) {
      return (
        <OnboardingView
          onComplete={() => setAppState(obraStore.getState())}
        />
      );
    }

    return (
      <AppDataProvider companyId={currentUser.companyId}>
        <MobileLayout
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          isDemoMode={appState.isDemoMode}
          onExitDemoToProduction={() => obraStore.exitDemoMode()}
          onOpenNewReport={() => setNewReportModalOpen(true)}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              state={appState}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenNewReport={() => setNewReportModalOpen(true)}
            />
          )}
          {currentTab === 'reports' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
              <DailyReportsView state={appState} onOpenReportModal={() => setNewReportModalOpen(true)} />
            </ProtectedRoute>
          )}
          {currentTab === 'delivery_notes' && <DeliveryNotesView state={appState} />}
          {currentTab === 'projects' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
              <ProjectsView state={appState} onNavigate={(tab) => setCurrentTab(tab as any)} />
            </ProtectedRoute>
          )}
          {currentTab === 'chat' && <ChatView state={appState} />}
          {currentTab === 'map' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
              <MapView state={appState} />
            </ProtectedRoute>
          )}
          {currentTab === 'team' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.ADMIN}>
              <TeamView state={appState} />
            </ProtectedRoute>
          )}
          {currentTab === 'audit' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.ADMIN}>
              <AuditTrailView state={appState} />
            </ProtectedRoute>
          )}
          {currentTab === 'integrations' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.ADMIN}>
              <IntegrationsView state={appState} />
            </ProtectedRoute>
          )}
          {currentTab === 'docs' && <DocsView state={appState} />}
          {currentTab === 'settings' && (
            <ProtectedRoute currentUser={currentUser} minRole={Role.MANAGER}>
              <SettingsView state={appState} />
            </ProtectedRoute>
          )}

          {newReportModalOpen && (
            <NewReportModal
              state={appState}
              onClose={() => setNewReportModalOpen(false)}
              onSuccess={() => setCurrentTab('reports')}
            />
          )}
        </MobileLayout>
      </AppDataProvider>
    );
  };

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        {/* Public Marketing Routes */}
        <Route element={
          <PublicLayout 
            onOpenLogin={() => setAuthModalMode('login')} 
            onOpenRegister={() => setAuthModalMode('register')}
            onDemoAccess={() => setDemoProfileSelectorOpen(true)}
          />
        }>
          <Route path="/" element={
            <PublicEntryView
              onOpenLogin={() => setAuthModalMode('login')}
              onOpenRegister={() => setAuthModalMode('register')}
              onOpenJoinCode={() => setAuthModalMode('join_code')}
              onDemoAccess={() => setDemoProfileSelectorOpen(true)}
            />
          } />
          
          {/* Product */}
          <Route path="/producto/que-agilizamos" element={<ProductAgilizeView />} />
          <Route path="/producto/como-funciona" element={<ProductHowItWorksView />} />
          <Route path="/producto/seguridad" element={<ProductSecurityView />} />
          <Route path="/precios" element={<PricingPage />} />

          {/* Company */}
          <Route path="/empresa/quienes-somos" element={<CompanyAboutView />} />
          <Route path="/blog" element={<CompanyBlogView />} />
          <Route path="/empresa/prensa" element={<CompanyPressView />} />
          <Route path="/empresa/contacto" element={<CompanyContactView />} />

          {/* Resources */}
          <Route path="/recursos/api" element={<ResourcesApiView />} />
          <Route path="/recursos/guia" element={<ResourcesGuideView />} />
          <Route path="/integrations" element={<ResourcesIntegrationsView />} />
          
          {/* Legal */}
          <Route path="/legal" element={<LegalPrivacyView />} />
        </Route>

        {/* Protected App Route */}
        <Route path="/app/*" element={<AuthenticatedApp />} />
        
        {/* Fallback Custom 404 Page */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>

      {(activeInviteCode || authModalMode === 'join_code') && (
        <InviteAcceptanceView
          initialCode={activeInviteCode || ''}
          onClose={() => {
            setActiveInviteCode(null);
            if (authModalMode === 'join_code') setAuthModalMode(null);
            if (queryParams.get('invite') || queryParams.get('code')) {
              navigate(location.pathname, { replace: true });
            }
          }}
          onSuccess={() => {
            setActiveInviteCode(null);
            if (authModalMode === 'join_code') setAuthModalMode(null);
            navigate('/app');
          }}
        />
      )}

      {authModalMode && authModalMode !== 'join_code' && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={() => {
            setAuthModalMode(null);
            // Router will handle the redirect via Navigate if state updates
          }}
        />
      )}

      {demoProfileSelectorOpen && (
        <DemoProfileSelector
          onClose={() => setDemoProfileSelectorOpen(false)}
        />
      )}
    </>
  );
}
