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
  Briefcase
} from 'lucide-react';
import { AppState, Role } from '../../types';
import { TabKey } from '../layout/AuthenticatedLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onNavigate }) => {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const userCompanyId = user.companyId;

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
  const ownCompliance = checkOperationalStatus(userCompanyId);

  // Stats for the top bar
  const stats = [
    { label: 'Obras Activas', value: activeProjects.length, icon: Building2, trend: '+2 esta semana', color: 'text-brand-accent' },
    { label: 'Horas Totales', value: `${totalLaborHours}h`, icon: Clock, trend: 'En curso', color: 'text-blue-500' },
    { label: 'Albaranes', value: companyDeliveryNotes.length, icon: FileText, trend: `${pendingNotes.length} pendientes`, color: 'text-emerald-500' },
    { label: 'Incidencias', value: blockedSubcontractors.length, icon: AlertTriangle, trend: 'Requiere acción', color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Welcome & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Hola, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1">
            Aquí tienes el resumen operativo de <span className="text-white">Construcciones Norte S.A.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="btn-secondary h-11 gap-2 justify-center text-xs uppercase tracking-wider"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Validar Partes</span>
          </button>
          <button
            onClick={() => navigate('/admin/reports/nuevo')}
            className="btn-primary h-11 gap-2 shadow-lg shadow-brand-accent/20 justify-center text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Obra</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card p-5 group hover:border-brand-accent/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{stat.label}</div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-black text-white tabular-nums">{stat.value}</div>
                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" />
                   <span>{stat.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Operational Flow (Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted px-1">Flujos de Trabajo</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'reports', title: 'Partes de Trabajo', desc: 'Validación de jornadas y tajos', icon: FileSpreadsheet, color: 'text-brand-accent' },
              { key: 'delivery_notes', title: 'Albaranes Digitales', desc: 'Control de materiales y suministros', icon: FileText, color: 'text-blue-500' },
              { key: 'projects', title: 'Gestión de Obras', desc: 'Planificación y presupuestos', icon: Building2, color: 'text-emerald-500' },
              { key: 'team', title: 'Subcontratas', icon: Briefcase, desc: 'Compliance y liquidaciones', color: 'text-amber-500' },
            ].map(item => (
              <button 
                key={item.key}
                onClick={() => onNavigate(item.key as any)}
                className="card p-6 flex flex-col gap-4 text-left hover:bg-brand-surface-hover transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border border-brand-border group-hover:border-brand-accent transition-colors">
                   <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{item.title}</h3>
                  <p className="text-xs text-brand-muted mt-1 font-medium">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 4. Active Map Preview (Sleek placeholder) */}
          <div className="card p-1 overflow-hidden relative group cursor-pointer" onClick={() => onNavigate('map')}>
             <div className="absolute inset-0 bg-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <span className="btn-primary h-9 px-4 text-[11px]">Abrir Mapa en Tiempo Real</span>
             </div>
             <img 
               src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200&h=400" 
               className="w-full h-48 object-cover rounded-2xl opacity-60 group-hover:scale-105 transition-transform duration-700" 
               alt="Map Preview" 
             />
             <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="bg-brand-bg/80 backdrop-blur-md border border-brand-border px-3 py-1.5 rounded-lg">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">12 Operarios Activos</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 5. Alerts & Activity (Right Sidebar) */}
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted px-1">Alertas Críticas</h2>
          
          <div className="space-y-3">
            {blockedSubcontractors.length > 0 ? (
              blockedSubcontractors.map(sub => (
                <div key={sub.id} className="card p-4 border-rose-500/20 bg-rose-500/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 shrink-0">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Subcontrata Bloqueada</div>
                      <div className="text-[11px] text-brand-muted font-medium mt-1">{sub.name} — Documentación caducada</div>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('team')} className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors">
                    Ver Documentación
                  </button>
                </div>
              ))
            ) : (
              <div className="card p-8 border-dashed border-brand-border flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[11px] font-medium text-brand-muted">Todo el ecosistema de subcontratas está al día con la normativa PRL.</p>
              </div>
            )}

            <div className="card p-4 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Actividad Reciente</h3>
              <div className="space-y-4">
                {[
                  { time: '10:45', user: 'Javier Ortiz', action: 'validó parte diario', obra: 'Residencial Jara' },
                  { time: '09:12', user: 'Elena Ramos', action: 'subió un albarán', obra: 'Edificio Nexo' },
                  { time: 'Ayer', user: 'Sistema', action: 'notificó caducidad REA', obra: 'Estructuras S.L.' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-[10px] font-mono text-brand-muted w-10 shrink-0">{act.time}</div>
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-white">{act.user}</span>
                      <span className="text-brand-muted"> {act.action} en </span>
                      <span className="text-brand-accent font-bold">{act.obra}</span>
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
