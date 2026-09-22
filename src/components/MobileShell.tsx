import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout, TabKey } from './MobileLayout';
import { DailyReportsView } from '../views/DailyReportsView';
import { DeliveryNotesView } from '../views/DeliveryNotesView';
import { SettingsView } from '../views/SettingsView';
import { WorkersManagementView } from '../views/WorkersManagementView';
import { ProfileView } from '../views/ProfileView';
import { DailyReportWizard } from '../views/DailyReportWizard';
import { NotFoundView } from '../views/NotFoundView';
import { AppState } from '../types';
import { obraStore } from '../services/store';
import { Plus, ShieldCheck, Building2, FileSpreadsheet, FileText, MessageSquare, ChevronRight } from 'lucide-react';

interface MobileShellProps {
  state: AppState;
}

export const MobileShell: React.FC<MobileShellProps> = ({ state }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Determine current active tab based on path suffix
  const pathParts = location.pathname.split('/');
  const subRoute = pathParts[2] || 'dashboard';
  // Fallback map tab keys
  const currentTab = (subRoute === 'nuevo-parte' ? 'reports' : subRoute) as TabKey;

  const handleSelectTab = (tab: TabKey) => {
    navigate(`/mobile/${tab}`);
  };

  const currentUser = state.currentUser;
  const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
  const activeProject = state.projects.find(p => currentUser.assignedProjectIds?.includes(p.id)) || state.projects[0];

  return (
    <MobileLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      currentUser={currentUser}
      isDemoMode={state.isDemoMode}
      onExitDemoToProduction={() => obraStore.exitDemoMode()}
      onOpenNewReport={() => navigate('/mobile/nuevo-parte')}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={
          <div className="flex flex-col space-y-4 w-full text-zinc-200">
            {/* 1. Header Section: Contrata / Subcontrata & Obra */}
            <div className="w-full bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {activeCompany?.name || 'Subcontrata / Contrata'}
                </div>
                <h1 className="text-base font-bold text-white mt-0.5">{currentUser.name}</h1>
                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Obra: {activeProject?.name || 'Obra Asignada'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>PRL Aprobado</span>
              </div>
            </div>

            {/* 2. Direct Task Action: Emitir Parte Diario */}
            <button
              onClick={() => navigate('/mobile/nuevo-parte')}
              className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Parte Diario de Trabajo</span>
            </button>

            {/* 3. Direct Task Action: Albaranes */}
            <div
              onClick={() => navigate('/mobile/delivery_notes')}
              className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Albaranes de Materiales y Tajo</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Subir foto o firmar albaranes de entrega</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
            </div>

            {/* 4. Direct Task Action: Chat con Jefe de Obra */}
            <div
              onClick={() => navigate('/mobile/chat')}
              className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Canal con Jefe de Obra</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Consultas, tajos e incidencias directas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
            </div>

            {/* 5. Recent Reports Section */}
            <div className="w-full bg-[#18181B] border border-[#27272A] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Partes Emitidos Recientes</h3>
                <button
                  onClick={() => navigate('/mobile/reports')}
                  className="text-xs text-[#EA580C] hover:underline font-semibold"
                >
                  Ver todos
                </button>
              </div>
              <div className="divide-y divide-[#27272A]">
                {(state.reports || []).slice(0, 3).map(rep => {
                  const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
                  return (
                    <div key={rep.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <div className="text-xs font-bold text-white">{rep.projectNameSnapshot}</div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{rep.date} • {rep.code}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">{totalHrs}h</span>
                        <span className="block text-[10px] text-zinc-400">{rep.status}</span>
                      </div>
                    </div>
                  );
                })}
                {(state.reports || []).length === 0 && (
                  <div className="text-xs text-zinc-500 py-3 text-center">
                    No hay partes registrados aún.
                  </div>
                )}
              </div>
            </div>
          </div>
        } />
        <Route path="/reports" element={
          <DailyReportsView 
            state={state} 
            onOpenReportModal={() => navigate('/mobile/nuevo-parte')} 
          />
        } />
        <Route path="/nuevo-parte" element={<DailyReportWizard state={state} />} />
        <Route path="/delivery_notes" element={<DeliveryNotesView state={state} />} />
        <Route path="/workers" element={<WorkersManagementView state={state} />} />
        <Route path="/settings" element={<SettingsView state={state} />} />
        <Route path="/profile" element={<ProfileView state={state} />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </MobileLayout>
  );
};

