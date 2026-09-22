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
  Sparkles
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
      toast.success(`Operario "${name}" actualizado con éxito.`);
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
      toast.success(`Operario "${name}" registrado en plantilla.`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (worker: Worker) => {
    obraStore.updateWorker(worker.id, { active: !worker.active });
    toast.success(`Estado de ${worker.name} cambiado a ${!worker.active ? 'Activo' : 'Inactivo'}`);
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (w.taxId && w.taxId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCompany = selectedCompanyFilter === 'ALL' || w.companyId === selectedCompanyFilter;
    const matchesProject = selectedProjectFilter === 'ALL' || (w.assignedProjectIds && w.assignedProjectIds.includes(selectedProjectFilter));
    return matchesSearch && matchesCompany && matchesProject;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HardHat className="w-3.5 h-3.5" />
            <span>Gestión de Plantillas y Cuadrillas</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Control de Operarios y Personal de Campo</h1>
          <p className="text-xs text-slate-400">Matriculación, asignación de obras y estado de actividad de la fuerza laboral.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95 border border-amber-500/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Alta Nuevo Operario</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o NIF/CIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas las Empresas</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas las Obras</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Linear List */}
      <div className="flex flex-col space-y-3">
        {filteredWorkers.map(w => {
          const comp = companies.find(c => c.id === w.companyId);
          const assignedProjects = projects.filter(p => w.assignedProjectIds?.includes(p.id));

          return (
            <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{w.name}</h3>
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{w.category || 'Oficial'}</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    w.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {w.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Empresa:</span>
                    <span className="font-bold text-slate-800">{comp?.name || w.companyNameSnapshot || 'Subcontrata'}</span>
                  </div>
                  {w.taxId && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>DNI/NIE:</span>
                      <span className="font-mono font-medium text-slate-700">{w.taxId}</span>
                    </div>
                  )}
                  {w.phone && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Teléfono:</span>
                      <span className="font-mono font-medium text-slate-700">{w.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Obras Asignadas ({assignedProjects.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {assignedProjects.length > 0 ? (
                      assignedProjects.map(p => (
                        <span key={p.id} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 truncate max-w-[150px]">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sin obras asignadas</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(w)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleToggleStatus(w)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    w.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {w.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Worker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <HardHat className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-900">
                  {editingWorker ? 'Editar Ficha de Operario' : 'Alta de Nuevo Operario'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Manuel García"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">DNI / NIE</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="12345678Z"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Teléfono Movil</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="600000000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Categoría Profesional</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkerCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#18181B] border border-[#27272A] text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#EA580C] [&>option]:bg-[#18181B] [&>option]:text-white"
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Empresa de Pertenencia</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#18181B] border border-[#27272A] text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#EA580C] [&>option]:bg-[#18181B] [&>option]:text-white"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Asignación a Obras Activas</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {projects.map(p => {
                    const isAssigned = assignedProjectIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProjectAssignment(p.id)}
                        className={`p-2 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                          isAssigned ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isAssigned && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 text-white font-black rounded-xl text-xs uppercase tracking-wider hover:bg-amber-500 cursor-pointer shadow-md"
                >
                  {editingWorker ? 'Guardar Cambios' : 'Registrar Operario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
