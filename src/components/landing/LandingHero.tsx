import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building2, UserCheck, FileCheck } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onLogin, onDemo }) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-[80vh]: min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 bg-slate-950">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        
        {/* Industrial Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Plataforma Industrial B2B • Control de Obra Sin Papeles</span>
        </div>

        {/* Main Technical Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Control Integral de Obras, Partes y Subcontratas en Tiempo Real
        </h1>

        {/* Concise Technical Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Plataforma homologada para el control geolocalizado de personal, emisión inmutable de partes de tajo y bloqueo preventivo de PRL.
        </p>

        {/* 3 Massive Action Buttons (Vertical on mobile, horizontal on desktop) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-3xl mx-auto w-full">
          {/* Primary Button */}
          <button
            onClick={onLogin}
            className="w-full sm:flex-1 h-14 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95 border border-amber-500/30"
          >
            <UserCheck className="w-5 h-5 text-white" />
            <span>Iniciar Sesión en Campo / Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Button */}
          <button
            onClick={onStart}
            className="w-full sm:flex-1 h-14 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-3 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>Crear Empresa y Dar de Alta Obra</span>
          </button>

          {/* Tertiary Button */}
          <button
            onClick={() => navigate('/invitation')}
            className="w-full sm:flex-1 h-14 px-6 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-3 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            <FileCheck className="w-5 h-5 text-blue-400" />
            <span>Unirse a Obra (Subcontratas)</span>
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            onClick={onDemo}
            className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
          >
            ¿Quieres explorar una obra de prueba con datos reales? Clic aquí para acceder al Entorno Demo
          </button>
        </div>

      </div>
    </section>
  );
};
