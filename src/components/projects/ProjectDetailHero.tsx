import React from 'react';
import { Building2, MapPin, Trash2, Play, ChevronLeft, Users } from 'lucide-react';
import { Project } from '../../types';

interface ProjectDetailHeroProps {
  selectedProject: Project;
  coverUrl: string;
  isAdmin: boolean;
  onBack: () => void;
  onNavigateToTeam?: () => void;
  onToggleStatus: (e: React.MouseEvent, project: Project) => void;
  onDeleteProject: (projectId: string, name: string) => void;
}

export const ProjectDetailHero: React.FC<ProjectDetailHeroProps> = ({
  selectedProject,
  coverUrl,
  isAdmin,
  onBack,
  onNavigateToTeam,
  onToggleStatus,
  onDeleteProject,
}) => {
  const isActive = selectedProject.status === 'Active';

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:border-brand-accent transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Volver al Listado de Obras</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleStatus(e, selectedProject)}
            className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isActive ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Obra Activa</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Reanudar</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDeleteProject(selectedProject.id, selectedProject.name)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
              title="Eliminar Obra"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Identity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-950">
          <img 
            src={coverUrl} 
            alt={selectedProject.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-accent text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-md">
                  {selectedProject.code}
                </span>
                <span className="text-slate-300 font-bold text-xs">• {selectedProject.projectType || 'Construcción'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase">
                {selectedProject.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                 <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                    <span>{selectedProject.address || 'Ubicación no registrada'}</span>
                 </div>
                 {selectedProject.client && (
                    <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                       <Building2 className="w-4 h-4 text-brand-accent shrink-0" />
                       <span>Cliente: <strong className="text-white">{selectedProject.client}</strong></span>
                    </div>
                 )}
              </div>
            </div>

            {onNavigateToTeam && (
              <button
                onClick={onNavigateToTeam}
                className="btn-primary h-11 px-5 gap-2 shadow-lg text-xs uppercase tracking-wider shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Gestión de Equipo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
