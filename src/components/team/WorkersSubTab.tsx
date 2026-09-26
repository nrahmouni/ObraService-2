import React, { useState } from 'react';
import { Plus, Trash2, Edit2, HardHat, ShieldCheck, Sparkles, User, IdCard, Building2, Briefcase, ChevronRight, X } from 'lucide-react';
import { Worker, WorkerCategory, Company, AppState } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui/Badge';

interface WorkersSubTabProps {
  state: AppState;
  searchQuery: string;
}

export const WorkersSubTab: React.FC<WorkersSubTabProps> = ({ state, searchQuery }) => {
  const currentUser = state.currentUser;
  
  // Modals & Forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerName, setWorkerName] = useState('');
  const [workerCategory, setWorkerCategory] = useState<WorkerCategory>('Oficial de 1ª');
  const [workerCompanyId, setWorkerCompanyId] = useState(currentUser?.companyId || '');
  const [workerDni, setWorkerDni] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  // Filters
  const filteredWorkers = (state.workers || []).filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyWorkerPreset = (name: string, cat: WorkerCategory) => {
    setWorkerName(name);
    setWorkerCategory(cat);
    setWorkerDni('5' + Math.floor(1000000 + Math.random() * 9000000) + 'X');
  };

  const handleOpenCreate = () => {
    setEditingWorker(null);
    setWorkerName('');
    setWorkerCategory('Oficial de 1ª');
    setWorkerCompanyId(currentUser.companyId || state.companies[0]?.id || '');
    setWorkerDni('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name);
    setWorkerCategory(w.category);
    setWorkerCompanyId(w.companyId);
    setWorkerDni(w.nationalId || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!workerName.trim() || workerName.trim().length < 3) {
      setFormError('Nombre inválido.');
      return;
    }
    if (!workerDni.trim() || workerDni.trim().length < 5) {
      setFormError('DNI inválido.');
      return;
    }

    const targetCompanyId = workerCompanyId || state.companies[0]?.id;
    if (!targetCompanyId) {
      setFormError('Se requiere asignar una empresa.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (editingWorker) {
        obraStore.updateWorker(editingWorker.id, {
          name: workerName.trim(),
          category: workerCategory,
          companyId: targetCompanyId,
          nationalId: workerDni.trim().toUpperCase()
        });
        toast.success(`Actualizado: ${workerName.trim()}`);
      } else {
        obraStore.createWorker({
          name: workerName.trim(),
          category: workerCategory,
          companyId: targetCompanyId,
          nationalId: workerDni.trim().toUpperCase(),
          active: true,
        });
        toast.success(`Registrado: ${workerName.trim()}`);
      }
      setModalOpen(false);
      setIsSaving(false);
    }, 400);
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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h2 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em]">Listado de Cuadrillas</h2>
        
        {isAdmin && (
          <button onClick={handleOpenCreate} className="btn-primary h-11 sm:h-10 px-6 w-full sm:w-auto justify-center text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            <span>Añadir Operario</span>
          </button>
        )}
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredWorkers.map(w => {
          const comp = state.companies.find(c => c.id === w.companyId);
          return (
            <div key={w.id} className="card group hover:border-brand-accent/40 transition-all duration-300">
              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors">
                        {w.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase">
                        <IdCard className="w-3 h-3 text-brand-accent" />
                        <span>{w.nationalId || 'S/N'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge status="Active" className="text-[9px] px-2 py-0.5 rounded uppercase font-black" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-brand-border/50">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                       <Briefcase className="w-3 h-3 text-brand-accent" />
                       Categoría
                    </div>
                    <div className="text-[11px] font-bold text-white uppercase truncate">{w.category}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                       <Building2 className="w-3.5 h-3.5 text-brand-accent" />
                       Empresa
                    </div>
                    <div className="text-[11px] font-bold text-white uppercase truncate">{comp ? comp.name : 'Externa'}</div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-accent hover:border-brand-accent transition-all flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id, w.name)}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-rose-500 hover:border-rose-500 transition-all flex items-center justify-center"
                      title="Baja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredWorkers.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-16 text-center flex flex-col items-center gap-4 border-dashed border-brand-border">
            <div className="w-20 h-20 rounded-3xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted opacity-30">
              <HardHat className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Sin operarios registrados</p>
          </div>
        )}
      </div>

      {/* Modal Overhaul */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorker ? 'Editar Perfil Operario' : 'Registrar Nuevo Operario'}
      >
        <form onSubmit={handleSave} className="space-y-5 p-2">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <X className="w-4 h-4" />
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Nombre Completo</label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Manuel García López"
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Documento ID</label>
              <input
                type="text"
                value={workerDni}
                onChange={(e) => setWorkerDni(e.target.value)}
                placeholder="12345678Z"
                className="input font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Categoría</label>
              <select
                value={workerCategory}
                onChange={(e) => setWorkerCategory(e.target.value as WorkerCategory)}
                className="select"
              >
                <option value="Oficial de 1ª">Oficial de 1ª</option>
                <option value="Oficial de 2ª">Oficial de 2ª</option>
                <option value="Peón Especialista">Peón Especialista</option>
                <option value="Peón Ordinario">Peón Ordinario</option>
                <option value="Encargado de Obra">Encargado de Obra</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Empresa / Empleador</label>
            <select
              value={workerCompanyId}
              onChange={(e) => setWorkerCompanyId(e.target.value)}
              className="select"
            >
              {state.companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id === currentUser.companyId ? '(Principal)' : '(Subcontrata)'}
                </option>
              ))}
            </select>
          </div>

          {!editingWorker && (
            <div className="p-4 bg-brand-surface/50 border border-brand-border rounded-2xl space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">
                Completado Rápido (Demo):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Javier Sotomayor', cat: 'Oficial de 1ª' },
                  { name: 'Sofía Benítez Rivas', cat: 'Encargado de Obra' },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyWorkerPreset(p.name, p.cat as WorkerCategory)}
                    className="px-3 py-1.5 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-border text-[9px] font-black text-brand-muted hover:text-brand-accent uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-8"
            >
              {isSaving ? 'Procesando...' : editingWorker ? 'Actualizar Operario' : 'Dar de Alta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
