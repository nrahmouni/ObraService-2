import React, { useState, useEffect } from 'react';
import { ObraServiceLogo } from '../components/ObraServiceLogo';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingBentoFeatures } from '../components/landing/LandingBentoFeatures';
import { LandingCircuit } from '../components/landing/LandingCircuit';
import { LandingCalculator } from '../components/landing/LandingCalculator';
import { LandingTrust } from '../components/landing/LandingTrust';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ImmersivePresentation } from '../components/presentation/ImmersivePresentation';
import { 
  KeyRound, 
  LogIn, 
  Menu, 
  X, 
  Play, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Sparkles 
} from 'lucide-react';

interface PublicEntryViewProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onOpenJoinCode: () => void;
  onDemoAccess: () => void;
  currentUser?: any;
}

export const PublicEntryView: React.FC<PublicEntryViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenJoinCode,
  onDemoAccess,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      return search.includes('presentation') || search.includes('keynote') || window.location.pathname === '/presentation';
    }
    return false;
  });

  // Global Keyboard Shortcuts (Senior Developer craft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is not open and user is not in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.key === 'k' || e.key === 'K' || e.key === 'p' || e.key === 'P') && !isPresentationOpen) {
        e.preventDefault();
        setIsPresentationOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationOpen]);

  return (
    <div className="relative flex flex-col bg-[#0B0F17] min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased">
      
      {/* 1. TOP BAR CONTRACT: One-Row, Three-Zone Layout */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Zone 1: Brand Wordmark (Single Element) */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md">
              <ObraServiceLogo className="w-9 h-9 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  ObraService <span className="text-amber-500">Pro</span>
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: 4 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#circuito" className="hover:text-white transition-colors">Circuito Digital</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Impacto ROI</a>
            <a href="#precios" className="hover:text-white transition-colors">Planes & Tarifas</a>
          </nav>

          {/* Zone 3: Primary Actions (Single-Line Controls) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setIsPresentationOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all whitespace-nowrap cursor-pointer"
              title="Presentación Ejecutiva [K]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Keynote 2026</span>
            </button>

            <button
              onClick={onOpenJoinCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Código de Obra</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={onDemoAccess}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Probar Demo</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsPresentationOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Keynote</span>
            </button>
            <button
              onClick={onDemoAccess}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors"
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-slate-900"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-[#0B0F17]/95 px-4 py-6 space-y-4 backdrop-blur-xl">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <a 
                href="#funcionalidades" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white transition-colors"
              >
                Funcionalidades
              </a>
              <a 
                href="#circuito" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white transition-colors"
              >
                Circuito Digital
              </a>
              <a 
                href="#calculadora" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white transition-colors"
              >
                Impacto ROI
              </a>
              <a 
                href="#precios" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white transition-colors"
              >
                Planes & Tarifas
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenJoinCode(); }}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Canjear Código de Obra</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Crear Cuenta de Constructora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN SECTIONS FLOW */}
      <main className="flex-1">
        {/* Section 1: Hero with Interactive Tajo Simulator */}
        <LandingHero 
          onStart={(plan) => onOpenRegister(plan)}
          onLogin={onOpenLogin}
          onDemo={onDemoAccess}
          onJoinCode={onOpenJoinCode}
          onViewPresentation={() => setIsPresentationOpen(true)}
        />

        {/* Section 2: Asymmetric Bento Grid Features */}
        <LandingBentoFeatures />

        {/* Section 3: 4-Step Digital Circuit */}
        <LandingCircuit />

        {/* Section 4: ROI / Savings Calculator */}
        <div id="calculadora">
          <LandingCalculator onStart={() => onOpenRegister()} />
        </div>

        {/* Section 5: Trust & Compliance Guarantees */}
        <LandingTrust />

        {/* Section 6: Transparent Pricing */}
        <LandingPricing onSelect={(plan) => onOpenRegister(plan)} />
      </main>

      {/* 3. FOOTER */}
      <LandingFooter 
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenJoinCode={onOpenJoinCode}
        onDemoAccess={onDemoAccess}
      />

      {/* 4. MODAL DE PRESENTACIÓN EJECUTIVA / KEYNOTE */}
      {isPresentationOpen && (
        <ImmersivePresentation
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          onLaunchDemo={() => {
            setIsPresentationOpen(false);
            onDemoAccess();
          }}
        />
      )}

    </div>
  );
};
