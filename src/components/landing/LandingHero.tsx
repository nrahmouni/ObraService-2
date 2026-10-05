import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  MapPin, 
  HardHat, 
  FileText, 
  Clock, 
  Zap, 
  WifiOff, 
  Lock,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { TrustAndComplianceModal } from '../trust/TrustAndComplianceModal';

interface LandingHeroProps {
  onStart: (plan?: string) => void;
  onLogin: () => void;
  onDemo: () => void;
  onJoinCode: () => void;
  onViewPresentation?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ 
  onStart, 
  onLogin, 
  onDemo,
  onJoinCode,
  onViewPresentation
}) => {
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<'report' | 'geofence' | 'delivery_note'>('report');
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [simulatedHours, setSimulatedHours] = useState(8.5);
  const [simulatedExtra, setSimulatedExtra] = useState(1.5);
  const [geofencePassed, setGeofencePassed] = useState(true);

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-[#0B0F17] text-slate-100 border-b border-slate-800/80">
      {/* Precision architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        
        {/* Top Headline Block */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Unboxed Legal & Accreditation Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
            <button
              onClick={() => setTrustModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CUMPLIMIENTO LEGAL LEY 32/2006 · RD 1109/2007 REA</span>
            </button>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-slate-400 hidden sm:inline">PWA Offline-First</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-amber-400/90 font-medium">Sello Criptográfico SHA-256</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
            Partes de Obra Digitales y Albaranes Inmutables <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Sin Disputas en Liquidación
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Plataforma integral para constructoras y subcontratas en España. Fichaje geolocalizado en tajo, cálculo automático de horas por convenio y emisión instantánea de albaranes firmados digitalmente.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => onStart()}
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Comenzar Prueba Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explorar Entorno Demo</span>
            </button>

            {onViewPresentation && (
              <button 
                onClick={onViewPresentation}
                className="w-full sm:w-auto px-5 py-3.5 text-slate-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Ver Keynote</span>
              </button>
            )}
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sin instalación obligatoria (Web & Móvil)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Funciona 100% sin cobertura en zanja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Firma táctil con validez jurídica</span>
            </div>
          </div>
        </div>

        {/* Interactive Live Tajo Simulator Interface */}
        <div className="max-w-5xl mx-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
          
          {/* Window Frame Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">CONSOLA OPERATIVA · OBRA EN EJECUCIÓN: RESIDENCIAL PUERTA DE HIERRO</span>
            </div>

            {/* Segmented Simulator Controls */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveSimulatorTab('report')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeSimulatorTab === 'report' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Parte Diario
              </button>
              <button
                onClick={() => setActiveSimulatorTab('geofence')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeSimulatorTab === 'geofence' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Geocerca GPS
              </button>
              <button
                onClick={() => setActiveSimulatorTab('delivery_note')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeSimulatorTab === 'delivery_note' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Albarán Firmado
              </button>
            </div>
          </div>

          {/* Simulator Content Area */}
          <div className="p-6 sm:p-8">
            {activeSimulatorTab === 'report' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs font-mono text-amber-400">FASE ACTIVA: ESTRUCTURAS & CIMENTACIÓN</div>
                      <h4 className="text-base font-bold text-white mt-0.5">Dotación de Cuadrilla y Registro de Horas</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded">
                      Convenio Construcción Madrid
                    </span>
                  </div>

                  {/* Operational Crew Row Simulation */}
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                          MG
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">Manuel García (Oficial 1ª Ferrallista)</div>
                          <div className="text-slate-400 text-[11px]">Estructuras Metálicas del Norte SL · REA Válido</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-200 font-bold">8.0h Ord.</span> + <span className="text-amber-400 font-bold">1.5h Ext.</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                          AR
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">Antonio Rodríguez (Encofrador)</div>
                          <div className="text-slate-400 text-[11px]">Estructuras Metálicas del Norte SL · REA Válido</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-200 font-bold">8.0h Ord.</span> + <span className="text-amber-400 font-bold">1.0h Ext.</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Adjustment Controls */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">Ajustar horas de cuadrilla de hoy:</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSimulatedExtra(prev => Math.max(0, prev - 0.5))}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono cursor-pointer"
                      >
                        -0.5h
                      </button>
                      <span className="font-mono text-amber-400 font-bold">
                        {simulatedHours}h Ord / {simulatedExtra}h Extra
                      </span>
                      <button 
                        onClick={() => setSimulatedExtra(prev => prev + 0.5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono cursor-pointer"
                      >
                        +0.5h
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                  <div className="text-xs font-mono text-slate-400 uppercase">Resumen en Tiempo Real</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Total Horas Cuadrilla:</span>
                      <span className="font-mono font-bold text-white">{(simulatedHours + simulatedExtra) * 2} h</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Validación Geocerca:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> DENTRO DE TAJO (38m)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Sello Criptográfico:</span>
                      <span className="font-mono text-[11px] text-slate-400">SHA-256: e8b9...4f21</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveSimulatorTab('delivery_note')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Firmar y Generar Albarán Oficial</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeSimulatorTab === 'geofence' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-mono text-amber-400">SISTEMA HAVERSINE SATELITAL</div>
                  <h4 className="text-base font-bold text-white">Geocerca perimetral de la obra sin espionaje continuo</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A diferencia de apps intrusivas de rastreo continuo, ObraService calcula la distancia polar exclusivamente en el milisegundo de emisión del parte para garantizar la presencia física en el tajo cumpliendo el RGPD.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Radio de tolerancia configurado:</span>
                    <span className="font-mono text-amber-400 font-bold">150 metros</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Distancia calculada al punto centro:</span>
                    <span className="font-mono text-emerald-400 font-bold">38.4 metros (VÁLIDO)</span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-5 rounded-lg border border-slate-800 text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-amber-500/40 relative flex items-center justify-center bg-amber-500/5">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold">
                    DISPOSITIVO DENTRO DEL PERÍMETRO
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Lat: 40.4532° N · Lng: -3.6883° W · Precisión: ±4m
                  </div>
                </div>
              </div>
            )}

            {activeSimulatorTab === 'delivery_note' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-mono text-emerald-400">ALBARÁN DIGITAL GENERADO: ALB-2026-0042</div>
                  <h4 className="text-base font-bold text-white">Comprobante Jurídico con Firma Táctil</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Albarán emitido automáticamente para la subcontrata. Ambas partes disponen del documento con sello temporal inalterable, evitando recortes a final de mes.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Emisor:</span>
                      <span className="text-white">Estructuras Metálicas del Norte SL</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Validador:</span>
                      <span className="text-white">Carlos Mendoza (Jefe de Obra)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Unidades:</span>
                      <span className="text-amber-400 font-bold">19.0 Horas Cuadrilla Homologadas</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-5 rounded-lg border border-emerald-800/60 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-bold text-white">Albarán Oficial Validado</div>
                  <div className="text-xs font-mono text-slate-400">
                    Firma digital registrada: 18:42 CET
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 break-all p-2 bg-slate-900 rounded border border-slate-800">
                    HASH: 9c4f7b2a1e8e5d3c6a90b4f8c2e1d7a5b3f9...
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Industrial Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
              &lt; 60 seg
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Emisión de parte en tajo</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums">
              0%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Discrepancias a mes vencido</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
              100%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Modo Offline sin cobertura</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
              SHA-256
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Seguridad jurídica inmutable</div>
          </div>
        </div>

      </div>

      <TrustAndComplianceModal 
        isOpen={trustModalOpen} 
        onClose={() => setTrustModalOpen(false)} 
      />
    </section>
  );
};
