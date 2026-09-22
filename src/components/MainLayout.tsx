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
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { AppState, User, Project } from '../types';
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
    window.dispatchEvent(new Event('storage')); // Notify all active views of storage changes
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

    // Log audit event
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
      toast.success(`Albarán ${res.note?.code} subido correctamente`, { id: 'albaran-success' });
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

  // Grouped Sidebar Items
  const navGroups = [
    {
      name: 'Operación',
      items: [
        { key: 'dashboard', label: 'Panel', icon: LayoutDashboard },
        { key: 'reports', label: 'Partes Diarios', icon: FileSpreadsheet, minRole: 'SITE_MANAGER' },
        { key: 'delivery_notes', label: 'Albaranes', icon: FileText },
        { key: 'map', label: 'Fichajes / Mapa', icon: MapPin },
      ]
    },
    {
      name: 'Gestión',
      items: [
        { key: 'projects', label: 'Proyectos', icon: Building2, minRole: 'SITE_MANAGER' },
        { key: 'team', label: 'Equipo / Subcontratas', icon: Users, minRole: 'SITE_MANAGER' },
        { key: 'workers', label: 'Trabajadores', icon: HardHat },
      ]
    },
    {
      name: 'Administración',
      items: [
        { key: 'audit', label: 'Auditoría', icon: History, minRole: 'MAIN_CONTRACTOR_ADMIN' },
        { key: 'settings', label: 'Ajustes', icon: Settings, minRole: 'MAIN_CONTRACTOR_ADMIN' },
        { key: 'integrations', label: 'Integraciones', icon: LinkIcon, minRole: 'MAIN_CONTRACTOR_ADMIN' },
        { key: 'billing', label: 'Facturación', icon: Euro, minRole: 'MAIN_CONTRACTOR_ADMIN' },
      ]
    },
    {
      name: 'Soporte',
      items: [
        { key: 'docs', label: 'Documentación', icon: FileSpreadsheet },
        { key: 'profile', label: 'Mi Perfil', icon: UserIcon },
      ]
    }
  ];

  // Dynamic Adaptive FAB Actions based on Active Tab and Role
  const getFABActions = () => {
    const isMainAdminOrManager = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

    if (currentUser.role === 'SUBCONTRACTOR_USER') {
      return [
        {
          label: 'Subir Albarán',
          desc: 'Registrar entrega de obra',
          icon: Upload,
          color: 'bg-emerald-500/10 text-emerald-400',
          onClick: () => setUploadAlbaranModalOpen(true)
        },
        {
          label: 'Registrar Incidencia',
          desc: 'Informar sobre un desvío',
          icon: AlertTriangle,
          color: 'bg-amber-500/10 text-amber-500',
          onClick: () => setIncidentModalOpen(true)
        }
      ];
    }

    if (isMainAdminOrManager) {
      if (currentTab === 'projects') {
        return [
          {
            label: 'Crear Nueva Obra',
            desc: 'Registrar nueva ficha de obra',
            icon: Plus,
            color: 'bg-brand-accent/10 text-brand-accent',
            onClick: () => {
              setFabOpen(false);
              const btn = document.getElementById('btn-new-project-shell') || document.getElementById('btn-new-project-main');
              if (btn) btn.click();
              else toast.error('Usa el botón "+ Nueva Obra" de la vista para iniciar.');
            }
          }
        ];
      }
      if (currentTab === 'reports') {
        return [
          {
            label: 'Crear Parte Diario',
            desc: 'Formulario rápido de jornada',
            icon: FileSpreadsheet,
            color: 'bg-brand-accent/10 text-brand-accent',
            onClick: () => {
              setFabOpen(false);
              navigate('/admin/reports/nuevo');
            }
          }
        ];
      }
      if (currentTab === 'team' || currentTab === 'workers') {
        return [
          {
            label: 'Invitar Colaborador',
            desc: 'Generar invitación de acceso',
            icon: Users,
            color: 'bg-brand-accent/10 text-brand-accent',
            onClick: () => {
              setFabOpen(false);
              const btn = document.getElementById('btn-invite-team-trigger') || document.getElementById('btn-add-worker-trigger');
              if (btn) btn.click();
              else toast.error('Abre el modal de invitación desde el panel de Equipo.');
            }
          }
        ];
      }
    }

    // Default Fallback
    return [
      {
        label: 'Crear Parte Diario',
        desc: 'Registrar jornada de tajo',
        icon: FileSpreadsheet,
        color: 'bg-brand-accent/10 text-brand-accent',
        onClick: () => {
          setFabOpen(false);
          if (currentUser.role === 'SUBCONTRACTOR_USER') navigate('/mobile/nuevo-parte');
          else navigate('/admin/reports/nuevo');
        }
      },
      {
        label: 'Subir Albarán',
        desc: 'Registrar remisión de subcontrata',
        icon: Upload,
        color: 'bg-emerald-500/10 text-emerald-400',
        onClick: () => setUploadAlbaranModalOpen(true)
      },
      {
        label: 'Registrar Incidencia',
        desc: 'Informar desvío o clima',
        icon: AlertTriangle,
        color: 'bg-amber-500/10 text-amber-500',
        onClick: () => setIncidentModalOpen(true)
      }
    ];
  };

  const fabActions = getFABActions();

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col font-body selection:bg-brand-accent selection:text-white antialiased pb-20 md:pb-0">
      
      {/* Dynamic Header */}
      <header className="h-14 border-b border-slate-800/80 flex items-center justify-between px-4 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-40">
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-accent flex items-center justify-center shadow-md shadow-brand-accent/20 group-hover:scale-105 transition-transform">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-100 uppercase tracking-tight group-hover:text-brand-accent transition-colors font-display">ObraService</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{activeCompany?.name || 'Cargando...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Persistent Project Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <select
              value={selectedHeaderProjectId}
              onChange={handleHeaderProjectChange}
              className="bg-transparent text-[11px] font-black uppercase tracking-wider text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="" className="bg-[#0f172a] text-slate-300">Todas las Obras</option>
              {state.projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0f172a] text-slate-300">{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <NotificationBell currentUser={currentUser} />

          <button
            onClick={() => obraStore.toggleTheme()}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
          >
            {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Desktop Sidebar (Hides automatically on mobile screens) */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#0F172A] border-r border-slate-800/80">
          <div className="px-5 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SaaS Multi-Tenant</span>
            </div>
            <div className="text-xs font-black text-slate-100 truncate uppercase">{activeCompany?.name}</div>
            <div className="text-[9px] font-black text-brand-accent uppercase tracking-widest mt-0.5">
              {currentUser.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : currentUser.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {navGroups.map((group) => {
              // Pre-filter items to check if user has access to at least one
              const visibleItems = group.items.filter(item => {
                if (item.minRole === 'SITE_MANAGER' && currentUser.role === 'SUBCONTRACTOR_USER') return false;
                if (item.minRole === 'MAIN_CONTRACTOR_ADMIN' && currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') return false;
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.name} className="space-y-1">
                  <span className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px]
                            ${isActive 
                              ? 'bg-brand-accent/10 text-brand-accent border-l-2 border-brand-accent' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-accent' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Children Content Wrapper */}
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile-Optimized Bottom Navigation bar with centered FAB */}
      <div className="md:hidden">
        {/* Central Raise FAB Menu Backdrop overlay */}
        {fabOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-all duration-150 animate-in fade-in" 
            onClick={() => setFabOpen(false)}
          />
        )}

        {/* Persistent FAB Action Panel (Sleek slider popup) */}
        <div className={`fixed bottom-20 left-4 right-4 bg-[#0F172A] border border-slate-800 rounded-3xl p-4 shadow-2xl z-50 transition-all duration-300 transform ${
          fabOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones Rápidas</span>
            <button onClick={() => setFabOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {fabActions.map((act, index) => {
              const ActIcon = act.icon;
              return (
                <button 
                  key={index}
                  onClick={() => {
                    act.onClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-left border border-slate-800/80 transition-all group cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                    <ActIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-200 group-hover:text-brand-accent transition-colors">{act.label}</div>
                    <div className="text-[9px] text-slate-400 font-medium">{act.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav Bar - Optimized for Single Handed Touch Zones */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-800/80 h-16 flex items-center justify-around px-2 pb-safe z-40 shadow-xl">
          
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
              currentTab === 'dashboard' ? 'text-brand-accent' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-tight">Panel</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex-1 flex flex-col items-center justify-center h-full mr-5 transition-all cursor-pointer ${
              currentTab === 'reports' ? 'text-brand-accent' : 'text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-tight">Partes</span>
          </button>

          {/* Centralized raised FAB Anchor Button */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={`w-12 h-12 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg shadow-brand-accent/30 hover:scale-105 active:scale-95 transition-all focus:outline-none border-4 border-slate-900 cursor-pointer ${
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
            className={`flex-1 flex flex-col items-center justify-center h-full ml-5 transition-all cursor-pointer ${
              currentTab === 'delivery_notes' ? 'text-brand-accent' : 'text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-tight">Albaranes</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
              currentTab === 'chat' ? 'text-brand-accent' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-tight">Chat</span>
          </button>

        </nav>
      </div>

      {/* Modal: Registrar Incidencia */}
      {incidentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0F172A] rounded-2xl w-full max-w-md p-6 border border-slate-800 shadow-2xl" id="incident-form-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight font-display">Registrar Incidencia</h3>
              </div>
              <button onClick={() => setIncidentModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Obra / Proyecto</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 cursor-pointer text-slate-100"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título de Incidencia</label>
                <input
                  type="text"
                  placeholder="Ej: Retraso de hormigonera, avería grúa, lluvia intensa"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción / Comentarios</label>
                <textarea
                  rows={3}
                  placeholder="Explica detalladamente lo sucedido para el análisis posterior de la IA..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-slate-100 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Guardar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Subir Albarán (Carga Directa) */}
      {uploadAlbaranModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0F172A] rounded-2xl w-full max-w-md p-6 border border-slate-800 shadow-2xl" id="albaran-upload-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight font-display">Subir Albarán en Campo</h3>
              </div>
              <button onClick={() => setUploadAlbaranModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUploadAlbaran} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Obra / Proyecto Destino</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 cursor-pointer text-slate-100"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Documento Albarán (Foto o PDF)</label>
                <div 
                  onClick={() => setUploadedFileName('img_albaran_campo_v2.png')}
                  className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-brand-accent/40 transition-colors bg-slate-900 flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  {uploadedFileName ? (
                    <span className="text-xs font-black text-brand-accent uppercase tracking-tight">{uploadedFileName}</span>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-300">Toca para capturar con la cámara o subir archivo</span>
                      <span className="text-[9px] text-slate-500 mt-1">Formato JPG, PNG o PDF de remisión de materiales</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Horas Normales</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 px-3">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      value={normalHours}
                      onChange={(e) => setNormalHours(Number(e.target.value))}
                      className="w-full text-xs bg-transparent py-2 focus:outline-none text-slate-100"
                      min={0}
                      max={24}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Horas Extras</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 px-3">
                    <Clock className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                    <input
                      type="number"
                      value={extraHours}
                      onChange={(e) => setExtraHours(Number(e.target.value))}
                      className="w-full text-xs bg-transparent py-2 focus:outline-none text-slate-100"
                      min={0}
                      max={24}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notas / Materiales Recibidos</label>
                <input
                  type="text"
                  placeholder="Ej: Cemento gris 40 sacos, arena fina 2 m3..."
                  value={albaranComment}
                  onChange={(e) => setAlbaranComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadAlbaranModalOpen(false)}
                  className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
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
