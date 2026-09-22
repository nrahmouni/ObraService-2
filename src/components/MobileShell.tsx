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
import { ClockInButton } from './ClockInButton';
import { Plus, ShieldCheck, Building2 } from 'lucide-react';

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
          <div className="p-4 space-y-6">
            {/* Greeting & Status Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">Panel Operario</span>
                  <h2 className="text-lg font-black">{currentUser.name}</h2>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-[#FF6600]">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Estado PRL:</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Aprobado
                </span>
              </div>
            </div>

            {/* Giant Clock-In / Clock-Out Button */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fichaje de Jornada en Tajo</h3>
              <div className="flex justify-center">
                <ClockInButton state={state} />
              </div>
            </div>

            {/* Quick Action: Report Tajo */}
            <button
              onClick={() => navigate('/mobile/nuevo-parte')}
              className="w-full bg-[#FF6600] hover:bg-[#e05a00] text-white p-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6600]/25 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" /> Reportar Nuevo Parte de Tajo
            </button>

            {/* Recent Reports */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mis Partes Recientes</h4>
              {(state.reports || []).slice(0, 3).map(rep => {
                const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
                return (
                  <div key={rep.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">{rep.code} - {rep.projectNameSnapshot}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rep.date} • {totalHrs} hrs</div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Enviado</span>
                  </div>
                );
              })}
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

