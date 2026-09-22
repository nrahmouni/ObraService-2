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
  Radio,
  Download,
  Plus,
  Sparkles,
  Search,
  Check,
  Dices
} from 'lucide-react';
import { AppState, Project } from '../../types';
import { TabKey } from '../MainLayout';
import { checkOperationalStatus } from '../../utils/compliance';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../../services/store';
import toast from 'react-hot-toast';

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

  // Compute budget & consumption
  const totalBudget = allProjects.reduce((acc, p) => acc + (p.budget || 250000), 0);
  const projectIds = allProjects.map(p => p.id);
  
  const companyReports = (state.reports || []).filter(r => projectIds.includes(r.projectId));
  const totalLaborHours = companyReports.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const laborCost = totalLaborHours * 24;
  
  const projectMachinery = (state.machinery || []).filter(m => m.companyId === userCompanyId);
  const machineryCost = projectMachinery.length * 180 * 20;
  const totalAccruedCost = laborCost + machineryCost;
  const budgetConsumedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalAccruedCost / totalBudget) * 100)) : 0;

  // Delivery Notes & Disputed Notes
  const companyDeliveryNotes = (state.deliveryNotes || []).filter(n => projectIds.includes(n.projectId));
  const pendingNotes = companyDeliveryNotes.filter(n => n.status === 'Pending');
  const disputedNotes = companyDeliveryNotes.filter(n => n.status === 'Disputed');
  
  // Compliance verification for subcontractors
  const subcontractorCompanies = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');
  const blockedSubcontractors = subcontractorCompanies.filter(sub => checkOperationalStatus(sub.id).isBlocked);
  const ownCompliance = checkOperationalStatus(userCompanyId);

  // Critical alerts collection
  const criticalAlerts: { id: string; type: 'PRL' | 'Dispute'; title: string; desc: string; actionTab: TabKey }[] = [];

  if (ownCompliance.isBlocked) {
    criticalAlerts.push({
      id: 'compliance-own',
      type: 'PRL',
      title: 'Incumplimiento de Compliance Propio',
      desc: ownCompliance.reason || 'Documentación de prevención de riesgos (PRL) caducada o pendiente.',
      actionTab: 'docs'
    });
  }

  blockedSubcontractors.forEach(sub => {
    const res = checkOperationalStatus(sub.id);
    criticalAlerts.push({
      id: `compliance-sub-${sub.id}`,
      type: 'PRL',
      title: `Subcontrata Bloqueada: ${sub.name}`,
      desc: res.reason || 'Documentos obligatorios REA o de prevención vencidos.',
      actionTab: 'team'
    });
  });

  disputedNotes.forEach(note => {
    criticalAlerts.push({
      id: `dispute-${note.id}`,
      type: 'Dispute',
      title: `Disputa en Albarán: ${note.code}`,
      desc: `La subcontrata "${note.subcontractorCompanyName}" discrepa con las horas asignadas en ${note.projectNameSnapshot}.`,
      actionTab: 'delivery_notes'
    });
  });

  // Active personnel calculation
  const totalWorkers = (state.workers || []).filter(w => w.companyId === userCompanyId || w.isSubcontractor).length;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const workersClockedToday = new Set(
    (state.timeLogs || [])
      .filter(tl => tl.timestamp?.startsWith(todayDateStr) && tl.status === 'In')
      .map(tl => tl.userId)
  ).size;
  const personnelCount = Math.max(workersClockedToday, Math.min(totalWorkers, 12));

  // Today's reports
  const todayReports = companyReports.filter(r => r.date?.startsWith(todayDateStr) || r.createdAt?.startsWith(todayDateStr));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-4 text-zinc-200">
      
      {/* 1. Header & Direct Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] p-4 sm:p-5 rounded-xl">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Panel Principal de Constructora
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Validación de partes de subcontratas, albaranes, certificaciones y cumplimiento.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Validar Partes de Subcontratas</span>
        </button>
      </div>

      {/* 2. Critical Notices (PRL or Disputes) - Only if active */}
      {criticalAlerts.length > 0 && (
        <div className="bg-[#1C1917] border border-[#44403C] rounded-xl p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{criticalAlerts.length} aviso(s) pendiente(s) de revisión</span>
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
                Partes Diarios de Trabajo
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {companyReports.length} partes • {totalLaborHours}h registradas
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
                {pendingNotes.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {pendingNotes.length} pendientes
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {companyDeliveryNotes.length} albaranes registrados
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Section 3: Obras */}
        <div 
          onClick={() => onNavigate('projects')}
          className="w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1C1C20] p-4 sm:p-5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center text-zinc-200 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                Obras y Proyectos
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeProjects.length} activas • {allProjects.length} registradas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Section 4: Personal y Cuadrillas */}
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
                Personal y Fichajes
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {personnelCount} en tajo hoy • {totalWorkers} operarios
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

      </div>

    </div>
  );
};
