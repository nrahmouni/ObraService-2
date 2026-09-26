import React, { useState } from 'react';
import { 
  Sparkles, 
  UserCheck, 
  RotateCcw, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Building2, 
  HardHat, 
  Users, 
  Smartphone,
  Crown,
  X
} from 'lucide-react';
import { obraStore } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface DemoActionBarProps {
  currentUserName?: string;
  currentUserRole?: string;
}

export const DemoActionBar: React.FC<DemoActionBarProps> = ({ currentUserName, currentUserRole }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const demoAccounts = [
    {
      name: 'David Gómez',
      role: 'Operario de Campo',
      email: 'david.gomez@estructuraslevante.es',
      path: '/mobile/dashboard',
      icon: Smartphone,
      color: 'text-amber-500'
    },
    {
      name: 'Javier Ortiz',
      role: 'Jefe de Obra',
      email: 'javier.ortiz@construccionesnorte.es',
      path: '/admin/dashboard',
      icon: HardHat,
      color: 'text-blue-400'
    },
    {
      name: 'Carlos Mendoza',
      role: 'Director General',
      email: 'carlos.mendoza@construccionesnorte.es',
      path: '/admin/dashboard',
      icon: Building2,
      color: 'text-brand-accent'
    },
    {
      name: 'Elena Ramos',
      role: 'Gerente Subcontrata',
      email: 'elena.ramos@estructuraslevante.es',
      path: '/admin/dashboard',
      icon: Users,
      color: 'text-emerald-400'
    },
    {
      name: 'Super Admin',
      role: 'Master Admin',
      email: 'superadmin@obraservice.com',
      path: '/admin/master',
      icon: Crown,
      color: 'text-purple-400'
    }
  ];

  const handleSwitchRole = (email: string, targetPath: string, name: string) => {
    const res = obraStore.login(email);
    if (res.success) {
      toast.success(`Cambiado a: ${name}`, { icon: '🔄' });
      setIsOpen(false);
      navigate(targetPath);
    }
  };

  const handleResetData = () => {
    obraStore.resetDemoData();
    toast.success('Datos de prueba reiniciados.');
    setIsOpen(false);
  };

  const handleExitDemo = () => {
    obraStore.exitDemoMode();
    toast.success('Has salido del modo Demo.');
    navigate('/');
  };

  if (isMinimized) {
    return (
      <aside 
        aria-label="Controles de Demo" 
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3 py-2 rounded-full bg-brand-accent text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 animate-spin text-white" />
          <span>Modo Demo</span>
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Panel de Control Demo" 
      className="fixed bottom-20 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-6 z-40 max-w-lg sm:max-w-md ml-auto"
    >
      <div className="bg-brand-surface/95 backdrop-blur-xl border border-brand-accent/40 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-white">
        <div className="flex items-center justify-between gap-2">
          {/* Badge & Current Actor */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block truncate">
                Modo Demo Activo
              </span>
              <p className="text-xs font-bold text-white truncate">
                {currentUserName || 'Usuario Demo'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-xs font-bold flex items-center gap-1.5 hover:border-brand-accent/50 transition-colors"
              >
                <span>Cambiar Rol</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Role Menu */}
              {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-1.5 border-b border-brand-border/60">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">
                      Probar como otro actor:
                    </span>
                  </div>

                  {demoAccounts.map(account => {
                    const Icon = account.icon;
                    const isSelected = account.name === currentUserName;
                    return (
                      <button
                        key={account.email}
                        onClick={() => handleSwitchRole(account.email, account.path, account.name)}
                        className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                          isSelected ? 'bg-brand-accent/20 border border-brand-accent/40' : 'hover:bg-brand-bg'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${account.color} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{account.name}</p>
                          <p className="text-[10px] text-brand-muted truncate">{account.role}</p>
                        </div>
                      </button>
                    );
                  })}

                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-1 px-1">
                    <button
                      onClick={handleResetData}
                      title="Reiniciar datos"
                      className="px-2 py-1 rounded-lg hover:bg-brand-bg text-[10px] font-bold text-brand-muted hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reiniciar</span>
                    </button>
                    <button
                      onClick={handleExitDemo}
                      className="px-2 py-1 rounded-lg hover:bg-rose-500/20 text-[10px] font-bold text-rose-400 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Salir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMinimized(true)}
              title="Minimizar panel demo"
              className="w-7 h-7 rounded-lg hover:bg-brand-bg flex items-center justify-center text-brand-muted hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
