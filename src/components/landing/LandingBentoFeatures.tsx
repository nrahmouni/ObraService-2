import React, { useState } from 'react';
import { 
  MapPin, 
  FileCheck2, 
  WifiOff, 
  ShieldCheck, 
  Clock, 
  Users2, 
  AlertTriangle, 
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  HardHat
} from 'lucide-react';

export const LandingBentoFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'constructora' | 'subcontrata'>('all');

  return (
    <section id="funcionalidades" className="py-20 sm:py-28 bg-[#0B0F17] text-slate-100 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            CAPACIDADES INDUSTRIALES HOMOLOGADAS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight text-balance">
            Construido para el Barro del Tajo, <br />
            Diseñado para la Tranquilidad de Dirección
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Elimina la fricción diaria entre contratas principales y subcontratistas. Un circuito digital cerrado que convierte horas trabajadas en albaranes inmutables al instante.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: 8 cols - High Impact Visual + Daily Reports */}
          <div className="md:col-span-8 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all">
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400">01. CERTIFICACIÓN EN TAJO</span>
                <span className="text-xs font-mono text-slate-500">TIEMPO MEDIO: 45 SEG</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Partes Diarios Digitales con Cálculo Automático por Convenio
              </h3>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Selecciona la cuadrilla en pantalla táctil, imputa horas ordinarias y extraordinarias separadas según el convenio provincial de la construcción, y registra maquinaria e incidencias climatológicas en 3 toques.
              </p>
            </div>

            {/* Visual Media Showcase with Generated High-Fidelity Asset */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950 border-t border-slate-800">
              <img 
                src="/src/assets/images/tablet_site_inspection_1791156161483.jpg" 
                alt="Encargado de obra revisando parte digital en tablet" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-200">Operarios Presentes: 14/14</span>
                </div>
                <span className="text-amber-400 font-bold">112h Ord · 14h Extra</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: 4 cols - Haversine Geofencing */}
          <div className="md:col-span-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-amber-400">02. HAVERSINE GPS</div>
              <h3 className="text-xl font-bold text-white">
                Geocerca Satelital Anti-Falsificación
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Valida que el parte se firme físicamente dentro del radio autorizado de la obra. Sin espionaje continuo a los trabajadores: únicamente valida el sello en el instante de la emisión.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Radio de Tajo:</span>
                <span className="text-slate-200 font-bold">150m</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Privacidad RGPD:</span>
                <span className="text-emerald-400 font-bold">100% Protegida</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: 4 cols - Offline PWA Engine */}
          <div className="md:col-span-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <WifiOff className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-blue-400">03. PWA OFFLINE-FIRST</div>
              <h3 className="text-xl font-bold text-white">
                Operatividad Total Sin Cobertura
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trabaja en sótanos, túneles y zanjas sin señal 4G/5G. Los partes se guardan de forma segura en almacenamiento local cifrado y se sincronizan en cuanto recuperas cobertura.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
                <span>Cola Offline:</span>
                <span className="text-emerald-400 font-bold">Sincronización Automática</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: 8 cols - Legal & Albaranes Inmutables */}
          <div className="md:col-span-8 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400">04. SEGURIDAD JURÍDICA</span>
                <span className="text-xs font-mono text-slate-500">LEY 32/2006 · RD 1109/2007 REA</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Albarán Digital Inalterable con Firma Táctil y Hash SHA-256
              </h3>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                El jefe de obra firma con un dedo sobre la pantalla. Se genera de inmediato el albarán digital oficial e inmutable que sella las unidades ejecutadas, cerrando de raíz las discusiones de facturación a fin de mes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Generación</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">Automática</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Firma Táctil</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">Jefe de Obra</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Exportación</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">PDF Oficial & CSV</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
