import React from 'react';
import { Search, LayoutGrid, List, MapPin, ChevronRight, ArrowRight, Building2, Sparkles, Pause } from 'lucide-react';
import { Project, AppState } from '../../types';
import { Table } from '../ui/Table';
import { StatusPill } from '../ui/StatusPill';
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
    <div className="space-y-6 font-sans">
      {/* Search, Status Filters & View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-xl border border-slate-800 shadow-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cliente, código PRJ o dirección..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-accent focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Filter by Status & View Mode */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Status pills */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['all', 'Active', 'Paused'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === filter ? 'bg-brand-accent text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'Todas' : filter === 'Active' ? 'Activas' : 'Pausadas'}
              </button>
            ))}
          </div>

          {/* View switcher (Cards vs List) */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-brand-accent text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-brand-accent text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const stats = getProjectBudgetStats(project);
            const reportCount = getReportCount(project.id);
            const coverUrl = project.coverImage || defaultCovers[idx % defaultCovers.length];

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-[#0F172A] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl hover:border-brand-accent/40 transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Visual Cover Photo with Status & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={coverUrl}
                    alt={project.name}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />

                  {/* Top tags on cover */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 font-mono text-[9px] font-black uppercase tracking-widest shadow">
                      {project.code}
                    </span>

                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => onToggleStatus(e, project)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all cursor-pointer border ${
                        project.status === 'Active'
                          ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950/90 text-amber-400 border-amber-800'
                      }`}
                    >
                      {project.status === 'Active' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-2.5 h-2.5" />
                          <span>Pausado</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom info on cover */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block truncate">
                      {project.client || 'Promotora Principal'}
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-100 line-clamp-1">
                      {project.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Location & Geofence tag */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                    <span className="truncate font-semibold uppercase">
                      {project.address || project.location?.address}
                    </span>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Presupuesto: {stats.budget.toLocaleString('es-ES')} €
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wide ${
                        stats.progressPct > 90 ? 'text-rose-400' : stats.progressPct > 70 ? 'text-amber-400' : 'text-brand-accent'
                      }`}>
                        {stats.progressPct}% ejecutado
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.progressPct > 90 ? 'bg-rose-500' : stats.progressPct > 70 ? 'bg-amber-500' : 'bg-brand-accent'
                        }`}
                        style={{ width: `${stats.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics row */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] font-black text-slate-500 uppercase block">Partes Diarios</span>
                      <span className="text-sm font-black text-slate-200">{reportCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] font-black text-slate-500 uppercase block">Horas Imputadas</span>
                      <span className="text-sm font-black text-brand-accent">{stats.hours} H</span>
                    </div>
                  </div>

                  {/* Card Footer & Quick Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ClockInButton project={project} variant="compact" />
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-brand-accent border border-slate-800 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Ver Obra</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <Table headers={['Obra / Cliente', 'Ubicación & Geocerca', 'Estado', 'Avance Presupuesto', 'Métricas']}>
            {filteredProjects.map((project, idx) => {
              const stats = getProjectBudgetStats(project);
              const reportCount = getReportCount(project.id);
              const coverUrl = project.coverImage || defaultCovers[idx % defaultCovers.length];

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="border-b border-slate-800/40 last:border-0 hover:bg-slate-900/40 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <img 
                        src={coverUrl} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-xs font-black text-slate-200 uppercase leading-snug">
                          {project.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          {project.code} • {project.client || 'Promotora'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      <span className="truncate max-w-[200px] uppercase font-bold text-[11px]">
                        {project.address || project.location?.address}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Radio: {project.validationRadiusMeters}m
                    </span>
                  </td>

                  <td className="px-6 py-4.5">
                    <StatusPill status={project.status === 'Active' ? 'Active' : 'Paused'} />
                  </td>

                  <td className="px-6 py-4.5">
                    <div className="w-36 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{stats.progressPct}%</span>
                        <span>{stats.spent.toLocaleString('es-ES')} €</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-brand-accent h-full rounded-full"
                          style={{ width: `${stats.progressPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4.5 text-right">
                    <div className="text-xs font-black text-slate-200">
                      {reportCount} <span className="text-slate-500 font-normal">partes</span>
                    </div>
                    <div className="text-[10px] font-black text-brand-accent mt-0.5">
                      {stats.hours} H
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}

      {/* Empty State when no projects exist */}
      {filteredProjects.length === 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-10 text-center max-w-xl mx-auto shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-brand-accent">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
              {searchQuery ? 'No se encontraron obras coincidentes' : 'No hay centros de trabajo configurados'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              {searchQuery
                ? 'Prueba con otros términos de búsqueda como el nombre del cliente o la ciudad.'
                : 'Configura tu primer proyecto con geocerca GPS satelital para comenzar a recibir partes diarios.'}
            </p>
          </div>

          {isAdmin && !searchQuery && (
            <button
              onClick={onOpenWizard}
              className="px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 mx-auto shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar mi Primera Obra con el Asistente</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
