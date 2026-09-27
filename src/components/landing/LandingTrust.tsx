import React from 'react';
import { 
  ShieldCheck, 
  WifiOff, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  Layers,
  MapPin
} from 'lucide-react';

export const LandingTrust: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Cumplimiento Normativo Ley 32/2006',
      description: 'Adaptado a los requerimientos de subcontratación en el sector de la construcción en España. Control documental obligatorio y trazabilidad para inspecciones laborales.',
      badge: 'Legal & PRL'
    },
    {
      icon: WifiOff,
      title: 'Arquitectura PWA Offline-First',
      description: 'Garantía de funcionamiento en sótanos, túneles, estructuras de hormigón y zonas rurales sin cobertura. Los datos se encolan localmente y sincronizan al recuperar señal.',
      badge: 'Disponibilidad 100%'
    },
    {
      icon: Lock,
      title: 'Auditoría Inmutable & Cifrado',
      description: 'Registro forense de cada parte diario, albarán emitido o firma registrada con marca temporal inalterable, garantizando transparencia entre contratista y subcontrata.',
      badge: 'Seguridad'
    },
    {
      icon: MapPin,
      title: 'Geolocalización con Google Maps',
      description: 'Integración cartográfica de precisión para cálculo de radios de tajo (geofencing) y validación de presencia física de operarios y maquinaria.',
      badge: 'GPS Precisión'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-brand-surface/30 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Heading */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantías Técnicas & Jurídicas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
            Tecnología Robusta en la que <span className="text-brand-accent">Puedes Confiar</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted font-medium">
            Seguridad de datos, cumplimiento normativo y resiliencia en obra sin compromisos.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="p-5 sm:p-6 bg-brand-surface border border-brand-border rounded-2xl space-y-3 flex flex-col justify-between hover:border-brand-accent/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-brand-muted">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-brand-muted leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/40 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verificado</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
