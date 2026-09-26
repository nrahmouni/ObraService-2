import React from 'react';
import { 
  Camera, 
  FileText, 
  MessageSquare, 
  HardHat, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Clock,
  Smartphone,
  Plus,
  CheckCircle2
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
    <div className="w-full flex flex-col space-y-6 pb-20 animate-in fade-in duration-300 px-4 pt-4">
      
      {/* 1. Worker Context Header */}
      <div className="card p-4 flex items-center justify-between border-brand-accent/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center border border-brand-border text-brand-accent">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-black text-white">{currentUser?.name?.split(' ')[0]}</div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-tight">{activeCompany?.name || 'Subcontrata'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">Obra Actual</div>
          <div className="text-xs font-bold text-brand-accent truncate max-w-[120px]">{activeProject?.name || '---'}</div>
        </div>
      </div>

      {/* 2. Primary In-Field Action */}
      <button 
        onClick={() => onOpenNewReport ? onOpenNewReport() : onNavigate?.('nuevo-parte')}
        className="btn-primary h-20 w-full flex flex-col items-center justify-center gap-1 shadow-2xl shadow-brand-accent/30 rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-6 h-6" />
          <span className="text-lg font-black uppercase tracking-wider">Nuevo Parte Diario</span>
        </div>
        <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Reportar tajo y personal</span>
      </button>

      {/* 3. Secondary Tools Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate?.('delivery_notes')}
          className="card p-6 flex flex-col items-center text-center gap-3 hover:bg-brand-surface-hover active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center border border-brand-border">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-tight">Albaranes</div>
            {myPendingNotes.length > 0 && (
              <div className="mt-1 text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                {myPendingNotes.length} Pendientes
              </div>
            )}
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('chat')}
          className="card p-6 flex flex-col items-center text-center gap-3 hover:bg-brand-surface-hover active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center border border-brand-border">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-tight">Consultas</div>
            <div className="mt-1 text-[9px] font-bold text-brand-muted">Chat Jefe de Obra</div>
          </div>
        </button>
      </div>

      {/* 4. Compliance & Info */}
      <div className="space-y-4 pt-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted px-1">Estado de Seguridad</h2>
        <div className="card p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <div>
                <div className="text-xs font-bold text-white">Autorizado para Tajo</div>
                <div className="text-[10px] text-brand-muted font-medium">Documentación PRL al día</div>
             </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* 5. Recent History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Actividad Reciente</h2>
          <button onClick={() => onNavigate?.('reports')} className="text-[10px] font-bold text-brand-accent uppercase">Ver Todo</button>
        </div>
        <div className="space-y-2">
          {myReports.slice(0, 3).map(rep => (
            <div key={rep.id} className="card p-4 flex items-center justify-between hover:bg-brand-surface-hover">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-bg border border-brand-border">
                  <Clock className="w-4 h-4 text-brand-muted" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{rep.projectNameSnapshot}</div>
                  <div className="text-[10px] text-brand-muted font-medium mt-0.5">{rep.date} • {rep.code}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
