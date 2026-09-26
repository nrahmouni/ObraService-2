import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';
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
import { ClientsCrmView } from '../views/ClientsCrmView';
import { WebAdminView } from '../views/WebAdminView';
import { AppState } from '../types';
import { obraStore } from '../services/store';

interface AdminShellProps {
  state: AppState;
}

export const AdminShell: React.FC<AdminShellProps> = ({ state }) => {
  const navigate = useNavigate();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = state.currentUser;

  return (
    <AuthenticatedLayout
      currentUser={currentUser}
      state={state}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={
          <DashboardView 
            state={state} 
            onNavigate={(t) => navigate(`/admin/${t}`)} 
            onOpenNewReport={() => navigate('/admin/reports/nuevo')} 
          />
        } />
        <Route path="/clients" element={<ClientsCrmView state={state} />} />
        <Route path="/crm" element={<Navigate to="/admin/clients" replace />} />
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
          <ProjectsView state={state} onNavigate={(t) => navigate(`/admin/${t}`)} />
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
        <Route path="/web-admin" element={<WebAdminView state={state} />} />
        <Route path="/master" element={<Navigate to="/admin/web-admin" replace />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AuthenticatedLayout>
  );
};

