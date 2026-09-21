import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Autónomo / Pyme',
    price: '29€',
    period: '/mes',
    description: 'Para subcontratas que quieren digitalizar su gestión interna.',
    features: [
      'Hasta 15 trabajadores',
      'Partes diarios ilimitados',
      'Gestión de maquinaria propia',
      'Exportación CSV básica',
      'Soporte por email'
    ],
    cta: 'Empezar ya',
    highlighted: false
  },
  {
    name: 'Constructora Pro',
    price: '149€',
    period: '/mes',
    description: 'La solución completa para gestionar múltiples subcontratas.',
    features: [
      'Trabajadores ilimitados',
      'Generación automática de albaranes',
      'Red de subcontratas conectada',
      'Trazabilidad por proyecto',
      'Exportación PDF/Excel avanzada',
      'Soporte prioritario 24/7'
    ],
    cta: 'Prueba gratuita 14 días',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Consultar',
    period: '',
    description: 'Personalización total para grandes grupos de infraestructura.',
    features: [
      'Despliegue en servidor propio',
      'Integración con ERP (SAP, Navision)',
      'API de red abierta',
      'Formación presencial',
      'Account Manager dedicado'
    ],
    cta: 'Contactar ventas',
    highlighted: false
  }
];

import { toast } from 'react-hot-toast';

export const LandingPricing: React.FC = () => {
  const handleSelectPlan = (planName: string) => {
    toast.success(`Plan ${planName} seleccionado. Redirigiendo...`, {
      style: {
        borderRadius: '16px',
        background: '#1F2329',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    });
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planes adaptados a tu escala</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Desde el control de un solo equipo hasta la gestión de redes nacionales de infraestructura.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-0">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-10 rounded-[2.5rem] border transition-all flex-1 flex flex-col ${
                plan.highlighted 
                ? 'bg-[#1F2329] border-[#FF6600] z-20 lg:scale-105 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]' 
                : 'bg-white/[0.02] border-white/5 lg:my-8 z-10'
              } ${idx === 0 ? 'lg:rounded-r-none lg:border-r-0' : ''} ${idx === 2 ? 'lg:rounded-l-none lg:border-l-0' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl shadow-orange-900/40">
                  Recomendado para Empresas
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 h-12">
                {plan.description}
              </p>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#FF6600]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#FF6600]" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-4 rounded-xl font-bold transition-all cursor-pointer ${
                plan.highlighted
                ? 'bg-[#FF6600] text-white hover:bg-[#E65C00] shadow-lg shadow-[#FF6600]/20'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
