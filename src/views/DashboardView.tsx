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
  Network,
  Zap,
  Activity,
  History,
  Users,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { TabKey } from '../components/AppShell';
import { AppState } from '../types';

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

  const isSubcontractor = user.role === 'SUBCONTRACTOR_USER';
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN';

  const activeProjects = (state.projects || []).filter(p => p.status === 'Active');
  const confirmedToday = (state.deliveryNotes || []).filter(n => n.status === 'Confirmed').length;

  const pendingNotes = (state.deliveryNotes || []).filter(n => {
    if (isSubcontractor) return n.subcontractorCompanyId === user.companyId && n.status === 'Pending';
    return n.status === 'Pending';
  });

  const DashboardHeader = () => (
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{user.companyName}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isAdmin ? 'Métricas Estratégicas' : isSubcontractor ? 'Panel Logístico' : 'Control Operativo'}
          </span>
        </div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          Vista General
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {user.role !== 'SUBCONTRACTOR_USER' && (
          <button
            onClick={onOpenNewReport}
            className="bg-[#FF6600] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Zap className="w-3 h-3" />
            Nuevo Parte
          </button>
        )}
        {isSubcontractor && pendingNotes.length > 0 && (
          <button
            onClick={() => onNavigate('delivery_notes')}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            Firmar ({pendingNotes.length})
          </button>
        )}
      </div>
    </div>
  );

  // Role-based Access Control (RBAC) - Redirect or restrict based on role
  if (isAdmin) {
    const totalHours = (state.reports || []).reduce((acc, r) => acc + r.totalHours, 0);
    const totalWorkers = (state.workers || []).length;
    const activeProjectsCount = activeProjects.length;
    const subCompanies = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');

    return (
      <div className="animate-in fade-in duration-500">
        <DashboardHeader />
        
        {/* Compact Admin Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Obras Activas</div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-xl font-black text-slate-900">{activeProjectsCount}</div>
              <div className="text-[8px] text-emerald-600 font-bold uppercase">En Curso</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Efectivos Totales</div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-xl font-black text-[#FF6600]">{totalWorkers}</div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">Red Activa</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Producción Acum.</div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-xl font-black text-emerald-600">{totalHours}h</div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">Mes Actual</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Hitos Auditados</div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-xl font-black text-indigo-600">{(state.auditEvents || []).length}</div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">Chain-Link</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Network Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Network className="w-3 h-3 text-[#FF6600]" />
                  Malla de Subcontratas
                </h3>
                <span className="text-[8px] font-bold text-slate-500 uppercase">{subCompanies.length} Colaboradores vinculados</span>
              </div>
              <div className="divide-y divide-slate-100">
                {subCompanies.map(sub => (
                  <div key={sub.id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200 uppercase">
                        {sub.taxId.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-900">{sub.name}</div>
                        <div className="text-[8px] text-slate-500 uppercase tracking-tight">
                          CIF: {sub.taxId} • {(state.workers || []).filter(w => w.companyId === sub.id).length} Operarios en Campo
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onNavigate('team')} className="text-[8px] font-bold text-[#FF6600] hover:underline uppercase tracking-widest">Ver Detalles</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Estado por Proyecto</h3>
              </div>
              <div className="p-3 space-y-3">
                {activeProjects.slice(0, 4).map(prj => {
                  const prjHours = (state.reports || []).filter(r => r.projectId === prj.id).reduce((acc, r) => acc + r.totalHours, 0);
                  return (
                    <div key={prj.id} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-700 uppercase">
                        <span>{prj.name}</span>
                        <span>{prjHours}h / 500h</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6600] rounded-full" style={{ width: `${Math.min(100, (prjHours/500)*100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side Info Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Agenda de Validación</h3>
              <div className="space-y-2">
                {(state.reports || []).filter(r => r.status === 'Draft').slice(0, 5).map((report, i) => (
                  <div key={i} className="flex gap-2.5 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-1 h-1 rounded-full bg-[#FF6600] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-900 leading-tight uppercase">Parte: {report.code}</div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-tighter">{report.projectNameSnapshot} • {report.date}</div>
                    </div>
                  </div>
                ))}
                {(state.reports || []).filter(r => r.status === 'Draft').length === 0 && (
                  <p className="text-[8px] text-slate-400 italic text-center py-4 uppercase font-bold tracking-widest">Sin tareas críticas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'SITE_MANAGER') {
    return (
      <div className="animate-in fade-in duration-500">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Control Operativo de Partes</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onNavigate('reports')}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-left hover:border-[#FF6600]/30 transition-all group"
                >
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Borradores</div>
                  <div className="text-xl font-black text-slate-900">{(state.reports || []).filter(r => r.status === 'Draft' && r.creatorId === user.id).length}</div>
                </button>
                <button 
                  onClick={() => onNavigate('reports')}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-left hover:border-emerald-500/30 transition-all"
                >
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Enviados (Semana)</div>
                  <div className="text-xl font-black text-slate-900">{(state.reports || []).filter(r => r.status === 'Submitted' && r.creatorId === user.id).length}</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Mis Obras Asignadas</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {(state.projects || []).filter(p => user.assignedProjectIds.includes(p.id)).map(prj => (
                  <div key={prj.id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('projects')}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-900 uppercase">{prj.name}</div>
                        <div className="text-[8px] text-slate-500 uppercase tracking-tight">{prj.location.address}</div>
                      </div>
                    </div>
                    <Badge variant={prj.status === 'Active' ? 'success' : 'warning'} className="text-[8px] px-1.5 py-0">
                      {prj.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Personal en Tajo</h3>
              <div className="space-y-2">
                {(state.workers || []).slice(0, 6).map(worker => (
                  <div key={worker.id} className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-50">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[8px] font-black text-white uppercase">
                      {worker.name[0]}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-900 uppercase">{worker.name}</div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-tighter">{worker.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                <h3 className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Alertas Geovalla</h3>
              </div>
              <p className="text-[9px] font-medium text-rose-700/70 leading-relaxed mb-3">
                Detectados {(state.auditEvents || []).filter(e => e.operation === 'REPORT_SUBMITTED' && e.details.includes('fuera')).length} intentos fuera de radio.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubcontractor) {
    return (
      <div className="animate-in fade-in duration-500">
        <DashboardHeader />
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Pendientes de Firma</div>
            <div className="text-xl font-black text-slate-900">{pendingNotes.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Confirmados (Mes)</div>
            <div className="text-xl font-black text-emerald-600">
              {(state.deliveryNotes || []).filter(n => n.status === 'Confirmed' && n.subcontractorCompanyId === user.companyId).length}
            </div>
          </div>
          <div className="hidden lg:block bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Disputas Abiertas</div>
            <div className="text-xl font-black text-rose-600">
              {(state.deliveryNotes || []).filter(n => n.status === 'Disputed' && n.subcontractorCompanyId === user.companyId).length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Últimos Albaranes Recibidos</h3>
            <button onClick={() => onNavigate('delivery_notes')} className="text-[8px] font-bold text-[#FF6600] uppercase tracking-widest">Ver Todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {(state.deliveryNotes || [])
              .filter(n => n.subcontractorCompanyId === user.companyId)
              .slice(0, 6)
              .map(note => (
                <div key={note.id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 border border-slate-200 uppercase">
                      REF
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{note.projectNameSnapshot}</div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-widest">Cód: {note.code} • {note.date}</div>
                    </div>
                  </div>
                  <Badge 
                    variant={note.status === 'Confirmed' ? 'success' : note.status === 'Disputed' ? 'danger' : 'warning'}
                    className="text-[8px] px-1.5 py-0"
                  >
                    {note.status}
                  </Badge>
                </div>
              ))}
            {(state.deliveryNotes || []).filter(n => n.subcontractorCompanyId === user.companyId).length === 0 && (
              <div className="p-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                No hay albaranes registrados para tu empresa.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for restricted or unknown roles
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Acceso Restringido</h2>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
        Tu rol actual no dispone de un panel configurado. Contacta con soporte técnico.
      </p>
    </div>
  );
};
