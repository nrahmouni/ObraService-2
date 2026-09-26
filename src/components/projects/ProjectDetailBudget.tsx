import React from 'react';
import { Clock, FileSpreadsheet, HardHat, Users, Radio, BarChart3, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <FileSpreadsheet className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Partes Diarios</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{reportCount}</div>
            <div className="text-[10px] font-bold text-brand-muted">Total emitidos</div>
          </div>
        </div>

        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Horas de Trabajo</div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-black text-white tabular-nums">{stats.hours}h</div>
            <div className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
               <TrendingUp className="w-3 h-3" />
               <span>Acumulado</span>
            </div>
          </div>
        </div>

        <div className="card p-5 group transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-surface-hover transition-colors">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Consumo Ejecución</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
               <div className="text-2xl font-black text-white tabular-nums">{stats.progressPct}%</div>
            </div>
            <div className="w-full h-1.5 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Control Presencia Card */}
      <div className="card p-6 bg-brand-accent/5 border-brand-accent/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-accent flex items-center justify-center text-white shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Validación de Presencia GPS</h3>
            <p className="text-xs text-brand-muted font-medium mt-1">
              Fichaje habilitado en un radio de <span className="text-brand-accent font-bold">{selectedProject.validationRadiusMeters || 250}m</span> desde el centro de obra.
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
