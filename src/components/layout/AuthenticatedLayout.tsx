import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  MapPin, 
  Users, 
  HardHat, 
  History, 
  Settings, 
  Link as LinkIcon, 
  FileCheck, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  Menu, 
  X,
  Bell,
  Building2,
  Sparkles,
  Plus,
  Briefcase,
  CreditCard,
  Crown,
  Globe,
  Keyboard,
  Bot,
  Rocket,
  Leaf
} from 'lucide-react';
import { obraStore } from '../../services/store';
import { AppState, User, Role } from '../../types';
import toast from 'react-hot-toast';
import { NotificationBell } from '../NotificationBell';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';
import { AgencyAgentsModal } from '../modals/AgencyAgentsModal';
import { DesignAgencyLabModal } from '../design/DesignAgencyLabModal';
import { CivilEngineeringLabModal } from '../engineering/CivilEngineeringLabModal';
import { ESGConstructionModal } from '../esg/ESGConstructionModal';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  state: AppState;
}

export type TabKey = 
  | 'dashboard' 
  | 'reports' 
  | 'delivery_notes' 
  | 'projects' 
  | 'map'
  | 'team' 
  | 'workers'
  | 'clients'
  | 'audit'
  | 'settings'
  | 'integrations'
  | 'docs'
  | 'profile'
  | 'billing'
  | 'web-admin'
  | 'mobile-release';

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  currentUser,
  state
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [agentsModalOpen, setAgentsModalOpen] = useState(false);
  const [designLabOpen, setDesignLabOpen] = useState(false);
  const [civilLabOpen, setCivilLabOpen] = useState(false);
  const [esgLabOpen, setEsgLabOpen] = useState(false);

  // Sync state changes from central store
  const [appState, setAppState] = useState<AppState>(state);
  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const activeCompany = appState.companies.find(c => c.id === currentUser.companyId);
  const basePath = location.pathname.startsWith('/mobile') ? '/mobile' : '/admin';

  // Global Keyboard Shortcuts (Accessibility Auditor & UI Designer)
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Open Shortcuts Help (? or Shift+/)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen(prev => !prev);
        return;
      }

      // Quick single-key actions
      if (key === 'n') {
        e.preventDefault();
        navigate(`${basePath}/reports/nuevo`);
        return;
      }

      if (key === 'f') {
        e.preventDefault();
        navigate(`${basePath}/fichar`);
        return;
      }

      if (key === 'c') {
        e.preventDefault();
        navigate(`${basePath}/chat`);
        return;
      }

      // Check 'g' two-key navigation sequences
      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        if (key === 'd') {
          e.preventDefault();
          navigate(`${basePath}/dashboard`);
        } else if (key === 'p') {
          e.preventDefault();
          navigate(`${basePath}/reports`);
        } else if (key === 'a') {
          e.preventDefault();
          navigate(`${basePath}/delivery_notes`);
        } else if (key === 'o') {
          e.preventDefault();
          navigate(`${basePath}/projects`);
        } else if (key === 'm') {
          e.preventDefault();
          navigate(`${basePath}/map`);
        } else if (key === 'e') {
          e.preventDefault();
          navigate(`${basePath}/team`);
        }
        lastKey = '';
        return;
      }

      lastKey = key;
      lastKeyTime = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [basePath, navigate]);

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (e) {
      toast.error('Error al cerrar sesión');
    }
  };

  // Determine current active tab based on path
  const pathParts = location.pathname.split('/');
  const subRoute = pathParts[2] || 'dashboard';
  const currentTab = subRoute as TabKey;

  const navGroups = [
    {
      name: 'Operaciones',
      items: [
        { key: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
        { key: 'reports', label: 'Partes Diarios', icon: FileSpreadsheet },
        { key: 'delivery_notes', label: 'Albaranes', icon: FileText },
        { key: 'map', label: 'Mapa y GPS', icon: MapPin },
      ]
    },
    {
      name: 'CRM & Gestión',
      items: [
        { key: 'clients', label: 'CRM Clientes', icon: Briefcase, minRole: Role.MANAGER },
        { key: 'projects', label: 'Obras', icon: Building2, minRole: Role.MANAGER },
        { key: 'team', label: 'Empresas', icon: Users, minRole: Role.MANAGER },
        { key: 'workers', label: 'Personal', icon: HardHat },
      ]
    },
    {
      name: 'Administración & SaaS',
      items: [
        { key: 'billing', label: 'Planes & Pagos', icon: CreditCard, minRole: Role.ADMIN },
        { key: 'web-admin', label: 'Admin Web', icon: Crown, minRole: Role.ADMIN },
        { key: 'mobile-release', label: 'Release Móvil', icon: Rocket, minRole: Role.ADMIN },
        { key: 'integrations', label: 'API & ERP', icon: LinkIcon, minRole: Role.ADMIN },
        { key: 'audit', label: 'Auditoría', icon: History, minRole: Role.ADMIN },
        { key: 'settings', label: 'Ajustes', icon: Settings, minRole: Role.ADMIN },
      ]
    },
    {
      name: 'Cuenta',
      items: [
        { key: 'docs', label: 'Ayuda', icon: FileCheck },
        { key: 'profile', label: 'Mi Perfil', icon: UserIcon },
      ]
    }
  ];

  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!item.minRole) return true;
      if (currentUser.role === Role.ADMIN || currentUser.isSuperAdmin || currentUser.role === 'SUPER_ADMIN') return true;
      if (currentUser.role === Role.MANAGER && item.minRole !== Role.ADMIN) return true;
      return false;
    })
  })).filter(group => group.items.length > 0);

  const isWorker = (currentUser.role as string) === 'SUBCONTRACTOR_USER';
  const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
  const announcement = appState.platformSettings?.announcementBanner;

  // Role-aware bottom navigation tabs for mobile
  const getMobileBottomItems = () => {
    if (isSuperAdmin) {
      return [
        { key: 'web-admin', label: 'Tenants', icon: Crown, path: `${basePath}/web-admin` },
        { key: 'clients', label: 'CRM', icon: Briefcase, path: `${basePath}/clients` },
        { key: 'team', label: 'Empresas', icon: Building2, path: `${basePath}/team` },
        { key: 'audit', label: 'Auditoría', icon: History, path: `${basePath}/audit` },
      ];
    }
    if (isWorker) {
      return [
        { key: 'dashboard', label: 'Mi Tajo', icon: LayoutDashboard, path: `${basePath}/dashboard` },
        { key: 'reports', label: 'Mis Partes', icon: FileSpreadsheet, path: `${basePath}/reports` },
        { key: 'delivery_notes', label: 'Albaranes', icon: FileText, path: `${basePath}/delivery_notes` },
        { key: 'docs', label: 'Docs PRL', icon: FileCheck, path: `${basePath}/docs` },
      ];
    }
    return [
      { key: 'dashboard', label: 'Inicio', icon: LayoutDashboard, path: `${basePath}/dashboard` },
      { key: 'reports', label: 'Partes', icon: FileSpreadsheet, path: `${basePath}/reports` },
      { key: 'delivery_notes', label: 'Albaranes', icon: FileText, path: `${basePath}/delivery_notes` },
      { key: 'projects', label: 'Obras', icon: Building2, path: `${basePath}/projects` },
    ];
  };

  const mobileBottomItems = getMobileBottomItems();

  return (
    <div className={`min-h-screen bg-brand-bg text-brand-text flex flex-col font-body antialiased min-w-0 max-w-[1440px] w-full mx-auto overflow-x-hidden ${appState.uiStyle !== 'standard' ? 'theme-neumorphic' : ''}`}>
      
      {/* Global Announcement Banner if enabled */}
      {announcement?.enabled && announcement.message && (
        <div className={`px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 border-b z-50 transition-all ${
          announcement.type === 'warning' 
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
            : announcement.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-brand-accent/15 border-brand-accent/30 text-orange-200'
        }`}>
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>{announcement.message}</span>
        </div>
      )}

      {/* Top Header - Strictly Responsive (360px-1440px) with Landscape mode optimization */}
      <header className="h-14 sm:h-16 landscape:h-12 border-b border-brand-border glass-panel sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link to={basePath} className="flex items-center gap-2 sm:gap-2.5 active:scale-95 transition-transform shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 landscape:w-8 landscape:h-8 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20 shrink-0">
              <HardHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-white leading-none">
                ObraService <span className="text-brand-accent font-mono text-[10px]">PRO</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-muted font-medium mt-0.5 uppercase tracking-wider truncate max-w-[120px] sm:max-w-[200px]">
                {activeCompany?.name || 'Constructora'}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* AI Agents Directory Trigger (Industrial Amber Unified) */}
          <button
            onClick={() => setAgentsModalOpen(true)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Directorio del Equipo de Agentes IA"
          >
            <Bot className="w-3.5 h-3.5 text-brand-accent" />
            <span className="hidden sm:inline">Equipo IA</span>
            <span className="text-[10px] font-mono bg-brand-accent/20 text-brand-accent px-1.5 py-0.2 rounded hidden xs:inline">14</span>
          </button>

          {/* Design & UX Experience Lab Trigger */}
          <button
            onClick={() => setDesignLabOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Design & UX Experience Lab"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Design Lab</span>
          </button>

          {/* Civil Engineering Eurocode Lab Trigger */}
          <button
            onClick={() => setCivilLabOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Módulo de Cálculo Estructural Eurocódigo"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Cálculo Civil</span>
          </button>

          {/* ESG & Sustainability Officer Trigger */}
          <button
            onClick={() => setEsgLabOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Módulo ESG y Residuos RCD"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESG & RCDs</span>
          </button>

          {/* Keynote Presentation Link */}
          <Link
            to="/presentation"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-brand-accent/40 text-brand-accent hover:text-orange-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Presentación Ejecutiva Keynote Pro"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="hidden sm:inline">Keynote Pro</span>
          </Link>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="hidden sm:flex items-center gap-1 p-2 text-brand-muted hover:text-white hover:bg-brand-surface-hover rounded-xl transition-colors border border-transparent hover:border-brand-border min-h-[38px] cursor-pointer"
            title="Atajos de Teclado (?)"
            aria-label="Ver atajos de teclado"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <NotificationBell currentUser={currentUser} />

          <button
            onClick={handleLogout}
            className="hidden sm:flex p-2 text-brand-muted hover:text-white hover:bg-brand-surface-hover rounded-xl transition-colors border border-transparent hover:border-brand-border min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-muted hover:text-white rounded-xl active:bg-brand-surface border border-brand-border/60 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brand-accent" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-brand-bg overflow-y-auto shrink-0">
          <nav className="p-4 space-y-6 flex-1">
            {filteredNavGroups.map(group => (
              <div key={group.name} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold text-brand-muted uppercase tracking-widest">{group.name}</h3>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.key;
                    return (
                      <Link
                        key={item.key}
                        to={`${basePath}/${item.key}`}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                          isActive 
                            ? 'bg-brand-surface text-brand-text shadow-sm' 
                            : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-brand-accent" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Desktop Sidebar Bottom Accessories (Industrial Amber Unified) */}
          <div className="p-4 border-t border-brand-border space-y-2 mt-auto">
            <button
              onClick={() => setAgentsModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-brand-accent/10 hover:bg-brand-accent/15 border border-brand-accent/25 text-amber-300 text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-brand-accent" />
                <span>Equipo de Agentes IA</span>
              </div>
              <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded font-mono">10</span>
            </button>

            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-brand-muted hover:text-white hover:bg-brand-surface border border-transparent hover:border-brand-border transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-brand-accent" />
                <span>Atajos de Teclado</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-brand-surface border border-white/10 font-mono text-[10px] text-zinc-300">
                ?
              </kbd>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport with Responsive Math (360px-1440px) */}
        <main className="flex-1 overflow-y-auto bg-brand-bg scroll-smooth pb-20 sm:pb-8 landscape:pb-14 w-full min-w-0">
          <div className="w-full max-w-[1440px] mx-auto p-3.5 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav (Mobile) with Safe-Area & Landscape Constraint (Strict Responsive Math) */}
      <nav 
        className="md:hidden glass-panel border-t border-brand-border fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 sm:px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-2xl landscape:h-11 landscape:pt-0 landscape:pb-0 transition-all"
        style={{ minHeight: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {mobileBottomItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[38px] min-w-[48px] active:scale-90 ${
                isActive ? 'text-brand-accent font-bold' : 'text-brand-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 landscape:w-3.5 landscape:h-3.5 landscape:mb-0" />
              <span className={`text-[9px] sm:text-[10px] landscape:text-[8px] leading-tight ${isActive ? 'text-brand-text font-black' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}

        {/* More/Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[38px] min-w-[48px] active:scale-90 cursor-pointer ${
            mobileMenuOpen ? 'text-brand-accent' : 'text-brand-muted hover:text-white'
          }`}
          aria-label="Abrir menú de navegación completo"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 landscape:w-3.5 landscape:h-3.5 landscape:mb-0" />
          <span className="text-[9px] sm:text-[10px] landscape:text-[8px] leading-tight font-medium">Más</span>
        </button>
      </nav>

      {/* Mobile Drawer (Accessible Sheet Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-md" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div 
            className="absolute top-0 right-0 bottom-0 w-[85%] max-w-xs bg-brand-bg border-l border-brand-border p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-accent flex items-center justify-center text-white">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">{activeCompany?.name || 'ObraService'}</div>
                  <div className="text-[10px] text-brand-muted">{currentUser.name}</div>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-white cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Agents and Shortcuts trigger */}
            <div className="pt-3 pb-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAgentsModalOpen(true);
                }}
                className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-brand-accent" />
                <span>Equipo IA</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShortcutsModalOpen(true);
                }}
                className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5 text-brand-accent" />
                <span>Atajos (?)</span>
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-5 my-4 flex-1">
              {filteredNavGroups.map(group => (
                <div key={group.name} className="space-y-1.5">
                  <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest px-2">{group.name}</h3>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.key;
                      return (
                        <Link
                          key={item.key}
                          to={`${basePath}/${item.key}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all min-h-[42px] ${
                            isActive 
                              ? 'bg-brand-surface text-brand-accent font-bold border border-brand-border' 
                              : 'text-brand-muted hover:text-brand-text active:bg-brand-surface-hover'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accent' : 'text-brand-muted'}`} />
                            <span>{item.label}</span>
                          </div>
                          {isActive && <ChevronRight className="w-4 h-4 text-brand-accent" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-brand-border space-y-2 shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 w-full rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-xs active:bg-rose-500/20 min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Accessibility & AI Agents */}
      <KeyboardShortcutsModal 
        isOpen={shortcutsModalOpen} 
        onClose={() => setShortcutsModalOpen(false)} 
      />

      <AgencyAgentsModal 
        isOpen={agentsModalOpen} 
        onClose={() => setAgentsModalOpen(false)} 
        onOpenCivilLab={() => setCivilLabOpen(true)}
        onOpenDesignLab={() => setDesignLabOpen(true)}
        onOpenESGLab={() => setEsgLabOpen(true)}
      />

      <DesignAgencyLabModal
        isOpen={designLabOpen}
        onClose={() => setDesignLabOpen(false)}
      />

      <CivilEngineeringLabModal
        isOpen={civilLabOpen}
        onClose={() => setCivilLabOpen(false)}
      />

      <ESGConstructionModal
        isOpen={esgLabOpen}
        onClose={() => setEsgLabOpen(false)}
      />
    </div>
  );
};
