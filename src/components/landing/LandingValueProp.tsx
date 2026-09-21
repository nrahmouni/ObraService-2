import React from 'react';
import { MapPin, WifiOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LandingValueProp: React.FC = () => {
  const blocks = [
    {
      num: '01',
      icon: MapPin,
      title: 'Fichaje por Geolocalización en Obra',
      subtitle: 'Validación automática por radio de coordenadas GPS',
      description: 'El sistema valida de forma automática que el operario o jefe de equipo se encuentre dentro del radio perimetral autorizado de la obra (ej. 200m). Cero fichajes fuera de tajo.',
      accent: 'text-amber-500',
      badge: 'Precisión GPS Real'
    },
    {
      num: '02',
      icon: WifiOff,
      title: 'Partes Diarios con Modo Offline',
      subtitle: 'Cero pérdida de datos en sótanos y zonas sin cobertura',
      description: 'Diseñado específicamente para entornos de construcción difíciles. Los operarios pueden registrar horas, cuadrillas e incidencias sin conexión; se sincronizan automáticamente al recuperar señal.',
      accent: 'text-blue-400',
      badge: 'Resiliencia Total'
    },
    {
      num: '03',
      icon: ShieldAlert,
      title: 'Control Automático de PRL',
      subtitle: 'Bloqueo preventivo de subcontratas con documentación caducada',
      description: 'Verificación en tiempo real de TC1/TC2, seguros de responsabilidad civil y cursos de prevención de riesgos. El operario no puede acceder al tajo si falta documentación homologada.',
      accent: 'text-emerald-400',
      badge: 'Cumplimiento Ley 32/2006'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-slate-950 border-t border-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 font-mono">Arquitectura Industrial</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pilares Técnicos para Operativa de Obra
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Sistemas robustos diseñados para capataces, jefes de obra y dirección facultativa.
          </p>
        </div>

        {/* 3 Clean Stacked Blocks (No complex grids) */}
        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div 
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  <block.icon className={`w-7 h-7 ${block.accent}`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500">{block.num}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {block.badge}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{block.title}</h4>
                  <p className="text-xs font-medium text-amber-500/90">{block.subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1 max-w-xl">
                    {block.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end md:self-center text-xs font-bold text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Activo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
