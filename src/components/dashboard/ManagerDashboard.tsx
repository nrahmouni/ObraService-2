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
  Smartphone,
  Play,
  Sparkles
} from 'lucide-react';
import { AppState, DailyReport, DeliveryNote } from '../../types';
import { TabKey } from '../layout/AuthenticatedLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { ClockInButton } from '../ClockInButton';
import { TajoHoursDistributionChart } from './TajoHoursDistributionChart';
import { useNavigate } from 'react-router-dom';

interface ManagerDashboardProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenNewReport: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ state, onNavigate, onOpenNewReport }) => {
  const navigate = useNavigate();
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
  const projectReports = (state.reports || []).filter(r => r.projectId === activeProject?.id);
  const projectHours = projectReports.reduce((acc, r) => acc + (r.totalHours || 0), 0);
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Project Selector (Visual Storyteller & UI Designer) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-brand-accent/15 border border-brand-accent/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider">
              Control de Jefatura de Obra
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Gestión de Tajos en Vivo
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-brand-muted font-medium">Obra en seguimiento:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-brand-surface border border-white/10 text-brand-accent text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:border-brand-accent/40 transition-colors"
            >
              {assignedProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate('/presentation')}
            className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-brand-accent/40 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
            title="Abrir Presentación Ejecutiva Keynote Pro"
          >
            <Play className="w-3.5 h-3.5 text-brand-accent fill-brand-accent group-hover:scale-110 transition-transform" />
            <span>Keynote 3D</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="btn-primary h-11 px-5 gap-2 shadow-lg shadow-brand-accent/25 text-xs uppercase tracking-wider cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Validar {pendingReports.length} Partes</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-executive p-5 group space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-bg/80 border border-white/10 flex items-center justify-center text-brand-accent">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              En el tajo hoy
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">Dotación de Personal</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-white tabular-nums mt-1">{activeWorkersCount} operarios</div>
          </div>
        </div>

        <div className="card-executive p-5 group space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-bg/80 border border-white/10 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
              Certificadas
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">Horas Acumuladas</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-white tabular-nums mt-1">{projectHours}h</div>
          </div>
        </div>

        <div className="card-executive p-5 group space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-bg/80 border border-white/10 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Ejecución Presupuestaria
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">Presupuesto Consumido</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-white tabular-nums mt-1">{percentConsumed}%</div>
            <div className="w-full h-1.5 bg-brand-bg border border-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-brand-accent rounded-full transition-all duration-500" style={{ width: `${percentConsumed}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* 3. Daily Operations & Data Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-executive p-5 sm:p-6 bg-brand-accent/5 border-brand-accent/25 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-accent/25">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fichaje de Jornada — {user.name}</h3>
                <p className="text-xs text-brand-muted font-normal">Registro oficial de presencia para dirección facultativa.</p>
              </div>
            </div>
            <ClockInButton project={activeProject} variant="full" />
          </div>

          {/* Data Visualization of Labor Hours for this Project */}
          <TajoHoursDistributionChart 
            reports={projectReports.length > 0 ? projectReports : (state.reports || [])} 
            companies={state.companies || []} 
          />

          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-muted px-1">
              Acciones Inmediatas en Tajo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button 
                onClick={() => onNavigate('reports')} 
                className="card p-5 flex items-center justify-between hover:bg-brand-surface-hover hover:border-brand-accent/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-bg border border-white/10 flex items-center justify-center group-hover:border-brand-accent transition-colors">
                    <FileSpreadsheet className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">Partes Diarios</div>
                    <div className="text-[11px] font-mono text-brand-muted mt-0.5">{pendingReports.length} por validar</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white" />
              </button>

              <button 
                onClick={() => onNavigate('delivery_notes')} 
                className="card p-5 flex items-center justify-between hover:bg-brand-surface-hover hover:border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-bg border border-white/10 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Albaranes Oficiales</div>
                    <div className="text-[11px] font-mono text-brand-muted mt-0.5">{pendingDeliveryNotes.length} pendientes firma</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Obra Detail Sidebar */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-muted px-1">
              Ficha Técnica del Tajo
            </h2>
            
            <div className="card-executive p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-bg border border-white/10 flex items-center justify-center text-brand-accent">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{activeProject?.name}</div>
                    <div className="text-[11px] font-mono text-brand-muted mt-0.5">Radio Geocerca: {activeProject?.validationRadiusMeters || 200}m</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/10">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted mb-2">Estado Documental</div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Libro de Subcontratación Vigente</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">Supervisión Satelital</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-brand-muted leading-relaxed font-normal">
                  Geocerca activa: los fichajes a pie de obra son validados contra las coordenadas oficiales del proyecto.
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('map')} 
              className="card p-4 flex items-center justify-between hover:bg-brand-surface-hover hover:border-brand-accent/30 transition-all group cursor-pointer w-full"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-brand-accent" />
                <span className="text-xs font-bold text-white">Abrir Radar GPS de Operarios</span>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
