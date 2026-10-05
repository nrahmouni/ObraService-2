import React, { useState } from 'react';
import { 
  Rocket, 
  Smartphone, 
  Apple, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Play, 
  Pause, 
  RefreshCw, 
  Terminal, 
  Copy, 
  Download, 
  FileCode, 
  Layers, 
  Cpu, 
  Activity, 
  ArrowRight,
  ExternalLink,
  Lock,
  Radio,
  FileCheck
} from 'lucide-react';
import { AppState } from '../types';
import toast from 'react-hot-toast';

interface MobileReleaseViewProps {
  state: AppState;
}

export const MobileReleaseView: React.FC<MobileReleaseViewProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'fastlane' | 'rollout' | 'compliance'>('checklist');
  const [rolloutPaused, setRolloutPaused] = useState(false);
  const [rolloutDay, setRolloutDay] = useState(3);
  const [copiedFastfile, setCopiedFastfile] = useState(false);

  // Pre-submission Checklist state
  const [checklist, setChecklist] = useState([
    { id: 'version', label: 'Semantic Version & Monotonic Build bumped (v2.4.1 / Build 142)', category: 'Core', checked: true },
    { id: 'signing', label: 'iOS Distribution Certificate & Provisioning Profile match (Fastlane Match synced)', category: 'iOS', checked: true },
    { id: 'keystore', label: 'Play App Signing Upload Key verified (SHA-256 fingerprint validated)', category: 'Android', checked: true },
    { id: 'privacy_ios', label: 'Apple Privacy Manifest (NSPrivacyAccessedAPITypes & Geolocation reason defined)', category: 'iOS', checked: true },
    { id: 'fg_service', label: 'Android 14+ Foreground Service Type (location + dataSync) declared', category: 'Android', checked: true },
    { id: 'symbols', label: 'dSYMs & ProGuard/R8 deobfuscation mapping files uploaded to Crashlytics', category: 'Health', checked: true },
    { id: 'offline_mode', label: 'Offline cache & IndexedDB sync tested in Airplane mode (zero data loss)', category: 'QA', checked: true },
    { id: 'wcag', label: 'Touch targets >= 48px & Contrast ratio >= 4.5:1 (WCAG 2.1 AA compliant)', category: 'QA', checked: true },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const allChecked = checklist.every(c => c.checked);

  const rolloutPercentages = [
    { day: 1, pct: '1%', desc: 'Canary / Internal testers' },
    { day: 2, pct: '2%', desc: 'Initial early adopters' },
    { day: 3, pct: '5%', desc: 'Early production monitor' },
    { day: 4, pct: '10%', desc: 'Confidence ramp' },
    { day: 5, pct: '25%', desc: 'Broad scale validation' },
    { day: 6, pct: '50%', desc: 'General availability ramp' },
    { day: 7, pct: '100%', desc: 'Full public deployment' },
  ];

  const fastfileCode = `# ObraService Pro Fastfile
# Managed by Mobile Release Engineer Agent
default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    setup_ci
    match(type: "appstore", readonly: true)
    increment_build_number(build_number: "142")
    build_app(
      scheme: "ObraServicePro",
      export_method: "app-store",
      clean: true
    )
    upload_to_testflight(
      distribute_external: true,
      groups: ["Jefes de Obra", "Encargados"],
      changelog: "v2.4.1: Geocerca GPS Haversine, firma táctil de albaranes y partes diarios sin conexión."
    )
    upload_symbols_to_crashlytics
  end
end

platform :android do
  desc "Build AAB and deploy to Google Play Closed Testing"
  lane :beta do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(
      track: "closed-testing",
      aab: "build/app/outputs/bundle/release/app-release.aab",
      release_status: "draft"
    )
    upload_symbols_to_crashlytics
  end
end`;

  const copyFastfile = () => {
    navigator.clipboard.writeText(fastfileCode);
    setCopiedFastfile(true);
    toast.success('Fastfile copiado al portapapeles');
    setTimeout(() => setCopiedFastfile(false), 2000);
  };

  return (
    <div className="w-full max-w-[1440px] min-w-0 mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121215] via-[#1a1c23] to-[#121215] border border-brand-accent/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              Mobile Release Hub
            </span>
            <span className="text-zinc-400 font-mono text-xs">· App Store & Google Play</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Consola de Despliegue Móvil
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Pipeline automatizado de firmas criptográficas, checklists de conformidad y despliegue escalonado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-right">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Versión Objetivo</div>
            <div className="text-base font-mono font-black text-amber-400">v2.4.1 <span className="text-xs text-zinc-400">(#142)</span></div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-right">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Salud de Versión</div>
            <div className="text-base font-mono font-black text-emerald-400">99.94% Crash-Free</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'checklist' 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : 'bg-white/[0.04] text-zinc-400 hover:text-white'
          }`}
        >
          Checklist Pre-Envío ({checklist.filter(c => c.checked).length}/{checklist.length})
        </button>

        <button
          onClick={() => setActiveTab('rollout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rollout' 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : 'bg-white/[0.04] text-zinc-400 hover:text-white'
          }`}
        >
          Despliegue Escalonado (Día {rolloutDay} · {rolloutPercentages[rolloutDay-1]?.pct})
        </button>

        <button
          onClick={() => setActiveTab('fastlane')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'fastlane' 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : 'bg-white/[0.04] text-zinc-400 hover:text-white'
          }`}
        >
          Pipeline Fastlane CI/CD
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'compliance' 
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
              : 'bg-white/[0.04] text-zinc-400 hover:text-white'
          }`}
        >
          Políticas & Privacidad Stores
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Criterios de Aprobación de Lanzamiento</h2>
                  <p className="text-xs text-zinc-400">Todos los puntos deben estar validados antes de promover el binario.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${allChecked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                  {allChecked ? 'READY TO SHIP' : 'PENDING GATES'}
                </span>
              </div>

              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      item.checked 
                        ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-white' 
                        : 'bg-white/[0.02] border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        item.checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-zinc-600'
                      }`}>
                        {item.checked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Identificadores Oficiales</h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 block">iOS Bundle Identifier</span>
                  <span className="font-mono font-bold text-amber-400">es.obraservice.pro</span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 block">Android ApplicationId</span>
                  <span className="font-mono font-bold text-emerald-400">es.obraservice.pro</span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 block">Min SDK / Target SDK</span>
                  <span className="font-mono text-zinc-200">iOS 16.0+ · Android API 34 (14)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Garantía de Roll-Forward</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Los binarios de apps móviles nunca admiten rollback directo en dispositivos. Ante cualquier anomalía crítica, el sistema pausa el despliegue al 5% y lanza el parche de avance inmediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rollout' && (
        <div className="p-6 rounded-2xl bg-[#121215] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Monitor de Despliegue Progresivo (7 Días)</h2>
              <p className="text-xs text-zinc-400">Estrategia escalonada para mitigar riesgos en producción con control de umbral.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRolloutPaused(!rolloutPaused);
                  toast(rolloutPaused ? '▶️ Despliegue reanudado' : '⏸️ Despliegue pausado de emergencia');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  rolloutPaused 
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {rolloutPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{rolloutPaused ? 'Reanudar Rollout' : 'Pausar Emergencia'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {rolloutPercentages.map((step) => {
              const isCurrent = step.day === rolloutDay;
              const isPast = step.day < rolloutDay;
              return (
                <div
                  key={step.day}
                  onClick={() => setRolloutDay(step.day)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    isCurrent 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-lg shadow-amber-500/20' 
                      : isPast
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.02] border-white/10 text-zinc-500'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase">Día {step.day}</div>
                  <div className="text-xl font-mono font-black my-1">{step.pct}</div>
                  <div className="text-[9px] leading-tight opacity-80">{step.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Live Release Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Crash-Free Sessions</span>
                <span className="text-emerald-400 font-bold">99.94%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '99.94%' }} />
              </div>
              <div className="text-[10px] text-zinc-500">Umbral mínimo de seguridad: 99.50%</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Tasa de ANR (App Not Responding)</span>
                <span className="text-emerald-400 font-bold">0.08%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }} />
              </div>
              <div className="text-[10px] text-zinc-500">Límite crítico Play Console: 0.47%</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Dispositivos Activos Actualizados</span>
                <span className="text-amber-400 font-bold">3,420 u.</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '35%' }} />
              </div>
              <div className="text-[10px] text-zinc-500">Sin incidencias de geoposición reportadas</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fastlane' && (
        <div className="p-6 rounded-2xl bg-[#121215] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Fastfile de Producción</h2>
            </div>
            <button
              onClick={copyFastfile}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFastfile ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFastfile ? 'Copiado' : 'Copiar Fastfile'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
            {fastfileCode}
          </pre>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Apple className="w-4 h-4 text-amber-400" />
              <span>Apple App Store Guidelines (5.1.1 & 2.1)</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <strong className="text-amber-400 block mb-1">NSLocationWhenInUseUsageDescription:</strong>
                "ObraService Pro utiliza tu ubicación para verificar el fichaje dentro de la geocerca oficial de la obra asignada según el convenio colectivo."
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <strong className="text-amber-400 block mb-1">NSCameraUsageDescription:</strong>
                "ObraService Pro utiliza la cámara para adjuntar evidencias fotográficas a los partes diarios de trabajo."
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Google Play Policies (Target API 34)</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <strong className="text-emerald-400 block mb-1">Foreground Service (Location):</strong>
                Declarado formalmente para el seguimiento de cuadrillas durante horas de jornada laboral bajo consentimiento de prevención.
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <strong className="text-emerald-400 block mb-1">Data Safety Form:</strong>
                Datos encriptados en tránsito (TLS 1.3) y en reposo (AES-256). Sin venta de datos a terceros.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
