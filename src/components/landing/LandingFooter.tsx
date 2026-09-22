import React from 'react';
import { Link } from 'react-router-dom';
import { ObraServiceLogo } from '../ObraServiceLogo';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="py-20 border-t border-white/5 bg-[#0F0F12]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col space-y-12 mb-16">
          <div className="w-full">
            <div className="mb-6 scale-90 origin-left">
              <ObraServiceLogo />
            </div>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              La plataforma de confianza para la digitalización de la industria de la construcción e ingeniería.
            </p>
            <div className="flex gap-4">
              <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-white/5 rounded-lg hover:bg-[#FF6600]/20 hover:text-[#FF6600] transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-white/5 rounded-lg hover:bg-[#FF6600]/20 hover:text-[#FF6600] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="p-2 bg-white/5 rounded-lg hover:bg-[#FF6600]/20 hover:text-[#FF6600] transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-widest text-white">Producto</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><Link to="/producto/que-agilizamos" className="hover:text-[#FF6600] transition-colors">Qué agilizamos</Link></li>
              <li><Link to="/producto/como-funciona" className="hover:text-[#FF6600] transition-colors">Cómo funciona</Link></li>
              <li><Link to="/precios" className="hover:text-[#FF6600] transition-colors">Precios</Link></li>
              <li><Link to="/producto/seguridad" className="hover:text-[#FF6600] transition-colors">Seguridad de datos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-widest text-white">Empresa</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><Link to="/empresa/quienes-somos" className="hover:text-[#FF6600] transition-colors">Quiénes somos</Link></li>
              <li><Link to="/blog" className="hover:text-[#FF6600] transition-colors">Blog de Obra</Link></li>
              <li><Link to="/empresa/prensa" className="hover:text-[#FF6600] transition-colors">Prensa</Link></li>
              <li><Link to="/empresa/contacto" className="hover:text-[#FF6600] transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-[11px] tracking-widest text-white">Recursos</h4>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <li><Link to="/recursos/api" className="hover:text-[#FF6600] transition-colors">Documentación API</Link></li>
              <li><Link to="/recursos/guia" className="hover:text-[#FF6600] transition-colors">Guía de Usuario</Link></li>
              <li><Link to="/integrations" className="hover:text-[#FF6600] transition-colors">Integraciones</Link></li>
              <li><Link to="/legal" className="hover:text-[#FF6600] transition-colors">Legal & Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <p>© 2026 ObraService Network SL. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link to="/legal" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link to="/legal" className="hover:text-white transition-colors">Cookies</Link>
            <Link to="/legal" className="hover:text-white transition-colors">SLA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
