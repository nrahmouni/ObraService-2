import React from 'react';
import { ArrowLeft, Users, Building2, MapPin, Trash2, Pause } from 'lucide-react';
import { Project } from '../../types';
import { StatusPill } from '../ui/StatusPill';

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
  return (
    <div className="space-y-4 font-sans">
      {/* Visual Breadcrumb Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span className="hover:text-brand-accent cursor-pointer" onClick={onBack}>Inicio</span>
          <span>&gt;</span>
          <span className="hover:text-brand-accent cursor-pointer" onClick={onBack}>Obras</span>
          <span>&gt;</span>
          <span className="text-slate-300 font-mono font-bold">{selectedProject.code}</span>
        </nav>

        <div className="flex items-center gap-2">
          {onNavigateToTeam && (
            <button
              onClick={onNavigateToTeam}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border border-slate-800"
            >
              <Users className="w-3.5 h-3.5 text-brand-accent" />
              <span>Invitar Equipo a esta Obra</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          <img 
            src={coverUrl} 
            alt={selectedProject.name}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
          
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 font-mono text-[10px] font-black uppercase tracking-widest">
                {selectedProject.code}
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-accent text-white text-[10px] font-black uppercase tracking-wider">
                {selectedProject.projectType || 'Edificación'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onToggleStatus(e, selectedProject)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
                  selectedProject.status === 'Active'
                    ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                    : 'bg-amber-950/90 text-amber-400 border-amber-800 hover:bg-amber-900'
                }`}
              >
                {selectedProject.status === 'Active' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Obra Activa</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Obra Pausada</span>
                  </>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => onDeleteProject(selectedProject.id, selectedProject.name)}
                  className="p-2 rounded-full bg-rose-950/80 hover:bg-rose-900 text-rose-200 backdrop-blur-md border border-rose-800 transition-colors cursor-pointer"
                  title="Eliminar Obra"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Title Info */}
          <div className="absolute bottom-6 inset-x-4 sm:inset-x-6 text-white">
            <div className="text-xs font-black text-brand-accent uppercase tracking-widest mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Cliente: {selectedProject.client || 'Promotora Principal'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-100 font-display">
              {selectedProject.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mt-1">
              <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
              <span className="uppercase font-bold text-[11px] text-slate-300">{selectedProject.address || selectedProject.location?.address}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-brand-accent font-bold">Radio Geocerca {selectedProject.validationRadiusMeters}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
