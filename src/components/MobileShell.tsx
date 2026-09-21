import React, { useState } from 'react';
import { MobileLayout, TabKey } from './MobileLayout';
import { DailyReportsView } from '../views/DailyReportsView';
import { SettingsView } from '../views/SettingsView';
import { AppState, Role } from '../types';
import { obraStore } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { ClockInButton } from './ClockInButton';
import { Plus, ShieldCheck, Building2 } from 'lucide-react';

interface MobileShellProps {
  state: AppState;
}

export const MobileShell: React.FC<MobileShellProps> = ({ state }) => {
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const navigate = useNavigate();

  const currentUser = state.currentUser || {
    id: 'usr_worker',
    name: 'Operario Campo',
    email: 'operario@subcontrata.es',
    role: Role.WORKER,
    companyId: 'comp_sub_1',
    active: true,
    assignedProjectIds: [],
    createdAt: new Date().toISOString()
  };

  return (
    <MobileLayout
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      currentUser={currentUser}
      isDemoMode={state.isDemoMode}
      onExitDemoToProduction={() => obraStore.exitDemoMode()}
      onOpenNewReport={() => navigate('/mobile/nuevo-parte')}
    >
      {currentTab === 'dashboard' && (
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
      )}

      {currentTab === 'reports' && <DailyReportsView state={state} onOpenReportModal={() => {}} />}
      {currentTab === 'settings' && <SettingsView state={state} />}
    </MobileLayout>
  );
};
