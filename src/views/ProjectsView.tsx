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
  RefreshCw
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Project, ProjectStatus, Company, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { ProjectLocationPicker } from '../components/ProjectLocationPicker';
import { UnifiedCrudModal } from '../components/UnifiedCrudModal';

import { toast } from 'react-hot-toast';

interface ProjectsViewProps {
  state: AppState;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ state }) => {
  const user = state.currentUser;

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [subAssignmentOpen, setSubAssignmentOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  // New project form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(40.4168);
  const [lng, setLng] = useState<number>(-3.7038);
  const [radius, setRadius] = useState<number>(350);
  const [plannedHours, setPlannedHours] = useState<number>(12000);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) return null;

  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER';

  const filteredProjects = (state.projects || []).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyProjectPreset = (presetName: string, presetAddress: string, presetLat: number, presetLng: number, presetHours: number) => {
    setName(presetName);
    setAddress(presetAddress);
    setLat(presetLat);
    setLng(presetLng);
    setPlannedHours(presetHours);
  };

  const handleEditProjectClick = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setAddress(project.location.address);
    setLat(project.location.lat);
    setLng(project.location.lng);
    setRadius(project.validationRadiusMeters);
    setPlannedHours(project.plannedWorkloadHours || project.plannedHours || 12000);
    setModalOpen(true);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Robust validations
    if (!name.trim()) {
      setErrorMsg('El nombre del proyecto es obligatorio.');
      toast.error('El nombre es obligatorio.');
      return;
    }
    if (name.trim().length < 3) {
      setErrorMsg('El nombre del proyecto debe tener al menos 3 caracteres.');
      toast.error('Nombre demasiado corto.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('La dirección geográfica es obligatoria.');
      toast.error('La dirección es obligatoria.');
      return;
    }
    if (address.trim().length < 5) {
      setErrorMsg('La dirección debe ser detallada (mínimo 5 caracteres).');
      toast.error('Dirección insuficiente.');
      return;
    }
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrorMsg('Las coordenadas geográficas de la obra no son válidas.');
      toast.error('Coordenadas inválidas.');
      return;
    }
    if (!radius || radius < 50 || radius > 5000) {
      setErrorMsg('El radio de la geocerca debe estar configurado entre 50 y 5000 metros.');
      toast.error('Radio fuera de límites (50m - 5000m).');
      return;
    }
    if (!plannedHours || plannedHours <= 0) {
      setErrorMsg('Las horas presupuestadas son obligatorias y deben ser superiores a cero.');
      toast.error('Horas presupuestadas inválidas.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      if (editingProject) {
        const success = obraStore.updateProject(editingProject.id, {
          name: name.trim(),
          location: {
            address: address.trim(),
            lat,
            lng,
            latitude: lat,
            longitude: lng,
          },
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          validationRadiusMeters: radius,
          plannedHours,
          plannedWorkloadHours: plannedHours
        });

        if (success) {
          toast.success(`Proyecto "${name}" actualizado con éxito.`);
          setModalOpen(false);
          setEditingProject(null);
          setSelectedProject({
            ...selectedProject!,
            name: name.trim(),
            location: {
              address: address.trim(),
              lat,
              lng,
              latitude: lat,
              longitude: lng,
            },
            address: address.trim(),
            latitude: lat,
            longitude: lng,
            validationRadiusMeters: radius,
            plannedHours,
            plannedWorkloadHours: plannedHours
          });
        } else {
          setErrorMsg('No se pudo actualizar el proyecto.');
        }
      } else {
        const res = obraStore.createProject({
          name: name.trim(),
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          location: {
            address: address.trim(),
            lat,
            lng,
            latitude: lat,
            longitude: lng,
          },
          validationRadiusMeters: radius,
          plannedHours,
          status: 'Active',
        });

        if (res.success) {
          setModalOpen(false);
          setName('');
          setAddress('');
          toast.success(`Proyecto "${name}" creado con éxito.`);
        } else {
          setErrorMsg(res.error || 'No se pudo crear el proyecto.');
        }
      }
      setIsSaving(false);
    }, 400);
  };

  const handleToggleStatus = (project: Project, newStatus: ProjectStatus) => {
    obraStore.updateProjectStatus(project.id, newStatus);
  };

  const handleUpdateAssignments = (subIds: string[]) => {
    if (!selectedProject) return;
    obraStore.updateProjectAssignments(selectedProject.id, subIds);
    setSubAssignmentOpen(false);
    toast.success('Asignaciones actualizadas correctamente');
  };

  const handleDeleteProjectClick = (projectId: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${name}"? Esta acción no se puede deshacer y archivará sus registros.`)) {
      const res = obraStore.deleteProject(projectId);
      if (res) {
        toast.success(`Proyecto "${name}" eliminado con éxito.`);
        setSelectedProject(null);
      } else {
        toast.error("No se pudo eliminar el proyecto.");
      }
    }
  };

  const viewPreference = state.viewPreference;

  if (selectedProject) {
    const reportCount = (state.reports || []).filter(r => r.projectId === selectedProject.id).length;
    const totalHours = (state.reports || [])
      .filter(r => r.projectId === selectedProject.id)
      .reduce((acc, r) => acc + r.totalHours, 0);

    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={handleBackToList}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#FF6600] transition-colors mb-6 group"
        >
          <div className="p-1 rounded-md bg-slate-100 group-hover:bg-[#FF6600]/10 transition-colors">
            <ArrowLeft className="w-3 h-3" />
          </div>
          Volver al Directorio
        </button>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Building2 className="w-6 h-6 text-[#FF6600]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedProject.code}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activo</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedProject.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Badge status={selectedProject.status} />
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleEditProjectClick(selectedProject)}
                    className="p-2 border border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                    title="Editar Detalles de la Obra"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Editar Obra
                  </button>
                  <button
                    onClick={() => handleDeleteProjectClick(selectedProject.id, selectedProject.name)}
                    className="p-2 border border-rose-200 bg-rose-50 rounded-lg text-rose-500 hover:bg-rose-100 hover:border-rose-300 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                    title="Eliminar Obra Definitivamente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar Obra
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Partes Emitidos</div>
                <div className="text-2xl font-black text-slate-900">{reportCount}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Horas Acumuladas</div>
                <div className="text-2xl font-black text-[#FF6600]">{totalHours}H</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Geocerca</div>
                <div className="text-2xl font-black text-slate-900">{selectedProject.validationRadiusMeters}M</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Productividad</div>
                <div className="text-2xl font-black text-emerald-600">92%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6600]" />
                    Ubicación y Perímetro
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-slate-700 uppercase mb-3">{selectedProject.location.address}</div>
                    <div className="h-48 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase italic">
                      [ Vista de Mapa Satelital Activa ]
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-[#FF6600]" />
                    Actividad Reciente
                  </h3>
                  <div className="space-y-3">
                    {(state.reports || []).filter(r => r.projectId === selectedProject.id).slice(0, 5).map(report => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-900 uppercase">{report.code}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">{report.date}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-900">{report.totalHours}H</div>
                      </div>
                    ))}
                    {reportCount === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">No hay actividad registrada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subcontractor Assignments Section */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#FF6600]" />
                    Empresas Autorizadas en Obra
                  </h3>
                  {isAdmin && (
                    <button 
                      onClick={() => setSubAssignmentOpen(true)}
                      className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Gestionar Red
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Always show main contractor */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-900 uppercase">Empresa Principal</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">CONTRATISTA</div>
                      </div>
                    </div>
                  </div>

                  {(state.companies || [])
                    .filter(c => (selectedProject.assignedSubcontractorIds || []).includes(c.id))
                    .map(sub => (
                      <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between group hover:border-[#FF6600]/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Link className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600]" />
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-900 uppercase">{sub.name}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">SUBCONTRATA</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        <UnifiedCrudModal
          isOpen={subAssignmentOpen}
          onClose={() => setSubAssignmentOpen(false)}
          title="Gestionar Red de Subcontratas"
        >
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
              Selecciona las empresas que están autorizadas para trabajar en este proyecto. 
              Las empresas seleccionadas podrán ver la obra y emitir partes diarios.
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {(state.companies || [])
                .filter(c => c.type === 'SUBCONTRACTOR')
                .map(comp => {
                  const isAssigned = (selectedProject.assignedSubcontractorIds || []).includes(comp.id);
                  return (
                    <label 
                      key={comp.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        isAssigned ? 'bg-[#FF6600]/5 border-[#FF6600]/30' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
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
                          className="w-4 h-4 rounded border-slate-300 text-[#FF6600] focus:ring-[#FF6600]"
                        />
                        <span className="text-[10px] font-black text-slate-900 uppercase">{comp.name}</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{comp.taxId}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        </UnifiedCrudModal>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">Activos</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Directorio de Obras</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Proyectos</h1>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingProject(null);
              setName('');
              setAddress('');
              setLat(40.4168);
              setLng(-3.7038);
              setRadius(350);
              setPlannedHours(12000);
              setModalOpen(true);
            }}
            className="bg-[#FF6600] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            Nueva Obra
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR OBRA..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewPreference === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const reportCount = (state.reports || []).filter(r => r.projectId === project.id).length;
            const totalHours = (state.reports || [])
              .filter(r => r.projectId === project.id)
              .reduce((acc, r) => acc + r.totalHours, 0);

            return (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#FF6600]/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#FF6600] transition-colors" />
                    </div>
                    <Badge status={project.status} className="text-[8px] px-1.5 py-0" />
                  </div>

                  <div className="mb-4">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{project.code}</span>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5 line-clamp-1">{project.name}</h2>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-[#FF6600]" />
                      <span className="truncate uppercase font-bold">{project.location.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Partes</div>
                      <div className="text-xs font-black text-slate-900">{reportCount}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Horas</div>
                      <div className="text-xs font-black text-[#FF6600]">{totalHours}H</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">En Ejecución</div>
                  <button 
                    onClick={() => handleProjectClick(project)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-[#FF6600] hover:bg-slate-100 transition-all active:scale-90"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Obra</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Ubicación</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Métricas</th>
                <th className="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.map((project) => {
                const reportCount = (state.reports || []).filter(r => r.projectId === project.id).length;
                const totalHours = (state.reports || [])
                  .filter(r => r.projectId === project.id)
                  .reduce((acc, r) => acc + r.totalHours, 0);

                return (
                  <tr 
                    key={project.id} 
                    onClick={() => handleProjectClick(project)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-900 uppercase">{project.name}</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{project.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span className="truncate max-w-[200px] uppercase">{project.location.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge status={project.status} className="text-[8px] px-1.5 py-0" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-[10px] font-black text-slate-900 uppercase">
                        {reportCount} <span className="text-slate-400">P</span> <span className="mx-1 text-slate-200">/</span> <span className="text-[#FF6600]">{totalHours}H</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6600]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Project Modal — HIGH DENSITY REDESIGN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6600]">
                  {editingProject ? 'Editar Parámetros' : 'Gestión de Red'}
                </span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {editingProject ? 'Modificación de Centro de Trabajo' : 'Alta de Centro de Trabajo'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingProject(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-2 text-[10px] font-bold uppercase">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Presets - More professional layout */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Plantillas Rápidas</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyProjectPreset('Residencial Puerta de Hierro', 'Av. Miraflores 44, Madrid', 40.4530, -3.7310, 18000)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="text-[10px] font-black text-slate-900 uppercase">Residencial P. Hierro</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Edificación / 18k H</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyProjectPreset('Centro Logístico San Fernando', 'Polígono Industrial Las Monjas, Parcela 12', 40.4280, -3.5350, 24000)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="text-[10px] font-black text-slate-900 uppercase">Logístico San Fernando</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Nave Ind. / 24k H</div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Proyecto *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Rehabilitación Hospital Clínico"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ubicación Geográfica *</label>
                  <ProjectLocationPicker
                    initialLat={lat}
                    initialLng={lng}
                    radiusMeters={radius}
                    onLocationChange={(newLat, newLng, newAddress) => {
                      setLat(newLat);
                      setLng(newLng);
                      setAddress(newAddress);
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Radio de Geocerca (m)</label>
                    <div className="relative">
                      <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value) || 300)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[11px] font-bold text-slate-900 font-mono focus:outline-none focus:border-[#FF6600]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Horas Presupuestadas</label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="100"
                        value={plannedHours}
                        onChange={(e) => setPlannedHours(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[11px] font-bold text-slate-900 font-mono focus:outline-none focus:border-[#FF6600]/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setModalOpen(false);
                  setEditingProject(null);
                }}
                className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isSaving}
                className="bg-[#FF6600] text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-[#e65c00] transition-all shadow-md active:scale-95 disabled:opacity-75 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  editingProject ? 'Guardar Cambios' : 'Activar Centro de Trabajo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
