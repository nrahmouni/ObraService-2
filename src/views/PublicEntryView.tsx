import React from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingValueProp } from '../components/landing/LandingValueProp';
import { LandingAbout } from '../components/landing/LandingAbout';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingAppFlows } from '../components/landing/LandingAppFlows';
import { Sparkles, ArrowRight } from 'lucide-react';

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
  return (
    <div className="flex flex-col">
      <main>
        <LandingHero 
          onStart={() => onOpenRegister()} 
          onLogin={onOpenLogin} 
          onDemo={onDemoAccess}
        />
        
        <LandingValueProp />
        
        <LandingAbout />
        
        <LandingAppFlows />

        {/* High Conversion Demo Intermezzo Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[#FF6600]/5 to-transparent border-y border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[#FF6600] text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Entorno Interactivo Preparado
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">¿Prefieres ver el sistema en acción ahora mismo?</h2>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Explora una obra real con cuadrillas de ferralla, albaranes de hormigón firmados y geocercas GPS activas en menos de 5 segundos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onDemoAccess}
                className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-[#FF6600] hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acceder al Entorno Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenRegister()}
                className="w-full sm:w-auto bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-white/15 transition-all border border-white/10 active:scale-95 cursor-pointer"
              >
                Crear Cuenta de Empresa
              </button>
            </div>
          </div>
        </section>

        {/* Pricing with registered callback */}
        <LandingPricing onOpenRegister={onOpenRegister} />
      </main>
    </div>
  );
};
