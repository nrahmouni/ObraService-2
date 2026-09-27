import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List as ListIcon, Building2, Sparkles } from 'lucide-react';
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [subAssignmentOpen, setSubAssignmentOpen] = useState(false);

  // Sync selected project with store state
  const selectedProject = selectedProjectId 
    ? (state.projects || []).find(p => p.id === selectedProjectId) || null 
    : null;

  if (!user) return null;
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER';

  // Filters
  const filteredProjects = (state.projects || []).filter(p => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.code && p.code.toLowerCase().includes(query)) ||
      (p.client && p.client.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.location?.address && p.location.address.toLowerCase().includes(query));

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
        setSelectedProjectId(null);
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
    const budget = project.initialBudget || project.budget || 350000;
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
    <div className="space-y-6">
      {/* 1. Detail View */}
      {selectedProject ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ProjectDetailHero
            selectedProject={selectedProject}
            coverUrl={selectedProject.coverImage || DEFAULT_COVERS[0]}
            isAdmin={isAdmin}
            onBack={() => setSelectedProjectId(null)}
            onNavigateToTeam={onNavigate ? () => onNavigate('team') : undefined}
            onToggleStatus={handleToggleStatus}
            onDeleteProject={handleDeleteProjectClick}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProjectDetailBudget
                selectedProject={selectedProject}
                reportCount={getReportCount(selectedProject.id)}
                stats={getProjectBudgetStats(selectedProject)}
              />
            </div>
            <div>
              <ProjectDetailSubcontractors
                selectedProject={selectedProject}
                companies={state.companies || []}
                workers={state.workers || []}
                deliveryNotes={state.deliveryNotes || []}
                isAdmin={isAdmin}
                isOpen={subAssignmentOpen}
                setIsOpen={setSubAssignmentOpen}
                onUpdateAssignments={handleUpdateAssignments}
              />
            </div>
          </div>
        </div>
      ) : (
        /* 2. List / Gallery View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                Obras y Proyectos
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                Gestión centralizada de todos tus tajos activos ({state.projects?.length || 0} obras registradas).
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setWizardOpen(true)}
                className="btn-primary h-11 px-5 shadow-lg shadow-brand-accent/20 w-full sm:w-auto justify-center text-xs uppercase tracking-wider gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
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
            onSelectProject={(p) => setSelectedProjectId(p.id)}
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
          // Keep wizard open on step 4 or close to view in list
          setSelectedProjectId(null); // Shows list with new project on top
        }}
        onNavigateToTeam={onNavigate ? () => {
          setWizardOpen(false);
          onNavigate('team');
        } : undefined}
      />
    </div>
  );
};
