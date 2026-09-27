import React from 'react';
import { Check, ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface LandingPricingProps {
  onSelect: (plan: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onSelect }) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Gratuito',
      price: '0€',
      period: 'para siempre',
      description: 'Ideal para autónomos y pequeñas subcontratas de obra.',
      popular: false,
      features: [
        '1 Obra activa simultánea',
        'Hasta 10 operarios móviles registrados',
        'Partes diarios ilimitados con cálculo de horas',
        'Emisión y validación de albaranes digitales',
        'Fichaje GPS con geocerca básica',
        'Sincronización PWA Offline-First',
        'Exportación de informes en PDF estándar'
      ],
      cta: 'Comenzar Gratis',
      ctaStyle: 'btn-secondary'
    },
    {
      id: 'promax',
      name: 'Pro Empresa',
      price: '49€',
      period: '/ mes',
      description: 'La solución completa para constructoras y subcontratas medianas.',
      popular: true,
      features: [
        'Obras y proyectos ilimitados',
        'Operarios y cuadrillas ilimitados',
        'CRM de Clientes y Oportunidades de Licitación',
        'Control preventivo documental PRL/REA con avisos',
        'Cálculo configurable de horas extras por convenio',
        'Generación de API Keys y Webhooks en tiempo real',
        'Exportación avanzada (Excel, CSV, JSON, PDF)',
        'Soporte técnico prioritario'
      ],
      cta: 'Probar Pro 14 Días Gratis',
      ctaStyle: 'btn-primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Corporativo',
      price: 'Consultar',
      period: 'a medida',
      description: 'Para grandes constructoras, infraestructuras y grupos con UTEs.',
      popular: false,
      features: [
        'Multi-empresa y gestión de UTEs centralizada',
        'Registro de auditoría forense extendido',
        'Exportación de datos estructurados para ERPs propios',
        'Single Sign-On (SSO) y control RBAC avanzado',
        'SLA garantizado del 99.9% de disponibilidad',
        'Gestor de cuenta y soporte técnico dedicado',
        'Formación y despliegue in situ'
      ],
      cta: 'Contactar con Ventas',
      ctaStyle: 'btn-secondary'
    }
  ];

  return (
    <section id="precios" className="py-20 sm:py-28 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* Heading */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
            <Zap className="w-3.5 h-3.5" />
            <span>Precios Transparentes</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Planes Claros, <span className="text-brand-accent">Sin Letra Pequeña</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-medium leading-relaxed">
            Escala tu gestión digital a medida que crece el volumen de tus obras. Sin permanencia ni sorpresas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`card p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? 'border-brand-accent shadow-2xl shadow-brand-accent/15 ring-1 ring-brand-accent' 
                  : 'hover:border-brand-accent/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Recomendado</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-display font-black text-white">{plan.price}</span>
                    <span className="text-xs text-brand-muted font-medium">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-brand-muted font-normal leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block mb-3">
                    Incluye:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-brand-muted font-normal">
                        <div className="w-4 h-4 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-brand-accent" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-6">
                <button
                  onClick={() => onSelect(plan.id)}
                  className={`w-full h-11 sm:h-12 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'btn-primary shadow-lg shadow-brand-accent/25'
                      : 'btn-secondary'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Quote Help Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-brand-surface border border-brand-border text-center space-y-2">
          <h4 className="text-sm font-bold text-white">¿Tienes requerimientos especiales o licitaciones públicas de gran envergadura?</h4>
          <p className="text-xs text-brand-muted">
            Configuramos planes corporativos adaptados a tu estructura con soporte de implantación personalizada.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelect('enterprise')}
              className="text-xs font-bold text-brand-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Solicitar propuesta personalizada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
