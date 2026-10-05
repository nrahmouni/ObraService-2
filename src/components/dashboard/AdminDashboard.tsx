import React from 'react';
import { 
  Building2, 
  Users, 
  Euro, 
  ShieldAlert, 
  HardHat, 
  Activity, 
  MapPin, 
  ArrowUpRight, 
  ChevronRight,
  Clock,
  FileText,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Sparkles,
  BarChart3,
  TrendingUp,
  Briefcase,
  Play,
  Layers,
  Compass
} from 'lucide-react';
import { AppState, Role } from '../../types';
import { TabKey } from '../layout/AuthenticatedLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { useNavigate } from 'react-router-dom';
import { TajoHoursDistributionChart } from './TajoHoursDistributionChart';

interface AdminDashboardProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onNavigate }) => {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const userCompanyId = user.companyId;
  const userCompany = (state.companies || []).find(c => c.id === userCompanyId);

  // Filter projects owned by or assigned to this company
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

  // Stats for the top bar with Visual Storyteller styling
  const stats = [
    { 
      label: 'Obras en Ejecución', 
      value: activeProjects.length, 
      icon: Building2, 
      trend: `${allProjects.length} registradas`, 
      color: 'text-brand-accent',
      badgeBg: 'bg-brand-accent/10 border-brand-accent/30 text-amber-300'
    },
    { 
      label: 'Horas Auditadas', 
      value: `${totalLaborHours}h`, 
      icon: Clock, 
      trend: `${companyReports.length} partes diarios`, 
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300'
    },
    { 
      label: 'Albaranes Oficiales', 
      value: companyDeliveryNotes.length, 
      icon: FileText, 
      trend: `${pendingNotes.length} pendientes firma`, 
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
    },
    { 
      label: 'Subcontratas Homologadas', 
      value: subcontractorCompanies.length, 
      icon: Users, 
      trend: blockedSubcontractors.length > 0 ? `${blockedSubcontractors.length} con incidencias` : '100% REA / PRL OK', 
      color: blockedSubcontractors.length > 0 ? 'text-rose-400' : 'text-amber-400',
      badgeBg: blockedSubcontractors.length > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Executive Presentation Showcase Banner (Visual Storyteller & UI Designer) */}
      <div className="card-executive presentation-glow p-5 sm:p-7 overflow-hidden border-brand-accent/30 relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-accent/15 border border-brand-accent/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-widest">
                Panel de Control Ejecutivo
              </span>
              <span className="text-zinc-400 text-xs font-mono">· ObraService OS v2.4</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight leading-tight">
              Bienvenido, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted font-normal leading-relaxed">
              Consola central de supervisión para <strong className="text-zinc-100 font-semibold">{userCompany?.name || 'Constructora Principal'}</strong>: trazabilidad en tiempo real, geocerca satelital de cuadrillas y albaranes inmutables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/presentation')}
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-brand-accent/50 text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer min-h-[44px]"
              title="Abrir la presentación interactiva Keynote Pro"
            >
              <Play className="w-3.5 h-3.5 text-brand-accent fill-brand-accent group-hover:scale-110 transition-transform" />
              <span>Ver Keynote Pro 3D</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="btn-secondary h-11 px-4 gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-accent" />
              <span>Validar Partes</span>
            </button>

            <button
              onClick={() => navigate('/admin/reports/nuevo')}
              className="btn-primary h-11 px-5 gap-2 shadow-lg shadow-brand-accent/25 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Parte</span>
            </button>
          </div>
        </div>

        {/* Decorative architectural background lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
      </div>

      {/* 2. High-Impact Stats Grid (Zero-Pill Typography Discipline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="card-executive group hover:border-brand-accent/50 transition-all duration-300 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-bg/80 border border-white/10 flex items-center justify-center group-hover:border-brand-accent/40 transition-colors">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${stat.badgeBg}`}>
                  {stat.trend}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-2xl sm:text-3xl font-display font-black text-white tabular-nums mt-1">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Center Operations & Data Visualization Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Data Visualization Engineer: Labor Hours Distribution */}
          <TajoHoursDistributionChart 
            reports={companyReports} 
            companies={state.companies || []} 
          />

          {/* Quick Operations Workflows */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-muted px-1">
              Módulos Operativos Principales
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { key: 'reports', title: 'Partes de Trabajo', desc: 'Control de cuadrillas y cálculo automático por convenio', icon: FileSpreadsheet, color: 'text-brand-accent' },
                { key: 'delivery_notes', title: 'Albaranes Oficiales', desc: 'Emisión inmutable y certificación digital con firma', icon: FileText, color: 'text-blue-400' },
                { key: 'projects', title: 'Gestión de Tajos', desc: 'Planificación de obras, fases e hitos presupuestarios', icon: Building2, color: 'text-emerald-400' },
                { key: 'team', title: 'Subcontratas & REA', desc: 'Supervisión documental preventiva PRL y TC2', icon: Briefcase, desc2: 'Compliance y liquidaciones', color: 'text-amber-400' },
              ].map(item => (
                <button 
                  key={item.key}
                  onClick={() => onNavigate(item.key as any)}
                  className="card p-5 flex flex-col gap-3.5 text-left hover:bg-brand-surface-hover hover:border-brand-accent/30 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border border-white/10 group-hover:border-brand-accent transition-colors">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{item.title}</h3>
                    <p className="text-xs text-brand-muted mt-1 font-normal leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Active Projects & GPS Geofence Radar Preview */}
          <div className="card-executive p-4 sm:p-5 overflow-hidden relative group cursor-pointer border-brand-border hover:border-brand-accent/40 transition-all" onClick={() => onNavigate('map')}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-bg border border-white/10 flex items-center justify-center text-brand-accent">
                  <MapPin className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Radar de Tajos y Trazabilidad Satelital</h3>
                  <span className="text-[10px] text-brand-muted font-mono">Geolocalización activa mediante algoritmo Haversine</span>
                </div>
              </div>
              <span className="btn-secondary h-8 px-3 text-[10px] font-bold gap-1 border-brand-accent/30 text-brand-accent">
                <span>Ver Mapa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Live Projects Location Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {activeProjects.slice(0, 4).map((p) => {
                const locName = typeof p.location === 'string' ? p.location : (p.location?.address || p.address || 'Madrid, España');
                return (
                  <div key={p.id} className="p-3 rounded-xl bg-brand-bg/90 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-brand-muted truncate mt-0.5">{locName}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-brand-surface border border-white/10 text-[9px] font-mono font-bold text-brand-accent shrink-0 ml-2">
                      {p.code}
                    </span>
                  </div>
                );
              })}
              {activeProjects.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-brand-muted italic">
                  No hay obras activas en este momento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Alerts & Activity (Right Sidebar) */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-muted px-1">
              Control Preventivo & Alertas
            </h2>
            
            {blockedSubcontractors.length > 0 ? (
              blockedSubcontractors.map(sub => (
                <div key={sub.id} className="card p-4 border-rose-500/30 bg-rose-500/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 shrink-0">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Subcontrata Bloqueada</div>
                      <div className="text-[11px] text-brand-muted font-medium mt-1">{sub.name} — Documentación caducada</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('team')} 
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                  >
                    Ver Documentación
                  </button>
                </div>
              ))
            ) : (
              <div className="card p-6 border-dashed border-white/10 flex flex-col items-center text-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white">Cumplimiento Integral OK</div>
                <p className="text-[11px] font-normal text-brand-muted">
                  Todas las subcontratas activas cuentan con REA y seguros vigentes.
                </p>
              </div>
            )}

            {/* Keynote Presentation Teaser Card (Visual Storyteller) */}
            <div className="card-executive p-4 space-y-3 border-brand-accent/25">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Presentación para Clientes</h3>
                  <p className="text-[10px] text-brand-muted">Keynote 3D con audio y esquemas técnicos</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Muestra a promotores y socios inversores cómo ObraService digitaliza y blinda la operativa de tus tajos.
              </p>
              <button
                onClick={() => navigate('/presentation')}
                className="w-full py-2 px-3 rounded-lg bg-brand-accent/15 hover:bg-brand-accent/25 border border-brand-accent/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Abrir Keynote</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Activity Log */}
            <div className="card p-4 sm:p-5 space-y-4">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-muted">
                Actividad Reciente en Tajo
              </h3>
              <div className="space-y-3.5">
                {[
                  { time: '10:45', user: 'Javier Ortiz', action: 'validó parte diario #PAR-092', obra: 'Residencial Gran Vía' },
                  { time: '09:12', user: 'Elena Ramos', action: 'firmó albarán #ALB-054', obra: 'Torre Chamartín' },
                  { time: '08:30', user: 'Antonio Silva', action: 'fichaje presencial GPS', obra: 'Gran Vía 48' },
                  { time: 'Ayer', user: 'Sistema PRL', action: 'verificación REA completada', obra: 'Ferrallados Ibérica' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="text-[10px] font-mono text-brand-accent w-10 shrink-0 mt-0.5">{act.time}</div>
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-white">{act.user}</span>
                      <span className="text-brand-muted"> {act.action} en </span>
                      <span className="text-zinc-200 font-semibold">{act.obra}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
