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
  ArrowDownRight,
  Dices,
  CheckCircle2
} from 'lucide-react';
import { AppState, DailyReport, DeliveryNote } from '../../types';
import { TabKey } from '../MainLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { obraStore } from '../../services/store';
import { ClockInButton } from '../ClockInButton';
import toast from 'react-hot-toast';

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
    <div className="space-y-4 text-zinc-200">
      
      {/* 1. Header & Direct Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] p-4 sm:p-5 rounded-xl">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Panel de Jefe de Obra
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Supervisión directa de partes de trabajo, albaranes y cuadrillas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assignedProjects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#27272A] border border-[#3F3F46] text-white text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer [&>option]:bg-[#18181B] [&>option]:text-white"
            >
              {assignedProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Validar Partes de Subcontrata</span>
          </button>
        </div>
      </div>

      {/* 2. Critical Alerts if any */}
      {criticalAlerts.length > 0 && (
        <div className="bg-[#1C1917] border border-[#44403C] rounded-xl p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{criticalAlerts.length} aviso(s) para la obra en curso</span>
          </div>
          <div className="space-y-1.5">
            {criticalAlerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => onNavigate(alert.actionTab)}
                className="bg-[#27272A] border border-[#3F3F46] hover:border-zinc-500 p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-white">{alert.title}</div>
                  <div className="text-[11px] text-zinc-400">{alert.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Site Manager Presence Fichaje Card */}
      <div className="w-full bg-[#18181B] border border-[#27272A] p-4 sm:p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/30 flex items-center justify-center text-[#EA580C]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Presencia y Control de Jefe de Obra</h2>
              <p className="text-xs text-zinc-400">Registro oficial de presencia en obra para la dirección facultativa</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            JEFE DE OBRA
          </span>
        </div>
        <div className="pt-1">
          <ClockInButton project={activeProject} variant="full" />
        </div>
      </div>

      {/* 3. Dedicated Task Sections in Single-Column Vertical Document Flow */}
      <div className="flex flex-col space-y-3 w-full">
        
        {/* Section 1: Partes de Trabajo */}
        <div 
          onClick={() => onNavigate('reports')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 sm:p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-zinc-200 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                Partes Diarios de Tajo
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {pendingReports.length} pendientes • {projectHours}h registradas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Section 2: Albaranes */}
        <div 
          onClick={() => onNavigate('delivery_notes')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 sm:p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-zinc-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                  Albaranes de Subcontratas
                </h2>
                {pendingDeliveryNotes.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {pendingDeliveryNotes.length} pendientes
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Revisión y firma de horas de subcontratas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Section 3: Operarios en Cuadrilla */}
        <div 
          onClick={() => onNavigate('team')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 sm:p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-zinc-200 shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                Personal en Obra
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeWorkersCount} operarios asignados a este tajo
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Section 4: Geocerca y Ubicación */}
        <div 
          onClick={() => onNavigate('map')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 sm:p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-zinc-200 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                Geocerca y Ubicación
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]">
                {activeProject?.name || 'Obra actual'} • Radio {activeProject?.validationRadiusMeters || 200}m
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

      </div>

    </div>
  );
};
