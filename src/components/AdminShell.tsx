import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout, TabKey } from './MainLayout';
import { DashboardView } from '../views/DashboardView';
import { DailyReportsView } from '../views/DailyReportsView';
import { DeliveryNotesView } from '../views/DeliveryNotesView';
import { ProjectsView } from '../views/ProjectsView';
import { MapView } from '../views/MapView';
import { TeamView } from '../views/TeamView';
import { WorkersManagementView } from '../views/WorkersManagementView';
import { AuditTrailView } from '../views/AuditTrailView';
import { SettingsView } from '../views/SettingsView';
import { IntegrationsView } from '../views/IntegrationsView';
import { DocsView } from '../views/DocsView';
import { ProfileView } from '../views/ProfileView';
import { DailyReportWizard } from '../views/DailyReportWizard';
import { NotFoundView } from '../views/NotFoundView';
import { BillingView } from '../views/BillingView';
import { AppState } from '../types';
import { obraStore } from '../services/store';

interface AdminShellProps {
  state: AppState;
}

export const AdminShell: React.FC<AdminShellProps> = ({ state }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Determine current active tab based on path suffix
  const pathParts = location.pathname.split('/');
  // Match path parts, default to dashboard
  const subRoute = pathParts[2] || 'dashboard';
  const currentTab = subRoute as TabKey;

  const handleSelectTab = (tab: TabKey) => {
    navigate(`/admin/${tab}`);
  };

  const currentUser = state.currentUser;

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      currentUser={currentUser}
      isDemoMode={state.isDemoMode}
      onExitDemoToProduction={() => obraStore.exitDemoMode()}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={
          <DashboardView 
            state={state} 
            onNavigate={(t) => handleSelectTab(t as any)} 
            onOpenNewReport={() => navigate('/admin/reports/nuevo')} 
          />
        } />
        <Route path="/reports" element={
          <DailyReportsView 
            state={state} 
            onOpenReportModal={() => navigate('/admin/reports/nuevo')} 
          />
        } />
        <Route path="/reports/nuevo" element={
          <DailyReportWizard state={state} />
        } />
        <Route path="/delivery_notes" element={<DeliveryNotesView state={state} />} />
        <Route path="/projects" element={
          <ProjectsView state={state} onNavigate={(t) => handleSelectTab(t as any)} />
        } />
        <Route path="/map" element={<MapView state={state} />} />
        <Route path="/team" element={<TeamView state={state} />} />
        <Route path="/workers" element={<WorkersManagementView state={state} />} />
        <Route path="/audit" element={<AuditTrailView state={state} />} />
        <Route path="/settings" element={<SettingsView state={state} />} />
        <Route path="/integrations" element={<IntegrationsView state={state} />} />
        <Route path="/docs" element={<DocsView state={state} />} />
        <Route path="/profile" element={<ProfileView state={state} />} />
        <Route path="/billing" element={<BillingView state={state} />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </MainLayout>
  );
};

