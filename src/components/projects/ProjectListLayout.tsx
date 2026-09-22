import React from 'react';
import { Search, List, MapPin, ChevronRight, ArrowRight, Building2, Sparkles, Pause, Play, Users, FileSpreadsheet, Clock } from 'lucide-react';
import { Project } from '../../types';
import { Table } from '../ui/Table';
import { ClockInButton } from '../ClockInButton';

interface ProjectListLayoutProps {
  filteredProjects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'Active' | 'Paused';
  setStatusFilter: (filter: 'all' | 'Active' | 'Paused') => void;
  viewMode: 'cards' | 'list';
  setViewMode: (mode: 'cards' | 'list') => void;
  getProjectBudgetStats: (project: Project) => any;
  getReportCount: (projectId: string) => number;
  onSelectProject: (project: Project) => void;
  onToggleStatus: (e: React.MouseEvent, project: Project) => void;
  isAdmin: boolean;
  onOpenWizard: () => void;
  defaultCovers: string[];
}

export const ProjectListLayout: React.FC<ProjectListLayoutProps> = ({
  filteredProjects,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  getProjectBudgetStats,
  getReportCount,
  onSelectProject,
  onToggleStatus,
  isAdmin,
  onOpenWizard,
  defaultCovers,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* Search, Status Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0B101D] p-3 rounded-2xl border border-white/10 shadow-lg">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar obra, cliente o dirección..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['all', 'Active', 'Paused'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === filter ? 'bg-[#FF6600] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'Todas' : filter === 'Active' ? 'Activas' : 'Pausadas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Linear Project List */}
      <div className="flex flex-col space-y-3">
        {filteredProjects.map((project) => {
          const stats = getProjectBudgetStats(project);
          const reportCount = getReportCount(project.id);
          const isActive = project.status === 'Active';
          const subCount = (project.assignedSubcontractorIds || []).length;

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-[#0B101D] border border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg hover:border-[#FF6600]/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              {/* Header: Code & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#FF6600]/20 text-[#FF6600] font-mono text-xs font-black">
                    {project.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-bold">
                    {project.projectType || 'Edificación'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => onToggleStatus(e, project)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isActive ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Activa</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-2.5 h-2.5" />
                      <span>Pausada</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Client */}
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {project.name}
                </h2>
                {project.client && (
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Cliente: {project.client}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                  <span className="truncate font-semibold text-slate-300">
                    {project.address || project.location?.address || 'Ubicación registrada'}
                  </span>
                </div>
              </div>

              {/* Operational Stats: Partes & Horas */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-around gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Partes</span>
                  <span className="text-sm font-black text-white">{reportCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Horas</span>
                  <span className="text-sm font-black text-amber-400">{stats.hours} h</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Subcontratas</span>
                  <span className="text-sm font-black text-white">{subCount}</span>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="flex items-center justify-between gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <ClockInButton project={project} variant="compact" />
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6600] group-hover:translate-x-1 transition-transform">
                  <span>Abrir Obra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no projects exist */}
      {filteredProjects.length === 0 && (
        <div className="bg-[#0B101D] border border-white/15 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FF6600]">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {searchQuery ? 'No se encontraron obras coincidentes' : 'No hay obras configuradas'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? 'Prueba con otros términos de búsqueda como el nombre de la obra o dirección.'
                : 'Crea tu primera obra con geocerca GPS para comenzar a registrar partes diarios.'}
            </p>
          </div>

          {isAdmin && !searchQuery && (
            <button
              onClick={onOpenWizard}
              className="px-5 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#FF6600]/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 mx-auto shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar Primera Obra</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
