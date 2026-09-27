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
import { AppState, Role } from '../types';
import { Plus, ShieldCheck, Building2, FileText, MessageSquare, ChevronRight, Clock } from 'lucide-react';

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
  const isWorkerRole = currentUser.role === Role.WORKER;
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/mobile';

  const activeCompany = (state.companies || []).find(c => c.id === currentUser.companyId);
  const activeProject = (state.projects || []).find(p => currentUser.assignedProjectIds?.includes(p.id)) || (state.projects || [])[0];

  return (
    <AuthenticatedLayout
      currentUser={currentUser}
      state={state}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        {/* Dynamic Role-Adaptive Dashboard */}
        <Route path="/dashboard" element={
          isWorkerRole ? (
            /* Field Worker Mobile Experience */
            <div className="flex flex-col space-y-5 w-full max-w-2xl mx-auto">
              {/* Profile & Obra Badge */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <div className="label-text">
                    {activeCompany?.name || 'Constructora'}
                  </div>
                  <h1 className="text-lg font-display font-black text-white mt-0.5">{currentUser.name}</h1>
                  <div className="text-xs text-brand-muted mt-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="truncate">Obra: {activeProject?.name || 'Obra Asignada'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PRL OK</span>
                </div>
              </div>

              {/* Direct Task Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`${basePath}/nuevo-parte`)}
                  className="btn-primary h-14 text-xs uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/20 justify-center cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Emitir Parte Diario</span>
                </button>

                <button
                  onClick={() => navigate(`${basePath}/fichar`)}
                  className="btn-secondary h-14 text-xs uppercase tracking-wider gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-center cursor-pointer"
                >
                  <Clock className="w-5 h-5" />
                  <span>Fichar Entrada / Salida GPS</span>
                </button>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate(`${basePath}/delivery_notes`)}
                  className="card p-4 flex items-center justify-between hover:bg-brand-surface-hover transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Albaranes Digitales</h3>
                      <p className="text-xs text-brand-muted mt-0.5">Registrar material, foto o firmar entregas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-muted group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate(`${basePath}/chat`)}
                  className="card p-4 flex items-center justify-between hover:bg-brand-surface-hover transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Comunicación Directa de Tajo</h3>
                      <p className="text-xs text-brand-muted mt-0.5">Chat con Jefe de Obra e incidencias PRL</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-muted group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Recent Reports */}
              <div className="card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="label-text">Partes Recientes</h3>
                  <button
                    onClick={() => navigate(`${basePath}/reports`)}
                    className="text-xs text-brand-accent hover:underline font-bold cursor-pointer"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="divide-y divide-brand-border">
                  {(state.reports || []).slice(0, 3).map(rep => {
                    const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
                    return (
                      <div key={rep.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <div className="text-sm font-bold text-white">{rep.projectNameSnapshot}</div>
                          <div className="text-[11px] text-brand-muted mt-0.5 tabular-nums">{rep.date} • {rep.code}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white tabular-nums">{totalHrs}h</span>
                          <span className="block text-[10px] text-brand-muted uppercase font-bold mt-0.5">{rep.status}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(state.reports || []).length === 0 && (
                    <div className="text-xs text-brand-muted py-6 text-center italic">
                      No has registrado ningún parte todavía.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Admin & Manager Mobile-Optimized Executive View */
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

        {/* Mobile Specialized Views */}
        <Route path="/fichar" element={<MobileClockInView state={state} />} />
        <Route path="/chat" element={<MobileChatView state={state} />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AuthenticatedLayout>
  );
};
