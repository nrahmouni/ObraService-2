import React from 'react';
import { 
  FileCheck, 
  FileText, 
  MapPin, 
  ShieldAlert, 
  History, 
  Users2,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';

export const LandingValueProp: React.FC = () => {
  const features = [
    {
      icon: FileCheck,
      tag: 'Partes de Trabajo',
      title: 'Partes Diarios de Obra Digitales',
      description: 'Registro ágil de personal, cuadrillas, maquinaria e incidencias climáticas a pie de obra. Cálculo automático de horas ordinarias y extras según convenio laboral.',
      stat: 'Cálculo por convenio',
      color: 'text-brand-accent',
      borderColor: 'group-hover:border-brand-accent/50'
    },
    {
      icon: FileText,
      tag: 'Albaranes y Suministros',
      title: 'Albaranes Digitales Inmutables',
      description: 'Generación automática de albaranes al validar partes de trabajo. Gestión de firmas electrónicas, discrepancias de medición y control de materiales.',
      stat: 'Firma y trazabilidad',
      color: 'text-blue-400',
      borderColor: 'group-hover:border-blue-500/50'
    },
    {
      icon: MapPin,
      tag: 'Geocerca GPS',
      title: 'Geolocalización y Radio en Tajo',
      description: 'Control de presencia asistencial con validación de perímetro GPS. El sistema verifica que los fichajes y partes se emitan dentro del radio de obra autorizado.',
      stat: 'Validación por satélite',
      color: 'text-emerald-400',
      borderColor: 'group-hover:border-emerald-500/50'
    },
    {
      icon: ShieldAlert,
      tag: 'Seguridad y PRL',
      title: 'Control Preventivo Documental',
      description: 'Supervisión activa de certificados REA, TC2 y pólizas de Responsabilidad Civil. Alertas automáticas con 15, 7 y 1 día de antelación antes de su vencimiento.',
      stat: 'Conforme Ley 32/2006',
      color: 'text-amber-400',
      borderColor: 'group-hover:border-amber-500/50'
    },
    {
      icon: History,
      tag: 'Auditoría Forense',
      title: 'Historial de Auditoría Inalterable',
      description: 'Cada validación técnica, corrección, creación de operario o certificación queda registrada con marca temporal y usuario responsable, lista ante inspecciones.',
      stat: 'Registro inmutable',
      color: 'text-purple-400',
      borderColor: 'group-hover:border-purple-500/50'
    },
    {
      icon: Users2,
      tag: 'Multi-Empresa',
      title: 'Red Contratista & Subcontratas',
      description: 'Espacio de trabajo compartido donde la empresa principal y sus subcontratas colaboran con roles segmentados y códigos de invitación seguros.',
      stat: 'Acceso por invitación',
      color: 'text-cyan-400',
      borderColor: 'group-hover:border-cyan-500/50'
    }
  ];

  return (
    <section id="funciones" className="py-20 sm:py-28 bg-brand-surface/40 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
            <Zap className="w-3.5 h-3.5" />
            <span>Funcionalidades Operativas Reales</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Diseñado para la <span className="text-brand-accent">Realidad del Tajo</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-medium leading-relaxed">
            Herramientas construidas para resolver los problemas reales de control, medición y seguridad jurídica en las obras de edificación y obra civil.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className={`card p-6 sm:p-7 group transition-all duration-300 flex flex-col justify-between ${item.borderColor}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center border border-brand-border group-hover:border-brand-accent/40 transition-colors shrink-0">
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-brand-border/60 flex items-center gap-2 text-[11px] font-bold text-brand-accent">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
