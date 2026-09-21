import React, { useState } from 'react';
import { MainLayout, TabKey } from './MainLayout';
import { DashboardView } from '../views/DashboardView';
import { DailyReportsView } from '../views/DailyReportsView';
import { DeliveryNotesView } from '../views/DeliveryNotesView';
import { ProjectsView } from '../views/ProjectsView';
import { MapView } from '../views/MapView';
import { TeamView } from '../views/TeamView';
import { AuditTrailView } from '../views/AuditTrailView';
import { SettingsView } from '../views/SettingsView';
import { IntegrationsView } from '../views/IntegrationsView';
import { DocsView } from '../views/DocsView';
import { AppState, Role } from '../types';
import { obraStore } from '../services/store';

interface AdminShellProps {
  state: AppState;
}

export const AdminShell: React.FC<AdminShellProps> = ({ state }) => {
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const currentUser = state.currentUser || {
    id: 'usr_admin',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@construccionesnorte.es',
    role: Role.ADMIN,
    companyId: 'comp_main',
    active: true,
    assignedProjectIds: [],
    createdAt: new Date().toISOString()
  };

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      currentUser={currentUser}
      isDemoMode={state.isDemoMode}
      onExitDemoToProduction={() => obraStore.exitDemoMode()}
    >
      {currentTab === 'dashboard' && <DashboardView state={state} onNavigate={(t) => setCurrentTab(t as any)} onOpenNewReport={() => {}} />}
      {currentTab === 'reports' && <DailyReportsView state={state} onOpenReportModal={() => {}} />}
      {currentTab === 'delivery_notes' && <DeliveryNotesView state={state} />}
      {currentTab === 'projects' && <ProjectsView state={state} onNavigate={(t) => setCurrentTab(t as any)} />}
      {currentTab === 'map' && <MapView state={state} />}
      {currentTab === 'team' && <TeamView state={state} />}
      {currentTab === 'audit' && <AuditTrailView state={state} />}
      {currentTab === 'settings' && <SettingsView state={state} />}
      {currentTab === 'integrations' && <IntegrationsView state={state} />}
      {currentTab === 'docs' && <DocsView state={state} />}
    </MainLayout>
  );
};
