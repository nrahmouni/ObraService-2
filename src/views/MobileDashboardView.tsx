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
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { AppState, Role } from '../types';
import { ClockInButton } from '../components/ClockInButton';
import { checkOperationalStatus } from '../utils/compliance';

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
  const userCompliance = checkOperationalStatus(currentUser.companyId);

  // Filter time logs and reports for the active worker
  const userTimeLogs = (state.timeLogs || []).filter(tl => tl.userId === currentUser.id);
  const userReports = (state.reports || []).filter(r => r.creatorId === currentUser.id || r.creatorId === 'usr_worker');

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 pb-12 font-sans selection:bg-orange-600 selection:text-white">
      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* 1) CRITICAL PRL COMPLIANCE BLOCKER ALERT */}
        {userCompliance.isBlocked && (
          <div className="bg-rose-950/40 border border-rose-500/50 p-4 rounded-3xl space-y-2.5 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Acceso Restringido por PRL</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {userCompliance.reason || 'Tu empresa subcontratista tiene documentación obligatoria caducada en el sistema de homologación.'}
            </p>
            <div className="text-[9px] font-bold text-rose-300 uppercase tracking-widest bg-rose-950/80 px-2 py-1 rounded border border-rose-900/30">
              Bloqueado: Comunícate con tu Encargado
            </div>
          </div>
        )}

        {/* GREETING HEADER */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 font-display">
              Operario de Campo
            </span>
            <h2 className="text-lg font-black text-white leading-tight font-display">{currentUser.name}</h2>
            <p className="text-[10px] text-slate-500 font-semibold">{currentUser.email}</p>
          </div>
          <div className="w-11 h-11 bg-orange-950/40 border border-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* 2) GIANT CLOCK-IN BUTTON CARD (LARGEST VISUAL TARGET FOR MOBILE) */}
        <div className="bg-[#0F172A] border-2 border-orange-500/30 p-6 rounded-[32px] shadow-2xl relative overflow-hidden space-y-5">
          {/* Subtle background visual pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Fichaje y Control de Presencia
            </h3>
            <span className="text-[8px] font-black text-orange-400 bg-orange-950/60 border border-orange-900/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Gps Haversine
            </span>
          </div>

          <div className="py-2">
            {/* Clock-In button inside a prominent container */}
            <ClockInButton state={state} projects={activeProjects} />
          </div>

          <p className="text-[10px] text-slate-500 text-center font-medium leading-normal">
            El sistema valida tu proximidad física GPS de forma obligatoria contra el radio de exclusión de la obra asignada.
          </p>
        </div>

        {/* 3) QUICK ACTION: REPORT WORK PROGRESS */}
        <button
          onClick={() => navigate('/mobile/nuevo-parte')}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white p-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-950/35 transition-all transform active:scale-98 cursor-pointer border border-orange-500/30"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Reportar Parte de Tajo</span>
        </button>

        {/* RECENT USER HISTORY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Mis Partes de Trabajo Enviados
            </h4>
            <span className="text-[8px] text-slate-600 font-bold uppercase font-mono">
              HISTORIAL
            </span>
          </div>

          {userReports.length > 0 ? (
            <div className="space-y-2.5">
              {userReports.slice(0, 4).map(rep => {
                const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
                return (
                  <div 
                    key={rep.id} 
                    className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-black text-white uppercase">{rep.code} - {rep.projectNameSnapshot}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{rep.date}</span>
                        <span>•</span>
                        <span className="text-orange-400 font-bold">{totalHrs} hrs imputadas</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 uppercase tracking-wider">
                      Enviado
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-[#0F172A]/40 rounded-2xl text-center text-xs text-slate-500 border border-slate-900 italic font-medium">
              No se han encontrado partes enviados recientemente.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
