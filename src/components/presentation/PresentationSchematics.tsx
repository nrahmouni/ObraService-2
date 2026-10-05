import React from 'react';
import { ShieldCheck, MapPin, Layers, Users, Lock, CheckCircle2 } from 'lucide-react';
import { PresentationLang } from './presentationI18n';

interface SchematicProps {
  lang?: PresentationLang;
}

export const BrokenWorkflowSchematic: React.FC<SchematicProps> = () => (
  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs">
    <div className="flex items-center justify-between text-rose-400 font-bold">
      <span>FLUJO ANALÓGICO TRADICIONAL (PAPEL Y WHATSAPP)</span>
      <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">35% Pérdida</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400">
      <div className="p-2 rounded bg-zinc-900 border border-white/5">Parte de Papel</div>
      <div className="p-2 rounded bg-zinc-900 border border-white/5">Transcripción Manual</div>
      <div className="p-2 rounded bg-zinc-900 border border-white/5">Disputas de Cierre</div>
    </div>
  </div>
);

export const SiteCloudOfficeDiagram: React.FC<SchematicProps> = () => (
  <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-3 font-mono text-xs">
    <div className="flex items-center justify-between text-emerald-400 font-bold">
      <span>FLUJO DIGITAL OBRASERVICE PRO</span>
      <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">100% Cierre</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-200">
      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">Fichaje Táctil Tajo</div>
      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">Albarán Inmutable</div>
      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">Conciliación Directa</div>
    </div>
  </div>
);

export const RoleHierarchySchema: React.FC<SchematicProps> = () => (
  <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2 font-mono text-xs text-zinc-300">
    <div className="text-amber-400 font-bold uppercase">Jerarquía Multi-Tenant Permisos</div>
    <div className="flex items-center justify-between text-[11px]">
      <span>Contratista Principal</span>
      <span className="text-amber-400">Admin / Jefe Obra</span>
    </div>
    <div className="flex items-center justify-between text-[11px] text-zinc-400">
      <span>Subcontrata Externa</span>
      <span className="text-emerald-400">Firmante / Operario</span>
    </div>
  </div>
);

export const GeofenceRadarDiagram: React.FC<SchematicProps> = () => (
  <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/20 flex items-center justify-between font-mono text-xs text-zinc-300">
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-blue-400 animate-pulse" />
      <span>Geocerca Haversine GPS (150m)</span>
    </div>
    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Validado en Tajo</span>
  </div>
);
