import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const LandingPricing: React.FC<{ onSelect: (plan: string) => void }> = ({ onSelect }) => {
  const plans: PricingPlan[] = [
    {
      name: "Starter",
      price: "0€",
      description: "Para pequeños equipos y autónomos.",
      features: [
        "Hasta 3 usuarios",
        "1 Obra activa",
        "Partes diarios ilimitados",
        "Sincronización offline",
        "Soporte por email"
      ],
      cta: "Empezar Gratis"
    },
    {
      name: "Pro",
      price: "49€",
      description: "La solución completa para constructoras medianas.",
      features: [
        "Usuarios ilimitados",
        "Obras ilimitadas",
        "Gestión de subcontratas",
        "Control documental PRL",
        "Geolocalización avanzada",
        "Exportación ERP (Excel/PDF)",
        "Soporte prioritario"
      ],
      cta: "Prueba Gratis 14 días",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Consultar",
      description: "Para grandes grupos con necesidades complejas.",
      features: [
        "Integración vía API",
        "SSO / Active Directory",
        "Servidor dedicado (opcional)",
        "Account Manager dedicado",
        "Formación in-situ",
        "SLA garantizado"
      ],
      cta: "Contactar Ventas"
    }
  ];

  return (
    <section className="py-24 bg-brand-bg relative overflow-hidden" id="precios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Planes Claros, <span className="text-brand-accent">Sin Sorpresas</span>
          </h2>
          <p className="text-brand-muted max-w-2xl mx-auto font-medium">
            Escala tu gestión digital a medida que crece tu empresa. 
            Cancela cuando quieras, sin permanencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`card flex flex-col justify-between p-8 relative ${
                plan.popular ? 'border-brand-accent shadow-2xl shadow-brand-accent/10 ring-1 ring-brand-accent' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Más Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.price !== "Consultar" && <span className="text-brand-muted font-medium">/mes</span>}
                  </div>
                  <p className="mt-4 text-sm text-brand-muted font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-brand-muted font-medium">
                      <div className="w-5 h-5 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand-accent" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelect(plan.name)}
                className={`mt-10 w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90' 
                    : 'bg-brand-surface text-white border border-brand-border hover:bg-brand-surface-hover'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-brand-surface border border-brand-border text-center">
          <p className="text-sm text-brand-muted font-medium">
            ¿Necesitas un presupuesto a medida para una obra específica?{' '}
            <a href="mailto:hola@obraservice.com" className="text-brand-accent font-bold hover:underline">Habla con nuestro equipo comercial</a>
          </p>
        </div>
      </div>
    </section>
  );
};
