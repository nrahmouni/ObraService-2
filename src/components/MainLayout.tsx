import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  X, 
  AlertTriangle, 
  Upload, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon,
  HardHat,
  Building2,
  MapPin,
  Clock,
  Users,
  History,
  Settings,
  Link as LinkIcon,
  Euro,
  ChevronRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Search,
  CheckCircle2,
  Smartphone,
  Check,
  FileCheck,
  Dices
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { obraStore } from '../services/store';
import { AppState, User } from '../types';
import toast from 'react-hot-toast';
import { NotificationBell } from './NotificationBell';

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
  | 'profile'
  | 'billing';

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
  const navigate = useNavigate();
  const location = useLocation();
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

  // Persistent header project selector state
  const [selectedHeaderProjectId, setSelectedHeaderProjectId] = useState<string>(() => {
    return localStorage.getItem('selected_project_id') || '';
  });

  // Sync state changes from central store
  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (e) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleHeaderProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedHeaderProjectId(val);
    localStorage.setItem('selected_project_id', val);
    toast.success(val ? `Filtrando por obra seleccionada` : `Mostrando todas las obras`);
    window.dispatchEvent(new Event('storage'));
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

    (obraStore as any).logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: `inc_${Date.now()}`,
      recordCode: 'INCIDENCIA',
      operation: 'REPORT_CORRECTED',
      details: `Incidencia registrada en ${projectName}: ${incidentTitle}. Detalle: ${incidentDesc}`,
    });

    toast.success(`Incidencia registrada correctamente en ${projectName}`);
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
      correctionNotice: albaranComment || 'Subida directa desde panel corporativo.',
    });

    if (res.success) {
      toast.success(`Albarán ${res.note?.code} emitido con éxito`);
      onSelectTab('delivery_notes');
    } else {
      toast.error(res.error || 'Error al emitir el albarán');
    }

    setNormalHours(8);
    setExtraHours(0);
    setAlbaranComment('');
    setUploadAlbaranModalOpen(false);
    setFabOpen(false);
  };

  // Quick Action: Populate Random Test Data
  const handlePopulateRandomData = () => {
    const result = obraStore.populateRandomTestData();
    toast.success(
      `🎲 Generados ${result.projectsCount} obras, ${result.subcontractorsCount} subcontratas, ${result.reportsCount} partes y ${result.deliveryNotesCount} albaranes de prueba`,
      { duration: 4000 }
    );
  };

  useEffect(() => {
    if (state.projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(state.projects[0].id);
    }
  }, [state.projects, selectedProjectId]);

  // Dynamic Navigation Groups with Badges
  const pendingNotesCount = (state.deliveryNotes || []).filter(n => n.status === 'Pending').length;
  const activeProjectsCount = (state.projects || []).filter(p => p.status === 'Active').length;

  interface NavItem {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    minRole?: string;
    badge?: string;
    badgeColor?: string;
  }

  interface NavGroup {
    name: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      name: 'Operaciones de Campo',
      items: [
        { key: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
        { key: 'reports', label: 'Partes Diarios', icon: FileSpreadsheet, minRole: 'SITE_MANAGER' },
        { key: 'delivery_notes', label: 'Albaranes Inmutables', icon: FileText, badge: pendingNotesCount > 0 ? String(pendingNotesCount) : undefined, badgeColor: 'bg-[#FF6600]' },
        { key: 'map', label: 'Geocerca GPS / Mapa', icon: MapPin },
      ]
    },
    {
      name: 'Gestión & Recursos',
      items: [
        { key: 'projects', label: 'Proyectos de Obra', icon: Building2, minRole: 'SITE_MANAGER', badge: activeProjectsCount > 0 ? String(activeProjectsCount) : undefined },
        { key: 'team', label: 'Subcontratas & Roles', icon: Users, minRole: 'SITE_MANAGER' },
        { key: 'workers', label: 'Cuadrillas & Operarios', icon: HardHat },
      ]
    },
    {
      name: 'Control & Cumplimiento',
      items: [
        { key: 'audit', label: 'Auditoría Ley 32/2006', icon: History, minRole: 'MAIN_CONTRACTOR_ADMIN' },
        { key: 'settings', label: 'Configuración Empresa', icon: Settings, minRole: 'MAIN_CONTRACTOR_ADMIN' },
        { key: 'integrations', label: 'Integraciones & API', icon: LinkIcon, minRole: 'MAIN_CONTRACTOR_ADMIN' },
      ]
    },
    {
      name: 'Soporte & Cuenta',
      items: [
        { key: 'docs', label: 'Manual & PRL', icon: FileCheck },
        { key: 'profile', label: 'Mi Perfil de Acceso', icon: UserIcon },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#121214] text-[#F4F4F5] flex flex-col font-sans selection:bg-[#EA580C] selection:text-white antialiased pb-16 md:pb-0 w-full overflow-x-hidden">
      
      {/* Top Command Bar */}
      <header className="h-14 sm:h-16 border-b border-[#27272A] flex items-center justify-between px-3 sm:px-6 bg-[#18181B] sticky top-0 z-40 w-full">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EA580C] flex items-center justify-center shadow-sm shrink-0">
            <HardHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
              ObraService
            </span>
            <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[120px] sm:max-w-[240px]">
              {activeCompany?.name || 'Constructora'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Test Data Button */}
          <button
            onClick={handlePopulateRandomData}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-zinc-200 border border-[#3F3F46] text-[11px] font-bold transition-colors cursor-pointer"
            title="Generar datos aleatorios de prueba"
          >
            <Dices className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
            <span className="hidden sm:inline">Datos Test</span>
            <span className="sm:hidden">Test</span>
          </button>

          {/* Notification Bell */}
          <NotificationBell currentUser={currentUser} />

          {/* User Profile Chip (Desktop) */}
          <div 
            onClick={() => onSelectTab('profile')}
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#27272A] border border-[#3F3F46] hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">{currentUser.name}</div>
              <div className="text-[9px] text-zinc-400 uppercase">
                {currentUser.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : currentUser.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors rounded-lg border border-[#27272A] cursor-pointer shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Active Role & Quick Role Switcher Banner (ONLY shown in DEMO mode) */}
      {isDemoMode && (
        <div className="bg-[#1C1C21] border-b border-[#27272A] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Modo Activo:</span>
            <span className="font-bold text-[#EA580C] bg-[#EA580C]/10 border border-[#EA580C]/30 px-2.5 py-0.5 rounded-full text-[11px]">
              {currentUser.role === 'MAIN_CONTRACTOR_ADMIN' ? '🏢 Constructora Principal' : currentUser.role === 'SITE_MANAGER' ? '👷 Jefe de Obra' : '🔨 Subcontrata / Operario'}
            </span>
            <span className="text-zinc-400 font-medium hidden sm:inline text-[11px]">• {currentUser.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">Cambiar Rol:</span>
            <button 
              onClick={() => obraStore.switchRole('MAIN_CONTRACTOR_ADMIN')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentUser.role === 'MAIN_CONTRACTOR_ADMIN' ? 'bg-[#EA580C] text-white shadow-sm' : 'bg-[#27272A] text-zinc-400 hover:text-white'}`}
            >
              Constructora
            </button>
            <button 
              onClick={() => obraStore.switchRole('SITE_MANAGER')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentUser.role === 'SITE_MANAGER' ? 'bg-[#EA580C] text-white shadow-sm' : 'bg-[#27272A] text-zinc-400 hover:text-white'}`}
            >
              Jefe Obra
            </button>
            <button 
              onClick={() => obraStore.switchRole('SUBCONTRACTOR_USER')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentUser.role === 'SUBCONTRACTOR_USER' ? 'bg-[#EA580C] text-white shadow-sm' : 'bg-[#27272A] text-zinc-400 hover:text-white'}`}
            >
              Subcontrata
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full overflow-x-hidden">
        
        {/* Desktop Left Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#16161A] border-r border-[#27272A]">
          {/* Nav List */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter(item => {
                if (item.minRole === 'SITE_MANAGER' && currentUser.role === 'SUBCONTRACTOR_USER') return false;
                if (item.minRole === 'MAIN_CONTRACTOR_ADMIN' && currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') return false;
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.name} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">
                    {group.name}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => onSelectTab(item.key as TabKey)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px]
                            ${isActive 
                              ? 'bg-[#27272A] text-white font-bold' 
                              : 'text-zinc-400 hover:text-white hover:bg-[#202024]'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-zinc-400'}`} />
                            <span>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {item.badge}
                              </span>
                            )}
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Viewport Container */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-6 overflow-y-auto w-full overflow-x-hidden pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-5 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#18181B] border-t border-[#27272A] flex items-center justify-around z-40 px-1 shadow-lg">
        {[
          { key: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { key: 'reports', label: 'Partes', icon: FileSpreadsheet },
          { key: 'delivery_notes', label: 'Albaranes', icon: FileText },
          { key: 'projects', label: 'Obras', icon: Building2 },
          { key: 'team', label: 'Personal', icon: HardHat },
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key as TabKey)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer flex-1 max-w-[72px] ${
                isActive ? 'text-[#EA580C]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#EA580C]' : 'text-zinc-400'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : 'font-normal text-zinc-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Upload Albarán Modal */}
      {uploadAlbaranModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B101D] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF6600]" />
                <h3 className="text-sm font-black uppercase text-white">Emitir Albarán Directo</h3>
              </div>
              <button onClick={() => setUploadAlbaranModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadAlbaran} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Obra Destino <span className="text-[#FF6600]">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-[#27272A] bg-[#18181B] text-xs font-bold text-white [&>option]:bg-[#18181B] [&>option]:text-white"
                  required
                >
                  <option value="">Selecciona una obra...</option>
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">Horas Ordinarias</label>
                  <input
                    type="number"
                    value={normalHours}
                    onChange={(e) => setNormalHours(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">Horas Extra</label>
                  <input
                    type="number"
                    value={extraHours}
                    onChange={(e) => setExtraHours(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">Observaciones</label>
                <textarea
                  value={albaranComment}
                  onChange={(e) => setAlbaranComment(e.target.value)}
                  placeholder="Detalle de trabajos y partidas ejecutadas..."
                  className="w-full h-20 p-3 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                Confirmar y Registrar Albarán
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B101D] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black uppercase text-white">Registrar Incidencia de Obra</h3>
              </div>
              <button onClick={() => setIncidentModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Obra Afectada <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-white/15 bg-[#070B14] text-xs text-white"
                  required
                >
                  <option value="">Selecciona una obra...</option>
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Título de Incidencia <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Ej. Parada por lluvia torrencial o falta de material"
                  className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">Descripción Detallada</label>
                <textarea
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Detalla las cuadrillas afectadas y medidas tomadas..."
                  className="w-full h-20 p-3 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                Guardar Incidencia en Libro de Órdenes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
