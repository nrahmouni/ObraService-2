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
  CreditCard,
  X
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
  const [isDismissed, setIsDismissed] = useState(false);

  if (!state.isDemoMode || isDismissed) {
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
      value: Math.floor(250000 + Math.random() * 750000),
      stage: 'PROSPECT',
      probability: 30,
      expectedClosingDate: '2026-12-31',
      projectType: 'Civil / Urbanización',
      assignedTo: currentUser?.name || 'Director',
      notes: 'Lead generado automáticamente desde el simulador Sandbox.'
    });

    if (res.success) {
      toast.success('🎯 Nueva oportunidad CRM generada con éxito.');
    }
  };

  const handleRegenerateRandomData = () => {
    const result = obraStore.populateRandomTestData();
    toast.success(`🎲 Datos de prueba regenerados: ${result.projectsCount} obras, ${result.reportsCount} partes y ${result.deliveryNotesCount} albaranes.`);
  };

  const handleExitDemo = () => {
    obraStore.exitDemoMode();
    toast('Has salido del modo demostración.');
    navigate('/');
  };

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-3 sm:right-4 z-50 font-body pointer-events-auto">
      {!isExpanded ? (
        <div className="flex items-center gap-1 bg-slate-950/95 border border-brand-accent/50 rounded-full shadow-2xl p-1 backdrop-blur-xl">
          <button
            onClick={() => setIsExpanded(true)}
            className="px-2.5 py-1.5 text-white flex items-center gap-1.5 hover:text-brand-accent transition-all cursor-pointer group active:scale-95"
            title="Abrir panel de control del Entorno Sandbox"
          >
            <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-white shadow-md shadow-brand-accent/30 shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent">
              Sandbox
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-brand-muted group-hover:text-white" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Ocultar barra flotante durante esta sesión"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="glass-panel bg-slate-950/95 border border-brand-accent/40 rounded-2xl shadow-2xl p-3 sm:p-4 text-white backdrop-blur-xl w-[90vw] max-w-xl animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-accent flex items-center justify-center text-white shadow-md shadow-brand-accent/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                  <span>Entorno Demo Sandbox</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[200px]">
                  {currentUser?.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExitDemo}
                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                title="Salir del modo demostración"
              >
                Salir Demo
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-brand-muted hover:text-white transition-colors cursor-pointer"
                title="Minimizar panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Switcher Grid */}
          <div className="py-2.5 space-y-1.5">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Cambiar Perfil de Usuario:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {roleConfigs.map((cfg) => (
                <button
                  key={cfg.role}
                  onClick={() => handleSwitchRole(cfg.role, cfg.path)}
                  className={`p-2 rounded-xl text-[11px] font-bold uppercase text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentUser?.role === cfg.role 
                      ? 'bg-brand-accent text-white shadow-md' 
                      : 'bg-white/5 text-brand-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-2">
            <button
              onClick={handleRegenerateRandomData}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-brand-accent" />
              <span>Regenerar Obras</span>
            </button>

            <button
              onClick={handleSimulateCrmLead}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              <span>+1 Oportunidad CRM</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
