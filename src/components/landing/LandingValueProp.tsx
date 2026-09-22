import React from 'react';
import { MapPin, WifiOff, ShieldAlert, CheckCircle2, FileSpreadsheet, Lock, Radio } from 'lucide-react';

export const LandingValueProp: React.FC = () => {
  const pillars = [
    {
      icon: MapPin,
      tag: 'Geocerca Perimetral',
      title: 'Geolocalización Real en Tajo',
      description: 'Cálculo de distancia Haversine en metros para verificar con precisión milimétrica la presencia de capataces y operarios dentro del radio perimetral autorizado de la obra.',
      stat: 'Cero fichajes fraudulentos',
      badgeColor: 'bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/20'
    },
    {
      icon: WifiOff,
      tag: 'Offline-First Engine',
      title: 'Continuidad en Sótanos y Zanjas',
      description: 'Emisión fluida de partes de jornada sin cobertura. Toda la cuadrilla, horas y firmas se encolan de forma segura y se sincronizan instantáneamente al recuperar conectividad.',
      stat: 'Persistencia garantizada',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      icon: ShieldAlert,
      tag: 'Bloqueo Preventivo PRL',
      title: 'Auditoría Legal y Libro de Subcontratación',
      description: 'Control estricto de REA, seguros de RC, reconocimientos médicos y formación PRL. Bloqueo preventivo de subcontratas con documentación caducada según Ley 32/2006.',
      stat: '100% Inmutable y Auditado',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#070B14] border-t border-white/5">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
            Arquitectura de Grado Industrial
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Diseñado para la Realidad del Sector Construcción
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Desde el barro del tajo hasta la mesa de la dirección facultativa y el departamento de compras.
          </p>
        </div>

        {/* 3 Industrial Cards */}
        <div className="flex flex-col space-y-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-[#0B101D] border border-white/10 hover:border-white/20 p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#070B14] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#FF6600]" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
