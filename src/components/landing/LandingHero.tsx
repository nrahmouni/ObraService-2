import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building2, UserCheck, FileCheck, Radio, CheckCircle2, HardHat, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onLogin, onDemo }) => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-brand-bg">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--color-brand-accent)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Compliance Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-surface border border-brand-border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 max-w-full">
            <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-brand-text truncate">
              Homologado Ley 32/2006 • Seguridad Jurídica Total
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-white leading-[1.02] sm:leading-[0.95]">
              El CRM Pro Max <br />
              <span className="text-brand-accent italic">Integrable</span> de tu Obra
            </h1>
            <p className="text-base sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed font-medium px-2">
              Pipeline de licitaciones, captación de promotores, control de subcontratas y albaranes digitales. Conexión nativa con SAP, Sage y Dynamics.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onDemo}
              className="btn-primary w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-xs sm:text-sm uppercase tracking-wider gap-2 shadow-2xl shadow-brand-accent/25"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Probar Demo Pro Max (1 Clic)</span>
            </button>
            <button
              onClick={onStart}
              className="btn-secondary w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-xs sm:text-sm uppercase tracking-wider gap-2"
            >
              <span>Ver Planes & Precios</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent" />
            </button>
          </div>

          {/* Social Proof / Trust */}
          <div className="pt-6 sm:pt-8 flex flex-col items-center gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">CONFIADO POR LÍDERES DEL SECTOR</p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-base sm:text-xl font-black text-white italic tracking-tighter">CONSTRUCTORA X</span>
              <span className="text-base sm:text-xl font-black text-white italic tracking-tighter">EDIFICA PRO</span>
              <span className="text-base sm:text-xl font-black text-white italic tracking-tighter">CIVIL TECH</span>
              <span className="text-base sm:text-xl font-black text-white italic tracking-tighter">INFRA ESTRADA</span>
            </div>
          </div>
        </div>

        {/* Product Showcase */}
        <div className="mt-12 sm:mt-20 relative max-w-6xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/20 via-brand-accent/40 to-brand-accent/20 rounded-2xl sm:rounded-[2.5rem] blur-2xl opacity-20" />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9]">
            <img 
              src="/screenshot-desktop.jpg" 
              alt="ObraService Dashboard Preview" 
              className="w-full h-full object-cover object-top opacity-90"
            />
            {/* Floating Mobile Preview */}
            <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-32 sm:w-48 aspect-[9/19.5] bg-brand-bg border-2 sm:border-4 border-brand-border rounded-xl sm:rounded-[2rem] shadow-2xl overflow-hidden hidden sm:block">
              <img 
                src="/screenshot-mobile.jpg" 
                alt="ObraService Mobile App" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
