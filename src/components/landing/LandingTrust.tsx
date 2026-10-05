import React from 'react';
import { 
  ShieldCheck, 
  WifiOff, 
  Lock, 
  MapPin, 
  Check,
  FileCheck2,
  Server
} from 'lucide-react';

export const LandingTrust: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      kicker: 'NORMATIVA ESPAÑOLA',
      title: 'Cumplimiento Integral Ley 32/2006',
      description: 'Adaptado a los requerimientos de subcontratación en el sector de la construcción en España. Control documental obligatorio (REA, TC2, RC) y trazabilidad para inspecciones laborales.',
      stat: 'Seguridad Jurídica'
    },
    {
      icon: WifiOff,
      kicker: 'RESILIENCIA EN OBRA',
      title: 'Arquitectura PWA Offline-First',
      description: 'Garantía de funcionamiento en sótanos, túneles, estructuras de hormigón armado y zonas rurales sin cobertura. Los datos se encolan localmente en IndexedDB y se sincronizan al recuperar señal.',
      stat: 'Disponibilidad 100%'
    },
    {
      icon: Lock,
      kicker: 'CADENA DE CUSTODIA',
      title: 'Auditoría Forense Cifrada SHA-256',
      description: 'Registro inalterable de cada parte diario, albarán emitido o firma registrada con marca temporal y geoposición, garantizando transparencia total entre contratista y subcontrata.',
      stat: 'Inmutabilidad'
    },
    {
      icon: MapPin,
      kicker: 'CARTOGRAFÍA PRECISA',
      title: 'Geolocalización de Tajo por Satélite',
      description: 'Integración cartográfica de precisión para cálculo de radios de tajo (geofencing) y validación de presencia física de cuadrillas y maquinaria en el punto autorizado.',
      stat: 'Fórmula Haversine'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-brand-surface/30 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            GARANTÍAS TÉCNICAS, JURÍDICAS Y OPERATIVAS
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Tecnología Robusta en la que <span className="text-brand-accent">Puedes Confiar</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-muted font-normal leading-relaxed">
            Construido según los estándares más exigentes de la industria constructora: seguridad de datos, cumplimiento normativo y resiliencia en obra.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="card p-6 sm:p-7 flex flex-col justify-between group hover:border-brand-accent/40 transition-all border-white/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-brand-bg border border-white/10 flex items-center justify-center text-brand-accent group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                      {pillar.stat}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-widest">
                      {pillar.kicker}
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-black text-white mt-1 group-hover:text-brand-accent transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed mt-2">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Estándar Activo</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Stack Credibility Banner */}
        <div className="p-6 rounded-2xl bg-brand-bg/80 border border-white/10 flex flex-wrap items-center justify-around gap-6 text-center text-xs font-mono text-brand-muted">
          <div>
            <div className="text-white font-bold text-sm">Servidores Europeos (GDPR)</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Región europe-west (España/Bélgica)</div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10" />
          <div>
            <div className="text-white font-bold text-sm">Cifrado en Tránsito y Reposo</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">TLS 1.3 · AES-256 GCM</div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10" />
          <div>
            <div className="text-white font-bold text-sm">Copias de Seguridad Horarias</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Recuperación ante desastres (RPO &lt; 1h)</div>
          </div>
        </div>

      </div>
    </section>
  );
};
