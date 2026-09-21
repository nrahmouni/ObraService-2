import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ObraServiceLogo } from './ObraServiceLogo';
import { LandingFooter } from './landing/LandingFooter';

interface PublicLayoutProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onDemoAccess: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  onOpenLogin,
  onOpenRegister,
  onDemoAccess,
}) => {
  const location = useLocation();

  const navLinks = [
    {
      label: 'Producto',
      items: [
        { label: 'Qué Agilizamos', href: '/producto/que-agilizamos' },
        { label: 'Cómo Funciona', href: '/producto/como-funciona' },
        { label: 'Precios', href: '/precios' },
        { label: 'Seguridad', href: '/producto/seguridad' },
      ]
    },
    {
      label: 'Empresa',
      items: [
        { label: 'Quiénes Somos', href: '/empresa/quienes-somos' },
        { label: 'Blog', href: '/blog' },
        { label: 'Prensa', href: '/empresa/prensa' },
        { label: 'Contacto', href: '/empresa/contacto' },
      ]
    },
    {
      label: 'Recursos',
      items: [
        { label: 'Documentación API', href: '/recursos/api' },
        { label: 'Guía de Usuario', href: '/recursos/guia' },
        { label: 'Integraciones', href: '/integrations' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#F4F5F6] flex flex-col font-sans selection:bg-[#FF6600] selection:text-white scroll-smooth">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0F0F12]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <ObraServiceLogo className="w-32 sm:w-40 md:w-48 h-auto" />
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((group) => (
              <div key={group.label} className="group relative py-2">
                <button className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#FF6600] transition-colors flex items-center gap-1">
                  {group.label}
                  <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-[#1F2329] border border-white/10 rounded-xl p-4 min-w-[200px] shadow-2xl">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block py-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Link to="/precios" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#FF6600] transition-colors">
              Precios
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onDemoAccess}
              className="hidden md:block text-xs font-bold text-[#FF6600] border border-[#FF6600]/20 px-5 py-2.5 rounded-xl hover:bg-[#FF6600] hover:text-white transition-all active:scale-95"
            >
              Probar Demo
            </button>
            <button
              onClick={onOpenLogin}
              className="hidden sm:block text-[11px] font-bold uppercase tracking-widest hover:text-[#FF6600] transition-colors px-4 py-2 whitespace-nowrap"
            >
              Log In
            </button>
            <button
              onClick={onOpenRegister}
              className="bg-[#FF6600] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-[#e65c00] transition-all shadow-lg shadow-orange-900/20 active:scale-95 whitespace-nowrap"
            >
              Empezar
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
};
