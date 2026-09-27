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
  Dices,
  Plus,
  Briefcase,
  CreditCard,
  Crown,
  Globe
} from 'lucide-react';
import { obraStore } from '../../services/store';
import { AppState, User, Role } from '../../types';
import toast from 'react-hot-toast';
import { NotificationBell } from '../NotificationBell';
import { DemoFloatingSandbox } from '../demo/DemoFloatingSandbox';

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
  | 'web-admin';

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  currentUser,
  state
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync state changes from central store
  const [appState, setAppState] = useState<AppState>(state);
  useEffect(() => {
    const unsubscribe = obraStore.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const activeCompany = appState.companies.find(c => c.id === currentUser.companyId);

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    } catch (e) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handlePopulateRandomData = () => {
    const result = obraStore.populateRandomTestData();
    toast.success(
      `🎲 Datos de prueba generados: ${result.projectsCount} obras, ${result.reportsCount} partes.`,
      { duration: 4000 }
    );
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

  const isWorker = currentUser.role === Role.WORKER;
  const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
  const basePath = isWorker ? '/mobile' : '/admin';
  const announcement = appState.platformSettings?.announcementBanner;

  // Role-aware bottom navigation tabs for mobile
  const getMobileBottomItems = () => {
    if (isSuperAdmin) {
      return [
        { key: 'web-admin', label: 'Tenants', icon: Crown, path: '/admin/web-admin' },
        { key: 'clients', label: 'CRM', icon: Briefcase, path: '/admin/clients' },
        { key: 'team', label: 'Empresas', icon: Building2, path: '/admin/team' },
        { key: 'audit', label: 'Auditoría', icon: History, path: '/admin/audit' },
      ];
    }
    if (isWorker || currentUser.role === 'SUBCONTRACTOR_USER') {
      return [
        { key: 'dashboard', label: 'Mi Tajo', icon: LayoutDashboard, path: `${basePath}/dashboard` },
        { key: 'reports', label: 'Mis Partes', icon: FileSpreadsheet, path: `${basePath}/reports` },
        { key: 'delivery_notes', label: 'Albaranes', icon: FileText, path: `${basePath}/delivery_notes` },
        { key: 'docs', label: 'Docs PRL', icon: FileCheck, path: `${basePath}/docs` },
      ];
    }
    // Main Contractor Admin / Site Manager
    return [
      { key: 'dashboard', label: 'Inicio', icon: LayoutDashboard, path: `${basePath}/dashboard` },
      { key: 'reports', label: 'Partes', icon: FileSpreadsheet, path: `${basePath}/reports` },
      { key: 'delivery_notes', label: 'Albaranes', icon: FileText, path: `${basePath}/delivery_notes` },
      { key: 'projects', label: 'Obras', icon: Building2, path: `${basePath}/projects` },
    ];
  };

  const mobileBottomItems = getMobileBottomItems();

  return (
    <div className={`min-h-screen bg-brand-bg text-brand-text flex flex-col font-body antialiased pb-14 sm:pb-0 ${appState.uiStyle !== 'standard' ? 'theme-neumorphic' : ''}`}>
      
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

      {/* Top Header */}
      <header className="h-16 border-b border-brand-border glass-panel sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={basePath} className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20 shrink-0">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tight text-white leading-none">ObraService</span>
              <span className="text-[10px] text-brand-muted font-medium mt-0.5 uppercase tracking-wider truncate max-w-[120px] sm:max-w-[200px]">
                {activeCompany?.name || 'Constructora'}
              </span>
            </div>
          </Link>

          {/* Role Badge (Desktop) */}
          {appState.isDemoMode && (
             <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-brand-border">
               <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Demo:</span>
               <select 
                 value={currentUser.role}
                 onChange={(e) => obraStore.switchRole(e.target.value as Role)}
                 className="bg-brand-surface border border-brand-border rounded px-2 py-0.5 text-[10px] font-bold text-brand-accent outline-none cursor-pointer"
               >
                 <option value={Role.ADMIN}>Administrador</option>
                 <option value={Role.MANAGER}>Jefe de Obra</option>
                 <option value={Role.WORKER}>Operario</option>
               </select>
             </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <NotificationBell currentUser={currentUser} />

          <button
            onClick={handleLogout}
            className="hidden sm:flex p-2 text-brand-muted hover:text-white hover:bg-brand-surface-hover rounded-xl transition-colors border border-transparent hover:border-brand-border min-h-[40px] min-w-[40px] items-center justify-center cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-muted hover:text-white rounded-xl active:bg-brand-surface border border-brand-border/60 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-brand-accent" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-brand-bg overflow-y-auto">
          <nav className="p-4 space-y-6">
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
        </aside>

        {/* Main Content with Mobile Bottom Padding */}
        <main className="flex-1 overflow-y-auto bg-brand-bg scroll-smooth pb-28 md:pb-8">
          <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav (Mobile) with Safe-Area Inset Support & Landscape Optimization */}
      <nav 
        className="md:hidden glass-panel border-t border-brand-border fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 sm:px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-2xl landscape:h-12 landscape:pt-0.5"
        style={{ minHeight: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {mobileBottomItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[40px] min-w-[50px] active:scale-90 ${
                isActive ? 'text-brand-accent font-bold' : 'text-brand-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className={`text-[9px] sm:text-[10px] leading-tight ${isActive ? 'text-brand-text font-black' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}

        {/* More/Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[40px] min-w-[50px] active:scale-90 cursor-pointer ${
            mobileMenuOpen ? 'text-brand-accent' : 'text-brand-muted hover:text-white'
          }`}
          aria-label="Abrir menú de navegación completo"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] leading-tight font-medium">Más</span>
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
                  <div className="text-xs font-black uppercase text-white tracking-wider truncate max-w-[150px]">{currentUser.name}</div>
                  <div className="text-[10px] text-brand-muted uppercase">
                    {currentUser.role === Role.ADMIN ? 'Administrador' : currentUser.role === Role.MANAGER ? 'Jefe de Obra' : 'Operario'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 -mr-1 text-brand-muted hover:text-white rounded-lg active:bg-brand-surface"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Role Switcher (in Demo mode) */}
            {appState.isDemoMode && (
              <div className="mt-4 p-3 rounded-xl bg-brand-surface border border-brand-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Cambiar Rol Demo</span>
                  <span className="text-[9px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">Demo Activa</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => obraStore.switchRole(Role.ADMIN)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors ${currentUser.role === Role.ADMIN ? 'bg-brand-accent text-white' : 'bg-brand-bg text-brand-muted'}`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => obraStore.switchRole(Role.MANAGER)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors ${currentUser.role === Role.MANAGER ? 'bg-brand-accent text-white' : 'bg-brand-bg text-brand-muted'}`}
                  >
                    Jefe Obra
                  </button>
                  <button
                    onClick={() => obraStore.switchRole(Role.WORKER)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors ${currentUser.role === Role.WORKER ? 'bg-brand-accent text-white' : 'bg-brand-bg text-brand-muted'}`}
                  >
                    Operario
                  </button>
                </div>
              </div>
            )}

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
              {appState.isDemoMode && (
                <button
                  onClick={() => {
                    handlePopulateRandomData();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-zinc-300 active:bg-brand-surface-hover min-h-[44px]"
                >
                  <Dices className="w-4 h-4 text-brand-accent" />
                  <span>Cargar Datos Test</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 w-full rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-xs active:bg-rose-500/20 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Demo Sandbox Toolbar */}
      <DemoFloatingSandbox state={appState} />
    </div>
  );
};
