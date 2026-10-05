import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LandingPricingProps {
  onSelect: (plan: string) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onSelect }) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Gratuito',
      kicker: 'AUTÓNOMOS Y CUADRILLAS',
      price: '0€',
      period: 'para siempre',
      description: 'Ideal para autónomos y pequeñas subcontratas de obra que inician su digitalización.',
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
      kicker: 'CONSTRUCTORAS Y SUBCONTRATAS',
      price: '49€',
      period: '/ mes',
      description: 'La solución completa de control para constructoras medianas y subcontratas en múltiples tajos.',
      popular: true,
      features: [
        'Obras y proyectos ilimitados',
        'Operarios y cuadrillas ilimitados',
        'CRM de Clientes y Oportunidades de Licitación',
        'Control preventivo documental PRL/REA con alertas a 15/7/1 días',
        'Cálculo configurable de horas extras según convenio laboral',
        'Generación de API Keys y Webhooks en tiempo real',
        'Exportación avanzada (Excel, CSV, JSON, PDF certificado)',
        'Soporte técnico prioritario y asistencia en tajo'
      ],
      cta: 'Probar Pro 14 Días Gratis',
      ctaStyle: 'btn-primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Corporativo',
      kicker: 'GRANDES CONSTRUCTORAS & UTES',
      price: 'A Medida',
      period: 'facturación anual',
      description: 'Para grandes grupos de infraestructuras, edificación masiva y gestión centralizada de UTEs.',
      popular: false,
      features: [
        'Multi-empresa y gestión de UTEs centralizada',
        'Registro de auditoría forense extendido con marca SHA-256',
        'Exportación estructurada de datos (PDF, CSV, Excel) y Webhooks de API en vivo',
        'Single Sign-On (SSO / SAML) y permisos RBAC a medida',
        'SLA garantizado del 99.9% de disponibilidad operativa',
        'Gestor de cuenta y soporte técnico 24/7',
        'Formación y despliegue in situ para jefes de obra'
      ],
      cta: 'Contactar con Ventas',
      ctaStyle: 'btn-secondary'
    }
  ];

  return (
    <section id="precios" className="py-20 sm:py-28 bg-brand-bg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="text-xs font-mono font-bold tracking-widest text-brand-accent uppercase">
            PLANES OPERATIVOS TRANSPARENTES
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Tarifas Claras, <span className="text-brand-accent">Sin Permanencia</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-normal leading-relaxed">
            Sin costes ocultos por usuario adicional. Elige el plan que se adapte al volumen de obras y operarios de tu constructora.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`card p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 border-white/10 ${
                plan.popular 
                  ? 'border-brand-accent shadow-2xl shadow-brand-accent/20 ring-1 ring-brand-accent bg-brand-surface/90' 
                  : 'hover:border-white/20 bg-brand-surface/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-mono font-black uppercase tracking-widest px-3 py-0.5 rounded shadow-lg border border-orange-400">
                  Plan Más Elegido en Construcción
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-widest">
                    {plan.kicker}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="border-y border-white/10 py-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-white tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-xs text-brand-muted font-mono uppercase">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
                    Incluye en este plan:
                  </div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Action */}
              <div className="pt-8">
                <button
                  onClick={() => onSelect(plan.id)}
                  className={`w-full h-12 uppercase tracking-wider text-xs font-bold gap-2 cursor-pointer justify-center flex items-center ${
                    plan.popular ? 'btn-primary shadow-xl shadow-brand-accent/25' : 'btn-secondary'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Legal & SLA Assurance */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted font-medium pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Factura española con IVA desglosado</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-accent" />
            <span>Activación instantánea en 2 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Cancela o cambia de plan cuando quieras</span>
          </div>
        </div>

      </div>
    </section>
  );
};
