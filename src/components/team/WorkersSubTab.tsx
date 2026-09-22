import React, { useState } from 'react';
import { Plus, Trash2, Edit2, HardHat, ShieldCheck, Sparkles } from 'lucide-react';
import { Worker, WorkerCategory, Company, AppState } from '../../types';
import { obraStore } from '../../services/store';
import { Table } from '../ui/Table';
import { StatusPill } from '../ui/StatusPill';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';

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
      setFormError('El nombre completo del operario es obligatorio (mínimo 3 caracteres).');
      return;
    }
    if (!workerDni.trim() || workerDni.trim().length < 5) {
      setFormError('El DNI, NIE o documento nacional de identidad es obligatorio (mínimo 5 caracteres).');
      return;
    }

    const targetCompanyId = workerCompanyId || state.companies[0]?.id;
    if (!targetCompanyId) {
      setFormError('Se requiere asignar una empresa contratista/subcontratista autorizada.');
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
        toast.success(`Operario "${workerName.trim()}" actualizado con éxito.`);
      } else {
        obraStore.createWorker({
          name: workerName.trim(),
          category: workerCategory,
          companyId: targetCompanyId,
          nationalId: workerDni.trim().toUpperCase(),
          active: true,
        });
        toast.success(`Operario "${workerName.trim()}" registrado con éxito.`);
      }
      setModalOpen(false);
      setIsSaving(false);
    }, 400);
  };

  const handleDelete = (workerId: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${name}" del registro?`)) {
      const res = obraStore.deleteWorker(workerId);
      if (res) {
        toast.success(`Operario "${name}" eliminado con éxito.`);
      } else {
        toast.error("Error al eliminar el operario.");
      }
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-300">
      {/* Search Header Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Registros Oficiales de Cuadrilla y Personal ({filteredWorkers.length})
        </div>
        
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="self-start sm:self-auto bg-brand-accent hover:bg-brand-accent/90 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Operario</span>
          </button>
        )}
      </div>

      {/* Workers Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Table headers={['Operario', 'Categoría Profesional', 'Empresa / Subcontrata', 'DNI / NIF', 'Estado', '']}>
          {filteredWorkers.map(w => {
            const comp = state.companies.find(c => c.id === w.companyId);
            return (
              <tr key={w.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-brand-accent shadow-sm shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-200 uppercase">{w.name}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">ID: {w.id.substring(0, 8)}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-300">
                    {w.category}
                  </span>
                </td>

                <td className="px-6 py-4.5">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    {comp ? comp.name : 'Empresa Externa'}
                  </span>
                </td>

                <td className="px-6 py-4.5">
                  <span className="font-mono text-xs font-bold text-slate-400">{w.nationalId || 'No Registrado'}</span>
                </td>

                <td className="px-6 py-4.5">
                  <StatusPill status="Active" />
                </td>

                <td className="px-6 py-4.5 text-right">
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(w)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-accent hover:border-brand-accent/20 transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.name)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/40 transition-all cursor-pointer"
                        title="Baja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredWorkers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-500 uppercase font-black tracking-widest">
                No hay operarios dados de alta en esta cuadrilla.
              </td>
            </tr>
          )}
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorker ? 'Editar Operario Registrado' : 'Alta de Nuevo Operario'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-xs font-bold text-rose-400 uppercase tracking-wide">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nombre Completo del Operario</label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Ej. Manuel García López"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Categoría Profesional</label>
              <select
                value={workerCategory}
                onChange={(e) => setWorkerCategory(e.target.value as WorkerCategory)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-accent"
              >
                <option value="Oficial de 1ª">Oficial de 1ª</option>
                <option value="Oficial de 2ª">Oficial de 2ª</option>
                <option value="Peón Especialista">Peón Especialista</option>
                <option value="Peón Ordinario">Peón Ordinario</option>
                <option value="Encargado de Obra">Encargado de Obra</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">DNI / NIE / NIF</label>
              <input
                type="text"
                value={workerDni}
                onChange={(e) => setWorkerDni(e.target.value)}
                placeholder="Ej. 12345678Z"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-accent"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Empresa de Contratación</label>
            <select
              value={workerCompanyId}
              onChange={(e) => setWorkerCompanyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-accent"
            >
              {state.companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id === currentUser.companyId ? '(Principal)' : '(Subcontrata)'}
                </option>
              ))}
            </select>
          </div>

          {!editingWorker && (
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                Presets de Prueba Rápidos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Javier Sotomayor', cat: 'Oficial de 1ª' },
                  { name: 'Sofía Benítez Rivas', cat: 'Encargado de Obra' },
                  { name: 'Alejandro Domínguez', cat: 'Peón Especialista' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyWorkerPreset(p.name, p.cat as WorkerCategory)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-brand-accent" />
                    <span>{p.name} ({p.cat})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? 'Guardando...' : editingWorker ? 'Actualizar Operario' : 'Registrar Alta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
