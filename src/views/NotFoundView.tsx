import React from 'react';
import { HardHat, AlertTriangle, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none" id="not-found-workspace">
      
      {/* Aesthetic Danger Warning Line */}
      <div className="flex gap-2 mb-8 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-12 h-3 bg-amber-400 -skew-x-12 border-y border-amber-500" />
        ))}
      </div>

      <div className="max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
        
        {/* Custom Icon Grouping */}
        <div className="relative mx-auto w-20 h-20 bg-amber-50 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-500 shadow-inner">
          <HardHat className="w-10 h-10 stroke-[2.5]" />
          <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1 rounded-full border border-white">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Brand & Error Code */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">Error 404 — Ruta en Obras</div>
          <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight">¡Zona Fuera de Límites!</h1>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed uppercase">
            La sección de la obra que buscas no está pavimentada o se encuentra bajo reformas de seguridad preventiva.
          </p>
        </div>

        {/* Quick Helper Guidelines */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-left">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 font-bold uppercase leading-normal">
            Verifica que no haya enlaces rotos, o bien regresa a tu panel de control de partes diarios y albaranes.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retroceder
          </button>
          <button
            onClick={() => navigate('/app')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Ir a la Obra
          </button>
        </div>

      </div>

      {/* Safety Stripes Footer */}
      <div className="flex gap-2 mt-8 opacity-60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-12 h-3 bg-slate-900 -skew-x-12 border-y border-slate-950" />
        ))}
      </div>

    </div>
  );
};
