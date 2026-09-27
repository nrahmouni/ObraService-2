import React from 'react';
import { ObraServiceLogo } from '../ObraServiceLogo';
import { Activity, ShieldCheck, Mail, ArrowUp } from 'lucide-react';

interface LandingFooterProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onOpenJoinCode: () => void;
  onDemoAccess: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenJoinCode,
  onDemoAccess
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-surface border-t border-brand-border py-12 sm:py-16 text-brand-text font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-brand-border">
          
          {/* Brand Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <ObraServiceLogo className="w-36 h-auto" />
            <p className="text-xs text-brand-muted leading-relaxed font-normal">
              Software especializado en gestión operativa de obras, partes diarios digitales y control documental para el sector de la construcción en España.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Sistemas 100% Operativos</span>
            </div>
          </div>

          {/* Product & Action Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Acceso y Acciones
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <button 
                  onClick={onDemoAccess}
                  className="hover:text-brand-accent transition-colors font-medium text-left cursor-pointer"
                >
                  Probar Demo Interactiva
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenLogin}
                  className="hover:text-brand-accent transition-colors font-medium text-left cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenRegister()}
                  className="hover:text-brand-accent transition-colors font-medium text-left cursor-pointer"
                >
                  Registrar Empresa
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenJoinCode}
                  className="hover:text-brand-accent transition-colors font-medium text-left cursor-pointer"
                >
                  Canjear Código de Obra
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <a href="#funciones" className="hover:text-brand-accent transition-colors font-medium">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-brand-accent transition-colors font-medium">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-brand-accent transition-colors font-medium">
                  Planes y Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
              Marco Legal & Normativo
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted font-medium">
              <li className="flex items-center gap-1.5 text-white/80">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Ley 32/2006 Subcontratación</span>
              </li>
              <li>
                <span>Control Preventivo PRL & REA</span>
              </li>
              <li>
                <span>Protección de Datos (RGPD)</span>
              </li>
              <li>
                <span>Validez Jurídica de Albaranes</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-muted uppercase tracking-wider font-bold">
          <p>© 2026 ObraService Pro • Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded bg-white/5"
            >
              <span>Subir al inicio</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
