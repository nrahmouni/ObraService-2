import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';
import { DashboardView } from '../views/DashboardView';
import { DailyReportsView } from '../views/DailyReportsView';
import { DeliveryNotesView } from '../views/DeliveryNotesView';
import { ProjectsView } from '../views/ProjectsView';
import { MapView } from '../views/MapView';
import { TeamView } from '../views/TeamView';
import { WorkersManagementView } from '../views/WorkersManagementView';
import { ClientsCrmView } from '../views/ClientsCrmView';
import { AuditTrailView } from '../views/AuditTrailView';
import { SettingsView } from '../views/SettingsView';
import { IntegrationsView } from '../views/IntegrationsView';
import { DocsView } from '../views/DocsView';
import { ProfileView } from '../views/ProfileView';
import { BillingView } from '../views/BillingView';
import { WebAdminView } from '../views/WebAdminView';
import { DailyReportWizard } from '../views/DailyReportWizard';
import { MobileChatView } from '../views/MobileChatView';
import { MobileClockInView } from '../views/MobileClockInView';
import { NotFoundView } from '../views/NotFoundView';
import { MobileLanding } from './MobileLanding';
import { AppState, Role } from '../types';

interface MobileShellProps {
  state: AppState;
}

export const MobileShell: React.FC<MobileShellProps> = ({ state }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = state.currentUser;
  const isWorkerRole = currentUser.role === Role.WORKER || (currentUser.role as string) === 'SUBCONTRACTOR_USER';
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/mobile';

  return (
    <AuthenticatedLayout
      currentUser={currentUser}
      state={state}
    >
      {/* Strict Responsive Bounds: 360px to 1440px without overflow or landscape breakage */}
      <div className="w-full max-w-[1440px] min-w-[360px] mx-auto overflow-x-hidden transition-all duration-200">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />

          {/* Dynamic Role-Adaptive Field Dashboard */}
          <Route path="/dashboard" element={
            isWorkerRole ? (
              <MobileLanding 
                state={state}
                onNavigate={(tab) => navigate(`${basePath}/${tab}`)}
                onOpenNewReport={() => navigate(`${basePath}/reports/nuevo`)}
              />
            ) : (
              <div className="w-full max-w-5xl mx-auto">
                <DashboardView 
                  state={state} 
                  onNavigate={(t) => navigate(`${basePath}/${t}`)} 
                  onOpenNewReport={() => navigate(`${basePath}/reports/nuevo`)} 
                />
              </div>
            )
          } />

          {/* Core Operations Routes */}
          <Route path="/reports" element={
            <DailyReportsView 
              state={state} 
              onOpenReportModal={() => navigate(`${basePath}/reports/nuevo`)} 
            />
          } />
          <Route path="/reports/nuevo" element={<DailyReportWizard state={state} />} />
          <Route path="/nuevo-parte" element={<DailyReportWizard state={state} />} />
          <Route path="/delivery_notes" element={<DeliveryNotesView state={state} />} />
          <Route path="/projects" element={
            <ProjectsView state={state} onNavigate={(t) => navigate(`${basePath}/${t}`)} />
          } />
          <Route path="/map" element={<MapView state={state} />} />

          {/* CRM & Team */}
          <Route path="/clients" element={<ClientsCrmView state={state} />} />
          <Route path="/crm" element={<Navigate to={`${basePath}/clients`} replace />} />
          <Route path="/team" element={<TeamView state={state} />} />
          <Route path="/workers" element={<WorkersManagementView state={state} />} />

          {/* Administration & SaaS */}
          <Route path="/audit" element={<AuditTrailView state={state} />} />
          <Route path="/settings" element={<SettingsView state={state} />} />
          <Route path="/integrations" element={<IntegrationsView state={state} />} />
          <Route path="/docs" element={<DocsView state={state} />} />
          <Route path="/profile" element={<ProfileView state={state} />} />
          <Route path="/billing" element={<BillingView state={state} />} />
          <Route path="/web-admin" element={<WebAdminView state={state} />} />
          <Route path="/master" element={<Navigate to={`${basePath}/web-admin`} replace />} />

          {/* Mobile Specialized In-Field Views */}
          <Route path="/fichar" element={<MobileClockInView state={state} />} />
          <Route path="/chat" element={<MobileChatView state={state} />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </div>
    </AuthenticatedLayout>
  );
};
