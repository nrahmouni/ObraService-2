import React from 'react';
import { Clock, FileSpreadsheet, Radio, BarChart3, TrendingUp } from 'lucide-react';
import { Project } from '../../types';
import { ClockInButton } from '../ClockInButton';

interface ProjectDetailBudgetProps {
  selectedProject: Project;
  reportCount: number;
  stats: {
    budget: number;
    spent: number;
    progressPct: number;
    hours: number;
  };
}

export const ProjectDetailBudget: React.FC<ProjectDetailBudgetProps> = ({
  selectedProject,
  reportCount,
  stats,
}) => {
  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-brand-accent">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partes Diarios</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{reportCount}</div>
            <div className="text-xs font-semibold text-slate-400">Total emitidos</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horas Trabajadas</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{stats.hours}h</div>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
               <TrendingUp className="w-3.5 h-3.5" />
               <span>Acumulado</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consumo de Presupuesto</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
               <div className="text-2xl font-black text-white tabular-nums">{stats.progressPct}%</div>
               <span className="text-xs font-bold text-slate-300">{stats.spent.toLocaleString('es-ES')} €</span>
            </div>
            <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${stats.progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Control Presencia Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-accent flex items-center justify-center text-white shrink-0 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Validación de Presencia GPS</h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Fichaje habilitado en un radio de <span className="text-brand-accent font-bold">{selectedProject.validationRadiusMeters || 250}m</span> desde el centro de la obra.
            </p>
          </div>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <ClockInButton project={selectedProject} variant="full" />
        </div>
      </div>
    </div>
  );
};
