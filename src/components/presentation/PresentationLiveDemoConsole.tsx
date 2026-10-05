import React, { useState, useRef } from 'react';
import { 
  Smartphone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  FileText, 
  PenTool, 
  ShieldCheck, 
  Clock, 
  Layers, 
  RotateCcw,
  Sparkles,
  Lock,
  Radio,
  FileCheck
} from 'lucide-react';
import { PresentationLang, PRESENTATION_I18N } from './presentationI18n';
import { presentationAudio } from '../../utils/presentationAudio';

interface PresentationLiveDemoConsoleProps {
  lang?: PresentationLang;
}

export const PresentationLiveDemoConsole: React.FC<PresentationLiveDemoConsoleProps> = ({
  lang = 'es',
}) => {
  const t = PRESENTATION_I18N[lang].liveDemo;
  const [activeTab, setActiveTab] = useState<'geofence' | 'report' | 'signature' | 'offline' | 'compliance'>('geofence');
  const [isOffline, setIsOffline] = useState(false);
  const [isInsideSite, setIsInsideSite] = useState(true);
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [ordinarias, setOrdinarias] = useState(8);
  const [extras, setExtras] = useState(1.5);
  
  // Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
    presentationAudio.playTick();
  };

  const certifySignature = () => {
    setSignatureDone(true);
    presentationAudio.playTransition();
  };

  const handleClockIn = () => {
    if (isInsideSite) {
      setHasClockedIn(true);
      presentationAudio.playTransition();
    } else {
      presentationAudio.playTick();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-[#121215]/95 border border-white/[0.08] backdrop-blur-2xl shadow-2xl overflow-hidden text-left">
      {/* 1. Device Mockup Chrome Bar */}
      <div className="px-3.5 sm:px-5 py-3 bg-black/60 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-mono text-[#86868b] ml-1 sm:ml-2 truncate">
            ObraService Pro · Terminal Tajo
          </span>
        </div>

        {/* Live Network & GPS Indicators */}
        <div className="shrink-0">
          <button
            onClick={() => {
              setIsOffline(!isOffline);
              presentationAudio.playTick();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
            title="Haz clic para simular pérdida de red"
          >
            {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span className="hidden sm:inline">{isOffline ? 'MODO OFFLINE (IndexedDB)' : 'ONLINE (Cloud Sync)'}</span>
            <span className="sm:hidden">{isOffline ? 'OFFLINE' : 'ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Feature Tabs (Scrollable on mobile) */}
      <div className="flex border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'geofence', label: t.tabs.geofence, icon: MapPin },
          { id: 'report', label: t.tabs.dailyReport, icon: FileText },
          { id: 'signature', label: t.tabs.signatures, icon: PenTool },
          { id: 'compliance', label: t.tabs.compliance, icon: ShieldCheck },
          { id: 'offline', label: t.tabs.auditLedger, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                presentationAudio.playTick();
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 shrink-0 ${
                isActive
                  ? 'border-amber-500 text-white bg-white/[0.04]'
                  : 'border-transparent text-[#86868b] hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-[#86868b]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Interactive Stage */}
      <div className="p-4 sm:p-6 md:p-8">
        
        {/* TAB 1: GEOFENCE CLOCK-IN */}
        {activeTab === 'geofence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Geocerca Haversine Activa (250m)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Verificación Geodésica en Tiempo Real
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El operario solo puede fichar si sus coordenadas GPS coinciden matemáticamente con el radio de la obra asignada.
              </p>

              {/* Simulation Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsInsideSite(true);
                    setHasClockedIn(false);
                    presentationAudio.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isInsideSite
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-white/[0.06] text-[#86868b] hover:text-white'
                  }`}
                >
                  En Obra (38m)
                </button>
                <button
                  onClick={() => {
                    setIsInsideSite(false);
                    setHasClockedIn(false);
                    presentationAudio.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isInsideSite
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/[0.06] text-[#86868b] hover:text-white'
                  }`}
                >
                  Fuera (840m)
                </button>
              </div>
            </div>

            {/* Interactive Phone UI */}
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 sm:space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2.5">
                <span className="font-mono text-[#86868b] text-[11px]">Obra: Metro Línea 5</span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  isInsideSite ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isInsideSite ? 'GPS: OK (38m)' : 'DESVÍO (+840m)'}
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                  07:58:42
                </div>
                <div className="text-[11px] text-[#86868b]">
                  {isInsideSite ? t.insideGeofence : t.outsideGeofence}
                </div>
              </div>

              <button
                onClick={handleClockIn}
                disabled={!isInsideSite || hasClockedIn}
                className={`w-full h-11 sm:h-12 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasClockedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isInsideSite
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 active:scale-98'
                    : 'bg-white/[0.05] text-[#86868b] cursor-not-allowed border border-white/5'
                }`}
              >
                {hasClockedIn ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.clockInSuccess}</span>
                  </>
                ) : isInsideSite ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Confirmar Entrada en Tajo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Fuera de Perímetro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY REPORT HOURS */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Cálculo Automático por Convenio</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Parte Diario Sin Errores de Liquidación
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El sistema segrega instantáneamente horas ordinarias y extras según las tarifas pactadas de cada subcontrata.
              </p>

              {/* Scrubber Controls */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-white mb-1">
                    <span>Horas Ordinarias (Convenio)</span>
                    <span className="font-mono text-amber-400 font-bold">{ordinarias} h</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={ordinarias}
                    onChange={(e) => setOrdinarias(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-white mb-1">
                    <span>Horas Extra Autorizadas</span>
                    <span className="font-mono text-amber-400 font-bold">{extras} h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={extras}
                    onChange={(e) => setExtras(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Certified Summary Card */}
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 sm:space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2.5">
                <span className="text-white font-bold truncate">Estructuras Levante S.L.</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  CIF B12345678
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-[#86868b] uppercase font-mono">Ord (22€/h)</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                    {(ordinarias * 22).toFixed(2)} €
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-[#86868b] uppercase font-mono">Extra (30€/h)</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-amber-400 mt-0.5">
                    {(extras * 30).toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-amber-300 font-bold">Liquidación Certificada</div>
                  <div className="text-[10px] text-zinc-400 font-mono">{ordinarias + extras} horas validadas</div>
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                  {((ordinarias * 22) + (extras * 30)).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNATURE & ALBARAN */}
        {activeTab === 'signature' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                <PenTool className="w-3.5 h-3.5" />
                <span>Albarán con Firma Digital Fechada</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Firma Táctil Directa en Pantalla
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El encargado de obra y el subcontratista firman digitalmente al terminar la jornada, generando un albarán inmutable con sello SHA-256.
              </p>
            </div>

            {/* Signature Pad */}
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-bold">{t.signPrompt}</span>
                <button
                  onClick={clearCanvas}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.clearSignature}</span>
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-white/20 bg-zinc-950/80 overflow-hidden relative h-32 sm:h-36 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={144}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!signatureDone && (
                  <div className="absolute pointer-events-none text-zinc-600 text-xs font-mono">
                    [ Dibuja tu firma táctil aquí ]
                  </div>
                )}
              </div>

              <button
                onClick={certifySignature}
                className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  signatureDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 active:scale-98'
                }`}
              >
                {signatureDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.signatureCertified}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t.certifySignature}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE PRL & REA */}
        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prevención Solidaria Ley 32/2006</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Semáforo Legal Anti-Sanciones
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Control continuo de certificados REA, pólizas de Responsabilidad Civil y TC2 de seguridad social de subcontratas.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/[0.08] space-y-2.5 shadow-xl">
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-400">Certificado REA Vigente</div>
                  <div className="text-[10px] text-zinc-400">Caduca en 84 días</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-400">Seguro Resp. Civil (RC)</div>
                  <div className="text-[10px] text-zinc-400">Póliza 300.000€ al corriente</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-amber-400">Aptitud Médica (PRL)</div>
                  <div className="text-[10px] text-zinc-400">1 renovación pendiente (12 días)</div>
                </div>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFLINE AUDIT LEDGER */}
        {activeTab === 'offline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Libro de Auditoría Inmutable</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Trazabilidad Criptográfica SHA-256
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Cada modificación, firma y sincronización genera un bloque encadenado permanente sin posibilidad de manipulación retroactiva.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/[0.08] space-y-2 text-[11px] font-mono shadow-xl">
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">GENESIS_PARTE_0042</span>
                <span className="text-emerald-400">VALID</span>
              </div>
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">GPS_HAVERSINE_LOCK</span>
                <span className="text-emerald-400">38.4m</span>
              </div>
              <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">DIGITAL_SIGNATURE_SEAL</span>
                <span className="text-amber-400">e8b94f...</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
