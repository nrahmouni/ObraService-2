import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, DollarSign, Clock } from 'lucide-react';

export const LandingCalculator: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [activeProjects, setActiveProjects] = useState(3);
  const [subcontractorsPerProject, setSubcontractorsPerProject] = useState(4);
  const [averageHourlyCost, setAverageHourlyCost] = useState(24);

  // Math: 1.5 hours wasted per day per project on reconciliation & disputes = 30 hours/month/project
  const monthlyHoursSaved = activeProjects * subcontractorsPerProject * 6.5;
  const estimatedMonthlySavings = Math.round(monthlyHoursSaved * averageHourlyCost);
  const annualDisputesAvoided = activeProjects * subcontractorsPerProject * 12;

  return (
    <section className="py-20 sm:py-28 bg-[#0B0F17] text-slate-100 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            IMPACTO ECONÓMICO REAL
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight text-balance">
            Calcula el Retorno de Inversión en Tus Obras
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Descubre cuántas horas administrativas y cuánto dinero recupera tu constructora al digitalizar los partes diarios en tajo.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Obras activas simultáneas:</span>
                <span className="text-amber-400 font-bold text-sm">{activeProjects} obras</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={activeProjects} 
                onChange={(e) => setActiveProjects(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Subcontratas por obra (media):</span>
                <span className="text-amber-400 font-bold text-sm">{subcontractorsPerProject} empresas</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={subcontractorsPerProject} 
                onChange={(e) => setSubcontractorsPerProject(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Coste medio/hora equipo técnico:</span>
                <span className="text-amber-400 font-bold text-sm">{averageHourlyCost} €/h</span>
              </div>
              <input 
                type="range" 
                min="18" 
                max="50" 
                step="2"
                value={averageHourlyCost} 
                onChange={(e) => setAverageHourlyCost(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              Basado en auditorías reales en el sector de la construcción en España: reducción de 85% en tiempo de cotejo de horas y 0% de penalizaciones por falta de REA/PRL.
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="text-xs font-mono text-amber-400 font-bold">ESTIMACIÓN DE AHORRO MENSUAL</div>
            
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                {estimatedMonthlySavings.toLocaleString('es-ES')} € <span className="text-sm font-normal text-slate-400">/ mes</span>
              </div>
              <div className="text-xs text-emerald-400 font-mono font-medium">
                ≈ {(estimatedMonthlySavings * 12).toLocaleString('es-ES')} € ahorro anual estimado
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Horas Reclamadas / Mes</div>
                <div className="text-xl font-bold text-white font-mono mt-1 tabular-nums">
                  {Math.round(monthlyHoursSaved)} h
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Disputas Evitadas / Año</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1 tabular-nums">
                  {annualDisputesAvoided} albaranes
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Digitalizar Mis Obras Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
