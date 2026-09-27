import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  HardHat, 
  ShieldCheck, 
  Sparkles, 
  User, 
  IdCard, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  X,
  FolderKanban,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Worker, WorkerCategory, Company, AppState } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui/Badge';

interface WorkersSubTabProps {
  state: AppState;
  searchQuery: string;
}

const CATEGORIES: WorkerCategory[] = [
  'Encargado General',
  'Jefe de Equipo',
  'Oficial 1ª',
  'Oficial 2ª',
  'Oficial de 1ª',
  'Encofrador',
  'Ferrallista',
  'Peón Especialista',
  'Peón Ordinario',
  'Maquinista',
  'Electricista',
  'Fontanero'
];

export const WorkersSubTab: React.FC<WorkersSubTabProps> = ({ state, searchQuery }) => {
  const currentUser = state.currentUser;
  
  // Filters
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');

  // Modals & Forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerName, setWorkerName] = useState('');
  const [workerCategory, setWorkerCategory] = useState<WorkerCategory>('Oficial 1ª');
  const [workerCompanyId, setWorkerCompanyId] = useState(currentUser?.companyId || '');
  const [workerDni, setWorkerDni] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  const mainCompany = (state.companies || []).find(c => c.type === 'MAIN_CONTRACTOR') || state.companies[0];
  const subcontractors = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');

  // Filter workers based on search and company
  const filteredWorkers = (state.workers || []).filter(w => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      w.name.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      (w.nationalId && w.nationalId.toLowerCase().includes(q));

    let matchesCompany = true;
    if (selectedCompanyFilter === 'MAIN') {
      matchesCompany = w.companyId === mainCompany?.id || !w.isSubcontractor;
    } else if (selectedCompanyFilter !== 'ALL') {
      matchesCompany = w.companyId === selectedCompanyFilter;
    }

    return matchesSearch && matchesCompany;
  });

  const applyWorkerPreset = (name: string, cat: WorkerCategory, compId?: string) => {
    setWorkerName(name);
    setWorkerCategory(cat);
    setWorkerDni('5' + Math.floor(1000000 + Math.random() * 9000000) + 'X');
    if (compId) setWorkerCompanyId(compId);
  };

  const handleOpenCreate = () => {
    setEditingWorker(null);
    setWorkerName('');
    setWorkerCategory('Oficial 1ª');
    setWorkerCompanyId(mainCompany?.id || state.companies[0]?.id || '');
    setWorkerDni('');
    setWorkerPhone('');
    setAssignedProjectIds((state.projects || []).map(p => p.id));
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name);
    setWorkerCategory(w.category);
    setWorkerCompanyId(w.companyId);
    setWorkerDni(w.nationalId || w.taxId || '');
    setWorkerPhone(w.phone || '');
    setAssignedProjectIds(w.assignedProjectIds || (state.projects || []).map(p => p.id));
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!workerName.trim() || workerName.trim().length < 3) {
      setFormError('Por favor introduce un nombre válido.');
      return;
    }

    const targetCompanyId = workerCompanyId || mainCompany?.id || state.companies[0]?.id;
    if (!targetCompanyId) {
      setFormError('Se requiere asignar una empresa empleadora.');
      return;
    }

    const comp = state.companies.find(c => c.id === targetCompanyId);

    setIsSaving(true);
    setTimeout(() => {
      if (editingWorker) {
        obraStore.updateWorker(editingWorker.id, {
          name: workerName.trim(),
          category: workerCategory,
          companyId: targetCompanyId,
          companyNameSnapshot: comp?.name || 'Empresa',
          isSubcontractor: comp?.type === 'SUBCONTRACTOR',
          nationalId: workerDni.trim().toUpperCase(),
          phone: workerPhone.trim(),
          assignedProjectIds,
        });
        toast.success(`Ficha de ${workerName.trim()} actualizada.`);
      } else {
        obraStore.createWorker({
          name: workerName.trim(),
          category: workerCategory,
          companyId: targetCompanyId,
          companyNameSnapshot: comp?.name || 'Empresa',
          isSubcontractor: comp?.type === 'SUBCONTRACTOR',
          nationalId: workerDni.trim().toUpperCase() || 'S/N',
          phone: workerPhone.trim(),
          active: true,
          assignedProjectIds,
        });
        toast.success(`Operario ${workerName.trim()} registrado en ${comp?.name || 'plantilla'}.`);
      }
      setModalOpen(false);
      setIsSaving(false);
    }, 300);
  };

  const handleDelete = (workerId: string, name: string) => {
    if (confirm(`¿Dar de baja a "${name}"?`)) {
      const res = obraStore.deleteWorker(workerId);
      if (res) {
        toast.success(`Baja confirmada: ${name}`);
      } else {
        toast.error("Error al procesar la baja.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Actions & Company Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Company Quick-Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-brand-surface border border-brand-border rounded-2xl overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setSelectedCompanyFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              selectedCompanyFilter === 'ALL'
                ? 'bg-brand-accent text-white shadow'
                : 'text-brand-muted hover:text-white hover:bg-brand-bg'
            }`}
          >
            Todas las Cuadrillas ({state.workers?.length || 0})
          </button>

          {mainCompany && (
            <button
              onClick={() => setSelectedCompanyFilter('MAIN')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCompanyFilter === 'MAIN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-brand-muted hover:text-white hover:bg-brand-bg'
              }`}
            >
              Personal Propio ({(state.workers || []).filter(w => w.companyId === mainCompany.id || !w.isSubcontractor).length})
            </button>
          )}

          {subcontractors.map(sub => {
            const count = (state.workers || []).filter(w => w.companyId === sub.id).length;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedCompanyFilter(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCompanyFilter === sub.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-brand-muted hover:text-white hover:bg-brand-bg'
                }`}
              >
                {sub.name} ({count})
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button 
            onClick={handleOpenCreate} 
            className="btn-primary h-11 px-5 shadow-lg shadow-brand-accent/20 cursor-pointer text-xs uppercase tracking-wider gap-2 shrink-0 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Operario</span>
          </button>
        )}
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorkers.map(w => {
          const comp = (state.companies || []).find(c => c.id === w.companyId);
          const isMainWorker = !w.isSubcontractor && (comp?.type === 'MAIN_CONTRACTOR' || w.companyId === mainCompany?.id);
          const workerProjects = (state.projects || []).filter(p => (w.assignedProjectIds || []).includes(p.id));

          return (
            <div 
              key={w.id} 
              className="card group hover:border-brand-accent/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                      isMainWorker
                        ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-brand-accent transition-colors">
                        {w.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase mt-0.5">
                        <span className="text-brand-accent">{w.category}</span>
                        <span>•</span>
                        <span>DNI: {w.nationalId || w.taxId || 'S/N'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                    w.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {w.active ? 'Activo' : 'Baja'}
                  </span>
                </div>

                {/* Company Link Badge */}
                <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className={`w-4 h-4 shrink-0 ${isMainWorker ? 'text-blue-400' : 'text-emerald-400'}`} />
                    <div className="min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-wider text-brand-muted">
                        {isMainWorker ? 'Personal Propio' : 'Subcontrata'}
                      </div>
                      <div className="text-xs font-bold text-white uppercase truncate">
                        {comp ? comp.name : (w.companyNameSnapshot || 'Constructora')}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    isMainWorker ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isMainWorker ? 'Directo' : 'Externo'}
                  </span>
                </div>

                {/* Assigned Projects */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3 h-3 text-brand-accent" />
                      Obras Asignadas
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {workerProjects.length > 0 ? `${workerProjects.length} tajos` : 'Todas'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {workerProjects.length > 0 ? (
                      workerProjects.slice(0, 2).map(p => (
                        <span 
                          key={p.id}
                          className="text-[9px] font-bold bg-brand-surface border border-brand-border text-slate-300 px-2 py-0.5 rounded-lg truncate max-w-[150px]"
                        >
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Habilitado para cualquier obra autorizada
                      </span>
                    )}
                    {workerProjects.length > 2 && (
                      <span className="text-[9px] font-bold bg-brand-surface border border-brand-border text-brand-accent px-1.5 py-0.5 rounded-lg">
                        +{workerProjects.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              {isAdmin && (
                <div className="p-3 bg-brand-bg/50 border-t border-brand-border/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(w)}
                    className="w-8 h-8 rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    title="Editar ficha de operario"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    className="w-8 h-8 rounded-lg bg-brand-surface hover:bg-rose-500/20 border border-brand-border text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center justify-center cursor-pointer"
                    title="Dar de baja operario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredWorkers.length === 0 && (
          <div className="col-span-full card p-12 text-center flex flex-col items-center gap-3 border-dashed border-brand-border">
            <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase">No hay operarios que coincidan</h3>
              <p className="text-xs text-brand-muted font-medium mt-1">
                Ajusta el filtro por empresa o registra nuevos operarios en la plantilla.
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={handleOpenCreate}
                className="btn-primary h-10 px-5 text-xs uppercase tracking-wider mt-2 cursor-pointer"
              >
                + Alta de Operario
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT WORKER MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorker ? 'Editar Operario' : 'Alta de Nuevo Operario'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
              Nombre Completo <span className="text-brand-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Ej. José María Beltrán"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                DNI / NIE / Documento ID
              </label>
              <input
                type="text"
                value={workerDni}
                onChange={(e) => setWorkerDni(e.target.value)}
                placeholder="48291044M"
                className="input-field font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                Categoría Profesional
              </label>
              <select
                value={workerCategory}
                onChange={(e) => setWorkerCategory(e.target.value as WorkerCategory)}
                className="input-field cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Empresa Empleadora (CRITICAL LINKAGE) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted flex items-center justify-between">
              <span>Empresa Empleadora <span className="text-brand-accent">*</span></span>
              <span className="text-slate-400 font-normal">Personal Propio o Subcontrata</span>
            </label>
            <select
              value={workerCompanyId}
              onChange={(e) => setWorkerCompanyId(e.target.value)}
              className="input-field cursor-pointer"
              required
            >
              <optgroup label="🏢 Empresa Principal (Personal Propio)">
                {mainCompany && (
                  <option value={mainCompany.id}>
                    {mainCompany.name} (Contratista General)
                  </option>
                )}
              </optgroup>
              <optgroup label="🔗 Subcontratistas Homologadas">
                {subcontractors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.taxId})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Obras Asignadas */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
              Obras en las que opera habitualmente
            </label>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {(state.projects || []).map(p => {
                const checked = assignedProjectIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      checked ? 'bg-orange-500/10 border-brand-accent text-white' : 'bg-brand-surface border-brand-border text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAssignedProjectIds(prev =>
                          checked ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        );
                      }}
                      className="accent-orange-500 w-4 h-4 rounded"
                    />
                    <span className="font-bold uppercase truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-auto">{p.code}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Demo Quick Presets */}
          {!editingWorker && (
            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">
                Completado Rápido de Prueba:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Antonio Rivas Cano', cat: 'Encargado General', comp: mainCompany?.id },
                  { name: 'Manuel Domínguez', cat: 'Encofrador', comp: subcontractors[0]?.id || mainCompany?.id },
                  { name: 'Lucas Santana', cat: 'Oficial 1ª', comp: subcontractors[1]?.id || mainCompany?.id },
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyWorkerPreset(preset.name, preset.cat as WorkerCategory, preset.comp)}
                    className="px-2.5 py-1 rounded-lg bg-brand-bg hover:bg-slate-800 border border-brand-border text-[9px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {preset.name} ({preset.cat})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary h-11 px-4 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary h-11 px-6 text-xs uppercase tracking-wider cursor-pointer"
            >
              {isSaving ? 'Guardando...' : editingWorker ? 'Actualizar Ficha' : 'Dar de Alta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
