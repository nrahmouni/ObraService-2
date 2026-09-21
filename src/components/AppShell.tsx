import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Building2, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck, 
  HardHat, 
  Briefcase,
  Plus,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle2,
  Filter,
  Network,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Map as MapIcon,
  MessageSquare
} from 'lucide-react';
import { obraStore } from '../services/store';
import { dispatcher } from '../services/dispatcher';
import { User, UserRole } from '../types';
import { ObraServiceLogo } from './ObraServiceLogo';
import { ComplianceOverlays } from './ComplianceOverlays';
import { PWAInstallButton } from './PWAInstallButton';

export type TabKey = 
  | 'dashboard' 
  | 'reports' 
  | 'delivery_notes' 
  | 'projects' 
  | 'map'
  | 'team' 
  | 'chat'
  | 'audit' 
  | 'integrations'
  | 'docs'
  | 'settings';

interface AppShellProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentUser: User;
  isDemoMode: boolean;
  onOpenNewReport?: () => void;
  onExitDemoToProduction?: () => void;
  children: React.ReactNode;
}

import { toast } from 'react-hot-toast';

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isDemoMode,
  onOpenNewReport,
  onExitDemoToProduction,
  children,
}) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const state = obraStore.getState();

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
    if (state.syncError) {
      toast.error(`Sincronización interrumpida: ${state.syncError}`, { id: 'sync-error-toast' });
    } else {
      toast.dismiss('sync-error-toast');
    }
  }, [state.syncError]);

  const handleLogout = async () => {
    try {
      await obraStore.logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'MAIN_CONTRACTOR_ADMIN': return 'Admin';
      case 'SITE_MANAGER': return 'Jefe Obra';
      case 'SUBCONTRACTOR_USER': return 'Subcontrata';
      default: return role;
    }
  };

  const activeCompany = state.companies.find(c => c.id === currentUser.companyId);

  // Mock available contexts for the demo (showing multi-company capability)
  const availableContexts = [
    { id: activeCompany?.id, name: activeCompany?.name, role: getRoleLabel(currentUser.role) },
    { id: 'ext_1', name: 'FCC Construcción', role: 'Subcontrata' },
    { id: 'ext_2', name: 'Ferrovial Agromán', role: 'Subcontrata' }
  ];

  const handleSwitchContext = async (companyId: string) => {
    const res = await dispatcher.dispatch('SWITCH_COMPANY_CONTEXT', { companyId });
    if (!res.success) {
      alert(res.error);
    }
    setContextMenuOpen(false);
  };

  // Stats for the "Network" logic
  const pendingNotesCount = state.deliveryNotes.filter(n => {
    if (currentUser.role === 'SUBCONTRACTOR_USER') {
      return n.subcontractorCompanyId === currentUser.companyId && n.status === 'Pending';
    }
    return n.status === 'Pending';
  }).length;

  const disputedNotesCount = state.deliveryNotes.filter(n => n.status === 'Disputed').length;

  const navItems = [
    { key: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { key: 'reports', label: 'Partes', icon: FileSpreadsheet, roles: ['MAIN_CONTRACTOR_ADMIN', 'SITE_MANAGER'] },
    { 
      key: 'delivery_notes', 
      label: 'Albaranes', 
      icon: FileText,
      badge: pendingNotesCount > 0 ? pendingNotesCount : undefined
    },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
    { key: 'projects', label: 'Obras', icon: Building2, roles: ['MAIN_CONTRACTOR_ADMIN', 'SITE_MANAGER'] },
    { key: 'map', label: 'Mapa', icon: MapIcon, roles: ['MAIN_CONTRACTOR_ADMIN', 'SITE_MANAGER'] },
    { key: 'team', label: 'Equipo', icon: Users, roles: ['MAIN_CONTRACTOR_ADMIN'] },
    { key: 'audit', label: 'Audit', icon: History, roles: ['MAIN_CONTRACTOR_ADMIN'] },
    { key: 'settings', label: 'Config', icon: Settings, roles: ['MAIN_CONTRACTOR_ADMIN', 'SITE_MANAGER'] },
  ].filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)] flex flex-col font-sans selection:bg-[#FF6600] selection:text-white antialiased">
      {/* 1. Technical Demo Banner - Slimmer */}
      {isDemoMode && (
        <div className="bg-[#FF6600] text-white px-4 py-1 text-[10px] font-bold flex items-center justify-between z-50 sticky top-0 md:relative">
          <div className="flex items-center gap-2 tracking-tight">
            <span className="bg-black/20 px-1 rounded text-[8px]">SIMULACIÓN</span>
            <span className="opacity-95">Entorno de demostración interactivo</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => {
              obraStore.resetDemoData();
              toast.success('Datos demo restablecidos');
            }} className="hover:underline text-[9px] opacity-80 hover:opacity-100 uppercase">
              Reiniciar Datos
            </button>
            <button 
              onClick={() => {
                if (onExitDemoToProduction) {
                  onExitDemoToProduction();
                  toast.success('Has salido del modo demo');
                }
              }} 
              className="bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded text-[9px] transition-colors uppercase tracking-wider cursor-pointer"
            >
              Salir de la Demo
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between z-50 sticky top-0 md:relative">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping" />
            <span>Modo sin conexión — Los partes y albaranes se guardarán en IndexedDB y se sincronizarán al recuperar 4G.</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Desktop Sidebar - More compact (w-56) */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[var(--brand-surface)] border-r border-[var(--brand-border)]">
          <div className="p-4 border-b border-[var(--brand-border)] mb-2">
            <ObraServiceLogo className="w-24" />
          </div>

          {/* Network Node Indicator - Minimalist */}
          <div className="px-4 py-2 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6600]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nodo de Red</span>
            </div>
            <div className="text-[11px] font-black truncate uppercase">{activeCompany?.name || 'ObraService'}</div>
            <div className="text-[9px] font-medium text-[#FF6600] uppercase opacity-80">
              {activeCompany?.type === 'MAIN_CONTRACTOR' ? 'Contratista' : 'Subcontrata'}
            </div>
          </div>

          {/* Nav List - High Density */}
          <nav className="flex-1 px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key as TabKey)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-bold transition-all group ${
                    isActive 
                      ? 'bg-black/5 text-[var(--brand-text)] border-l-2 border-[#FF6600]' 
                      : 'text-slate-500 hover:text-[var(--brand-text)] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6600]' : 'text-slate-400 group-hover:text-[#FF6600]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#FF6600] text-white px-1.5 rounded-full text-[8px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Role Selector (Fixed) */}
          {isDemoMode && (
            <div className="p-3 border-t border-[var(--brand-border)]">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Simular Rol</div>
              <div className="flex gap-1">
                {[
                  { id: 'usr_main_admin', icon: Briefcase, t: 'Adm' },
                  { id: 'usr_site_manager', icon: HardHat, t: 'Jefe' },
                  { id: 'usr_sub_admin', icon: Users, t: 'Sub' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => obraStore.switchDemoRole(role.id)}
                    className={`flex-1 flex flex-col items-center p-1 rounded transition-all border ${
                      currentUser.id === role.id 
                        ? 'bg-[#FF6600]/5 border-[#FF6600]/20 text-[#FF6600]' 
                        : 'border-transparent text-slate-400 hover:bg-black/5'
                    }`}
                  >
                    <role.icon className="w-3 h-3" />
                    <span className="text-[7px] font-black uppercase">{role.t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-3 pt-2">
            <PWAInstallButton />
          </div>

          <div className="p-3 border-t border-[var(--brand-border)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
          {/* Header Bar - More professional */}
          <header className="h-10 border-b border-[var(--brand-border)] flex items-center justify-between px-4 bg-white sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>{activeCompany?.name}</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-[var(--brand-text)]">{navItems.find(i => i.key === currentTab)?.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => obraStore.toggleTheme()}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {state.theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>

              <div className="w-px h-4 bg-slate-200" />

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-all bg-slate-50 hover:bg-slate-100 py-1 px-2.5 rounded-full border border-slate-200 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[8px] font-bold border border-orange-200">
                    {currentUser.name[0]}
                  </div>
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <>
                    {/* Backdrop to close */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setProfileMenuOpen(false)} 
                    />
                    
                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-100 text-slate-700">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{currentUser.name}</div>
                        <div className="text-[9px] text-slate-500 font-medium">{currentUser.email}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="bg-orange-50 text-[#FF6600] text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase">
                            {getRoleLabel(currentUser.role)}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase truncate max-w-[120px]">
                            {activeCompany?.name}
                          </span>
                        </div>
                      </div>

                      {/* On Mobile: show all navigation items */}
                      <div className="md:hidden py-1 border-b border-slate-100 max-h-48 overflow-y-auto">
                        <div className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">Navegar</div>
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentTab === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                onSelectTab(item.key as TabKey);
                                setProfileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-left text-[11px] font-bold ${
                                isActive ? 'bg-orange-50/50 text-[#FF6600]' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Demo Role Switcher inside profile menu (Available on Mobile and Desktop) */}
                      {isDemoMode && (
                        <div className="py-2 border-b border-slate-100 px-3 bg-slate-50/50">
                          <div className="px-1 mb-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Cambiar Rol (Demo)</div>
                          <div className="flex flex-col gap-1">
                            {[
                              { id: 'usr_main_admin', label: 'Carmen Vega (Admin)', desc: 'Control total' },
                              { id: 'usr_site_manager', label: 'Javier Ortiz (Jefe Obra)', desc: 'Gestión diaria' },
                              { id: 'usr_sub_admin', label: 'Elena Garrido (Subcontrata)', desc: 'Validar albaranes' }
                            ].map((role) => (
                              <button
                                key={role.id}
                                onClick={() => {
                                  obraStore.switchDemoRole(role.id);
                                  toast.success(`Cambiado a rol: ${role.label.split(' ')[0]}`);
                                  setProfileMenuOpen(false);
                                }}
                                className={`w-full text-left p-1.5 rounded-lg border transition-all text-xs flex flex-col ${
                                  currentUser.id === role.id 
                                    ? 'bg-[#FF6600]/5 border-[#FF6600]/20 text-[#FF6600] font-bold' 
                                    : 'border-transparent text-slate-600 hover:bg-black/5'
                                }`}
                              >
                                <span className="text-[10px] font-bold">{role.label}</span>
                                <span className="text-[8px] text-slate-400 font-medium">{role.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="py-1">
                        {isDemoMode && (
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              if (onExitDemoToProduction) onExitDemoToProduction();
                              toast.success('Has salido del modo demo');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-1.5 text-left text-[11px] font-bold text-[#FF6600] hover:bg-orange-50/50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Salir de la Demo</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-1.5 text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 pb-24 md:p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sticky Nav (Professional Flat Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 px-4 flex items-center justify-around w-full z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key as TabKey)}
              className={`flex flex-col items-center gap-0.5 transition-all relative px-2 py-1 cursor-pointer ${isActive ? 'text-[#FF6600]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[7px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute -top-1 right-0 bg-[#FF6600] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border border-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Compliance overlays (Cookies, Legal Notice, Privacy Policy, WhatsApp Floating support) */}
      <ComplianceOverlays />
    </div>
  );
};

