import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Network } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onLogin, onDemo }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-[#FF6600] rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#FF6600] text-sm font-medium mb-8">
          <Zap className="w-4 h-4 fill-current" />
          <span>Nueva Red de Intercambio Digital 2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          La Red de Confianza para la <span className="text-[#FF6600]">Ingeniería y Construcción</span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Digitalizamos la cadena de suministro en obra. Partes diarios, albaranes automáticos y trazabilidad total entre contratas y subcontratas en una única red descentralizada.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-[#FF6600] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#E65C00] transition-all transform hover:scale-105"
          >
            Empezar Ahora Gratis
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onDemo}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-[#FF6600] hover:text-white transition-all transform hover:scale-105 shadow-xl shadow-white/5"
          >
            Probar Demo
          </button>
          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            Acceso Empresas
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-20 w-full max-w-5xl relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6600] to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[#0F0F12] border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
          <img 
            src="/images/dashboard-preview.jpg" 
            alt="ObraService Dashboard Preview" 
            className="w-full rounded-lg opacity-90 shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent"></div>
        </div>
      </motion.div>
    </section>
  );
};
