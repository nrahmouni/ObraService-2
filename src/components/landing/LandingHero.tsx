import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building2, UserCheck, FileCheck, Radio, CheckCircle2, HardHat, FileSpreadsheet, MapPin } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onLogin, onDemo }) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 bg-[#070B14] overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
        
        {/* Compliance & Normative Chip */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0B101D] border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-lg">
          <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
          <span>Homologado Ley 32/2006 • Criterio Técnico ITSS 101/2019</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.06]">
          El Cockpit Digital para <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Obras, Partes y Subcontratas
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Digitalización inmutable de partes de tajo con firma digital en campo, geovalidación perimetral por GPS, y conciliación automática de albaranes de subcontratación.
        </p>

        {/* Main Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 max-w-3xl mx-auto w-full">
          {/* Main Action: Field & Office Login */}
          <button
            onClick={onLogin}
            className="w-full sm:flex-1 h-14 px-6 bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-orange-950/50 border border-orange-500/30 transition-all cursor-pointer active:scale-95"
          >
            <UserCheck className="w-5 h-5 text-white" />
            <span>Acceso Jefes de Obra / Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action: Register Company */}
          <button
            onClick={onStart}
            className="w-full sm:flex-1 h-14 px-6 bg-[#0B101D] hover:bg-[#141C2E] text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Registrar Empresa & Obra</span>
          </button>

          {/* Tertiary Action: Subcontractor Code Access */}
          <button
            onClick={() => navigate('/invitation')}
            className="w-full sm:flex-1 h-14 px-6 bg-[#0B101D] hover:bg-[#141C2E] text-slate-200 hover:text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <FileCheck className="w-5 h-5 text-blue-400" />
            <span>Unirse con Código (Subcontratas)</span>
          </button>
        </div>

        {/* Demo Fast Sandbox Banner */}
        <div className="pt-3">
          <button
            onClick={onDemo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>¿Quieres probar la app de inmediato? <strong>Haz clic aquí para entrar en Modo Demo</strong></span>
          </button>
        </div>

      </div>
    </section>
  );
};
