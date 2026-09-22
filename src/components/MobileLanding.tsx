import React from 'react';
import { 
  Plus, 
  Camera, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  HardHat, 
  ChevronRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { AppState, Project } from '../types';
import { obraStore } from '../services/store';

interface MobileLandingProps {
  state?: AppState;
  onNavigate?: (tab: any) => void;
  onOpenNewReport?: () => void;
}

export const MobileLanding: React.FC<MobileLandingProps> = ({
  state: propState,
  onNavigate,
  onOpenNewReport,
}) => {
  const state = propState || obraStore.getState();
  const currentUser = state.currentUser;

  // Find user's assigned projects or first active project
  const userProjects = (state.projects || []).filter(p => 
    currentUser?.assignedProjectIds?.includes(p.id) || p.status === 'Active'
  );
  const activeProject: Project | undefined = userProjects[0] || state.projects[0];
  const activeCompany = state.companies.find(c => c.id === currentUser?.companyId);

  // Pending delivery notes for this worker's company
  const myPendingNotes = (state.deliveryNotes || []).filter(
    n => n.subcontractorCompanyId === currentUser?.companyId && n.status === 'Pending'
  );

  // Recent reports created by this user/company
  const myReports = (state.reports || []).filter(
    r => r.creatorId === currentUser?.id || r.companyId === currentUser?.companyId
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col space-y-4 pb-8 animate-in fade-in duration-300">
      {/* 1. Subcontractor Header Section */}
      <div className="w-full flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#27272A] flex items-center justify-center text-[#EA580C]">
            <HardHat className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {currentUser?.name || 'Operario'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                SUBCONTRATA
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[190px]">
              {activeCompany?.name || currentUser?.companyName || 'Subcontratista'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-zinc-400">Obra Asignada</div>
          <div className="text-xs font-bold text-white truncate max-w-[140px]">
            {activeProject ? activeProject.name : 'Sin asignar'}
          </div>
        </div>
      </div>

      {/* 2. Operational & PRL Status */}
      <div className="w-full rounded-xl p-4 border border-[#27272A] bg-[#18181B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Homologación y PRL Activo</div>
            <div className="text-[11px] text-zinc-400">Subcontrata autorizada para trabajos en tajo</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          Válido
        </span>
      </div>

      {/* 3. Dedicated Task Buttons (Full Width Single-Column Flow) */}
      <div className="flex flex-col space-y-3 w-full">
        {/* Task 1: Parte de Tajo */}
        <div
          id="btn-worker-add-photo-report"
          onClick={() => {
            if (onOpenNewReport) onOpenNewReport();
            else if (onNavigate) onNavigate('nuevo-parte');
          }}
          className="w-full p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] transition-colors flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Emitir Parte Diario de Trabajo / Fotos
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Reporta avance de tajo, personal y fotos de ejecución
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
        </div>

        {/* Task 2: Subir Albarán */}
        <div
          id="btn-worker-scan-delivery-note"
          onClick={() => {
            if (onNavigate) onNavigate('delivery_notes');
          }}
          className="w-full p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] transition-colors flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Escanear / Subir Albarán
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Recepción de materiales, hormigón o suministros
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
        </div>

        {/* Task 3: Chat con Jefe de Obra */}
        <div
          id="btn-worker-chat-manager"
          onClick={() => {
            if (onNavigate) onNavigate('chat');
          }}
          className="w-full p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] transition-colors flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] text-zinc-200 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Chat con Jefe de Obra
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Canal directo de comunicación e incidencias de tajo
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white shrink-0" />
        </div>
      </div>

      {/* 4. Albaranes Pendientes */}
      {myPendingNotes.length > 0 && (
        <div className="w-full bg-[#18181B] border border-[#27272A] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">
              Albaranes Pendientes de Firma ({myPendingNotes.length})
            </span>
            <button 
              onClick={() => onNavigate && onNavigate('delivery_notes')}
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-2">
            {myPendingNotes.slice(0, 2).map(note => (
              <div key={note.id} className="bg-[#202024] p-3 rounded-lg border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{note.code}</div>
                  <div className="text-[11px] text-zinc-400">{note.projectNameSnapshot} • {note.date}</div>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('delivery_notes')}
                  className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg text-xs font-bold hover:bg-[#c2410c] transition-colors"
                >
                  Firmar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Historial de Partes Recientes */}
      <div className="w-full bg-[#18181B] border border-[#27272A] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Partes de Tajo Emitidos</h3>
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="text-xs text-[#EA580C] hover:underline font-semibold"
          >
            Ver historial
          </button>
        </div>
        <div className="divide-y divide-[#27272A]">
          {myReports.slice(0, 3).map(rep => {
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
          {myReports.length === 0 && (
            <div className="text-xs text-zinc-500 py-3 text-center">
              No hay partes emitidos aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
