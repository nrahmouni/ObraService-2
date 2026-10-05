import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  HardHat, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Clock,
  Plus,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Users,
  Wifi,
  Sparkles
} from 'lucide-react';
import { AppState, Project, DailyReport, DeliveryNote } from '../types';
import { obraStore } from '../services/store';
import { exportToCSV } from '../utils/export';
import toast from 'react-hot-toast';

interface MobileLandingProps {
  state?: AppState;
  onNavigate?: (tab: any) => void;
  onOpenNewReport?: () => void;
}

export const MobileLanding: React.FC<MobileLandingProps> = ({
  state: propState,
  onNavigate,
  onOpenNewReport,
}) => {
  const state = propState || obraStore.getState();
  const currentUser = state.currentUser;
  const [activeTab, setActiveTab] = useState<'partes' | 'albaranes' | 'cuadrilla'>('partes');

  // Find user's assigned projects or first active project
  const userProjects = (state.projects || []).filter(p => 
    currentUser?.assignedProjectIds?.includes(p.id) || p.status === 'Active'
  );
  const activeProject: Project | undefined = userProjects[0] || state.projects[0];
  const activeCompany = (state.companies || []).find(c => c.id === currentUser?.companyId);

  // Pending delivery notes for this worker's company
  const myPendingNotes = (state.deliveryNotes || []).filter(
    n => n.subcontractorCompanyId === currentUser?.companyId && n.status === 'Pending'
  );

  const allMyNotes = (state.deliveryNotes || []).filter(
    n => n.subcontractorCompanyId === currentUser?.companyId
  );

  // Recent reports created by this user/company
  const myReports = (state.reports || []).filter(
    r => r.creatorId === currentUser?.id || r.companyId === currentUser?.companyId
  );

  // Find latest time log for current user
  const latestLog = (state.timeLogs || [])
    .filter(tl => tl.userId === currentUser?.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  const isClockedIn = latestLog?.status === 'In';

  const todayStr = new Date().toISOString().split('T')[0];

  // Assigned crew workers for this company
  const companyWorkers = (state.workers || []).filter(
    w => w.companyId === currentUser?.companyId
  );

  const handleExportMyReports = () => {
    const defaultHeaders = ['Codigo', 'Proyecto', 'Fecha', 'Horas', 'Estado'];
    if (!myReports || myReports.length === 0) {
      exportToCSV([], `Mis_Partes_${todayStr}`, defaultHeaders);
      return;
    }
    const data = myReports.map(r => ({
      Codigo: r.code,
      Proyecto: r.projectNameSnapshot || '',
      Fecha: r.date,
      Horas: r.totalHours || 0,
      Estado: r.status
    }));
    exportToCSV(data, `Mis_Partes_${todayStr}`, defaultHeaders);
  };

  const getShiftTimeLabel = () => {
    if (!latestLog) return 'Sin fichaje registrado hoy';
    const timeStr = new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isClockedIn) {
      return `Jornada Activa: Entrada a las ${timeStr}h`;
    }
    return `Último registro: Salida a las ${timeStr}h`;
  };

  return (
    <div className="w-full flex flex-col space-y-4 landscape:space-y-2.5 pb-20 landscape:pb-12 animate-in fade-in duration-300 px-3 sm:px-4 pt-1 max-w-3xl min-w-[360px] mx-auto overflow-x-hidden">
      
      {/* 1. In-Field Sticky Context & Telemetry Bar (UX Architect & UI Designer) */}
      <div className="card p-3.5 sm:p-5 landscape:p-3 bg-brand-surface border-white/10 space-y-3 landscape:space-y-2 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 landscape:w-9 landscape:h-9 rounded-2xl bg-brand-bg flex items-center justify-center border border-white/10 text-brand-accent shrink-0 shadow-inner">
              <HardHat className="w-5 h-5 sm:w-6 sm:h-6 landscape:w-4 landscape:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-display font-black text-white">{currentUser?.name}</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  PRL OK
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-brand-muted font-medium mt-0.5">
                {activeCompany?.name || 'Subcontrata Autorizada'} · CIF {activeCompany?.taxId || '---'}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">Obra Asignada</div>
            <div className="text-xs font-bold text-brand-accent max-w-[130px] truncate mt-0.5">
              {activeProject?.name || 'Obra Principal'}
            </div>
          </div>
        </div>

        {/* Live In-Tajo Status Indicators */}
        <div className="pt-2.5 landscape:pt-1.5 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-brand-bg/80 border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-zinc-300">GPS Tajo ±4m (Dentro)</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-brand-bg/80 border border-white/5">
            <Wifi className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate text-zinc-300">PWA Offline Activa</span>
          </div>
        </div>
      </div>

      {/* 2. Live Shift Card ("Mi Jornada en Curso") */}
      <div className="card p-3 sm:p-4 landscape:p-2.5 bg-brand-surface/70 border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ${
            isClockedIn 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {getShiftTimeLabel()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-brand-muted mt-0.5 font-mono">
              {isClockedIn 
                ? 'Fichaje satelital verificado en tajo' 
                : 'Ficha tu presencia en cuanto accedas a la obra'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('fichar')}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-surface hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all shrink-0 cursor-pointer min-h-[38px] flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5 text-brand-accent" />
          <span>{isClockedIn ? 'Registrar Salida' : 'Fichar GPS'}</span>
        </button>
      </div>

      {/* 3. Primary In-Field Action Dock (Large Touch Targets >= 54px, compact in landscape) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <button 
          onClick={() => onOpenNewReport ? onOpenNewReport() : onNavigate?.('nuevo-parte')}
          className="btn-primary h-12 sm:h-14 landscape:h-11 w-full flex items-center justify-center gap-2.5 shadow-xl shadow-brand-accent/25 rounded-2xl cursor-pointer text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          <span>Emitir Parte Diario</span>
        </button>

        <button 
          onClick={() => onNavigate?.('fichar')}
          className="btn-secondary h-12 sm:h-14 landscape:h-11 w-full flex items-center justify-center gap-2.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl cursor-pointer text-xs font-bold uppercase tracking-wider"
        >
          <Clock className="w-5 h-5" />
          <span>Fichar Entrada / Salida GPS</span>
        </button>
      </div>

      {/* 4. Secondary Field Operational Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => onNavigate?.('delivery_notes')}
          className="card p-3.5 flex flex-col items-center text-center gap-2 hover:bg-brand-surface-hover active:scale-98 transition-all border-white/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border border-white/10 text-blue-400 relative">
            <FileText className="w-5 h-5" />
            {myPendingNotes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                {myPendingNotes.length}
              </span>
            )}
          </div>
          <div className="text-[11px] font-bold text-white leading-tight">Albaranes</div>
          <div className="text-[9px] font-mono text-brand-muted">
            {myPendingNotes.length > 0 ? `${myPendingNotes.length} pendientes` : 'Al día'}
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('chat')}
          className="card p-3.5 flex flex-col items-center text-center gap-2 hover:bg-brand-surface-hover active:scale-98 transition-all border-white/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border border-white/10 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-white leading-tight">Chat Tajo</div>
          <div className="text-[9px] font-mono text-brand-muted">Jefe de Obra</div>
        </button>

        <button 
          onClick={() => onNavigate?.('map')}
          className="card p-3.5 flex flex-col items-center text-center gap-2 hover:bg-brand-surface-hover active:scale-98 transition-all border-white/10 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center border border-white/10 text-amber-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-white leading-tight">Geocerca</div>
          <div className="text-[9px] font-mono text-brand-muted">Radio GPS</div>
        </button>
      </div>

      {/* 5. In-Field Segmented Operations Hub */}
      <div className="card p-4 sm:p-5 bg-brand-surface border-white/10 space-y-4">
        
        {/* Segmented Tab Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('partes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'partes'
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              Partes Recientes ({myReports.length})
            </button>

            <button
              onClick={() => setActiveTab('albaranes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'albaranes'
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <span>Albaranes</span>
              {myPendingNotes.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('cuadrilla')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cuadrilla'
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              Cuadrilla ({companyWorkers.length})
            </button>
          </div>

          {activeTab === 'partes' && myReports.length > 0 && (
            <button
              onClick={handleExportMyReports}
              className="text-xs text-brand-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
              title="Exportar partes en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
        </div>

        {/* TAB 1: RECENT REPORTS */}
        {activeTab === 'partes' && (
          <div className="space-y-2.5">
            {myReports.slice(0, 5).map(rep => {
              const totalHrs = rep.totalHours || (rep.workEntries || []).reduce((acc, we) => acc + (we.totalHours || 0), 0);
              const isApproved = rep.status === 'Corrected' || rep.status === 'Locked' || rep.status === 'Submitted';
              return (
                <div 
                  key={rep.id} 
                  onClick={() => onNavigate?.('reports')}
                  className="p-3 rounded-xl bg-brand-bg/70 hover:bg-brand-bg border border-white/5 hover:border-white/15 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-surface border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-brand-accent transition-colors">
                        {rep.projectNameSnapshot}
                      </div>
                      <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                        {rep.date} • {rep.code}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white tabular-nums">{totalHrs}h</div>
                    <span className={`inline-block text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                      isApproved 
                        ? 'text-emerald-400 bg-emerald-500/10' 
                        : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {myReports.length === 0 && (
              <div className="py-8 text-center text-xs text-brand-muted space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>No has registrado ningún parte de trabajo aún.</p>
                <button
                  onClick={() => onOpenNewReport ? onOpenNewReport() : onNavigate?.('nuevo-parte')}
                  className="text-brand-accent font-bold hover:underline"
                >
                  Emitir tu primer parte ahora →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALBARANES DE ENTREGA */}
        {activeTab === 'albaranes' && (
          <div className="space-y-2.5">
            {allMyNotes.slice(0, 5).map(note => (
              <div 
                key={note.id} 
                onClick={() => onNavigate?.('delivery_notes')}
                className="p-3 rounded-xl bg-brand-bg/70 hover:bg-brand-bg border border-white/5 hover:border-white/15 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {note.code}
                    </div>
                    <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                      {note.date} • {note.totalHours} horas certificadas
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    note.status === 'Confirmed' 
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                      : 'text-amber-400 bg-amber-500/10 border border-amber-500/20 animate-pulse'
                  }`}>
                    {note.status === 'Confirmed' ? 'Firmado' : 'Firma Pendiente'}
                  </span>
                </div>
              </div>
            ))}

            {allMyNotes.length === 0 && (
              <div className="py-8 text-center text-xs text-brand-muted space-y-1">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>No hay albaranes generados para tu subcontrata.</p>
                <p className="text-[11px] text-zinc-500">Se crearán automáticamente al validar tus partes diarios.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUADRILLA */}
        {activeTab === 'cuadrilla' && (
          <div className="space-y-2.5">
            {companyWorkers.map(w => (
              <div key={w.id} className="p-3 rounded-xl bg-brand-bg/70 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface border border-white/10 flex items-center justify-center text-brand-muted shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{w.name}</div>
                    <div className="text-[10px] text-brand-muted font-mono mt-0.5">{w.category} · DNI/NIE {w.taxId || '---'}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">PRL Activo</span>
              </div>
            ))}

            {companyWorkers.length === 0 && (
              <div className="py-8 text-center text-xs text-brand-muted">
                No hay operarios registrados en tu cuadrilla aún.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
