import React, { useState } from 'react';
import { 
  Users2, 
  MapPin, 
  HardHat, 
  FileCheck2, 
  ArrowRight, 
  Check, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const LandingCircuit: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Dotación de Cuadrilla en Tajo',
      kicker: 'INICIO DE JORNADA',
      icon: Users2,
      duration: '30 seg',
      summary: 'El encargado de la subcontrata o jefe de cuadrilla abre la app en el móvil y marca a los operarios presentes.',
      points: [
        'Selección con un toque del listado homologado de la subcontrata',
        'Comprobación automática de vigencia de REA y alta en Seguridad Social',
        'Asignación a la fase de obra correspondiente'
      ]
    },
    {
      number: '02',
      title: 'Validación de Geocerca GPS',
      kicker: 'CONTROL PERIMETRAL',
      icon: MapPin,
      duration: 'Instantáneo',
      summary: 'El motor satelital Haversine comprueba que la cuadrilla se encuentra dentro del radio autorizado de la obra.',
      points: [
        'Sin rastreo permanente de batería ni invasión de privacidad personal',
        'Validación matemática del radio polar (ej. 150 metros del centro)',
        'Sello de coordenadas geográficas incrustado en el parte'
      ]
    },
    {
      number: '03',
      title: 'Imputación de Horas y Convenio',
      kicker: 'CÁLCULO AUTOMÁTICO',
      icon: Clock,
      duration: '20 seg',
      summary: 'Desglose exacto de horas ordinarias y extras con maquinaria e incidencias climatológicas registradas.',
      points: [
        'Separación estricta de horas ordinarias vs extras según convenio provincial',
        'Registro de alquiler de maquinaria con horómetro de inicio y fin',
        'Adjuntos fotográficos de tajos terminados y partes de material'
      ]
    },
    {
      number: '04',
      title: 'Validación y Albarán Digital',
      kicker: 'FIRMA & CIERRE INMUTABLE',
      icon: FileCheck2,
      duration: '10 seg',
      summary: 'El jefe de obra revisa en su teléfono y valida con su firma táctil, generando el albarán oficial.',
      points: [
        'Firma manuscrita digitalizada sobre la pantalla del smartphone',
        'Emisión del albarán inalterable con hash criptográfico SHA-256',
        'Ambas partes disponen de la copia oficial en PDF y exportable a CSV'
      ]
    }
  ];

  return (
    <section id="circuito" className="py-20 sm:py-28 bg-[#080B11] text-slate-100 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            EL CIRCUITO DIGITAL CERRADO
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight text-balance">
            De la Zanja al Albarán Validado en 4 Pasos
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Sustituye libretas de papel mojado, cadenas interminables de WhatsApp y discusiones tensas de facturación a mes vencido.
          </p>
        </div>

        {/* Interactive Step Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Step Selector List */}
          <div className="lg:col-span-6 space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = selectedStep === idx;
              return (
                <button
                  key={step.number}
                  onClick={() => setSelectedStep(idx)}
                  className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isActive 
                      ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-sm ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">{step.kicker}</span>
                      <span className="text-[11px] font-mono text-slate-500">{step.duration}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{step.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{step.summary}</p>
                  </div>

                  <ChevronRight className={`w-5 h-5 shrink-0 self-center transition-transform ${
                    isActive ? 'text-amber-400 translate-x-1' : 'text-slate-600'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Card */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">PASO {steps[selectedStep].number} EN DETALLE</span>
                <h3 className="text-xl font-bold text-white mt-1">{steps[selectedStep].title}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                {React.createElement(steps[selectedStep].icon, { className: 'w-6 h-6' })}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {steps[selectedStep].summary}
            </p>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase">Garantías Operativas:</div>
              {steps[selectedStep].points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Resultado del Paso:</span>
              <span className="text-amber-400 font-bold">
                {selectedStep === 3 ? 'Albarán Firmado & Sello SHA-256' : 'Datos Verificados sin Fricción'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
