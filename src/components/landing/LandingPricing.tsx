import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck, Sparkles, Building2, HardHat, FileSignature, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface LandingPricingProps {
  onOpenRegister?: (planName?: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenRegister }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      name: 'Subcontrata Especialista',
      badge: 'Para Empresas Instaladoras y Cuadrillas',
      description: 'Ideal para gremios, electricistas, fontanería, ferralla y autónomos que trabajan bajo contrata principal.',
      monthlyPrice: '49',
      annualPrice: '39',
      cta: 'Empezar Prueba Gratuita',
      popular: false,
      features: [
        'Hasta 15 operarios registrados',
        'Partes diarios móviles con fotos ilimitadas',
        'Firma digital táctil de albaranes',
        'Exportación PDF homologada',
        'Validación de geolocalización GPS 200m',
        'Soporte prioritario por WhatsApp y Chat',
      ],
    },
    {
      name: 'Constructora Pro',
      badge: 'El Estándar B2B de la Construcción',
      description: 'Para contratistas principales y medianas constructoras que coordinan múltiples obras y subcontratistas.',
      monthlyPrice: '149',
      annualPrice: '119',
      cta: 'Empezar Prueba Gratuita (14 días)',
      popular: true,
      features: [
        'Obras y proyectos ilimitados',
        'Red de subcontratas ilimitada',
        'Panel de control de costes y presupuesto en tiempo real',
        'Doble validación de partes de trabajo',
        'Generación y sellado automático de albaranes',
        'Exportación contable (Excel / CSV / ERP)',
        'Auditoría inmutable de trazabilidad',
        'Onboarding personalizado para jefes de obra',
      ],
    },
    {
      name: 'Corporativo & Enterprise',
      badge: 'Grandes Constructoras Nacionales',
      description: 'Para empresas con más de 10 obras simultáneas que requieren cumplimiento estricto y conexión con su ERP.',
      monthlyPrice: '299',
      annualPrice: '249',
      cta: 'Solicitar Prueba Enterprise',
      popular: false,
      features: [
        'Todo lo de Constructora Pro',
        'Acceso completo a la API REST & Webhooks',
        'Integración directa con SAP, Navision, Presto',
        'Certificado de custodia documental legal 5 años',
        'SLA 99.9% garantizado por contrato',
        'Gerente de cuenta técnico asignado',
        'Módulo a medida de prevención de riesgos (PRL)',
      ],
    },
  ];

  const handleCtaClick = (planName: string) => {
    if (onOpenRegister) {
      onOpenRegister(planName);
    } else {
      toast.success(`Abriendo registro para el plan ${planName}...`);
    }
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#090D16] via-[#0F172A] to-[#090D16]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
            <span>Precios Transparentes para el Sector</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 text-white tracking-tight">
            Planes Diseñados para Cada Rol en Obra
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Empieza con 14 días de prueba sin coste. Sin permanencia ni tarjetas de crédito requeridas.
          </p>

          {/* Billing Cycle Selector */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 rounded-full bg-[#1E293B] border border-white/10 p-1 flex items-center transition-colors cursor-pointer"
              aria-label="Alternar facturación mensual o anual"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#FF6600] transition-transform duration-200 ${
                  billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              Anual
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                Ahorra 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col space-y-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-[#131C31] border-2 border-[#FF6600] shadow-2xl shadow-orange-950/30 scale-100 lg:-translate-y-2'
                  : 'bg-[#0F172A] border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF6600] text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Más Recomendado para Constructoras
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider mb-2">
                  {plan.badge}
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}€
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/mes + IVA</span>
                  {billingCycle === 'annual' && (
                    <span className="text-[10px] text-slate-400 ml-2">(facturado anualmente)</span>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ¿Qué incluye?
                  </div>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleCtaClick(plan.name)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-[#FF6600] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-950/40 active:scale-95'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[10px] text-center text-slate-400 mt-3">
                  Prueba de 14 días • Sin compromiso
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Callout / Security Guarantee */}
        <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center shrink-0 text-[#FF6600]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">¿Tienes más de 15 obras o requerimientos específicos?</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Ofrecemos acuerdos marco corporativos, formación in-situ para encargados y servidores dedicados.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCtaClick('Enterprise Corporativo')}
            className="px-6 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
          >
            Hablar con un Especialista
          </button>
        </div>
      </div>
    </section>
  );
};
