import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Clock, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Compass,
  ArrowRight,
  ArrowLeft,
  Zap,
  Layers,
  History,
  FileText,
  ChevronRight,
  Users,
  Settings,
  Link,
  Trash2,
  RefreshCw,
  Euro,
  Sparkles,
  LayoutGrid,
  List,
  Play,
  Pause,
  UserPlus,
  Filter
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Project, ProjectStatus, Company, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { ClockInButton } from '../components/ClockInButton';
import { ProjectSetupWizard } from '../components/ProjectSetupWizard';
import { UnifiedCrudModal } from '../components/UnifiedCrudModal';
import { toast } from 'react-hot-toast';

interface ProjectsViewProps {
  state: AppState;
  onNavigate?: (tab: string) => void;
}

// Curated fallbacks for projects without explicit coverImage
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ state, onNavigate }) => {
  const user = state.currentUser;

  // View & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Paused'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Selection & Modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [subAssignmentOpen, setSubAssignmentOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (!user) return null;

  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER';

  // Filter projects by search query and status
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
    setSubAssignmentOpen(false);
    toast.success('Red de empresas autorizadas actualizada');
  };

  // Helper to compute budget and progress
  const getProjectBudgetStats = (project: Project) => {
    const budget = project.initialBudget || 350000;
    // Calculate spent from reports hours * avg hourly cost of 28€/h or explicit spentBudget
    const reportHours = (state.reports || [])
      .filter(r => r.projectId === project.id)
      .reduce((acc, r) => acc + (r.totalHours || 0), 0);
    
    const computedSpent = project.spentBudget !== undefined && project.spentBudget > 0
      ? project.spentBudget
      : Math.round(reportHours * 32);

    const progressPct = Math.min(100, Math.round((computedSpent / budget) * 100));

    return {
      budget,
      spent: computedSpent,
      progressPct,
      hours: reportHours
    };
  };

  // --- DETAILED PROJECT DASHBOARD VIEW ---
  if (selectedProject) {
    const stats = getProjectBudgetStats(selectedProject);
    const reportCount = (state.reports || []).filter(r => r.projectId === selectedProject.id).length;
    const coverUrl = selectedProject.coverImage || DEFAULT_COVERS[0];

    return (
      <div className="animate-in slide-in-from-right-4 duration-300 font-sans space-y-6">
        {/* Back breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider hover:text-[#FF6600] transition-colors group cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-orange-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-[#FF6600]" />
            </div>
            <span>Volver al Directorio de Obras</span>
          </button>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('team')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Invitar Equipo a esta Obra</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Hero Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Cover photo banner */}
          <div className="relative h-56 sm:h-72 w-full overflow-hidden">
            <img 
              src={coverUrl} 
              alt={selectedProject.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-black uppercase tracking-widest">
                  {selectedProject.code}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  {selectedProject.projectType || 'Edificación'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleToggleStatus(e, selectedProject)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                    selectedProject.status === 'Active'
                      ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                      : 'bg-amber-500/90 text-white hover:bg-amber-600'
                  }`}
                  title="Cambiar estado de la obra"
                >
                  {selectedProject.status === 'Active' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
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
                    onClick={() => handleDeleteProjectClick(selectedProject.id, selectedProject.name)}
                    className="p-2 rounded-full bg-rose-900/80 hover:bg-rose-800 text-rose-200 backdrop-blur-md border border-rose-700/50 transition-colors cursor-pointer"
                    title="Eliminar Obra"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom title & client info */}
            <div className="absolute bottom-6 inset-x-4 sm:inset-x-6 text-white">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Cliente: {selectedProject.client || 'Promotora Principal'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
                {selectedProject.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mt-1">
                <MapPin className="w-4 h-4 text-[#FF6600] shrink-0" />
                <span>{selectedProject.address || selectedProject.location?.address}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-orange-300">Geocerca {selectedProject.validationRadiusMeters}m</span>
              </div>
            </div>
          </div>

          {/* Key Metrics & Budget Bar */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Presupuesto y Avance Financiero */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Avance de Presupuesto Asignado
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {stats.spent.toLocaleString('es-ES')} €
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      de {stats.budget.toLocaleString('es-ES')} €
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                    stats.progressPct > 90 
                      ? 'bg-rose-100 text-rose-700' 
                      : stats.progressPct > 70 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {stats.progressPct}% Ejecutado
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    stats.progressPct > 90 
                      ? 'bg-rose-500' 
                      : stats.progressPct > 70 
                        ? 'bg-amber-500' 
                        : 'bg-[#FF6600]'
                  }`}
                  style={{ width: `${stats.progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-2">
                <span>Remanente: {(stats.budget - stats.spent).toLocaleString('es-ES')} €</span>
                <span>Horas de cuadrilla imputadas: {stats.hours} H</span>
              </div>
            </div>

            {/* GPS Geofenced Clock-in for Field Workers */}
            <div className="p-5 bg-orange-50/80 border border-orange-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black uppercase tracking-wider text-[#FF6600]">
                  <Clock className="w-4 h-4" />
                  <span>Control de Presencia GPS (Radio {selectedProject.validationRadiusMeters}m)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Los operarios y encargados pueden fichar su jornada comprobando la ubicación en tiempo real.
                </p>
              </div>
              <div className="w-full sm:w-auto shrink-0">
                <ClockInButton project={selectedProject} variant="full" />
              </div>
            </div>

            {/* 4 Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Partes Emitidos</div>
                <div className="text-2xl font-black text-slate-900">{reportCount}</div>
                <span className="text-[10px] text-slate-500 font-semibold">Validación digital</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Horas Acumuladas</div>
                <div className="text-2xl font-black text-[#FF6600]">{stats.hours} H</div>
                <span className="text-[10px] text-slate-500 font-semibold">Mano de obra</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Radio Geofence</div>
                <div className="text-2xl font-black text-slate-900">{selectedProject.validationRadiusMeters} m</div>
                <span className="text-[10px] text-slate-500 font-semibold">Perímetro satelital</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Subcontratas</div>
                <div className="text-2xl font-black text-slate-900">
                  {(selectedProject.assignedSubcontractorIds || []).length}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Empresas en red</span>
              </div>
            </div>

            {/* Subcontractor Network / Assigned companies */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6600]" />
                  Empresas y Subcontratas Autorizadas en Obra
                </h3>
                {isAdmin && (
                  <button 
                    onClick={() => setSubAssignmentOpen(true)}
                    className="text-xs font-black text-[#FF6600] hover:text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Gestionar Red</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Main Contractor */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase">Empresa Principal</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CONTRATISTA GENERAL</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Subcontractors */}
                {(state.companies || [])
                  .filter(c => (selectedProject.assignedSubcontractorIds || []).includes(c.id))
                  .map(sub => (
                    <div key={sub.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-[#FF6600]/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#FF6600]">
                          <Link className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">{sub.name}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sub.taxId} • SUBCONTRATA</div>
                        </div>
                      </div>
                    </div>
                  ))}

                {(selectedProject.assignedSubcontractorIds || []).length === 0 && (
                  <div className="sm:col-span-2 p-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <span>No hay subcontratas asignadas aún a este proyecto.</span>
                    <button
                      onClick={() => setSubAssignmentOpen(true)}
                      className="text-[10px] font-black text-[#FF6600] uppercase hover:underline cursor-pointer"
                    >
                      + Asignar ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subcontractor Assignment Modal */}
        <UnifiedCrudModal
          isOpen={subAssignmentOpen}
          onClose={() => setSubAssignmentOpen(false)}
          title="Asignar Subcontratas a la Obra"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Selecciona las empresas autorizadas para realizar tajos en esta obra. Las empresas marcadas recibirán acceso para emitir albaranes y partes diarios.
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(state.companies || [])
                .filter(c => c.type === 'SUBCONTRACTOR')
                .map(comp => {
                  const isAssigned = (selectedProject.assignedSubcontractorIds || []).includes(comp.id);
                  return (
                    <label 
                      key={comp.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isAssigned ? 'bg-[#FF6600]/5 border-[#FF6600]/40' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {
                            const current = selectedProject.assignedSubcontractorIds || [];
                            const next = isAssigned 
                              ? current.filter(id => id !== comp.id)
                              : [...current, comp.id];
                            handleUpdateAssignments(next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#FF6600] focus:ring-[#FF6600] cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 uppercase block">{comp.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{comp.address}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{comp.taxId}</span>
                    </label>
                  );
                })}
              {(state.companies || []).filter(c => c.type === 'SUBCONTRACTOR').length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No hay empresas subcontratadas dadas de alta. Ve a Equipo &gt; Subcontratas para crearlas.
                </div>
              )}
            </div>
          </div>
        </UnifiedCrudModal>
      </div>
    );
  }

  // --- MAIN DIRECTORY / CARD VIEW ---
  return (
    <div className="font-sans space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">
              Directorio de Obras
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Centro activo' : 'Centros de trabajo'}
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Proyectos y Obras
          </h1>
        </div>

        {/* Wizard Trigger Button */}
        {isAdmin && (
          <button
            onClick={() => setWizardOpen(true)}
            className="self-start sm:self-auto bg-[#FF6600] hover:bg-[#EA580C] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-950/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Obra</span>
          </button>
        )}
      </div>

      {/* Search, Status Filters & View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cliente, código PRJ o dirección..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
          />
        </div>

        {/* Filter by Status & View Mode */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Status pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'Active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setStatusFilter('Paused')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'Paused' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pausadas
            </button>
          </div>

          {/* View switcher (Cards vs List) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#FF6600] shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#FF6600] shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista en Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- CARDS VIEW (REQUIREMENT 1) --- */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const stats = getProjectBudgetStats(project);
            const reportCount = (state.reports || []).filter(r => r.projectId === project.id).length;
            const coverUrl = project.coverImage || DEFAULT_COVERS[idx % DEFAULT_COVERS.length];

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#FF6600]/40 transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Visual Cover Photo with Status & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={coverUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

                  {/* Top tags on cover */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] font-black uppercase tracking-widest shadow">
                      {project.code}
                    </span>

                    {/* Status Badge with toggle button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, project)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all cursor-pointer ${
                        project.status === 'Active'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                      title="Haz click para alternar entre Activo y Pausado"
                    >
                      {project.status === 'Active' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
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
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block truncate">
                      {project.client || 'Promotora Principal'}
                    </span>
                    <h2 className="text-base font-black uppercase tracking-tight text-white line-clamp-1 drop-shadow-sm">
                      {project.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Location & Geofence tag */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6600] shrink-0 mt-0.5" />
                    <span className="truncate font-semibold uppercase">
                      {project.address || project.location?.address}
                    </span>
                  </div>

                  {/* Budget Progress Bar (Barra de progreso de presupuesto) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Presupuesto: {stats.budget.toLocaleString('es-ES')} €
                      </span>
                      <span className={`text-[10px] font-black uppercase ${
                        stats.progressPct > 90 ? 'text-rose-600' : stats.progressPct > 70 ? 'text-amber-600' : 'text-[#FF6600]'
                      }`}>
                        {stats.progressPct}% ejecutado
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.progressPct > 90 ? 'bg-rose-500' : stats.progressPct > 70 ? 'bg-amber-500' : 'bg-[#FF6600]'
                        }`}
                        style={{ width: `${stats.progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>Gastado: {stats.spent.toLocaleString('es-ES')} €</span>
                      <span>Geocerca: {project.validationRadiusMeters}m</span>
                    </div>
                  </div>

                  {/* Key metrics chip row */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Partes Diarios</span>
                      <span className="text-sm font-black text-slate-900">{reportCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Horas Imputadas</span>
                      <span className="text-sm font-black text-[#FF6600]">{stats.hours} H</span>
                    </div>
                  </div>

                  {/* Card Footer & Quick Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ClockInButton project={project} variant="compact" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#FF6600] border border-slate-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
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
        /* --- LIST VIEW --- */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-5 py-3">Obra / Cliente</th>
                <th className="px-5 py-3">Ubicación & Geocerca</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3">Avance Presupuesto</th>
                <th className="px-5 py-3 text-right">Métricas</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project, idx) => {
                const stats = getProjectBudgetStats(project);
                const reportCount = (state.reports || []).filter(r => r.projectId === project.id).length;
                const coverUrl = project.coverImage || DEFAULT_COVERS[idx % DEFAULT_COVERS.length];

                return (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={coverUrl} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                        />
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase leading-snug">
                            {project.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {project.code} • {project.client || 'Promotora'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                        <span className="truncate max-w-[200px] uppercase font-bold text-[11px]">
                          {project.address || project.location?.address}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Radio: {project.validationRadiusMeters}m
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, project)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          project.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{project.status === 'Active' ? 'Activo' : 'Pausado'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>{stats.progressPct}%</span>
                          <span>{stats.spent.toLocaleString('es-ES')} €</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#FF6600] h-full rounded-full"
                            style={{ width: `${stats.progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="text-xs font-black text-slate-900">
                        {reportCount} <span className="text-slate-400 font-normal">partes</span>
                      </div>
                      <div className="text-[10px] font-black text-[#FF6600]">
                        {stats.hours} H
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#FF6600] transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State when no projects exist or search has no matches */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#FF6600]">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase">
              {searchQuery ? 'No se encontraron obras coincidentes' : 'No hay centros de trabajo configurados'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? 'Prueba con otros términos de búsqueda como el nombre del cliente o la ciudad.'
                : 'Configura tu primer proyecto con geocerca GPS satelital para comenzar a recibir partes diarios y coordinar cuadrillas en campo.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-[#FF6600] hover:bg-[#EA580C] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 mx-auto shadow-lg shadow-orange-950/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar mi Primera Obra con el Asistente</span>
            </button>
          )}
        </div>
      )}

      {/* WIZARD MODAL (REQUIREMENT 2 & 3) */}
      <ProjectSetupWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={(newProject) => {
          setSelectedProject(newProject);
        }}
        onNavigateToTeam={() => {
          if (onNavigate) {
            onNavigate('team');
          }
        }}
      />
    </div>
  );
};
