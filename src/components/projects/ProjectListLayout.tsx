import React from 'react';
import { Search, List, MapPin, ChevronRight, ArrowRight, Building2, Sparkles, Pause, Play, Users, FileSpreadsheet, Clock, Grid } from 'lucide-react';
import { Project } from '../../types';
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
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código o cliente..."
            className="input-field pl-10 h-11 text-xs"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex flex-1 sm:flex-initial bg-brand-surface border border-brand-border p-1 rounded-xl">
            {(['all', 'Active', 'Paused'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider sm:tracking-widest whitespace-nowrap min-h-[38px] transition-all text-center ${
                  statusFilter === filter 
                    ? 'bg-brand-accent text-white shadow-lg' 
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                {filter === 'all' ? 'Todas' : filter === 'Active' ? 'Activas' : 'Pausadas'}
              </button>
            ))}
          </div>
          
          <div className="flex bg-brand-surface border border-brand-border p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('cards')}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${viewMode === 'cards' ? 'bg-brand-bg text-brand-accent shadow-sm' : 'text-brand-muted'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${viewMode === 'list' ? 'bg-brand-bg text-brand-accent shadow-sm' : 'text-brand-muted'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const stats = getProjectBudgetStats(project);
            const reportCount = getReportCount(project.id);
            const isActive = project.status === 'Active';
            const subCount = (project.assignedSubcontractorIds || []).length;
            const cover = project.coverImage || defaultCovers[idx % defaultCovers.length];

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="card group cursor-pointer overflow-hidden hover:border-brand-accent/40 transition-all duration-500"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={cover} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 to-transparent" />
                  <div className="absolute top-4 right-4">
                     <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                     }`}>
                        {isActive ? 'Activa' : 'Pausada'}
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                     <span className="px-2 py-0.5 rounded bg-brand-accent text-white font-mono text-[9px] font-black uppercase">
                        {project.code}
                     </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-brand-muted font-medium mt-1">
                      <Building2 className="w-3 h-3 text-brand-accent" />
                      <span className="truncate">{project.client || 'Sin cliente'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-brand-border py-4">
                    <div className="text-center">
                       <div className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Partes</div>
                       <div className="text-sm font-black text-white mt-0.5">{reportCount}</div>
                    </div>
                    <div className="text-center border-x border-brand-border">
                       <div className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Horas</div>
                       <div className="text-sm font-black text-white mt-0.5">{stats.hours}h</div>
                    </div>
                    <div className="text-center">
                       <div className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Empresas</div>
                       <div className="text-sm font-black text-white mt-0.5">{subCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                     <div onClick={(e) => e.stopPropagation()}>
                        <ClockInButton project={project} variant="compact" />
                     </div>
                     <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface/50">
                  <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Código / Nombre</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest text-center">Actividad</th>
                  <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Estado</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-brand-surface/30 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-accent font-mono text-[10px] font-black">
                            {project.code}
                          </span>
                          <span className="text-xs font-bold text-white uppercase group-hover:text-brand-accent transition-colors">{project.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-brand-muted">{project.client || '---'}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-4 text-[11px] font-black text-white">
                          <span title="Partes">{getReportCount(project.id)} P</span>
                          <span title="Subcontratas" className="text-brand-muted">{(project.assignedSubcontractorIds || []).length} S</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                          project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                       }`}>
                          {project.status === 'Active' ? 'Activa' : 'Pausada'}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <ChevronRight className="w-4 h-4 text-brand-muted ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="card p-12 flex flex-col items-center text-center gap-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              {searchQuery ? 'No hay coincidencias' : 'Sin obras registradas'}
            </h3>
            <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed max-w-xs">
              {searchQuery
                ? 'Ajusta los filtros de búsqueda para encontrar lo que necesitas.'
                : 'Empieza configurando tu primer proyecto de obra para activar el registro.'}
            </p>
          </div>

          {isAdmin && !searchQuery && (
            <button onClick={onOpenWizard} className="btn-primary h-11 px-6 mt-2">
              <Sparkles className="w-4 h-4" />
              <span>Configurar Primera Obra</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
