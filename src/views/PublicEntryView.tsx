import React, { useState } from 'react';
import { ObraServiceLogo } from '../components/ObraServiceLogo';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingValueProp } from '../components/landing/LandingValueProp';
import { LandingHowItWorks } from '../components/landing/LandingHowItWorks';
import { LandingTrust } from '../components/landing/LandingTrust';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFooter } from '../components/landing/LandingFooter';
import { 
  KeyRound, 
  LogIn, 
  Sparkles, 
  Menu, 
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface PublicEntryViewProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onOpenJoinCode: () => void;
  onDemoAccess: () => void;
}

export const PublicEntryView: React.FC<PublicEntryViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenJoinCode,
  onDemoAccess,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col bg-brand-bg min-h-screen text-brand-text font-body selection:bg-brand-accent selection:text-white antialiased">
      
      {/* 1. Fixed Header with High Contrast and Real Actions */}
      <header className="sticky top-0 left-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-3.5 backdrop-blur-xl bg-brand-bg/90 border-b border-brand-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <ObraServiceLogo className="w-32 sm:w-40 h-auto" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-brand-muted uppercase tracking-wider">
            <a href="#funciones" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          </nav>

          {/* Action CTAs (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenJoinCode}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-brand-muted hover:text-white text-xs font-bold transition-all cursor-pointer min-h-[40px]"
              title="Canjear código de invitación a obra"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-accent" />
              <span>Unirme con Código</span>
            </button>

            <button 
              onClick={onOpenLogin}
              className="px-3 sm:px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-xs font-bold text-white uppercase tracking-wider transition-all min-h-[40px] cursor-pointer"
            >
              Acceso
            </button>

            <button 
              onClick={() => onOpenRegister()}
              className="btn-primary h-10 px-3.5 sm:px-5 text-xs uppercase tracking-wider shadow-lg shadow-brand-accent/20 min-h-[40px] cursor-pointer"
            >
              <span>Comenzar Gratis</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-surface transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-brand-border space-y-3 pb-2 animate-in fade-in duration-150">
            <div className="flex flex-col space-y-1 text-xs font-bold text-brand-muted uppercase tracking-wider">
              <a 
                href="#funciones" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-brand-surface hover:text-white"
              >
                Funcionalidades
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-brand-surface hover:text-white"
              >
                Cómo Funciona
              </a>
              <a 
                href="#precios" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-brand-surface hover:text-brand-accent"
              >
                Planes y Precios
              </a>
            </div>

            <div className="pt-2 border-t border-brand-border flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinCode();
                }}
                className="btn-secondary h-10 w-full justify-center text-xs gap-2"
              >
                <KeyRound className="w-4 h-4 text-brand-accent" />
                <span>Unirme con Código de Invitación</span>
              </button>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onDemoAccess();
                }}
                className="btn-secondary h-10 w-full justify-center text-xs gap-2 border-brand-accent/30 text-brand-accent"
              >
                <Sparkles className="w-4 h-4" />
                <span>Probar Demo Interactiva</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <LandingHero 
          onStart={(plan) => onOpenRegister(plan)} 
          onLogin={onOpenLogin} 
          onDemo={onDemoAccess}
          onJoinCode={onOpenJoinCode}
        />

        {/* 3. Core Functional Capabilities */}
        <LandingValueProp />

        {/* 4. How It Works Workflow */}
        <LandingHowItWorks />

        {/* 5. Real Trust & Legal Pillars */}
        <LandingTrust />

        {/* 6. Pricing Plans */}
        <LandingPricing 
          onSelect={(plan) => onOpenRegister(plan)}
        />
      </main>

      {/* 7. Footer */}
      <LandingFooter 
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenJoinCode={onOpenJoinCode}
        onDemoAccess={onDemoAccess}
      />

    </div>
  );
};
