import React from 'react';
import { Clock } from 'lucide-react';
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
    <div className="space-y-6 font-sans">
      {/* Budget and Financial Progression */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              Avance de Presupuesto Asignado
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-100">
                {stats.spent.toLocaleString('es-ES')} €
              </span>
              <span className="text-xs font-bold text-slate-400">
                de {stats.budget.toLocaleString('es-ES')} €
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              stats.progressPct > 90 
                ? 'bg-rose-950/50 text-rose-400 border border-rose-800' 
                : stats.progressPct > 70 
                  ? 'bg-amber-950/50 text-amber-400 border border-amber-800' 
                  : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800'
            }`}>
              {stats.progressPct}% Ejecutado
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              stats.progressPct > 90 
                ? 'bg-rose-500' 
                : stats.progressPct > 70 
                  ? 'bg-amber-500' 
                  : 'bg-brand-accent'
            }`}
            style={{ width: `${stats.progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">
          <span>Remanente: {(stats.budget - stats.spent).toLocaleString('es-ES')} €</span>
          <span>Horas imputadas: {stats.hours} H</span>
        </div>
      </div>

      {/* GPS Geofence Presence Controls */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black uppercase tracking-widest text-brand-accent">
            <Clock className="w-4 h-4" />
            <span>Control de Presencia GPS (Radio {selectedProject.validationRadiusMeters}m)</span>
          </div>
          <p className="text-xs text-slate-400">
            Los operarios y encargados pueden fichar su jornada comprobando la ubicación en tiempo real.
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0">
          <ClockInButton project={selectedProject} variant="full" />
        </div>
      </div>

      {/* Rhythmic Metric Grid (Clean and modern, avoiding stacked generic layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/60">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Partes Emitidos</div>
          <div className="text-xl font-black text-slate-200">{reportCount}</div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Validación digital</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/60">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Horas Acumuladas</div>
          <div className="text-xl font-black text-brand-accent">{stats.hours} H</div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Mano de obra</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/60">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Radio Geofence</div>
          <div className="text-xl font-black text-slate-200">{selectedProject.validationRadiusMeters} m</div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Perímetro satelital</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-xl border border-slate-800/60">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Subcontratas</div>
          <div className="text-xl font-black text-slate-200">
            {(selectedProject.assignedSubcontractorIds || []).length}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Empresas en red</span>
        </div>
      </div>
    </div>
  );
};
