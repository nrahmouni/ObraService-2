import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  HardHat, 
  FolderKanban,
  Plus,
  X,
  Sparkles,
  Phone,
  Fingerprint,
  MoreVertical,
  Activity,
  Briefcase,
  LayoutGrid
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, Worker, WorkerCategory } from '../types';
import { toast } from 'react-hot-toast';

interface WorkersManagementViewProps {
  state: AppState;
}

export const WorkersManagementView: React.FC<WorkersManagementViewProps> = ({ state }) => {
  const currentUser = state.currentUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<WorkerCategory>('Oficial 1ª');
  const [companyId, setCompanyId] = useState(currentUser?.companyId || state.companies[0]?.id || '');
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const workers = state.workers || [];
  const companies = state.companies || [];
  const projects = state.projects || [];

  const handleOpenModal = (worker?: Worker) => {
    if (worker) {
      setEditingWorker(worker);
      setName(worker.name);
      setTaxId(worker.taxId || '');
      setPhone(worker.phone || '');
      setCategory(worker.category || 'Oficial 1ª');
      setCompanyId(worker.companyId);
      setAssignedProjectIds(worker.assignedProjectIds || []);
      setIsActive(worker.active);
    } else {
      setEditingWorker(null);
      setName('');
      setTaxId('');
      setPhone('');
      setCategory('Oficial 1ª');
      setCompanyId(currentUser?.companyId || companies[0]?.id || '');
      setAssignedProjectIds([]);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleToggleProjectAssignment = (pId: string) => {
    setAssignedProjectIds(prev => 
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del operario es obligatorio.');
      return;
    }

    const company = companies.find(c => c.id === companyId);
    const companyName = company ? company.name : 'Subcontrata';

    if (editingWorker) {
      obraStore.updateWorker(editingWorker.id, {
        name: name.trim(),
        taxId: taxId.trim(),
        phone: phone.trim(),
        category,
        companyId,
        companyNameSnapshot: companyName,
        assignedProjectIds,
        active: isActive,
      });
      toast.success('Ficha actualizada');
    } else {
      obraStore.addWorker({
        name: name.trim(),
        taxId: taxId.trim(),
        phone: phone.trim(),
        category,
        companyId,
        companyNameSnapshot: companyName,
        isSubcontractor: companyId !== 'comp_main',
        active: isActive,
        assignedProjectIds,
      });
      toast.success('Alta registrada');
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (worker: Worker) => {
    obraStore.updateWorker(worker.id, { active: !worker.active });
    toast.success(`Estado de ${worker.name} actualizado`);
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (w.taxId && w.taxId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCompany = selectedCompanyFilter === 'ALL' || w.companyId === selectedCompanyFilter;
    const matchesProject = selectedProjectFilter === 'ALL' || (w.assignedProjectIds && w.assignedProjectIds.includes(selectedProjectFilter));
    return matchesSearch && matchesCompany && matchesProject;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black text-brand-accent uppercase tracking-widest mb-3">
              <HardHat className="w-3.5 h-3.5" />
              Gestión de Fuerza Laboral
           </div>
           <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase leading-none">Matrícula de Operarios</h1>
           <p className="text-brand-muted font-medium mt-2">Control centralizado de plantillas propias y subcontratadas.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary h-14 px-8 shadow-xl shadow-brand-accent/20"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Alta de Operario
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-brand-surface border border-brand-border p-3 rounded-[2rem] flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
           <Search className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
           <input
             type="text"
             placeholder="Buscar por nombre, DNI o especialidad..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-12 pl-11 pr-4 bg-brand-bg border border-brand-border rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-accent transition-all"
           />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
           <select
             value={selectedCompanyFilter}
             onChange={(e) => setSelectedCompanyFilter(e.target.value)}
             className="h-12 px-4 bg-brand-bg border border-brand-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-accent transition-all min-w-[180px]"
           >
             <option value="ALL">Todas las Empresas</option>
             {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
           <select
             value={selectedProjectFilter}
             onChange={(e) => setSelectedProjectFilter(e.target.value)}
             className="h-12 px-4 bg-brand-bg border border-brand-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-accent transition-all min-w-[180px]"
           >
             <option value="ALL">Todas las Obras</option>
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>
      </div>

      {/* Workers Linear List */}
      <div className="space-y-3">
        {filteredWorkers.map(w => {
          const comp = companies.find(c => c.id === w.companyId);
          const assignedProjects = projects.filter(p => w.assignedProjectIds?.includes(p.id));

          return (
            <div key={w.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-brand-accent/30 transition-all">
               <div className="flex items-center gap-5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted font-black text-xl group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-all shrink-0">
                     {w.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                     <div className="flex items-center gap-3">
                        <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{w.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          w.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-brand-surface text-brand-muted border border-brand-border'
                        }`}>
                          {w.active ? 'Activo' : 'Baja'}
                        </span>
                     </div>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-accent uppercase tracking-widest">
                           <Activity className="w-3.5 h-3.5" />
                           {w.category || 'Oficial'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase tracking-tight">
                           <Building2 className="w-3.5 h-3.5" />
                           {comp?.name || 'Empresa Externa'}
                        </div>
                        {w.taxId && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-brand-muted">
                             <Fingerprint className="w-3.5 h-3.5" />
                             {w.taxId}
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-6">
                  <div className="hidden xl:flex flex-col items-end gap-1">
                     <span className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">Asignación Proyectos</span>
                     <div className="flex -space-x-2">
                        {assignedProjects.length > 0 ? (
                          assignedProjects.slice(0, 3).map((p, i) => (
                            <div key={p.id} className="w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-bg flex items-center justify-center text-[8px] font-black text-white uppercase" title={p.name}>
                               {p.name.charAt(0)}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-brand-muted font-bold italic">Sin Obra</span>
                        )}
                        {assignedProjects.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-brand-accent border-2 border-brand-bg flex items-center justify-center text-[8px] font-black text-white">
                             +{assignedProjects.length - 3}
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <button
                       onClick={() => handleOpenModal(w)}
                       className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-accent transition-all"
                     >
                       <Edit2 className="w-5 h-5" />
                     </button>
                     <button
                       onClick={() => handleToggleStatus(w)}
                       className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                         w.active ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                       }`}
                     >
                       {w.active ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                     </button>
                  </div>
               </div>
            </div>
          );
        })}

        {filteredWorkers.length === 0 && (
          <div className="p-24 bg-brand-surface border border-brand-border border-dashed rounded-[3rem] text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
                <Users className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Sin Operarios Registrados</h3>
                <p className="text-sm text-brand-muted font-medium">No se han encontrado operarios que coincidan con los filtros seleccionados.</p>
             </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Worker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/95 backdrop-blur-md p-6 overflow-y-auto">
          <div className="card max-w-2xl w-full p-0 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-surface">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                     {editingWorker ? 'Editar Ficha Operativa' : 'Alta de Nuevo Operario'}
                   </h2>
                   <p className="text-xs text-brand-muted font-medium mt-1">Configuración técnica de personal.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-brand-bg flex items-center justify-center text-brand-muted transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Manuel García"
                      className="input h-14"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">DNI / NIE / CIF</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                      placeholder="12345678Z"
                      className="input h-14 font-mono font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Teléfono Móvil</label>
                    <div className="relative">
                       <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                       <input
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         placeholder="600 000 000"
                         className="input h-14 pl-12"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Especialidad Profesional</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as WorkerCategory)}
                      className="input h-14 uppercase font-black text-[10px] tracking-widest"
                    >
                      <option value="Encargado General">Encargado General</option>
                      <option value="Jefe de Equipo">Jefe de Equipo</option>
                      <option value="Oficial 1ª">Oficial 1ª</option>
                      <option value="Oficial 2ª">Oficial 2ª</option>
                      <option value="Peón Especialista">Peón Especialista</option>
                      <option value="Peón Ordinario">Peón Ordinario</option>
                      <option value="Maquinista">Maquinista</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Empresa Pagadora</label>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="input h-14 font-bold"
                    >
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1 block">Habilitación en Obras Activas</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-brand-surface rounded-[2rem] border border-brand-border max-h-48 overflow-y-auto">
                      {projects.map(p => {
                        const isAssigned = assignedProjectIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProjectAssignment(p.id)}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight cursor-pointer flex items-center justify-between border transition-all ${
                              isAssigned ? 'bg-brand-accent/10 border-brand-accent text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-accent/30'
                            }`}
                          >
                            <span className="truncate max-w-[140px]">{p.name}</span>
                            {isAssigned && <CheckCircle2 className="w-4 h-4 text-brand-accent" />}
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>

              <div className="pt-8 flex items-center justify-end gap-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary h-14 px-8"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary h-14 px-12 text-sm shadow-xl shadow-brand-accent/20"
                >
                  {editingWorker ? 'Guardar Cambios' : 'Confirmar Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
