import React from 'react';
import { ArrowLeft, Users, Building2, MapPin, Trash2, Pause, Play } from 'lucide-react';
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
    <div className="space-y-4 font-sans">
      {/* Top Navigation Bar: Clean and direct */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6600]" />
          <span>Volver a Obras</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleStatus(e, selectedProject)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            {isActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Obra Activa</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Reanudar Obra</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDeleteProject(selectedProject.id, selectedProject.name)}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              title="Eliminar Obra"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Obra Info Card: Linear, high contrast, clean */}
      <div className="bg-[#0B101D] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#FF6600]/20 text-[#FF6600] font-mono text-xs font-black">
                {selectedProject.code}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs font-bold">
                {selectedProject.projectType || 'Edificación'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight mt-2">
              {selectedProject.name}
            </h1>
            {selectedProject.client && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Cliente: {selectedProject.client}</span>
              </div>
            )}
          </div>

          {onNavigateToTeam && (
            <button
              onClick={onNavigateToTeam}
              className="self-start px-3.5 py-2 rounded-xl bg-[#FF6600] hover:bg-[#FF6600]/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-950/40 shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Subcontratas & Equipo</span>
            </button>
          )}
        </div>

        {/* Location & GPS Info */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF6600] shrink-0" />
            <span className="font-semibold text-slate-200">
              {selectedProject.address || selectedProject.location?.address || 'Ubicación registrada'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-amber-300/90 font-bold">
            Radio GPS: {selectedProject.validationRadiusMeters || 250}m
          </div>
        </div>
      </div>
    </div>
  );
};
