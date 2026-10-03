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
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
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
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f97316';
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
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#121215]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl overflow-hidden text-left">
      {/* 1. Device Mockup Chrome Bar */}
      <div className="px-5 py-3.5 bg-black/50 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] font-mono text-[#86868b] ml-2">ObraService Pro // Terminal Tajo v4.2</span>
        </div>

        {/* Live Network & GPS Indicators */}
        <div className="flex items-center gap-3">
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
            <span>{isOffline ? 'MODO OFFLINE (IndexedDB)' : 'ONLINE 5G (Cloud Sync)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Feature Tabs */}
      <div className="flex border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto no-scrollbar">
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
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'border-orange-500 text-white bg-white/[0.04]'
                  : 'border-transparent text-[#86868b] hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-[#86868b]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Interactive Stage */}
      <div className="p-6 sm:p-8">
        {/* TAB 1: GEOFENCE CLOCK-IN */}
        {activeTab === 'geofence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Geocerca Haversine Activa (250m)</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Verificación Geodésica en Tiempo Real
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El operario solo puede fichar si sus coordenadas GPS coinciden matemáticamente con el radio de la obra asignada. Cero fichajes falsos desde casa.
              </p>

              {/* Simulation Switcher */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsInsideSite(true);
                    setHasClockedIn(false);
                    presentationAudio.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isInsideSite
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-white/[0.06] text-[#86868b] hover:text-white'
                  }`}
                >
                  Simular "En Obra (38m)"
                </button>
                <button
                  onClick={() => {
                    setIsInsideSite(false);
                    setHasClockedIn(false);
                    presentationAudio.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isInsideSite
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/[0.06] text-[#86868b] hover:text-white'
                  }`}
                >
                  Simular "Fuera (840m)"
                </button>
              </div>
            </div>

            {/* Interactive Phone UI */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-3">
                <span className="font-mono text-[#86868b]">Obra: Metro Línea 5</span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  isInsideSite ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isInsideSite ? 'GPS: 40.4202°N, -3.7041°W (OK)' : 'GPS: Fuera de Zona (DESVÍO)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-1">
                <div className="text-3xl font-mono font-black text-white">
                  07:58:42
                </div>
                <div className="text-[11px] text-[#86868b]">
                  {isInsideSite ? t.insideGeofence : t.outsideGeofence}
                </div>
              </div>

              <button
                onClick={handleClockIn}
                disabled={!isInsideSite || hasClockedIn}
                className={`w-full h-12 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasClockedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isInsideSite
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-98'
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
                    <span>Fichar Entrada Ahora (1 Toque)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Bloqueado: Acércate a la obra</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY REPORT WIZARD */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>Cálculo Automático por Convenio</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Parte Diario Sin Errores Humanos
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El sistema segrega instantáneamente horas ordinarias y extras según las tarifas pactadas de cada subcontrata, evitando discrepancias en la liquidación mensual.
              </p>

              {/* Scrubber Controls */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-white mb-1">
                    <span>Horas Ordinarias (Convenio)</span>
                    <span className="font-mono text-orange-400 font-bold">{ordinarias} h</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={ordinarias}
                    onChange={(e) => setOrdinarias(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
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

            {/* Live Certified Summary Card */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-3">
                <span className="text-white font-bold">Subcontrata: Estructuras Levante S.L.</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  CIF B12345678
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-[#86868b] uppercase font-mono">Coste Ordinario (22€/h)</div>
                  <div className="text-xl font-mono font-bold text-white mt-1">
                    {(ordinarias * 22).toFixed(2)} €
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-[#86868b] uppercase font-mono">Coste Extra (30€/h)</div>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                    {(extras * 30).toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-orange-300 font-bold">Liquidación Certificada del Día</div>
                  <div className="text-[10px] text-zinc-400 font-mono">Total horas: {ordinarias + extras}h</div>
                </div>
                <div className="text-2xl font-mono font-black text-orange-400">
                  {((ordinarias * 22) + (extras * 30)).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNATURE & ALBARAN */}
        {activeTab === 'signature' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                <PenTool className="w-3.5 h-3.5" />
                <span>Albarán con Firma Digital Fechada</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Firma Táctil Directa en Pantalla
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                El encargado de obra y el responsable de la subcontrata firman digitalmente al terminar la jornada. Genera un PDF inmutable con hash criptográfico.
              </p>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 font-mono space-y-1">
                <div>• Sellado de tiempo: {new Date().toLocaleTimeString()}</div>
                <div>• ID Certificado: SHA256:7b91e4a...f8902</div>
                <div>• Validez jurídica conforme eIDAS UE 910/2014</div>
              </div>
            </div>

            {/* Interactive Signature Pad */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 shadow-xl">
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

              <div className="rounded-xl border border-dashed border-white/20 bg-zinc-950/80 overflow-hidden relative h-36 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
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
                    [ Dibuja tu firma aquí ]
                  </div>
                )}
              </div>

              <button
                onClick={certifySignature}
                className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  signatureDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-98'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prevención Solidaria Ley 32/2006</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Semáforo Legal Anti-Sanciones
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Control continuo de certificados REA, pólizas de Responsabilidad Civil y TC2 de seguridad social de subcontratas para evitar responsabilidad subsidiaria ante la ITSS.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 shadow-xl">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Certificado REA (Comunidad de Madrid)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">Válido hasta: 14/11/2026</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  CONFORME
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Póliza Responsabilidad Civil (Mapfre)</div>
                  <div className="text-[10px] text-amber-300 font-mono">Vence en 12 días (Aviso preventivo enviado)</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  ALERTA
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Reconocimiento Médico Cuadrilla (8 operarios)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">100% en vigor</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  AL DÍA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT & OFFLINE QUEUE */}
        {activeTab === 'offline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Pista de Auditoría Forense</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Transparencia Criptográfica Total
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Cada evento (fichaje, aprobación, disputa o edición de horas) genera una entrada inmutable con ID de usuario, timestamp atómico y dirección IP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2.5 font-mono text-[11px] shadow-xl">
              {[
                { time: '17:42:01', action: 'SIGNATURE_ISSUED', entity: 'ALBARAN #ALB-4091-08', actor: 'Carlos Soler' },
                { time: '17:35:14', action: 'REPORT_SUBMITTED', entity: 'PARTE DIARIO #PAR-992', actor: 'Javier Ortiz' },
                { time: '08:01:22', action: 'CLOCK_IN_GEOFENCE', entity: 'OPERARIO Manuel Vega', actor: 'GPS_VALIDATOR' },
              ].map((log, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{log.time}</span>
                    <span className="text-orange-400 font-bold">{log.action}</span>
                  </div>
                  <span className="text-zinc-400 truncate max-w-[120px]">{log.actor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
