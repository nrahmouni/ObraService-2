import React from 'react';
import { HardHat, AlertTriangle, ArrowLeft, Home, Sparkles, Construction, Ghost } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative" id="not-found-workspace">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Safety Stripes Top */}
      <div className="flex gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-16 h-3 bg-brand-accent/40 -skew-x-[25deg] rounded-full" />
        ))}
      </div>

      <div className="max-w-xl space-y-10 relative z-10">
        
        {/* Custom Icon Grouping */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
           <div className="absolute inset-0 bg-brand-accent/10 rounded-[3rem] rotate-12 animate-pulse" />
           <div className="absolute inset-0 bg-brand-surface border border-brand-border rounded-[3rem] -rotate-6 transition-transform hover:rotate-0 duration-500" />
           <Construction className="w-16 h-16 text-brand-accent relative z-10" />
           <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-2xl border-4 border-brand-bg animate-bounce">
              <Ghost className="w-5 h-5" />
           </div>
        </div>

        {/* Brand & Error Code */}
        <div className="space-y-4">
          <div className="text-[12px] font-black uppercase tracking-[0.4em] text-brand-accent animate-in fade-in duration-1000">Status Error 404</div>
          <h1 className="text-5xl font-display font-black text-white tracking-tight uppercase leading-none">
             Zona Fuera de Límites
          </h1>
          <p className="text-base text-brand-muted font-medium max-w-md mx-auto leading-relaxed">
            La sección de la obra que buscas no está pavimentada o se encuentra bajo reformas estructurales. 
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary h-14 px-10 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Retroceder
          </button>
          <button
            onClick={() => navigate('/app')}
            className="btn-primary h-14 px-10 shadow-[0_0_30px_rgba(255,102,0,0.3)]"
          >
            <Home className="w-5 h-5 mr-2" />
            Panel Central
          </button>
        </div>

        {/* Technical Hint */}
        <div className="pt-8 border-t border-brand-border/30">
           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Verifica el enlace o contacta con Soporte Operativo
           </div>
        </div>
      </div>

      {/* Safety Stripes Footer */}
      <div className="flex gap-4 mt-12 opacity-30 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-16 h-3 bg-brand-muted/20 -skew-x-[25deg] rounded-full" />
        ))}
      </div>

    </div>
  );
};
