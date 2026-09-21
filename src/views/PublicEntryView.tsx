import React from 'react';
import { obraStore } from '../services/store';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingValueProp } from '../components/landing/LandingValueProp';
import { LandingAbout } from '../components/landing/LandingAbout';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingAppFlows } from '../components/landing/LandingAppFlows';

interface PublicEntryViewProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
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
          onStart={onOpenRegister} 
          onLogin={onOpenLogin} 
          onDemo={onDemoAccess}
        />
        
        <LandingValueProp />
        
        <LandingAbout />
        
        <LandingAppFlows />

        <section className="py-24 px-6 bg-gradient-to-b from-transparent to-[#FF6600]/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Prefieres ver el sistema en acción?</h2>
            <p className="text-slate-400 text-lg mb-10">
              Accede instantáneamente a un entorno de demostración con proyectos y subcontratas configurados para entender el potencial de la red.
            </p>
            <button
              onClick={onDemoAccess}
              className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-tighter text-lg hover:bg-[#FF6600] hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Entrar en Modo Demo
            </button>
          </div>
        </section>

        <LandingPricing />
      </main>
    </div>
  );
};


