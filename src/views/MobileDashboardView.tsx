import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ShieldCheck, 
  Building2, 
  FileText,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { AppState, Role } from '../types';
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
  const activeProject = activeProjects.find(p => currentUser.assignedProjectIds?.includes(p.id)) || activeProjects[0];
  const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
  const userCompliance = checkOperationalStatus(currentUser.companyId);

  // Filter reports for the active worker/subcontractor
  const userReports = (state.reports || []).filter(
    r => r.creatorId === currentUser.id || r.companyId === currentUser.companyId
  );

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-200 pb-12 font-sans selection:bg-[#EA580C] selection:text-white">
      <div className="p-4 space-y-4 max-w-xl mx-auto flex flex-col">
        
        {/* 1. PRL Compliance Blocker Alert if any */}
        {userCompliance.isBlocked && (
          <div className="w-full bg-rose-950/40 border border-rose-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Acceso Restringido por PRL</span>
            </div>
            <p className="text-xs text-zinc-300">
              {userCompliance.reason || 'Tu empresa subcontratista tiene documentación obligatoria caducada en el sistema de homologación.'}
            </p>
          </div>
        )}

        {/* 2. Subcontractor Header Section */}
        <div className="w-full bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {activeCompany?.name || 'Subcontrata / Contrata'}
            </span>
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

        {/* 3. Direct Task Action: Emitir Parte */}
        <button
          onClick={() => navigate('/mobile/nuevo-parte')}
          className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Parte Diario de Trabajo</span>
        </button>

        {/* 4. Direct Task Action: Albaranes */}
        <div
          onClick={() => navigate('/mobile/delivery_notes')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Albaranes de Materiales y Tajo</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Subir foto o firmar albaranes de entrega</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
        </div>

        {/* 5. Direct Task Action: Chat con Jefe de Obra */}
        <div
          onClick={() => navigate('/mobile/chat')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Canal con Jefe de Obra</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Consultas, tajos e incidencias directas</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
        </div>

        {/* 6. Recent Reports History */}
        <div className="w-full bg-[#18181B] border border-[#27272A] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Partes de Trabajo Enviados
            </h3>
            <button
              onClick={() => navigate('/mobile/reports')}
              className="text-xs text-[#EA580C] hover:underline font-semibold"
            >
              Ver todos
            </button>
          </div>

          <div className="divide-y divide-[#27272A]">
            {userReports.slice(0, 4).map(rep => {
              const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
              return (
                <div 
                  key={rep.id} 
                  className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{rep.code} - {rep.projectNameSnapshot}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {rep.date} • <span className="text-zinc-300 font-semibold">{totalHrs} hrs</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {rep.status}
                  </span>
                </div>
              );
            })}
            {userReports.length === 0 && (
              <div className="py-4 text-center text-xs text-zinc-500 italic">
                No hay partes enviados recientemente.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
