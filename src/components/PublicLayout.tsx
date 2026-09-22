import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ObraServiceLogo } from './ObraServiceLogo';
import { LandingFooter } from './landing/LandingFooter';
import { ShieldCheck, ArrowRight, Menu, X, CheckCircle2, Building2, Sparkles } from 'lucide-react';

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
    {
      label: 'Recursos',
      items: [
        { label: 'Documentación API', href: '/recursos/api' },
        { label: 'Guía de Usuario', href: '/recursos/guia' },
        { label: 'Integraciones ERP', href: '/integrations' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FF6600] selection:text-white scroll-smooth antialiased">
      {/* Top High-Trust Corporate Strip */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-b border-white/5 py-1.5 px-4 text-center text-[11px] font-medium text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6600]" />
            SaaS B2B para la Construcción e Ingeniería
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            Conforme a la Ley 32/2006 de Subcontratación y Validez de Albaranes Digitales
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            +450 Constructoras Activas
          </span>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <nav className="border-b border-white/10 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-3 group">
            <ObraServiceLogo className="w-32 sm:w-40 md:w-44 h-auto" />
            <span className="hidden xl:inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20">
              B2B Enterprise
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              item.items ? (
                <div key={item.label} className="group relative py-2">
                  <button className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#FF6600] transition-colors flex items-center gap-1 cursor-pointer">
                    {item.label}
                    <svg
                      className="w-3 h-3 transition-transform group-hover:rotate-180 text-slate-400 group-hover:text-[#FF6600]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-[#111726] border border-white/15 rounded-2xl p-3 min-w-[220px] shadow-2xl backdrop-blur-xl">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className="block py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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
                  className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                    location.pathname === item.href
                      ? 'text-[#FF6600]'
                      : 'text-slate-300 hover:text-[#FF6600]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onDemoAccess}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/5 border border-white/15 px-3.5 sm:px-4 py-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Probar Demo</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 sm:px-4 py-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => onOpenRegister()}
              className="flex items-center gap-1.5 bg-[#FF6600] text-white text-xs font-black uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-xl hover:bg-[#EA580C] transition-all shadow-lg shadow-orange-950/40 cursor-pointer active:scale-95"
            >
              <span>Empezar Prueba Gratuita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-3 pb-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2 text-xs font-bold text-slate-300">
              <Link
                to="/producto/que-agilizamos"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10"
              >
                Qué Agilizamos
              </Link>
              <Link
                to="/producto/como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10"
              >
                Cómo Funciona
              </Link>
              <Link
                to="/precios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF6600]"
              >
                Planes y Precios
              </Link>
              <Link
                to="/producto/seguridad"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10"
              >
                Seguridad Jurídica
              </Link>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onDemoAccess();
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Explorar Demo Interactiva
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-3 rounded-xl bg-[#FF6600] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Empezar Prueba Gratuita (14 días)
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content with Context */}
      <main className="flex-1">
        <Outlet context={{ onOpenLogin, onOpenRegister, onDemoAccess }} />
      </main>

      {/* Corporate High-Trust Footer */}
      <LandingFooter />
    </div>
  );
};
