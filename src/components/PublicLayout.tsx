import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ObraServiceLogo } from './ObraServiceLogo';
import { LandingFooter } from './landing/LandingFooter';
import { ShieldCheck, ArrowRight, Menu, X, Sparkles, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export interface PublicOutletContext {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onDemoAccess: () => void;
}

interface PublicLayoutProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onDemoAccess: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  onOpenLogin,
  onOpenRegister,
  onDemoAccess,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    {
      label: 'Producto',
      items: [
        { label: 'Qué Agilizamos', href: '/producto/que-agilizamos' },
        { label: 'Cómo Funciona', href: '/producto/como-funciona' },
        { label: 'Seguridad y Cumplimiento', href: '/producto/seguridad' },
      ],
    },
    {
      label: 'Precios',
      href: '/precios',
    },
    {
      label: 'Empresa',
      items: [
        { label: 'Quiénes Somos', href: '/empresa/quienes-somos' },
        { label: 'Blog Técnico', href: '/blog' },
        { label: 'Contacto Comercial', href: '/empresa/contacto' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-body selection:bg-brand-accent selection:text-white scroll-smooth antialiased">
      {/* Top High-Trust Corporate Strip */}
      <div className="bg-brand-surface border-b border-brand-border py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-brand-accent font-bold text-xs uppercase tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5" />
            SaaS B2B para la Construcción
          </span>
          <span className="hidden md:inline text-brand-muted text-xs">•</span>
          <span className="hidden md:inline text-brand-muted text-xs">
            Conforme a la Ley 32/2006 de Subcontratación
          </span>
          <span className="hidden sm:inline text-brand-muted text-xs">•</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs uppercase tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            +450 Constructoras Activas
          </span>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <nav className="border-b border-brand-border bg-brand-bg/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-3" aria-label="ObraService Pro Home">
            <ObraServiceLogo className="w-32 sm:w-40 h-auto" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              item.items ? (
                <div key={item.label} className="group relative">
                  <button className="text-[13px] font-semibold text-brand-muted group-hover:text-brand-text transition-colors flex items-center gap-1 cursor-pointer">
                    {item.label}
                    <svg
                      className="w-3 h-3 transition-transform group-hover:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-brand-surface border border-brand-border rounded-xl p-2 min-w-[200px] shadow-2xl">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className="block py-2 px-3 text-[13px] font-medium text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover rounded-lg transition-all"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  className={`text-[13px] font-semibold transition-colors ${
                    location.pathname === item.href
                      ? 'text-brand-accent'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            <button
              onClick={onOpenLogin}
              className="hidden sm:block text-[13px] font-semibold text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => onOpenRegister()}
              className="btn-primary gap-2"
            >
              <span>Prueba Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover transition-colors"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-brand-border space-y-4 pb-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col space-y-1">
              <Link
                to="/producto/que-agilizamos"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-brand-surface-hover text-sm font-medium"
              >
                Qué Agilizamos
              </Link>
              <Link
                to="/producto/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-brand-surface-hover text-sm font-medium"
              >
                Cómo Funciona
              </Link>
              <Link
                to="/precios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-brand-surface-hover text-sm font-medium text-brand-accent"
              >
                Planes y Precios
              </Link>
              <Link
                to="/producto/seguridad"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-brand-surface-hover text-sm font-medium"
              >
                Seguridad Jurídica
              </Link>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-brand-border">
              <PWAInstallButton />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onDemoAccess();
                }}
                className="btn-secondary w-full gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-accent" />
                Demo Interactiva
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="btn-secondary w-full"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content with Context */}
      <main className="flex-1">
        <Outlet context={{ onOpenLogin, onOpenRegister, onDemoAccess }} />
      </main>

      <LandingFooter />
    </div>
  );
};
