import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2, Building2, Clock, FileCheck } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onLogin, onDemo }) => {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-16 overflow-hidden">
      {/* Subtle Corporate Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[8%] left-[25%] w-80 h-80 bg-[#FF6600]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[15%] right-[20%] w-96 h-96 bg-blue-600/10 rounded-full blur-[160px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl text-center"
      >
        {/* Trust Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#FF6600]" />
          <span className="text-amber-400 font-bold">Nueva Versión 2.4</span>
          <span className="text-slate-500">•</span>
          <span>Red Digital para Contratistas y Subcontratas</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-[1.08] text-white">
          La Red de Confianza para el <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#FF6600] via-orange-400 to-amber-300 bg-clip-text text-transparent">
            Control de Obra y Subcontratas
          </span>
        </h1>
        
        {/* Clear Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed font-normal">
          Digitaliza partes diarios en obra, valida albaranes de entrega con firma digital conforme a la 
          <strong className="text-white font-semibold"> Ley 32/2006</strong> y elimina el 85% de las disputas económicas entre contratas y subcontratistas.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-7 py-4 bg-[#FF6600] text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-all shadow-xl shadow-orange-950/40 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Empezar Prueba Gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onDemo}
            className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ver Demo en Vivo</span>
          </button>

          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-6 py-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
          >
            Acceso Empresas
          </button>
        </div>

        {/* Micro-copy Trust Points */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium flex-wrap mb-12">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Prueba de 14 días sin coste
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Sin tarjeta de crédito
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Configuración en 2 minutos
          </span>
        </div>
      </motion.div>

      {/* Hero Dashboard Preview Card with Live Metrics */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-5xl relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6600]/30 to-blue-500/20 rounded-3xl blur-xl opacity-60"></div>
        <div className="relative bg-[#0F172A] border border-white/15 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
          {/* Mock Browser/App Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">app.obraservice.es/dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Auditoría Sincronizada
              </span>
            </div>
          </div>

          {/* Metric Teaser Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="bg-[#1E293B]/80 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partes Validados</div>
              <div className="text-xl font-black text-white mt-0.5">142 <span className="text-xs text-emerald-400 font-bold">+18 hoy</span></div>
            </div>
            <div className="bg-[#1E293B]/80 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Albaranes Firmados</div>
              <div className="text-xl font-black text-[#FF6600] mt-0.5">38 <span className="text-xs text-slate-400 font-normal">100% legal</span></div>
            </div>
            <div className="bg-[#1E293B]/80 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcontratas Activas</div>
              <div className="text-xl font-black text-white mt-0.5">12 <span className="text-xs text-slate-400 font-normal">en red</span></div>
            </div>
            <div className="bg-[#1E293B]/80 p-3 rounded-2xl border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Control GPS</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">200m <span className="text-xs text-slate-400 font-normal">geocerca</span></div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img 
              src="/images/dashboard-preview.jpg" 
              alt="ObraService Dashboard Preview" 
              className="w-full object-cover max-h-[420px]"
              onError={(e) => {
                // Fallback image if local file missing
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
            
            {/* Overlay CTA inside the preview */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <div className="text-xs font-bold text-white">¿Listo para conectar a tus Jefes de Obra y Subcontratas?</div>
                  <div className="text-[11px] text-slate-300">Empieza con tu constructora y despliega en minutos.</div>
                </div>
              </div>
              <button
                onClick={onStart}
                className="px-4 py-2 bg-[#FF6600] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#EA580C] transition-all shrink-0 cursor-pointer"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
