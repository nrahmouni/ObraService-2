import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  ChevronRight, 
  HardHat, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { AppState, DailyReport, DeliveryNote } from '../../types';
import { TabKey } from '../layout/AuthenticatedLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { ClockInButton } from '../ClockInButton';

interface ManagerDashboardProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenNewReport: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ state, onNavigate, onOpenNewReport }) => {
  const user = state.currentUser!;
  const userCompanyId = user.companyId;

  // Find active and assigned projects for this Site Manager
  const allProjects = state.projects || [];
  const assignedProjects = allProjects.filter(p => p.companyId === userCompanyId);
  const activeProjects = assignedProjects.filter(p => p.status === 'Active');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjects[0]?.id || assignedProjects[0]?.id || allProjects[0]?.id || ''
  );

  const activeProject = allProjects.find(p => p.id === selectedProjectId) || activeProjects[0] || assignedProjects[0] || allProjects[0];

  // Financial performance
  const projectBudget = activeProject?.budget || 350000;
  const projectHours = (state.reports || [])
    .filter(r => r.projectId === activeProject?.id)
    .reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const projectSpent = projectHours * 24 + 18000;
  const percentConsumed = Math.min(100, Math.round((projectSpent / projectBudget) * 100));

  // Pending items
  const pendingReports = (state.reports || []).filter(r => 
    (!selectedProjectId || r.projectId === selectedProjectId) && (r.status === 'Submitted')
  );
  const pendingDeliveryNotes = (state.deliveryNotes || []).filter(n => 
    (!selectedProjectId || n.projectId === selectedProjectId) && (n.status === 'Pending')
  );

  // Workforce
  const activeWorkersCount = (state.workers || []).filter(w => 
    w.active && (!activeProject || w.assignedProjectIds?.includes(activeProject.id))
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Project Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            Gestión de Obra
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-brand-muted font-medium">Obra seleccionada:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-brand-surface border border-brand-border text-brand-accent text-sm font-bold px-3 py-1 rounded-lg outline-none cursor-pointer"
            >
              {assignedProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="btn-primary h-11 gap-2 shadow-lg shadow-brand-accent/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Validar {pendingReports.length} Partes</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <HardHat className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Personal hoy</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{activeWorkersCount}</div>
            <div className="text-[10px] font-bold text-emerald-500">En el tajo</div>
          </div>
        </div>

        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Horas acumuladas</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{projectHours}h</div>
            <div className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Proyecto</span>
            </div>
          </div>
        </div>

        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Consumo Presupuesto</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
               <div className="text-2xl font-black text-white tabular-nums">{percentConsumed}%</div>
            </div>
            <div className="w-full h-1.5 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentConsumed}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Daily Operations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-brand-accent/5 border-brand-accent/20 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-base font-bold text-white">Control de Presencia — {user.name}</h3>
                   <p className="text-xs text-brand-muted font-medium">Su registro oficial de jornada en obra para dirección facultativa.</p>
                </div>
             </div>
             <ClockInButton project={activeProject} variant="full" />
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted px-1">Acciones en Tajo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => onNavigate('reports')} className="card p-5 flex items-center justify-between hover:bg-brand-surface-hover transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center group-hover:border-brand-accent transition-colors">
                        <FileSpreadsheet className="w-5 h-5 text-brand-accent" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">Partes Diarios</div>
                        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-tight mt-1">{pendingReports.length} por validar</div>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-white" />
               </button>

               <button onClick={() => onNavigate('delivery_notes')} className="card p-5 flex items-center justify-between hover:bg-brand-surface-hover transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center group-hover:border-blue-500 transition-colors">
                        <FileText className="w-5 h-5 text-blue-500" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">Albaranes</div>
                        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-tight mt-1">{pendingDeliveryNotes.length} pendientes</div>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-white" />
               </button>
            </div>
          </div>
        </div>

        {/* 4. Obra Detail Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted px-1">Detalle de Obra</h2>
          
          <div className="card p-6 space-y-6">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-accent" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-white">{activeProject?.name}</div>
                      <div className="text-[10px] font-bold text-brand-muted uppercase tracking-tight mt-1">Perímetro: {activeProject?.validationRadiusMeters || 200}m</div>
                   </div>
                </div>
                
                <div className="pt-4 border-t border-brand-border">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">Estado de Cumplimiento</h4>
                   <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Libro de Subcontratación OK</span>
                   </div>
                </div>
             </div>

             <div className="pt-6 border-t border-brand-border space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Últimas alertas</h4>
                   <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                   <p className="text-[11px] font-medium text-brand-muted leading-relaxed">
                     Aviso: 2 operarios han intentado fichar fuera del radio de validación en la última hora.
                   </p>
                </div>
             </div>
          </div>

          <button onClick={() => onNavigate('map')} className="card p-4 flex items-center justify-between hover:bg-brand-surface-hover transition-all group">
             <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-brand-muted" />
                <span className="text-xs font-bold text-white">Ver Mapa de Operarios</span>
             </div>
             <ChevronRight className="w-4 h-4 text-brand-muted" />
          </button>
        </div>
      </div>
    </div>
  );
};
