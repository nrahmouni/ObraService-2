import React from 'react';
import { MapPin, WifiOff, ShieldAlert, CheckCircle2, Zap, Lock, Smartphone } from 'lucide-react';

export const LandingValueProp: React.FC = () => {
  const pillars = [
    {
      icon: MapPin,
      tag: 'Geolocalización',
      title: 'Geocerca de Precisión',
      description: 'Validación por GPS milimétrico. Asegura que los partes de trabajo se emitan realmente desde el tajo autorizado, eliminando el fraude en el fichaje.',
      stat: 'Cero fichajes fuera de obra',
      color: 'text-brand-accent'
    },
    {
      icon: WifiOff,
      tag: 'Offline-First',
      title: 'Trabajo sin Conexión',
      description: 'Diseñado para sótanos y zonas remotas. La app encola los datos de forma segura y los sincroniza automáticamente al recuperar cobertura.',
      stat: '100% disponibilidad en tajo',
      color: 'text-blue-500'
    },
    {
      icon: ShieldAlert,
      tag: 'Cumplimiento',
      title: 'Seguridad Jurídica PRL',
      description: 'Control estricto de documentación de subcontratas. Bloqueo preventivo de acceso si el REA o los seguros están caducados.',
      stat: 'Conforme Ley 32/2006',
      color: 'text-emerald-500'
    },
    {
      icon: Zap,
      tag: 'Agilidad',
      title: 'Partes en 30 Segundos',
      description: 'Interfaz optimizada para operarios. Menos tiempo escribiendo, más tiempo ejecutando. Automatiza el envío a oficina técnica.',
      stat: 'Ahorro de 12h/semana por jefe',
      color: 'text-amber-500'
    }
  ];

  return (
    <section className="py-24 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Diseñado para la <span className="text-brand-accent">Realidad</span> de la Obra
          </h2>
          <p className="text-brand-muted max-w-2xl mx-auto font-medium">
            No es un software genérico de gestión. Es una herramienta forjada en el barro para constructores que necesitan control real y datos inmutables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="card group hover:border-brand-accent/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center border border-brand-border group-hover:bg-brand-accent transition-colors">
                      <Icon className={`w-6 h-6 ${item.color} group-hover:text-white transition-colors`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-brand-border flex items-center gap-2 text-[10px] font-black uppercase text-brand-accent">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
