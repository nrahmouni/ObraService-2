import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';
import { DailyReportsView } from '../views/DailyReportsView';
import { DeliveryNotesView } from '../views/DeliveryNotesView';
import { SettingsView } from '../views/SettingsView';
import { WorkersManagementView } from '../views/WorkersManagementView';
import { ProfileView } from '../views/ProfileView';
import { DailyReportWizard } from '../views/DailyReportWizard';
import { MobileChatView } from '../views/MobileChatView';
import { MobileClockInView } from '../views/MobileClockInView';
import { NotFoundView } from '../views/NotFoundView';
import { AppState } from '../types';
import { obraStore } from '../services/store';
import { Plus, ShieldCheck, Building2, FileText, MessageSquare, ChevronRight, MapPin, Clock } from 'lucide-react';

interface MobileShellProps {
  state: AppState;
}

export const MobileShell: React.FC<MobileShellProps> = ({ state }) => {
  const navigate = useNavigate();

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = state.currentUser;
  const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
  const activeProject = state.projects.find(p => currentUser.assignedProjectIds?.includes(p.id)) || state.projects[0];

  return (
    <AuthenticatedLayout
      currentUser={currentUser}
      state={state}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={
          <div className="flex flex-col space-y-5 w-full max-w-2xl mx-auto">
            {/* 1. Header Section: Profile & Obra */}
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

            {/* 2. Direct Task Action: Emitir Parte Diario & Fichaje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/mobile/nuevo-parte')}
                className="btn-primary h-14 text-xs uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/20 justify-center"
              >
                <Plus className="w-5 h-5" />
                <span>Emitir Parte Diario</span>
              </button>

              <button
                onClick={() => navigate('/mobile/fichar')}
                className="btn-secondary h-14 text-xs uppercase tracking-wider gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-center"
              >
                <Clock className="w-5 h-5" />
                <span>Fichar Entrada / Salida GPS</span>
              </button>
            </div>

            {/* 3. Action Grid */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/mobile/delivery_notes')}
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
                onClick={() => navigate('/mobile/chat')}
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

            {/* 5. Recent Reports Section */}
            <div className="card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="label-text">Partes Recientes</h3>
                <button
                  onClick={() => navigate('/mobile/reports')}
                  className="text-xs text-brand-accent hover:underline font-bold"
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
        } />
        <Route path="/reports" element={
          <DailyReportsView 
            state={state} 
            onOpenReportModal={() => navigate('/mobile/nuevo-parte')} 
          />
        } />
        <Route path="/nuevo-parte" element={<DailyReportWizard state={state} />} />
        <Route path="/fichar" element={<MobileClockInView state={state} />} />
        <Route path="/chat" element={<MobileChatView state={state} />} />
        <Route path="/delivery_notes" element={<DeliveryNotesView state={state} />} />
        <Route path="/workers" element={<WorkersManagementView state={state} />} />
        <Route path="/settings" element={<SettingsView state={state} />} />
        <Route path="/profile" element={<ProfileView state={state} />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </AuthenticatedLayout>
  );
};


