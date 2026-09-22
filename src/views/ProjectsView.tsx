import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { obraStore } from '../services/store';
import { Project, ProjectStatus, AppState } from '../types';
import { ProjectSetupWizard } from '../components/ProjectSetupWizard';
import { toast } from 'react-hot-toast';

// Subcomponents
import { ProjectDetailHero } from '../components/projects/ProjectDetailHero';
import { ProjectDetailBudget } from '../components/projects/ProjectDetailBudget';
import { ProjectDetailSubcontractors } from '../components/projects/ProjectDetailSubcontractors';
import { ProjectListLayout } from '../components/projects/ProjectListLayout';

interface ProjectsViewProps {
  state: AppState;
  onNavigate?: (tab: string) => void;
}

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ state, onNavigate }) => {
  const user = state.currentUser;

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Paused'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Modals & Selection
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [subAssignmentOpen, setSubAssignmentOpen] = useState(false);

  // Auto-select project if header filter matches a specific project
  useEffect(() => {
    const headerProjectId = localStorage.getItem('selected_project_id');
    if (headerProjectId) {
      const match = state.projects.find(p => p.id === headerProjectId);
      if (match) {
        setSelectedProject(match);
      }
    } else {
      setSelectedProject(null);
    }
  }, [state.projects]);

  // Handle cross-storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const headerProjectId = localStorage.getItem('selected_project_id');
      if (headerProjectId) {
        const match = state.projects.find(p => p.id === headerProjectId);
        if (match) setSelectedProject(match);
      } else {
        setSelectedProject(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.projects]);

  if (!user) return null;
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER';

  // Filters
  const filteredProjects = (state.projects || []).filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location?.address && p.location.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const newStatus: ProjectStatus = project.status === 'Active' ? 'Paused' : 'Active';
    obraStore.updateProjectStatus(project.id, newStatus);
    toast.success(`Estado de "${project.name}" cambiado a ${newStatus === 'Active' ? 'Activo' : 'Pausado'}`);
  };

  const handleDeleteProjectClick = (projectId: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${name}"? Esta acción archivará sus registros.`)) {
      const res = obraStore.deleteProject(projectId);
      if (res) {
        toast.success(`Proyecto "${name}" eliminado con éxito.`);
        setSelectedProject(null);
      } else {
        toast.error("No se pudo eliminar el proyecto.");
      }
    }
  };

  const handleUpdateAssignments = (subIds: string[]) => {
    if (!selectedProject) return;
    obraStore.updateProjectAssignments(selectedProject.id, subIds);
    toast.success('Red de empresas autorizadas actualizada');
  };

  const getProjectBudgetStats = (project: Project) => {
    const budget = project.initialBudget || 350000;
    const reportHours = (state.reports || [])
      .filter(r => r.projectId === project.id)
      .reduce((acc, r) => acc + (r.totalHours || 0), 0);
    
    const computedSpent = project.spentBudget !== undefined && project.spentBudget > 0
      ? project.spentBudget
      : Math.round(reportHours * 32);

    const progressPct = Math.min(100, Math.round((computedSpent / budget) * 100));

    return { budget, spent: computedSpent, progressPct, hours: reportHours };
  };

  const getReportCount = (projectId: string) => {
    return (state.reports || []).filter(r => r.projectId === projectId).length;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Detail View */}
      {selectedProject ? (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <ProjectDetailHero
            selectedProject={selectedProject}
            coverUrl={selectedProject.coverImage || DEFAULT_COVERS[0]}
            isAdmin={isAdmin}
            onBack={() => {
              localStorage.removeItem('selected_project_id');
              setSelectedProject(null);
              window.dispatchEvent(new Event('storage'));
            }}
            onNavigateToTeam={onNavigate ? () => onNavigate('team') : undefined}
            onToggleStatus={handleToggleStatus}
            onDeleteProject={handleDeleteProjectClick}
          />
          
          <ProjectDetailBudget
            selectedProject={selectedProject}
            reportCount={getReportCount(selectedProject.id)}
            stats={getProjectBudgetStats(selectedProject)}
          />

          <ProjectDetailSubcontractors
            selectedProject={selectedProject}
            companies={state.companies || []}
            isAdmin={isAdmin}
            isOpen={subAssignmentOpen}
            setIsOpen={setSubAssignmentOpen}
            onUpdateAssignments={handleUpdateAssignments}
          />
        </div>
      ) : (
        /* 2. Standard Gallery / Card List View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
            <div>
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">
                Directorio de Obras
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100 font-display mt-0.5">
                Proyectos y Obras
              </h1>
            </div>

            {isAdmin && (
              <button
                onClick={() => setWizardOpen(true)}
                className="bg-brand-accent hover:bg-brand-accent/90 text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-accent/20 transition-all flex items-center gap-2 cursor-pointer"
                id="btn-new-project-main"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nueva Obra</span>
              </button>
            )}
          </div>

          <ProjectListLayout
            filteredProjects={filteredProjects}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            getProjectBudgetStats={getProjectBudgetStats}
            getReportCount={getReportCount}
            onSelectProject={(p) => {
              setSelectedProject(p);
              localStorage.setItem('selected_project_id', p.id);
              window.dispatchEvent(new Event('storage'));
            }}
            onToggleStatus={handleToggleStatus}
            isAdmin={isAdmin}
            onOpenWizard={() => setWizardOpen(true)}
            defaultCovers={DEFAULT_COVERS}
          />
        </div>
      )}

      {/* 3. Setup Wizard Modal */}
      <ProjectSetupWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={(newProject) => {
          setSelectedProject(newProject);
          localStorage.setItem('selected_project_id', newProject.id);
          window.dispatchEvent(new Event('storage'));
        }}
        onNavigateToTeam={onNavigate ? () => onNavigate('team') : undefined}
      />
    </div>
  );
};
