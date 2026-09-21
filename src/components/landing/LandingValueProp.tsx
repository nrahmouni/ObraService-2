import React from 'react';
import { motion } from 'motion/react';
import { Zap, Clock, FileCheck, Users, BarChart3, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Ahorro de Tiempo Crítico',
    description: 'Reduce en un 85% el tiempo dedicado a la gestión de partes diarios y la picada de albaranes manual.'
  },
  {
    icon: FileCheck,
    title: 'Validación Automática',
    description: 'Los albaranes se generan automáticamente a partir de los partes aprobados, eliminando errores de facturación.'
  },
  {
    icon: Users,
    title: 'Coordinación entre Empresas',
    description: 'Principal y subcontratas comparten la misma información en tiempo real. Se acabaron las disputas por datos.'
  },
  {
    icon: Shield,
    title: 'Trazabilidad Total',
    description: 'Registro inmutable de cada acción, firma y cambio. Cumplimiento legal y técnico asegurado.'
  },
  {
    icon: Zap,
    title: 'Agilidad de Pago',
    description: 'Al tener albaranes validados al instante, los ciclos de certificación y pago se acortan drásticamente.'
  },
  {
    icon: BarChart3,
    title: 'Control de Costes Real',
    description: 'Visualiza el coste de personal y maquinaria por proyecto al final de cada jornada, no al final del mes.'
  }
];

export const LandingValueProp: React.FC = () => {
  return (
    <section id="benefits" className="py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">¿Qué agilizamos en tu obra?</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Eliminamos el "cuello de botella" administrativo de la construcción para que tu equipo se centre en lo que importa: construir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
          {benefits.map((benefit, idx) => {
            // Create asymmetrical distribution
            const spanClass = idx === 0 
              ? 'md:col-span-6 lg:col-span-8' // Large first item
              : idx === 1 
              ? 'md:col-span-6 lg:col-span-4' // Medium second item
              : 'md:col-span-3 lg:col-span-4'; // Regular items

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${spanClass} p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#FF6600]/30 transition-all group flex flex-col justify-between`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#FF6600]/20">
                    <benefit.icon className="w-6 h-6 text-[#FF6600]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{benefit.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                    {benefit.description}
                  </p>
                </div>
                {idx === 0 && (
                  <div className="mt-12 flex items-center gap-2 text-[#FF6600] font-bold text-sm uppercase tracking-widest">
                    <span>Métrica de eficiencia real</span>
                    <div className="h-px flex-1 bg-[#FF6600]/20" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
