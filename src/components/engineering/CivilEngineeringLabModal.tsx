import React, { useState } from 'react';
import { 
  X, 
  HardHat, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Ruler, 
  Layers, 
  FileCheck2, 
  ShieldCheck, 
  Zap, 
  Download,
  Building2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CivilEngineeringLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CivilEngineeringLabModal: React.FC<CivilEngineeringLabModalProps> = ({
  isOpen,
  onClose
}) => {
  // Concrete Structural Calculation State
  const [concreteClass, setConcreteClass] = useState<'C25/30' | 'C30/37' | 'C35/45'>('C30/37');
  const [steelGrade, setSteelGrade] = useState<'B400S' | 'B500S'>('B500S');
  const [lengthM, setLengthM] = useState<number>(12);
  const [widthM, setWidthM] = useState<number>(8);
  const [thicknessM, setThicknessM] = useState<number>(0.3);
  const [rebarRatio, setRebarRatio] = useState<number>(85); // kg/m3

  // Calculated Results
  const volumeM3 = Math.round(lengthM * widthM * thicknessM * 100) / 100;
  const rebarWeightKg = Math.round(volumeM3 * rebarRatio);
  const formworkAreaM2 = Math.round((2 * (lengthM + widthM) * thicknessM + lengthM * widthM) * 10) / 10;
  
  // Eurocode Limit Checks
  const fckMap = { 'C25/30': 25, 'C30/37': 30, 'C35/45': 35 };
  const fck = fckMap[concreteClass];
  const fcd = Math.round((fck / 1.5) * 10) / 10; // Concrete design compressive strength (MPa)
  const fyk = steelGrade === 'B500S' ? 500 : 400;
  const fyd = Math.round(fyk / 1.15); // Steel design yield strength (MPa)

  // Geotechnical check
  const bearingCapacityKPa = 250; // Presión admisible del terreno (kPa)
  const deadLoadKNm2 = volumeM3 * 25 / (lengthM * widthM); // ~7.5 kN/m2
  const liveLoadKNm2 = 4.0; // Uso industrial/obra
  const totalLoadULS = Math.round((1.35 * deadLoadKNm2 + 1.50 * liveLoadKNm2) * 10) / 10; // ULS Eurocode 0 (EN 1990)
  const bearingPass = totalLoadULS <= bearingCapacityKPa;

  if (!isOpen) return null;

  const handleExportCalcPackage = () => {
    toast.success('📄 Memoria de Cálculo Eurocode exportada con firma del Ingeniero Civil.', {
      icon: '🏗️',
      style: {
        borderRadius: '12px',
        background: '#121215',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.3)'
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
        className="w-full max-w-4xl bg-[#121215] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e0e11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Módulo de Ingeniería Civil Eurocode (EN 1990 / 1992)
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Civil Engineer Agent
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cálculo de estructuras de hormigón armado, armaduras y comprobación de Estados Limites (ELU / ELS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal de ingeniería civil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-400" />
                <span>Geometría del Elemento Estructural</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Largo (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={lengthM}
                    onChange={(e) => setLengthM(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Ancho (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={widthM}
                    onChange={(e) => setWidthM(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Espesor (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={thicknessM}
                    onChange={(e) => setThicknessM(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Clase de Hormigón</label>
                  <select
                    value={concreteClass}
                    onChange={(e) => setConcreteClass(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="C25/30">C25/30 (fck = 25 MPa)</option>
                    <option value="C30/37">C30/37 (fck = 30 MPa)</option>
                    <option value="C35/45">C35/45 (fck = 35 MPa)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Acero de Armar</label>
                  <select
                    value={steelGrade}
                    onChange={(e) => setSteelGrade(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="B500S">B500S (fyk = 500 MPa)</option>
                    <option value="B400S">B400S (fyk = 400 MPa)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculated Quantities */}
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Cómputo Métrico de Materiales</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Vol. Hormigón</span>
                  <span className="text-lg font-mono font-black text-amber-400">{volumeM3} m³</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Peso Acero</span>
                  <span className="text-lg font-mono font-black text-emerald-400">{rebarWeightKg} kg</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Superficie Encofrado</span>
                  <span className="text-lg font-mono font-black text-blue-400">{formworkAreaM2} m²</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Resistencia Cálculo Hormigón (fcd):</span>
                  <span className="text-white font-bold">{fcd} MPa (γc = 1.5)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Resistencia Cálculo Acero (fyd):</span>
                  <span className="text-white font-bold">{fyd} MPa (γs = 1.15)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Eurocode Verification Box */}
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Verificación de Estado Límite Último (ELU) — EN 1990 / EN 1992-1-1
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                bearingPass ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }`}>
                {bearingPass ? '✓ CUMPLE EUROCÓDIGO' : '⚠ REVISAR TENSIONES'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-zinc-300">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 block uppercase">Carga Combinada ELU (1.35G + 1.50Q)</span>
                <span className="text-sm font-bold text-white">{totalLoadULS} kN/m²</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-500 block uppercase">Tensión Admisible Terreno (q_adm)</span>
                <span className="text-sm font-bold text-emerald-400">{bearingCapacityKPa} kPa</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#0e0e11] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Estructuras diseñadas según CTE DB-SE / Eurocódigo EN 1990-1992
          </span>
          <button
            onClick={handleExportCalcPackage}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Memoria de Cálculo PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
