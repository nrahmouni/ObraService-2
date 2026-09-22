import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ShieldCheck, 
  Building2, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { AppState, Role } from '../types';
import { ClockInButton } from '../components/ClockInButton';

interface MobileDashboardViewProps {
  state: AppState;
}

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({ state }) => {
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

  const activeProjects = state.projects.filter(p => p.status === 'Active' || p.status === 'Planned');

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto font-sans">
      {/* Greeting & Status Card */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Panel Operario de Campo</span>
            <h2 className="text-xl font-black">{currentUser.name}</h2>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Estado Operativo:</span>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4" /> Activo & Homologado
          </span>
        </div>
      </div>

      {/* Giant Clock-In / Clock-Out Button */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fichaje Geolocalizado</h3>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Haversine GPS</span>
        </div>
        <div className="flex justify-center pt-2">
          <ClockInButton state={state} projects={activeProjects} />
        </div>
      </div>

      {/* Quick Action: Report Tajo */}
      <button
        onClick={() => navigate('/mobile/nuevo-parte')}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition-all cursor-pointer active:scale-95 border border-amber-500/30"
      >
        <Plus className="w-5 h-5 stroke-[3]" /> Reportar Nuevo Parte de Tajo
      </button>

      {/* Recent Reports */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mis Partes Recientes</h4>
        {(state.reports || []).length > 0 ? (
          (state.reports || []).slice(0, 4).map(rep => {
            const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
            return (
              <div key={rep.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-black text-slate-900">{rep.code} - {rep.projectNameSnapshot}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rep.date} • {totalHrs} hrs</div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enviado
                </span>
              </div>
            );
          })
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 italic">
            No has enviado partes de tajo hoy.
          </div>
        )}
      </div>
    </div>
  );
};
