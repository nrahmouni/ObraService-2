import React, { useState } from 'react';
import { 
  MapPin, 
  Inbox, 
  Zap, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  HardHat, 
  Euro,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AppState, DailyReport, DeliveryNote } from '../../types';
import { TabKey } from '../AppShell';
import { checkOperationalStatus } from '../../utils/compliance';

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

  // Pending elements filtered by current project if selected
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

  // Financial performance
  const projectBudget = activeProject?.budget || 350000;
  const projectHours = (state.reports || [])
    .filter(r => r.projectId === activeProject?.id)
    .reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const projectSpent = projectHours * 24 + 18000;
  const percentConsumed = Math.min(100, Math.round((projectSpent / projectBudget) * 100));

  // Compliance checks for the assigned project
  const subcontractorCompanies = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');
  const blockedSubcontractors = subcontractorCompanies.filter(sub => checkOperationalStatus(sub.id).isBlocked);
  const ownCompliance = checkOperationalStatus(userCompanyId);

  // Collect critical alerts
  const criticalAlerts: { id: string; type: 'PRL' | 'Dispute'; title: string; desc: string; actionTab: TabKey }[] = [];

  if (ownCompliance.isBlocked) {
    criticalAlerts.push({
      id: 'compliance-manager-own',
      type: 'PRL',
      title: 'Tu Empresa de Construcción está Bloqueada (PRL)',
      desc: ownCompliance.reason || 'Documentación caducada o vencida en el sistema de prevención.',
      actionTab: 'docs'
    });
  }

  blockedSubcontractors.forEach(sub => {
    // Show alert if subcontractors assigned to our projects are blocked
    const isAssigned = (state.workers || []).some(w => w.companyId === sub.id && w.assignedProjectIds?.includes(activeProject?.id));
    if (isAssigned) {
      criticalAlerts.push({
        id: `compliance-manager-sub-${sub.id}`,
        type: 'PRL',
        title: `Subcontrata en Obra Bloqueada: ${sub.name}`,
        desc: checkOperationalStatus(sub.id).reason || 'Falta de certificado REA o PRL válido.',
        actionTab: 'team'
      });
    }
  });

  const activeProjectDisputes = pendingDeliveryNotes.filter(n => n.status === 'Disputed');
  activeProjectDisputes.forEach(note => {
    criticalAlerts.push({
      id: `dispute-${note.id}`,
      type: 'Dispute',
      title: `Disputa en Albarán: ${note.code}`,
      desc: `La empresa subcontratada "${note.subcontractorCompanyName}" disputa las horas registradas en ${note.projectNameSnapshot}.`,
      actionTab: 'delivery_notes'
    });
  });

  // Active workforce on tajo
  const activeWorkersCount = (state.workers || []).filter(w => 
    w.active && (!activeProject || w.assignedProjectIds?.includes(activeProject.id))
  ).length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 text-slate-300 font-sans">
      
      {/* 1) CRITICAL ALERTS ZONE */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-rose-500">
              Alertas del Proyecto en Curso ({criticalAlerts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalAlerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => onNavigate(alert.actionTab)}
                className="bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 p-4 rounded-2xl flex items-start gap-3 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-black uppercase tracking-tight text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                    <span>{alert.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {alert.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEADER AND SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block font-display">
            Coordinación General Obra
          </span>
          <h1 className="text-xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            Bandeja e Inbox de Tajo
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {assignedProjects.slice(0, 4).map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                selectedProjectId === p.id
                  ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-950/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={onOpenNewReport}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Nuevo Parte</span>
          </button>
        </div>
      </div>

      {/* 2) KPIs WITH TENDENCY (CLICKABLE INTERFACE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Presupuesto Proyecto */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Ejecutado de Obra</span>
            <Euro className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatCurrency(projectSpent)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Presupuesto Obra: <span className="text-slate-300 font-bold">{formatCurrency(projectBudget)}</span>
          </p>
          <div className="mt-2.5">
            <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percentConsumed}%` }} />
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              <span>CONSUMO</span>
              <span>{percentConsumed}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Documentos por Validar */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Pendientes de Firma</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {pendingReports.length + pendingDeliveryNotes.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {pendingReports.length} partes • {pendingDeliveryNotes.length} albaranes
          </p>
          <div className="mt-3 flex items-center justify-between text-[9px] font-bold">
            <div className="flex items-center gap-1 text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+3 hoy</span>
            </div>
            <span className="text-slate-500 uppercase tracking-wider">Aprobaciones urgentes</span>
          </div>
        </div>

        {/* KPI 3: Operarios en Obra */}
        <div 
          onClick={() => onNavigate('team')}
          className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Operarios Homologados</span>
            <HardHat className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {activeWorkersCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Asignados a este proyecto
          </p>
          <div className="mt-3 flex items-center justify-between text-[9px] font-bold">
            <div className="flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18% vs ayer</span>
            </div>
            <span className="text-slate-500 uppercase tracking-wider">Rendimiento óptimo</span>
          </div>
        </div>

        {/* KPI 4: Ubicación y Geocerca */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Ubicación GPS</span>
            <MapPin className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xs font-black text-white uppercase truncate mt-1">
            {activeProject?.name || 'No seleccionado'}
          </div>
          <p className="text-[9px] text-slate-500 leading-tight mt-1 font-mono">
            {activeProject?.location?.address || 'Sin dirección'}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-sky-400">
            <span>RADIO: {activeProject?.validationRadiusMeters || 200}M</span>
            <span className="text-emerald-400 flex items-center gap-1">📍 ACTIVO</span>
          </div>
        </div>

      </div>

      {/* TWO COLUMNS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: prioritized Inbox */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                Inbox de Firmas y Validación de Obra
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800/60">
              <button
                onClick={() => setInboxFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  inboxFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Todos ({pendingReports.length + pendingDeliveryNotes.length})
              </button>
              <button
                onClick={() => setInboxFilter('reports')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  inboxFilter === 'reports' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Partes ({pendingReports.length})
              </button>
              <button
                onClick={() => setInboxFilter('notes')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  inboxFilter === 'notes' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Albaranes ({pendingDeliveryNotes.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/40">
            {filteredInbox.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-bold uppercase tracking-wider italic">
                ¡Bandeja vacía! No quedan documentos pendientes para {activeProject?.name || 'este proyecto'}.
              </div>
            ) : (
              filteredInbox.map(({ type, item }: any) => {
                if (type === 'report') {
                  const r: DailyReport = item;
                  return (
                    <div key={r.id} className="p-4 hover:bg-slate-900/10 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
                          <FileSpreadsheet className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-200 uppercase">
                            Parte Diario • {r.date}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Creador: {r.creatorNameSnapshot} • {r.totalHours}h ordinarias • {r.workEntries?.length || 0} operarios en tajo
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('reports')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-200 cursor-pointer transition-colors"
                      >
                        Revisar
                      </button>
                    </div>
                  );
                } else {
                  const n: DeliveryNote = item;
                  return (
                    <div key={n.id} className="p-4 hover:bg-slate-900/10 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-200 uppercase">
                            Albarán: {n.code}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Subcontrata: {n.subcontractorCompanyName} • {n.totalHours}h asignadas • {n.status === 'Disputed' ? '⚠️ DISPUTADO' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('delivery_notes')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-200 cursor-pointer transition-colors"
                      >
                        Auditar
                      </button>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>

        {/* Right: Coordination channels & active crew */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              Canales Directos
            </h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Mensajería integrada y chats de tajo por obra activa.
            </p>

            <div className="space-y-2">
              {['Avisos de Obra', 'Descargas y Hormigón', ' PRL & Geocerca'].map((canal, cidx) => (
                <button
                  key={canal}
                  onClick={() => onNavigate('chat')}
                  className="w-full p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-300 group-hover:text-orange-500 transition-colors">
                      #{canal}
                    </div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                      {cidx === 0 ? 'Notificaciones generales' : cidx === 1 ? 'Coordinación materiales' : 'Alertas GPS en tajo'}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-orange-500" />
              Equipo en Campo
            </h3>
            <div className="space-y-2">
              {(state.workers || []).slice(0, 3).map(w => (
                <div key={w.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-slate-200 uppercase block">{w.name}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">{w.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 uppercase">
                    EN TAJO
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
