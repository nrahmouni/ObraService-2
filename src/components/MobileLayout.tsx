import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  Clock, 
  Plus, 
  X, 
  Upload, 
  MapPin, 
  HardHat, 
  LogOut, 
  Wifi, 
  WifiOff, 
  CheckCircle2,
  AlertTriangle,
  Camera,
  MessageSquare
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, User, Project } from '../types';
import { ClockInButton } from './ClockInButton';
import toast from 'react-hot-toast';

export type TabKey = 
  | 'dashboard' 
  | 'reports' 
  | 'delivery_notes' 
  | 'projects' 
  | 'map'
  | 'team' 
  | 'workers'
  | 'chat'
  | 'audit'
  | 'settings'
  | 'integrations'
  | 'docs'
  | 'profile';

interface MobileLayoutProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentUser: User;
  isDemoMode: boolean;
  onExitDemoToProduction?: () => void;
  onOpenNewReport?: () => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isDemoMode,
  onExitDemoToProduction,
  onOpenNewReport,
  children,
}) => {
  const [state, setState] = useState<AppState>(obraStore.getState());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Quick Action Modal States
  const [clockInModalOpen, setClockInModalOpen] = useState(false);
  const [uploadNoteModalOpen, setUploadNoteModalOpen] = useState(false);

  // Upload Note form state
  const [noteProjectId, setNoteProjectId] = useState<string>('');
  const [noteNormalHours, setNoteNormalHours] = useState(8);
  const [noteExtraHours, setNoteExtraHours] = useState(0);
  const [noteComment, setNoteComment] = useState('');

  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (state.projects.length > 0 && !noteProjectId) {
      setNoteProjectId(state.projects[0].id);
    }
  }, [state.projects, noteProjectId]);

  const activeCompany = state.companies.find((c) => c.id === currentUser.companyId);
  const activeProjects = (state.projects || []).filter((p) => p.status === 'Active' || p.status === 'Planned');

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleUploadAlbaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteProjectId) {
      toast.error('Por favor, selecciona una obra');
      return;
    }

    const project = state.projects.find((p) => p.id === noteProjectId);
    const projectName = project ? project.name : 'Obra';

    const res = obraStore.uploadDeliveryNote({
      projectId: noteProjectId,
      projectNameSnapshot: projectName,
      normalHours: Number(noteNormalHours),
      extraHours: Number(noteExtraHours),
      correctionNotice: noteComment || 'Subida directa desde dispositivo móvil a pie de obra.',
    });

    if (res.success) {
      toast.success(`Albarán ${res.note?.code} subido y registrado correctamente`, {
        id: 'albaran-success',
      });
      onSelectTab('delivery_notes');
    } else {
      toast.error(res.error || 'Error al subir el albarán');
    }

    setNoteNormalHours(8);
    setNoteExtraHours(0);
    setNoteComment('');
    setUploadNoteModalOpen(false);
    setBottomSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#FF6600] selection:text-white">
      {/* Mobile-First Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6600] to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <HardHat className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-[#FF6600] transition-colors">
              ObraService
            </div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[130px]">
              {activeCompany?.name || 'Constructora'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online/Offline connectivity indicator */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? '4G Obra' : 'Offline'}</span>
          </div>

          {/* Quick Header Fichar Button */}
          <button
            onClick={() => setClockInModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FF6600] hover:bg-[#e05a00] text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fichar</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider flex items-center justify-between z-30 sticky top-14">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Sin Cobertura — Datos guardados en cola offline local</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-4 pb-28">
        {children}
      </main>

      {/* Persistent Bottom Navigation Bar with Thumb-Friendly Geometry */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-16 flex items-center justify-around px-2 z-40 shadow-xl pb-safe">
        {/* Tab 1: Obras */}
        <button
          onClick={() => onSelectTab('projects')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            currentTab === 'projects' || currentTab === 'dashboard'
              ? 'text-[#FF6600] font-black'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] uppercase tracking-tight font-black">Obras</span>
        </button>

        {/* Tab 2: Partes */}
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex-1 flex flex-col items-center justify-center h-full mr-6 transition-all cursor-pointer ${
            currentTab === 'reports'
              ? 'text-[#FF6600] font-black'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] uppercase tracking-tight font-black">Partes</span>
        </button>

        {/* Central Raised Floating Action Button (FAB) */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF6600] to-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all focus:outline-none border-4 border-white dark:border-slate-900 cursor-pointer ${
              bottomSheetOpen ? 'rotate-45' : ''
            }`}
            aria-label="Acciones Rápidas"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Tab 3: Albaranes */}
        <button
          onClick={() => onSelectTab('delivery_notes')}
          className={`flex-1 flex flex-col items-center justify-center h-full ml-6 transition-all cursor-pointer ${
            currentTab === 'delivery_notes'
              ? 'text-[#FF6600] font-black'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] uppercase tracking-tight font-black">Albaranes</span>
        </button>

        {/* Tab 4: Chat / Coordinación */}
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            currentTab === 'chat'
              ? 'text-[#FF6600] font-black'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] uppercase tracking-tight font-black">Chat</span>
        </button>
      </nav>

      {/* Bottom Sheet Menu (Thumb-friendly slide-up popup from bottom) */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in">
          {/* Backdrop Blur */}
          <div
            onClick={() => setBottomSheetOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Sheet Container */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 pb-8 shadow-2xl z-10 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Acciones Rápidas en Obra
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Selecciona la operación táctica que deseas realizar
                </p>
              </div>
              <button
                onClick={() => setBottomSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The 3 Core Actions */}
            <div className="grid grid-cols-1 gap-3">
              {/* Action 1: Fichar */}
              <button
                onClick={() => {
                  setBottomSheetOpen(false);
                  setClockInModalOpen(true);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-left transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase text-slate-950 dark:text-white group-hover:text-[#FF6600] transition-colors">
                    Fichar (Control de Presencia GPS)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Comprueba tu distancia a la obra y registra entrada o salida.
                  </div>
                </div>
              </button>

              {/* Action 2: Subir Albarán */}
              <button
                onClick={() => {
                  setBottomSheetOpen(false);
                  setUploadNoteModalOpen(true);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase text-slate-950 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Subir Albarán
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Captura o introduce un albarán de entrega o remisión de material.
                  </div>
                </div>
              </button>

              {/* Action 3: Nuevo Parte */}
              <button
                onClick={() => {
                  setBottomSheetOpen(false);
                  if (onOpenNewReport) {
                    onOpenNewReport();
                  } else {
                    onSelectTab('reports');
                  }
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase text-slate-950 dark:text-white group-hover:text-blue-500 transition-colors">
                    Nuevo Parte Diario (Wizard)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Inicia el asistente táctico paso a paso para el tajo de hoy.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Fichar con Geolocalización Haversine */}
      {clockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6600]" />
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Fichaje en Obra (GPS)
                </h3>
              </div>
              <button
                onClick={() => setClockInModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              El sistema comprobará tu posición vía satélite. Debes estar a menos de{' '}
              <strong className="text-slate-900 dark:text-white">200 metros</strong> de la obra para validar el registro.
            </p>

            <ClockInButton
              projects={activeProjects}
              variant="full"
              onSuccess={() => {
                setTimeout(() => setClockInModalOpen(false), 2000);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal 2: Subir Albarán */}
      {uploadNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Subir Albarán de Obra
                </h3>
              </div>
              <button
                onClick={() => setUploadNoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadAlbaran} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Obra Destino
                </label>
                <select
                  value={noteProjectId}
                  onChange={(e) => setNoteProjectId(e.target.value)}
                  className="w-full text-xs font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Horas Ordinarias
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={noteNormalHours}
                    onChange={(e) => setNoteNormalHours(Number(e.target.value))}
                    className="w-full text-xs font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Horas Extra
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={noteExtraHours}
                    onChange={(e) => setNoteExtraHours(Number(e.target.value))}
                    className="w-full text-xs font-bold p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Concepto / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={noteComment}
                  onChange={(e) => setNoteComment(e.target.value)}
                  placeholder="Ej: Suministro de arena, albarán firmado por el encargado..."
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Confirmar y Registrar Albarán
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
