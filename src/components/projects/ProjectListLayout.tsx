import React from 'react';
import { Search, List, ChevronRight, Building2, Sparkles, Grid, MapPin } from 'lucide-react';
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
  getProjectBudgetStats: (project: Project) => { budget: number; spent: number; progressPct: number; hours: number };
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
  isAdmin,
  onOpenWizard,
  defaultCovers,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código o cliente..."
            className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="flex bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
            {(['all', 'Active', 'Paused'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all text-center cursor-pointer ${
                  statusFilter === filter 
                    ? 'bg-brand-accent text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {filter === 'all' ? 'Todas' : filter === 'Active' ? 'Activas' : 'Pausadas'}
              </button>
            ))}
          </div>
          
          {/* View Mode */}
          <div className="flex bg-slate-900 border border-slate-700/80 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-slate-800 text-brand-accent shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Vista en tarjetas"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-800 text-brand-accent shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Vista en lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl group cursor-pointer overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-slate-950 shrink-0">
                  <img 
                    src={cover} 
                    alt={project.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                        isActive 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-500 text-white'
                     }`}>
                        {isActive ? 'Activa' : 'Pausada'}
                     </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                     <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-brand-accent font-mono text-[10px] font-black uppercase shadow">
                        {project.code}
                     </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-1">
                      <Building2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      <span className="truncate">{project.client || 'Cliente no especificado'}</span>
                    </div>
                    {project.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-normal mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{project.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-slate-800/80 py-3 bg-slate-950/40 rounded-xl px-2">
                    <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Partes</div>
                       <div className="text-sm font-black text-white mt-0.5">{reportCount}</div>
                    </div>
                    <div className="text-center border-x border-slate-800/80">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Horas</div>
                       <div className="text-sm font-black text-white mt-0.5">{stats.hours}h</div>
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Empresas</div>
                       <div className="text-sm font-black text-white mt-0.5">{subCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                     <div onClick={(e) => e.stopPropagation()}>
                        <ClockInButton project={project} variant="compact" />
                     </div>
                     <span className="text-xs font-bold text-slate-400 group-hover:text-brand-accent flex items-center gap-1 transition-colors">
                       <span>Detalles</span>
                       <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                     </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="px-5 py-3.5 text-xs font-black text-slate-300 uppercase tracking-wider">Código / Nombre</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-300 uppercase tracking-wider text-center">Actividad</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-300 uppercase tracking-wider text-right">Estado</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    onClick={() => onSelectProject(project)}
                    className="hover:bg-slate-800/40 cursor-pointer group transition-colors"
                  >
                    <td className="px-5 py-4">
                       <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-brand-accent font-mono text-xs font-black">
                            {project.code}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white uppercase group-hover:text-brand-accent transition-colors">
                            {project.name}
                          </span>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-300">{project.client || '---'}</td>
                    <td className="px-5 py-4">
                       <div className="flex items-center justify-center gap-4 text-xs font-bold text-white">
                          <span title="Partes">{getReportCount(project.id)} Partes</span>
                          <span title="Subcontratas" className="text-slate-400">{(project.assignedSubcontractorIds || []).length} Empresas</span>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          project.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                       }`}>
                          {project.status === 'Active' ? 'Activa' : 'Pausada'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-accent ml-auto" />
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center text-center gap-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-brand-accent">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              {searchQuery ? 'No hay coincidencias' : 'Sin obras registradas'}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed max-w-xs">
              {searchQuery
                ? 'Ajusta los filtros de búsqueda para encontrar lo que necesitas.'
                : 'Empieza configurando tu primer proyecto de obra para activar el registro.'}
            </p>
          </div>

          {isAdmin && !searchQuery && (
            <button 
              onClick={onOpenWizard} 
              className="btn-primary h-11 px-6 mt-2 text-xs uppercase tracking-wider font-bold cursor-pointer"
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
