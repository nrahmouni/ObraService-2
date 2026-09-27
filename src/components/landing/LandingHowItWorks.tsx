import React from 'react';
import { 
  Building2, 
  MapPin, 
  Smartphone, 
  FileCheck2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: Building2,
      title: 'Alta de Empresa o Invitación',
      description: 'Registra tu constructora o únete al proyecto al instante introduciendo el código de invitación que te ha facilitado la empresa principal.',
      badge: 'Paso Inicial'
    },
    {
      number: '02',
      icon: MapPin,
      title: 'Configura la Obra y Geocerca',
      description: 'Crea el proyecto con su ubicación exacta, define el radio GPS permitido (geofence) y asigna las cuadrillas y subcontratas autorizadas.',
      badge: 'Configuración'
    },
    {
      number: '03',
      icon: Smartphone,
      title: 'Emite el Parte desde el Móvil',
      description: 'El encargado registra los operarios presentes, las horas ordinarias/extras y la maquinaria directamente en el tajo, con o sin cobertura.',
      badge: 'En Obra'
    },
    {
      number: '04',
      icon: FileCheck2,
      title: 'Valida, Albarán y Certifica',
      description: 'El jefe de obra revisa y valida con un clic. El sistema genera el albarán digital oficial y exporta los informes de liquidación en PDF.',
      badge: 'Cierre Digital'
    }
  ];

  return (
    <section id="como-funciona" className="py-20 sm:py-28 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* Heading */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flujo Operativo Simple</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Cómo Funciona <span className="text-brand-accent">ObraService Pro</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-medium leading-relaxed">
            Del tajo a la oficina técnica en 4 pasos sin fricción, eliminando pérdidas de horas, papeles traspapelados y discrepancias en albaranes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="card p-6 relative flex flex-col justify-between group hover:border-brand-accent/40 transition-all"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-brand-accent/40 group-hover:text-brand-accent transition-colors">
                      {step.number}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-brand-muted">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-brand-border/40 flex items-center gap-1 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  <span>Paso {idx + 1} de 4</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
