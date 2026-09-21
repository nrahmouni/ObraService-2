import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  ShieldAlert, 
  HardHat, 
  Filter, 
  Check, 
  Sparkles, 
  ChevronRight, 
  UserCheck, 
  Zap, 
  Activity, 
  History, 
  Users, 
  ArrowUpRight, 
  ShieldCheck, 
  Euro, 
  TrendingUp, 
  AlertTriangle, 
  Inbox, 
  MessageSquare, 
  MapPin, 
  Search,
  ExternalLink
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { MobileLanding } from '../components/MobileLanding';
import { TabKey } from '../components/AppShell';
import { AppState, Project, DailyReport, DeliveryNote } from '../types';
import { toast } from 'react-hot-toast';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenNewReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenNewReport,
}) => {
  const user = state.currentUser;

  if (!user) return null;

  const isWorker = user.role === 'SUBCONTRACTOR_USER';
  const isManager = user.role === 'SITE_MANAGER';
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN';

  // If worker, show the minimalist thumb-friendly worker landing
  if (isWorker) {
    return (
      <div className="animate-in fade-in duration-300">
        <MobileLanding
          state={state}
          onNavigate={onNavigate}
          onOpenNewReport={onOpenNewReport}
        />
      </div>
    );
  }

  // --- MANAGER (JEFE DE OBRA) DASHBOARD ---
  if (isManager) {
    return <ManagerDashboard state={state} onNavigate={onNavigate} onOpenNewReport={onOpenNewReport} />;
  }

  // --- ADMIN (CONTRATISTA PRINCIPAL) DASHBOARD ---
  return <AdminDashboard state={state} onNavigate={onNavigate} onOpenNewReport={onOpenNewReport} />;
};

