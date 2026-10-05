import React, { useState } from 'react';
import { 
  X, 
  Leaf, 
  Recycle, 
  Factory, 
  ShieldCheck, 
  Award, 
  BarChart3, 
  TrendingDown, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ESGConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ESGConstructionModal: React.FC<ESGConstructionModalProps> = ({
  isOpen,
  onClose
}) => {
  // ESG Inputs
  const [concreteVolumeM3, setConcreteVolumeM3] = useState<number>(45);
  const [machineryHours, setMachineryHours] = useState<number>(28);
  const [recycledWastePercent, setRecycledWastePercent] = useState<number>(78); // RD 105/2008 requires >= 70%

  // Emissions Calculations (GHG Protocol & Spanish MITECO Factors)
  // Concrete C30/37: ~240 kg CO2 / m3
  // Machinery Diesel: ~2.64 kg CO2 / liter (approx 12L/hour = 31.68 kg CO2/hour)
  const concreteEmissionsKg = Math.round(concreteVolumeM3 * 240);
  const machineryEmissionsKg = Math.round(machineryHours * 31.68);
  const totalScope1And2Tons = Math.round(((concreteEmissionsKg + machineryEmissionsKg) / 1000) * 100) / 100;

  // RD 105/2008 Compliance check
  const rd105Pass = recycledWastePercent >= 70;

  if (!isOpen) return null;

  const handleExportESGReport = () => {
    toast.success('🌱 Memoria de Sostenibilidad ESG y RCDs (RD 105/2008) exportada.', {
      icon: '🍃',
      style: {
        borderRadius: '12px',
        background: '#121215',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-4xl bg-[#121215] border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e0e11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Módulo ESG & Sostenibilidad RCD (RD 105/2008)
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ESG & Sustainability Officer Agent
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Huella de Carbono (Alcance 1 y 2) y Gestión de Residuos de Construcción y Demolición
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal ESG"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Carbon Footprint & RCD Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de Huella de Carbono (MITECO)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Volumen Hormigón C30/37 (m³)</label>
                  <input
                    type="number"
                    value={concreteVolumeM3}
                    onChange={(e) => setConcreteVolumeM3(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Horas Máquina Pesada (h)</label>
                  <input
                    type="number"
                    value={machineryHours}
                    onChange={(e) => setMachineryHours(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 text-center space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Emisiones Totales Estimadas</span>
                <span className="text-2xl font-mono font-black text-emerald-400">{totalScope1And2Tons} Toneladas CO₂e</span>
                <span className="text-[10px] text-zinc-500 block">Factores MITECO Alcance 1 & 2 (GRI 305 / CSRD)</span>
              </div>
            </div>

            {/* RCD Waste Management RD 105/2008 */}
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-400" />
                <span>Gestión de Residuos RCD (RD 105/2008)</span>
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Porcentaje de Valorización / Reciclaje RCD</label>
                  <span className="text-xs font-mono font-bold text-emerald-400">{recycledWastePercent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={recycledWastePercent}
                  onChange={(e) => setRecycledWastePercent(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                rd105Pass ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase font-mono">
                    {rd105Pass ? '✓ CUMPLIMIENTO RD 105/2008 OK' : '⚠ INCUMPLIMIENTO LEGAL RCD'}
                  </span>
                  <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded">Mínimo: 70%</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {rd105Pass 
                    ? 'La obra supera el umbral del 70% de valorización de residuos de construcción y demolición exigido por la normativa estatal.' 
                    : 'Atención: Se requiere enviar más material a planta de valorización autorizada para evitar sanciones de Medio Ambiente.'}
                </p>
              </div>
            </div>
          </div>

          {/* CSRD & Taxonomia UE Compliance Badge */}
          <div className="p-4 rounded-2xl bg-[#18181b] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono">Sello de Transparencia CSRD & Taxonomía UE</h4>
                <p className="text-[11px] text-zinc-400">Certificación de reporte no financiero para contratistas y promotoras públicas en España.</p>
              </div>
            </div>
            <button
              onClick={handleExportESGReport}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte ESG</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#0e0e11] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>GRI 305 / CSRD / Real Decreto 105/2008 regulador de los RCD</span>
          <span className="text-emerald-400 font-bold">Auditoría ESG Activa</span>
        </div>

      </div>
    </div>
  );
};
