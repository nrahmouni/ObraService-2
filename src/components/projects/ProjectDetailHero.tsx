import React from 'react';
import { ArrowLeft, Users, Building2, MapPin, Trash2, Pause, Play, ChevronLeft } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-brand-muted hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center group-hover:border-brand-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Volver a Obras</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleStatus(e, selectedProject)}
            className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isActive ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
              title="Eliminar Obra"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Identity Card */}
      <div className="card overflow-hidden group">
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img 
            src={coverUrl} 
            alt={selectedProject.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-accent text-white font-mono text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {selectedProject.code}
                </span>
                <span className="text-white/60 font-medium text-xs">• {selectedProject.projectType || 'Construcción'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
                {selectedProject.name}
              </h1>
              <div className="flex items-center gap-4 text-xs font-medium text-brand-muted">
                 <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-accent" />
                    <span>{selectedProject.address || 'Ubicación no registrada'}</span>
                 </div>
                 {selectedProject.client && (
                    <div className="flex items-center gap-1.5 border-l border-brand-border pl-4">
                       <Building2 className="w-4 h-4 text-brand-accent" />
                       <span>Cliente: <span className="text-white">{selectedProject.client}</span></span>
                    </div>
                 )}
              </div>
            </div>

            {onNavigateToTeam && (
              <button
                onClick={onNavigateToTeam}
                className="btn-primary h-11 px-6 gap-2 shadow-2xl shadow-brand-accent/30"
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