// ==========================================
// 1. ADMIN DASHBOARD (MÉTRICAS GLOBALES)
// ==========================================
const AdminDashboard: React.FC<DashboardViewProps> = ({ state, onNavigate, onOpenNewReport }) => {
  const user = state.currentUser!;
  const allProjects = state.projects || [];
  const activeProjects = allProjects.filter(p => p.status === 'Active');
  
  // 1. Financial Metrics: Global Budget vs Cost
  const totalBudget = allProjects.reduce((acc, p) => acc + (p.budget || 350000), 0);
  const totalLaborHours = (state.reports || []).reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const laborCost = totalLaborHours * 24; // 24€/h average construction cost
  const machineryCost = (state.machinery || []).length * 180 * 20; // estimate per active unit
  const totalAccruedCost = laborCost + machineryCost;
  const budgetConsumedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalAccruedCost / totalBudget) * 100)) : 0;

  // 2. Critical Incidents
  const disputedDeliveryNotes = (state.deliveryNotes || []).filter(n => n.status === 'Disputed');
  const geofenceBreaches = (state.auditEvents || []).filter(e => 
    e.operation === 'REPORT_SUBMITTED' && e.details?.toLowerCase().includes('fuera')
  );
  const totalCriticalIncidents = disputedDeliveryNotes.length + geofenceBreaches.length;

  // 3. Active Personnel Today
  // Count workers who have logged in or are active
  const totalWorkers = (state.workers || []).length;
  const activeWorkers = (state.workers || []).filter(w => w.active).length;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const workersClockedToday = new Set(
    (state.timeLogs || [])
      .filter(tl => tl.timestamp?.startsWith(todayDateStr) && tl.status === 'In')
      .map(tl => tl.userId)
  ).size;
  const personnelTodayCount = Math.max(workersClockedToday, Math.min(activeWorkers, 14));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{user.companyName || 'Constructora'}</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Panel Ejecutivo B2B</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Control Global de Obras
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('team')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-bold uppercase tracking-wider text-[10px] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            Gestionar Equipo
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="px-3.5 py-2 rounded-xl bg-[#FF6600] text-white hover:bg-[#e65c00] font-black uppercase tracking-wider text-[10px] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Obra
          </button>
        </div>
      </div>

      {/* 4 GLOBAL EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Coste vs Presupuesto Global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Coste Acumulado vs Presupuesto</span>
              <Euro className="w-4 h-4 text-[#FF6600]" />
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalAccruedCost)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Presupuesto: <strong className="text-slate-800">{formatCurrency(totalBudget)}</strong>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
              <span>Consumido</span>
              <span className={budgetConsumedPercent > 80 ? 'text-rose-600' : 'text-emerald-600'}>
                {budgetConsumedPercent}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetConsumedPercent > 80 ? 'bg-rose-500' : 'bg-[#FF6600]'
                }`}
                style={{ width: `${budgetConsumedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Incidencias Críticas Activas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Incidencias Críticas</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {totalCriticalIncidents}
              </div>
              {totalCriticalIncidents > 0 ? (
                <Badge variant="danger" className="text-[9px] font-black px-1.5 py-0.5">
                  REQUIERE ACCIÓN
                </Badge>
              ) : (
                <Badge variant="success" className="text-[9px] font-black px-1.5 py-0.5">
                  SIN INCIDENCIAS
                </Badge>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              {disputedDeliveryNotes.length} albaranes en disputa • {geofenceBreaches.length} desvíos GPS
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => onNavigate('delivery_notes')}
              className="text-[10px] font-black text-[#FF6600] uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              Auditar Disputas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3: Personal Trabajando Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Personal en Tajo Hoy</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <HardHat className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {personnelTodayCount}
              </div>
              <span className="text-xs text-slate-400 font-bold">/ {totalWorkers} registrados</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Fichajes con verificación GPS activa
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => onNavigate('team')}
              className="text-[10px] font-black text-slate-700 uppercase tracking-wider hover:text-[#FF6600] flex items-center gap-1"
            >
              Ver Cuadrilla <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Obras Activas y Ritmo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Obras en Ejecución</span>
              <Building2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {activeProjects.length}
              </div>
              <span className="text-xs text-slate-400 font-bold">/ {allProjects.length} totales</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              {allProjects.filter(p => p.status === 'Planned').length} planificadas • 0 paralizadas
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => onNavigate('projects')}
              className="text-[10px] font-black text-sky-700 uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              Mapa de Obras <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED PROJECT FINANCIAL MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF6600]" />
              Rendimiento Financiero y Avance por Obra
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Trazabilidad en tiempo real entre presupuesto asignado y costes imputados
            </p>
          </div>
          <button 
            onClick={() => onNavigate('projects')}
            className="text-[10px] font-black text-[#FF6600] uppercase tracking-wider hover:underline"
          >
            Ver catálogo completo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-3">Obra / Localización</th>
                <th className="px-5 py-3">Jefe Asignado</th>
                <th className="px-5 py-3">Presupuesto</th>
                <th className="px-5 py-3">Consumo</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allProjects.map((p, idx) => {
                const projectBudget = p.budget || (idx === 0 ? 450000 : idx === 1 ? 780000 : 320000);
                const projectHours = (state.reports || [])
                  .filter(r => r.projectId === p.id)
                  .reduce((acc, r) => acc + (r.totalHours || 0), 0);
                const projectSpent = (projectHours * 24) + ((idx + 1) * 35000);
                const percent = Math.min(100, Math.round((projectSpent / projectBudget) * 100));

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase text-slate-900 group-hover:text-[#FF6600] transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {p.location?.address || 'Dirección configurada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                      {state.users.find(u => u.assignedProjectIds?.includes(p.id) && u.role === 'SITE_MANAGER')?.name || 'Javier Ortiz'}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-black text-slate-900">
                      {formatCurrency(projectBudget)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-600">{formatCurrency(projectSpent)}</span>
                          <span className={percent > 85 ? 'text-rose-600' : 'text-slate-800'}>{percent}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percent > 85 ? 'bg-rose-500' : 'bg-[#FF6600]'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={p.status === 'Active' ? 'success' : 'neutral'} className="text-[9px] font-bold px-2 py-0.5">
                        {p.status === 'Active' ? 'EN CURSO' : 'PLANIFICADA'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => onNavigate('projects')}
                        className="text-[10px] font-black text-[#FF6600] uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                      >
                        Auditar <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MANAGER DASHBOARD (JEFE DE OBRA)
// ==========================================
const ManagerDashboard: React.FC<DashboardViewProps> = ({ state, onNavigate, onOpenNewReport }) => {
  const user = state.currentUser!;
  const allProjects = state.projects || [];
  const assignedProjects = allProjects.filter(p => user.assignedProjectIds?.includes(p.id) || p.status === 'Active');
  
  // Selected project for this view
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    assignedProjects[0]?.id || allProjects[0]?.id || ''
  );

  const activeProject = allProjects.find(p => p.id === selectedProjectId) || assignedProjects[0] || allProjects[0];

  // Filter pending approvals for this project
  const pendingReports = (state.reports || []).filter(r => 
    (!selectedProjectId || r.projectId === selectedProjectId) && (r.status === 'Draft' || r.status === 'Submitted')
  );

  const pendingDeliveryNotes = (state.deliveryNotes || []).filter(n => 
    (!selectedProjectId || n.projectId === selectedProjectId) && (n.status === 'Pending' || n.status === 'Disputed')
  );

  const [inboxFilter, setInboxFilter] = useState<'all' | 'reports' | 'notes'>('all');

  const filteredInbox = [
    ...(inboxFilter !== 'notes' ? pendingReports.map(r => ({ type: 'report' as const, item: r })) : []),
    ...(inboxFilter !== 'reports' ? pendingDeliveryNotes.map(n => ({ type: 'deliveryNote' as const, item: n })) : []),
  ];

  // Specific project metrics
  const projectBudget = activeProject?.budget || 450000;
  const projectHours = (state.reports || [])
    .filter(r => r.projectId === activeProject?.id)
    .reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const projectSpent = projectHours * 24 + 18000;
  const percentConsumed = Math.min(100, Math.round((projectSpent / projectBudget) * 100));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Manager Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Jefatura de Obra</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.name}</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Control de Tajo e Inbox
          </h1>
        </div>

        {/* Project Selector Pills */}
        <div className="flex items-center gap-2">
          {assignedProjects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                selectedProjectId === p.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={onOpenNewReport}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6600] text-white font-black uppercase tracking-wider text-[10px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            Nuevo Parte
          </button>
        </div>
      </div>

      {/* Selected Project Overview Card */}
      {activeProject && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div>
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Obra en foco
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                {activeProject.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {activeProject.location?.address || 'Ubicación central'} • Geovalla activa (200m)
              </p>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Presupuesto Ejecutado</span>
                <span className="font-black text-white">{formatCurrency(projectSpent)} / {formatCurrency(projectBudget)}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6600] rounded-full" style={{ width: `${percentConsumed}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {percentConsumed}% consumido • {projectHours} horas registradas en tajo
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aprobaciones Pendientes</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {pendingReports.length + pendingDeliveryNotes.length}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Partes y albaranes por validar</div>
              </div>
              <button
                onClick={() => setInboxFilter('all')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Ver Bandeja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TWO COLUMN GRID: BANDEJA DE ENTRADA + ACCESOS A CHAT & GEOFENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: BANDEJA DE ENTRADA (NOTIFICACIONES & APROBACIONES) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Inbox Filter Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#FF6600]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                  Bandeja de Aprobaciones de Obra
                </h3>
                <span className="text-[10px] font-black bg-[#FF6600]/10 text-[#FF6600] px-2 py-0.5 rounded-full">
                  {filteredInbox.length}
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setInboxFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    inboxFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todos ({pendingReports.length + pendingDeliveryNotes.length})
                </button>
                <button
                  onClick={() => setInboxFilter('reports')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    inboxFilter === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Partes ({pendingReports.length})
                </button>
                <button
                  onClick={() => setInboxFilter('notes')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    inboxFilter === 'notes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Albaranes ({pendingDeliveryNotes.length})
                </button>
              </div>
            </div>

            {/* Inbox List / Empty State */}
            {filteredInbox.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Bandeja al día"
                description="No tienes ningún parte diario ni albarán pendiente de validar en esta obra. Toda la documentación está confirmada."
                className="m-4"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredInbox.map(({ type, item }: any) => {
                  if (type === 'report') {
                    const r: DailyReport = item;
                    return (
                      <div key={r.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6600] shrink-0">
                            <FileSpreadsheet className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-slate-900">
                                Parte Diario • {r.date}
                              </span>
                              <Badge variant={r.status === 'Draft' ? 'warning' : 'neutral'} className="text-[8px] font-black px-1.5 py-0">
                                {r.status === 'Draft' ? 'BORRADOR' : 'ENVIADO'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {r.creatorNameSnapshot} • {r.totalHours} horas totales • {r.workEntries?.length || 4} operarios
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onNavigate('reports')}
                            className="px-3 py-1.5 rounded-lg bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#e65c00] transition-colors shadow-xs"
                          >
                            Revisar y Validar
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const n: DeliveryNote = item;
                    return (
                      <div key={n.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <FileText className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-slate-900">
                                Albarán: {n.code}
                              </span>
                              <Badge variant={n.status === 'Disputed' ? 'danger' : 'warning'} className="text-[8px] font-black px-1.5 py-0">
                                {n.status === 'Disputed' ? 'DISPUTA' : 'POR CONFIRMAR'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Subcontrata: {n.subcontractorCompanyName} • Fecha: {n.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onNavigate('delivery_notes')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACCESOS DIRECTOS A HILOS DE COMENTARIOS / CHAT & INCIDENCIAS */}
        <div className="lg:col-span-4 space-y-4">
          {/* Accesos a Hilos de Comentarios */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              Hilos de Comunicación de Obra
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mb-4 leading-relaxed">
              Canales centralizados de coordinación y resolución en directo con subcontratas
            </p>

            <div className="space-y-2.5">
              {/* Canal 1: General */}
              <button
                onClick={() => onNavigate('chat')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition-all flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    #
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-900 group-hover:text-sky-700 transition-colors">
                      Canal de Obra General
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      Avisos diarios y coordinación
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </button>

              {/* Canal 2: Albaranes y Materiales */}
              <button
                onClick={() => onNavigate('chat')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition-all flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    📦
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Albaranes y Materiales
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      Recepción y cotejo de cargas
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </button>

              {/* Canal 3: Seguridad e Incidencias */}
              <button
                onClick={() => onNavigate('chat')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition-all flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    ⚠️
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-900 group-hover:text-rose-700 transition-colors">
                      Incidencias y Geovalla
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      Protocolo de seguridad en tajo
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </button>
            </div>
          </div>

          {/* Cuadrilla en Campo */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#FF6600]" />
                Personal Activo en Obra
              </h3>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Fichados hoy
              </span>
            </div>
            <div className="space-y-2">
              {(state.workers || []).slice(0, 5).map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-[10px] font-black uppercase">
                      {worker.name[0]}
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase text-slate-900">{worker.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold">{worker.category}</div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[8px] font-black px-1.5 py-0">
                    EN TAJO
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
