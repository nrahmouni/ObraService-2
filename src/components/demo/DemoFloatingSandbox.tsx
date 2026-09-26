import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Crown, 
  Building2, 
  HardHat, 
  Smartphone, 
  DollarSign, 
  RefreshCw, 
  LogOut, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  FileText,
  Briefcase,
  Layers,
  CreditCard
} from 'lucide-react';
import { AppState, UserRole } from '../../types';
import { obraStore } from '../../services/store';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface DemoFloatingSandboxProps {
  state: AppState;
}

export const DemoFloatingSandbox: React.FC<DemoFloatingSandboxProps> = ({ state }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!state.isDemoMode) {
    return null;
  }

  const currentUser = state.currentUser;

  const roleConfigs: { role: UserRole; label: string; icon: any; path: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown, path: '/admin/web-admin' },
    { role: 'MAIN_CONTRACTOR_ADMIN', label: 'Director General', icon: Building2, path: '/admin/dashboard' },
    { role: 'SITE_MANAGER', label: 'Jefe de Obra', icon: HardHat, path: '/admin/reports' },
    { role: 'SUBCONTRACTOR_USER', label: 'Operario Móvil', icon: Smartphone, path: '/mobile/dashboard' }
  ];

  const handleSwitchRole = (role: UserRole, targetPath: string) => {
    obraStore.switchRole(role);
    toast.success(`Cambiando a vista de: ${role.replace(/_/g, ' ')}`);
    navigate(targetPath);
  };

  const handleSimulateCrmLead = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const res = obraStore.addCrmOpportunity({
      companyId: currentUser?.companyId || 'comp_norte',
      clientId: state.clients?.[0]?.id || 'cli_metrovacesa',
      clientName: state.clients?.[0]?.name || 'Metrovacesa S.A.',
      title: `Licitación Express #${randomNum} - Urbanización y Viales`,
      value: Math.floor(200000 + Math.random() * 800000),
      stage: 'PROSPECT',
      probability: 30,
      expectedClosingDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      projectType: 'Civil',
      assignedTo: currentUser?.name || 'Director Comercial',
      notes: 'Oportunidad simulada con un clic desde el Sandbox Demo.'
    });

    if (res.success) {
      toast.success(`🎲 Nueva licitación simulada: ${res.opportunity?.title} (${(res.opportunity?.value || 0).toLocaleString('es-ES')} €)`);
      if (!location.pathname.includes('/clients')) {
        navigate('/admin/clients');
      }
    }
  };

  const handleRegenerateRandomData = () => {
    const result = obraStore.populateRandomTestData();
    toast.success(`🎲 Datos de prueba regenerados: ${result.projectsCount} obras, ${result.reportsCount} partes y ${result.deliveryNotesCount} albaranes.`);
  };

  const handleExitDemo = () => {
    obraStore.exitDemoMode();
    toast('Has salido del modo demostración.');
    navigate('/login');
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl font-body">
      <div className="glass-panel bg-slate-950/90 border border-brand-accent/40 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-white backdrop-blur-xl">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Badge & Current Role */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-accent/25 shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent">
                  Entorno Demo Sandbox
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {currentUser?.name} ({currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser?.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Director' : currentUser?.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'})
              </div>
            </div>
          </div>

          {/* Quick Role Switcher Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {roleConfigs.map((cfg) => {
              const isActive = currentUser?.role === cfg.role;
              return (
                <button
                  key={cfg.role}
                  onClick={() => handleSwitchRole(cfg.role, cfg.path)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-brand-accent text-white shadow-md' 
                      : 'text-brand-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                obraStore.toggleUiStyle();
                toast.success(`Estilo Neumórfico ${state.uiStyle === 'standard' ? 'Activado' : 'Desactivado'}`);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center gap-1 shrink-0 ${
                state.uiStyle !== 'standard'
                  ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title="Alternar diseño Neumórfico Soft UI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Soft UI</span>
            </button>

            <button
              onClick={handleSimulateCrmLead}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase border border-white/15 transition-all flex items-center gap-1 shrink-0"
              title="Simular nuevo lead en el CRM de Licitaciones"
            >
              <Plus className="w-3.5 h-3.5 text-brand-accent" />
              <span className="hidden sm:inline">Lead CRM</span>
            </button>

            <button
              onClick={() => navigate('/admin/billing')}
              className="px-2.5 py-1.5 rounded-xl bg-brand-accent/20 hover:bg-brand-accent text-white text-[11px] font-bold uppercase border border-brand-accent/30 transition-all flex items-center gap-1 shrink-0"
              title="Ir a pasarela de pago y suscripciones"
            >
              <CreditCard className="w-3.5 h-3.5 text-brand-accent" />
              <span className="hidden sm:inline">Pasarela</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white border border-white/10 transition-colors"
              title="Más herramientas del sandbox"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              onClick={handleExitDemo}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-colors"
              title="Salir de la demostración"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Panel (Mobile role switcher & Advanced demo tools) */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
            {/* Mobile role buttons */}
            <div className="space-y-1.5 md:hidden">
              <span className="text-[10px] font-bold text-brand-muted uppercase">Cambiar Rol:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {roleConfigs.map((cfg) => (
                  <button
                    key={cfg.role}
                    onClick={() => handleSwitchRole(cfg.role, cfg.path)}
                    className={`p-2 rounded-lg text-[10px] font-bold uppercase text-left flex items-center gap-1.5 ${
                      currentUser?.role === cfg.role ? 'bg-brand-accent text-white' : 'bg-white/5 text-brand-muted'
                    }`}
                  >
                    <cfg.icon className="w-3.5 h-3.5" />
                    <span>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="space-y-1.5 sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/admin/clients')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold uppercase transition-colors"
                >
                  Ir a CRM Clientes
                </button>
                <button
                  onClick={() => navigate('/admin/web-admin')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold uppercase transition-colors"
                >
                  Ir a Admin Web
                </button>
                <button
                  onClick={handleRegenerateRandomData}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" /> Regenerar Obras
                </button>
              </div>

              <div className="text-[10px] text-brand-muted">
                Demo interactiva con datos locales aislados.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
