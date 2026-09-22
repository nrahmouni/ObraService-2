import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare, 
  Plus, 
  X, 
  AlertTriangle, 
  Upload, 
  Compass, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon,
  HardHat,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, User, Project } from '../types';

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
import toast from 'react-hot-toast';

interface MainLayoutProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentUser: User;
  isDemoMode: boolean;
  onExitDemoToProduction?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isDemoMode,
  onExitDemoToProduction,
  children,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [state, setState] = useState<AppState>(obraStore.getState());
  
  // Modals inside FAB
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [uploadAlbaranModalOpen, setUploadAlbaranModalOpen] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [normalHours, setNormalHours] = useState(8);
  const [extraHours, setExtraHours] = useState(0);
  const [albaranComment, setAlbaranComment] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Sync state changes from central store
  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Viewport detection
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
    } catch (e) {
      toast.error('Error al cerrar sesión');
    }
  };

  const activeCompany = state.companies.find(c => c.id === currentUser.companyId);

  // Quick Action: Submit Incident
  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Por favor, selecciona una obra');
      return;
    }
    if (!incidentTitle.trim()) {
      toast.error('Por favor, introduce el título de la incidencia');
      return;
    }

    const project = state.projects.find(p => p.id === selectedProjectId);
    const projectName = project ? project.name : 'Obra General';

    // Log a real audit event and trigger success
    (obraStore as any).logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: `inc_${Date.now()}`,
      recordCode: 'INCIDENCIA',
      operation: 'REPORT_CORRECTED',
      details: `Incidencia registrada en ${projectName}: ${incidentTitle}. Detalle: ${incidentDesc}`,
    });

    toast.success(`Incidencia registrada correctamente en ${projectName}`, { id: 'inc-success' });
    
    // Reset Form
    setIncidentTitle('');
    setIncidentDesc('');
    setIncidentModalOpen(false);
    setFabOpen(false);
  };

  // Quick Action: Direct Upload Delivery Note (Albarán)
  const handleUploadAlbaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Por favor, selecciona una obra');
      return;
    }

    const project = state.projects.find(p => p.id === selectedProjectId);
    const projectName = project ? project.name : 'Obra';

    const res = obraStore.uploadDeliveryNote({
      projectId: selectedProjectId,
      projectNameSnapshot: projectName,
      normalHours: Number(normalHours),
      extraHours: Number(extraHours),
      correctionNotice: albaranComment || 'Subida directa desde dispositivo móvil.',
    });

    if (res.success) {
      toast.success(`Albarán ${res.note?.code} subido y guardado correctamente`, { id: 'albaran-success' });
      onSelectTab('delivery_notes');
    } else {
      toast.error(res.error || 'Error al subir el albarán');
    }

    // Reset Form
    setNormalHours(8);
    setExtraHours(0);
    setAlbaranComment('');
    setUploadedFileName('');
    setUploadAlbaranModalOpen(false);
    setFabOpen(false);
  };

  // Pre-populate the project field if projects exist
  useEffect(() => {
    if (state.projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(state.projects[0].id);
    }
  }, [state.projects, selectedProjectId]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans selection:bg-[#FF6600] selection:text-white antialiased">
      {/* Dynamic Header */}
      <header className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white sticky top-0 z-40">
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6600] to-orange-500 flex items-center justify-center shadow-sm shadow-[#FF6600]/20 group-hover:scale-105 transition-transform">
            <HardHat className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-950 uppercase tracking-tight group-hover:text-[#FF6600] transition-colors">ObraService</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{activeCompany?.name || 'Cargando...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => obraStore.toggleTheme()}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-lg border border-slate-100"
          >
            {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 rounded-lg border border-slate-100"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Layout with Responsive Sidebar / Bottom Nav toggle */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 pb-20 md:pb-0">
        
        {/* Desktop Sidebar (Rendered only on Desktop screen width) */}
        {!isMobile && (
          <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-slate-200">
            <div className="px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#FF6600] animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SaaS Multi-Tenant</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate uppercase">{activeCompany?.name}</div>
              <div className="text-[9px] font-bold text-[#FF6600] uppercase tracking-wider mt-0.5">
                {currentUser.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : currentUser.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
              </div>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-1">
              {[
                { key: 'dashboard', label: 'Panel', icon: LayoutDashboard },
                { key: 'reports', label: 'Partes de Trabajo', icon: FileSpreadsheet, minRole: 'SITE_MANAGER' },
                { key: 'delivery_notes', label: 'Albaranes', icon: FileText },
                { key: 'chat', label: 'Chat', icon: MessageSquare },
                { key: 'projects', label: 'Obras', icon: Building2, minRole: 'SITE_MANAGER' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                
                // Client-side role pre-filter (Protected routes will also double-check)
                if (item.minRole === 'SITE_MANAGER' && currentUser.role === 'SUBCONTRACTOR_USER') return null;

                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key as TabKey)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#FF6600]/5 text-[#FF6600] border-l-4 border-[#FF6600]' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6600]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Dynamic Children Content Wrapper */}
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto bg-[#F9FAFB]">
          {children}
        </main>
      </div>

      {/* Mobile-Optimized Bottom Navigation bar with centered FAB */}
      {isMobile && (
        <>
          {/* Central Raise FAB Menu Backdrop overlay */}
          {fabOpen && (
            <div 
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-all duration-150 animate-in fade-in" 
              onClick={() => setFabOpen(false)}
            />
          )}

          {/* Persistent FAB Action Panel (Sleek slider popup) */}
          <div className={`fixed bottom-20 left-4 right-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-xl z-50 transition-all duration-300 transform ${
            fabOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones Rápidas</span>
              <button onClick={() => setFabOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => {
                  setFabOpen(false);
                  onSelectTab('reports');
                  // Trigger standard create report workflow in App.tsx by opening modal
                  const btn = document.getElementById('btn-new-report-shell') || document.getElementById('btn-new-report-empty');
                  if (btn) {
                    btn.click();
                  } else {
                    toast.error('Por favor, navega a la sección de "Partes" para crear un informe.');
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left border border-slate-150 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6600] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-[#FF6600] transition-colors">Crear Parte Diario</div>
                  <div className="text-[9px] text-slate-500 font-medium">Registrar operarios, horas y materiales</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  setIncidentModalOpen(true);
                  setFabOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left border border-slate-150 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">Registrar Incidencia</div>
                  <div className="text-[9px] text-slate-500 font-medium">Notificar desvíos, clima o riesgos de seguridad</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  setUploadAlbaranModalOpen(true);
                  setFabOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left border border-slate-150 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">Subir Albarán</div>
                  <div className="text-[9px] text-slate-500 font-medium">Captura fotos de remisiones directamente</div>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Nav Bar - Optimized for Single Handed Touch Zones */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 pb-safe z-40 shadow-lg">
            
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all ${
                currentTab === 'dashboard' ? 'text-[#FF6600] font-bold' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tight">Panel</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex-1 flex flex-col items-center justify-center h-full mr-5 transition-all ${
                currentTab === 'reports' ? 'text-[#FF6600] font-bold' : 'text-slate-400'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tight">Partes</span>
            </button>

            {/* Centralized raised FAB Anchor Button */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
              <button
                onClick={() => setFabOpen(!fabOpen)}
                className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6600] to-orange-500 text-white flex items-center justify-center shadow-md shadow-[#FF6600]/30 hover:scale-105 active:scale-95 transition-all focus:outline-none border-4 border-white cursor-pointer ${
                  fabOpen ? 'rotate-45' : ''
                }`}
                aria-label="Menú Rápido"
                id="central-fab-button"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => onSelectTab('delivery_notes')}
              className={`flex-1 flex flex-col items-center justify-center h-full ml-5 transition-all ${
                currentTab === 'delivery_notes' ? 'text-[#FF6600] font-bold' : 'text-slate-400'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tight">Albaranes</span>
            </button>

            <button
              onClick={() => onSelectTab('chat')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all ${
                currentTab === 'chat' ? 'text-[#FF6600] font-bold' : 'text-slate-400'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tight">Chat</span>
            </button>

          </nav>
        </>
      )}

      {/* Modal 1: Registrar Incidencia */}
      {incidentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-xl" id="incident-form-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">Registrar Incidencia</h3>
              </div>
              <button onClick={() => setIncidentModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Obra / Proyecto</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF6600] cursor-pointer"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Título de Incidencia</label>
                <input
                  type="text"
                  placeholder="Ej: Retraso de hormigonera, avería grúa, lluvia intensa"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Descripción / Comentarios</label>
                <textarea
                  rows={3}
                  placeholder="Explica detalladamente lo sucedido para el análisis posterior de la IA..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm shadow-amber-500/20"
                >
                  Guardar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Subir Albarán (Carga Directa) */}
      {uploadAlbaranModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-xl" id="albaran-upload-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">Subir Albarán en Campo</h3>
              </div>
              <button onClick={() => setUploadAlbaranModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUploadAlbaran} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Obra / Proyecto Destino</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF6600] cursor-pointer"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Simulated camera / file upload drag-and-drop zone */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Documento Albarán (Foto o PDF)</label>
                <div 
                  onClick={() => setUploadedFileName('img_albaran_campo_v2.png')}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[#FF6600]/40 transition-colors bg-slate-50 flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  {uploadedFileName ? (
                    <span className="text-xs font-black text-[#FF6600] uppercase tracking-tight">{uploadedFileName}</span>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-700">Toca para capturar con la cámara o subir archivo</span>
                      <span className="text-[9px] text-slate-400 mt-1">Formato JPG, PNG o PDF de remisión de materiales</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Horas Normales</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1 px-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="number"
                      value={normalHours}
                      onChange={(e) => setNormalHours(Number(e.target.value))}
                      className="w-full text-xs bg-transparent py-2 focus:outline-none"
                      min={0}
                      max={24}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Horas Extras</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1 px-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse text-orange-400" />
                    <input
                      type="number"
                      value={extraHours}
                      onChange={(e) => setExtraHours(Number(e.target.value))}
                      className="w-full text-xs bg-transparent py-2 focus:outline-none"
                      min={0}
                      max={24}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Notas / Materiales Recibidos</label>
                <input
                  type="text"
                  placeholder="Ej: Cemento gris 40 sacos, arena fina 2 m3..."
                  value={albaranComment}
                  onChange={(e) => setAlbaranComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadAlbaranModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF6600] text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm shadow-[#FF6600]/20"
                >
                  Subir Albarán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
