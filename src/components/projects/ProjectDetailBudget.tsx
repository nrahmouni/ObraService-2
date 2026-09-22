import React from 'react';
import { Clock, FileSpreadsheet, HardHat, Users, Radio } from 'lucide-react';
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
    <div className="space-y-4 font-sans">
      {/* GPS Geofence Presence Controls: Simple single card */}
      <div className="p-4 sm:p-5 bg-[#0B101D] border border-white/15 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black uppercase tracking-wider text-[#FF6600]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Control de Presencia GPS</span>
          </div>
          <p className="text-xs text-slate-300">
            Valida fichajes dentro del perímetro de {selectedProject.validationRadiusMeters || 250} metros.
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0">
          <ClockInButton project={selectedProject} variant="full" />
        </div>
      </div>

      {/* Operational Stats: 3 direct metrics without financial/budget data */}
      <div className="flex flex-col space-y-2">
        <div className="p-4 bg-[#0B101D] rounded-2xl border border-white/10 flex items-center justify-between sm:flex-col sm:items-start">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-[#FF6600]" />
            <span>Partes Emitidos</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{reportCount}</div>
        </div>

        <div className="p-4 bg-[#0B101D] rounded-2xl border border-white/10 flex items-center justify-between sm:flex-col sm:items-start">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Horas en Obra</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.hours} h</div>
        </div>

        <div className="p-4 bg-[#0B101D] rounded-2xl border border-white/10 flex items-center justify-between sm:flex-col sm:items-start">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Subcontratas</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {(selectedProject.assignedSubcontractorIds || []).length}
          </div>
        </div>
      </div>
    </div>
  );
};
