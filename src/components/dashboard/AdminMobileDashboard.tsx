import React from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  FileText, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Play, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  HardHat,
  Search,
  PenTool,
  Radio,
  Layers,
  Activity
} from 'lucide-react';
import { AppState, Project, DailyReport, DeliveryNote } from '../../types';
import { TabKey } from '../layout/AuthenticatedLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { useNavigate } from 'react-router-dom';

interface AdminMobileDashboardProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenNewReport: () => void;
}

export const AdminMobileDashboard: React.FC<AdminMobileDashboardProps> = ({
  state,
  onNavigate,
  onOpenNewReport,
}) => {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const userCompanyId = user.companyId;
  const userCompany = (state.companies || []).find(c => c.id === userCompanyId);

  // Filter projects owned by this company
  const allProjects = (state.projects || []).filter(p => p.companyId === userCompanyId);
  const activeProjects = allProjects.filter(p => p.status === 'Active');

  // Metrics
  const projectIds = allProjects.map(p => p.id);
  const companyReports = (state.reports || []).filter(r => projectIds.includes(r.projectId));
  const totalLaborHours = companyReports.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const companyDeliveryNotes = (state.deliveryNotes || []).filter(n => projectIds.includes(n.projectId));
  const pendingNotes = companyDeliveryNotes.filter(n => n.status === 'Pending');

  // Compliance
  const subcontractorCompanies = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');
  const blockedSubcontractors = subcontractorCompanies.filter(sub => checkOperationalStatus(sub.id).isBlocked);

  // Recent 3 reports
  const recentReports = [...companyReports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Mobile Executive Header Card */}
      <div className="p-4 rounded-2xl bg-[#121215] border border-amber-500/30 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block truncate">
                {userCompany?.name || 'Constructora Principal'}
              </span>
              <span className="text-xs text-white font-bold block truncate">
                Admin · {user.name}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/presentation')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold shrink-0 active:scale-95 transition-transform cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Keynote</span>
          </button>
        </div>

        {/* 2x2 Compact Metric Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Obras Activas</div>
            <div className="text-lg font-mono font-black text-amber-400 mt-0.5">
              {activeProjects.length} <span className="text-[10px] text-zinc-500 font-normal">/ {allProjects.length}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Horas Auditadas</div>
            <div className="text-lg font-mono font-black text-blue-400 mt-0.5">
              {totalLaborHours} <span className="text-[10px] text-zinc-500 font-normal">h</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Albaranes</div>
            <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
              {companyDeliveryNotes.length} 
              {pendingNotes.length > 0 && (
                <span className="text-[10px] text-amber-400 font-bold ml-1">({pendingNotes.length} pend.)</span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Semáforo REA</div>
            <div className={`text-lg font-mono font-black mt-0.5 ${blockedSubcontractors.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {blockedSubcontractors.length > 0 ? `${blockedSubcontractors.length} Alertas` : '100% OK'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thumb Action Quick Hub */}
      <div className="space-y-1.5">
        <h2 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
          Acciones Operativas
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenNewReport}
            className="p-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-left flex flex-col justify-between h-24 shadow-lg shadow-amber-500/20 active:scale-98 transition-transform cursor-pointer"
          >
            <Plus className="w-5 h-5 bg-slate-950 text-amber-400 rounded-lg p-0.5" />
            <div>
              <span className="text-xs font-black block leading-tight">Nuevo Parte</span>
              <span className="text-[10px] text-slate-800 font-medium block">Registro en tajo</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('delivery_notes')}
            className="p-3.5 rounded-xl bg-[#18181b] border border-white/10 text-white font-bold text-left flex flex-col justify-between h-24 active:scale-98 transition-transform cursor-pointer relative"
          >
            <div className="flex items-center justify-between w-full">
              <PenTool className="w-5 h-5 text-emerald-400" />
              {pendingNotes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-black">
                  {pendingNotes.length}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">Albaranes</span>
              <span className="text-[10px] text-zinc-400 font-medium block">Firma & liquidación</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('map')}
            className="p-3.5 rounded-xl bg-[#18181b] border border-white/10 text-white font-bold text-left flex flex-col justify-between h-24 active:scale-98 transition-transform cursor-pointer"
          >
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            <div>
              <span className="text-xs font-black block leading-tight">Radar Satelital</span>
              <span className="text-[10px] text-zinc-400 font-medium block">Geocercas GPS</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="p-3.5 rounded-xl bg-[#18181b] border border-white/10 text-white font-bold text-left flex flex-col justify-between h-24 active:scale-98 transition-transform cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-black block leading-tight">Obras & Tajos</span>
              <span className="text-[10px] text-zinc-400 font-medium block">Listado y avances</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Pending Delivery Notes (Immediate Action Card) */}
      {pendingNotes.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white">Albaranes Pendientes ({pendingNotes.length})</span>
            </div>
            <button
              onClick={() => onNavigate('delivery_notes')}
              className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {pendingNotes.slice(0, 2).map((note) => {
              const project = allProjects.find(p => p.id === note.projectId);
              const sub = subcontractorCompanies.find(s => s.id === note.subcontractorCompanyId);
              return (
                <div 
                  key={note.id}
                  onClick={() => onNavigate('delivery_notes')}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs cursor-pointer active:bg-black/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{note.subcontractorCompanyName || sub?.name || 'Subcontrata'}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{project?.name} · {note.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-amber-400">{note.totalHours}h</div>
                    <div className="text-[9px] font-mono text-zinc-400">PENDIENTE</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Active Projects List (Thumb-friendly cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Obras en Curso ({activeProjects.length})
          </h2>
          <button
            onClick={() => onNavigate('projects')}
            className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {activeProjects.slice(0, 3).map((project) => {
            const projectReports = companyReports.filter(r => r.projectId === project.id);
            const projectHours = projectReports.reduce((acc, r) => acc + (r.totalHours || 0), 0);
            const addressText = typeof project.location === 'object' && project.location 
              ? project.location.address 
              : project.address || 'Ubicación asignada';

            return (
              <div
                key={project.id}
                onClick={() => onNavigate('reports')}
                className="p-3 rounded-xl bg-[#121215] border border-white/[0.08] hover:border-amber-500/30 transition-colors cursor-pointer space-y-2 active:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{addressText}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    ACTIVA
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.05] font-mono text-zinc-400">
                  <span>Radio GPS: {project.validationRadiusMeters || 250}m</span>
                  <span className="text-amber-400 font-bold">{projectHours}h registradas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Daily Reports */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Últimos Partes Diarios
          </h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver historial</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {recentReports.map((report) => {
            const project = allProjects.find(p => p.id === report.projectId);
            return (
              <div
                key={report.id}
                onClick={() => onNavigate('reports')}
                className="p-2.5 rounded-xl bg-[#121215] border border-white/[0.06] flex items-center justify-between text-xs cursor-pointer active:bg-white/[0.02]"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-white truncate">{project?.name || 'Obra'}</div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {report.date} · {report.workEntries?.length || 0} operarios
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-amber-400">{report.totalHours}h</div>
                  <div className="text-[9px] font-mono text-emerald-400">VALIDADO</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
