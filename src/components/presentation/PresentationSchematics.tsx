import React from 'react';
import { 
  FileText, 
  MapPin, 
  PenTool, 
  Cloud, 
  Building2, 
  Users, 
  HardHat, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Radio, 
  Cpu, 
  Smartphone, 
  Laptop, 
  Database,
  ArrowRight,
  TrendingDown,
  Layers,
  Lock,
  WifiOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { PresentationLang, PRESENTATION_I18N } from './presentationI18n';

interface SchematicProps {
  lang?: PresentationLang;
}

/**
 * 1. BROKEN WORKFLOW (BEFORE) VS DIGITAL TRACEABILITY (AFTER)
 */
export const BrokenWorkflowSchematic: React.FC<SchematicProps> = ({ lang = 'es' }) => {
  const t = PRESENTATION_I18N[lang].problem;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Broken Workflow Card */}
      <div className="p-5 rounded-3xl bg-rose-500/[0.04] border border-rose-500/20 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-display font-black text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{t.brokenTitle}</span>
          </div>
          <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {t.brokenPill}
          </span>
        </div>

        <div className="space-y-2.5">
          {t.brokenSteps.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/[0.05] hover:border-rose-500/30 transition-colors">
              <span className="font-mono text-xs font-black text-rose-400 shrink-0">{item.step}</span>
              <div>
                <div className="text-xs font-bold text-white leading-none">{item.title}</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Digital Flow Card */}
      <div className="p-5 rounded-3xl bg-emerald-500/[0.04] border border-emerald-500/25 backdrop-blur-xl space-y-4 shadow-xl shadow-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-display font-black text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.solutionTitle}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {t.solutionPill}
          </span>
        </div>

        <div className="space-y-2.5">
          {t.solutionSteps.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-black/50 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <span className="font-mono text-xs font-black text-emerald-400 shrink-0">{item.step}</span>
              <div>
                <div className="text-xs font-bold text-white leading-none">{item.title}</div>
                <div className="text-[11px] text-zinc-300 mt-1 leading-snug">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 2. JOB SITE ↔ CLOUD ↔ OFFICE DATA FLOW DIAGRAM (WITH OFFLINE BUFFER)
 */
export const SiteCloudOfficeDiagram: React.FC<SchematicProps> = ({ lang = 'es' }) => {
  const t = PRESENTATION_I18N[lang].solution;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 rounded-[32px] bg-[#161617]/85 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-6">
      <div className="text-center space-y-1.5">
        <h4 className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-sky-400">
          {t.diagramSubtitle}
        </h4>
        <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
          {t.diagramTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg mx-auto font-normal leading-relaxed">
          {t.diagramDesc}
        </p>
      </div>

      {/* Responsive Diagram Grid with Animated Data Lines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Node 1: Job Site (Tajo) */}
        <div className="p-5 rounded-[24px] bg-black/60 border border-brand-accent/30 space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-brand-accent font-black tracking-wider block">{t.node1Tag}</span>
            <div className="text-sm font-black text-white uppercase mt-0.5">{t.node1Title}</div>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">{t.node1Desc}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/70 border border-dashed border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-[10px]">{t.node1Pill}</span>
          </div>
        </div>

        {/* Node 2: Cloud Engine */}
        <div className="p-5 rounded-[24px] bg-gradient-to-b from-zinc-900/90 to-black/80 border border-sky-500/30 space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-sky-400 font-black tracking-wider block">{t.node2Tag}</span>
            <div className="text-sm font-black text-white uppercase mt-0.5">{t.node2Title}</div>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">{t.node2Desc}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/70 border border-sky-500/20 text-[11px] text-sky-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-mono text-[10px]">{t.node2Pill}</span>
          </div>
        </div>

        {/* Node 3: Office / Central Console */}
        <div className="p-5 rounded-[24px] bg-black/60 border border-emerald-500/30 space-y-3 relative group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-black tracking-wider block">{t.node3Tag}</span>
            <div className="text-sm font-black text-white uppercase mt-0.5">{t.node3Title}</div>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">{t.node3Desc}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-black/70 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-[10px]">{t.node3Pill}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. MULTI-TENANT ROLE HIERARCHY SCHEMA (RBAC MATRIX)
 */
export const RoleHierarchySchema: React.FC<SchematicProps> = ({ lang = 'es' }) => {
  const t = PRESENTATION_I18N[lang].benefits;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 rounded-[32px] bg-[#161617]/85 border border-white/[0.08] backdrop-blur-2xl space-y-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">{t.rbacSubtitle}</span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">{t.rbacTitle}</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-[#86868b] font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.rbacPill}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {t.rbacCards.map((card, i) => (
          <div key={i} className="p-4 rounded-[20px] bg-black/50 border border-white/[0.06] hover:border-emerald-500/30 transition-all space-y-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] text-emerald-400 flex items-center justify-center font-bold">
              {i === 0 && <Building2 className="w-4 h-4" />}
              {i === 1 && <Users className="w-4 h-4" />}
              {i === 2 && <Layers className="w-4 h-4" />}
              {i === 3 && <HardHat className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold">{card.level}</span>
              <div className="text-xs font-bold text-white mt-0.5">{card.title}</div>
              <div className="text-[9px] font-mono text-[#86868b] truncate">{card.sub}</div>
            </div>
            <p className="text-[11px] text-[#86868b] leading-snug pt-1">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. HAVERSINE GEOFENCE RADAR DIAGRAM
 */
export const GeofenceRadarDiagram: React.FC<SchematicProps> = ({ lang = 'es' }) => {
  const t = PRESENTATION_I18N[lang].services;

  return (
    <div className="w-full max-w-sm mx-auto p-5 rounded-[24px] bg-[#161617]/90 border border-white/[0.08] text-center space-y-3 backdrop-blur-2xl shadow-xl">
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-dashed border-orange-500/30 animate-spin" style={{ animationDuration: '14s' }} />
        <div className="absolute inset-2.5 rounded-full border border-orange-500/20" />
        <div className="absolute inset-6 rounded-full border border-emerald-500/30 bg-emerald-500/[0.04]" />
        
        {/* Center Obra Point */}
        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/50 z-10">
          <MapPin className="w-2.5 h-2.5" />
        </div>
        
        {/* Worker GPS Point Ping */}
        <div className="absolute top-7 right-8 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div className="absolute top-7 right-8 w-2.5 h-2.5 rounded-full bg-emerald-400 z-10" />
      </div>
      <div>
        <div className="text-xs font-bold text-white uppercase tracking-tight">{t.radarTitle}</div>
        <div className="text-[10px] text-[#86868b] mt-0.5 font-mono">{t.radarDesc}</div>
      </div>
    </div>
  );
};
