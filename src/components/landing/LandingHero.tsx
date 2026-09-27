import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles, KeyRound, MapPin, Smartphone, CheckCircle2 } from 'lucide-react';

interface LandingHeroProps {
  onStart: (plan?: string) => void;
  onLogin: () => void;
  onDemo: () => void;
  onJoinCode: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ 
  onStart, 
  onLogin, 
  onDemo,
  onJoinCode 
}) => {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-brand-bg">
      {/* Subtle architectural background pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[640px] bg-[radial-gradient(circle_at_center,_var(--color-brand-accent)_0%,_transparent_65%)] opacity-[0.04] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          
          {/* Legal Compliance Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-brand-surface/90 border border-brand-accent/30 shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-text">
              Conforme Ley 32/2006 • Seguridad Jurídica y Control PRL
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.08] sm:leading-[1.02]">
              Partes Diarios, Albaranes <br className="hidden sm:inline" />
              y Control en Tajo <span className="text-brand-accent">100% Digital</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed font-medium px-2">
              Gestión operativa en tiempo real para constructoras y subcontratas: geocerca GPS, cálculo de horas ordinarias y extras por convenio, y emisión inmutable de albaranes digitales.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onDemo}
              className="btn-primary h-12 sm:h-14 px-6 sm:px-8 text-xs sm:text-sm uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/20 cursor-pointer min-h-[48px] justify-center"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Probar Demo Interactiva (1 Clic)</span>
            </button>
            
            <a
              href="#precios"
              className="btn-secondary h-12 sm:h-14 px-6 sm:px-8 text-xs sm:text-sm uppercase tracking-wider gap-2 min-h-[48px] justify-center text-center inline-flex items-center"
            >
              <span>Ver Planes & Precios</span>
              <ArrowRight className="w-4 h-4 text-brand-accent shrink-0" />
            </a>
          </div>

          {/* Invitation Code Quick Link */}
          <div className="pt-1">
            <button
              onClick={onJoinCode}
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-accent" />
              <span>¿Has recibido una invitación de obra? <strong className="text-brand-accent underline">Canjear Código</strong></span>
            </button>
          </div>

          {/* Key Feature Highlights Pill Bar */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs font-bold text-brand-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sincronización Offline (PWA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Geolocalización en Tajo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Validación Multi-Subcontrata</span>
            </div>
          </div>
        </div>

        {/* Real App Screenshot Showcase */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/20 via-brand-accent/30 to-brand-accent/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-25" />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl aspect-[16/10] sm:aspect-[16/9]">
            <img 
              src="/screenshot-desktop.jpg" 
              alt="Panel Operativo ObraService Pro" 
              className="w-full h-full object-cover object-top opacity-95"
            />
            {/* Mobile Inset Device Preview */}
            <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-28 sm:w-44 aspect-[9/18] bg-brand-bg border-2 border-brand-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden hidden xs:block">
              <img 
                src="/screenshot-mobile.jpg" 
                alt="ObraService Pro en Móvil" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
