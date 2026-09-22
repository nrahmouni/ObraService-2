import React, { useState } from 'react';
import { Truck, Plus, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { AppState, Machinery } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';

interface MachinerySubTabProps {
  state: AppState;
  searchQuery: string;
}

export const MachinerySubTab: React.FC<MachinerySubTabProps> = ({ state, searchQuery }) => {
  const currentUser = state.currentUser;
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMac, setEditingMac] = useState<Machinery | null>(null);
  const [macName, setMacName] = useState('');
  const [macType, setMacType] = useState('Excavadora');
  const [macCompanyId, setMacCompanyId] = useState(currentUser?.companyId || '');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  const list = (state.machinery || []).filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingMac(null);
    setMacName('');
    setMacType('Excavadora');
    setMacCompanyId(currentUser.companyId || state.companies[0]?.id || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: Machinery) => {
    setEditingMac(m);
    setMacName(m.name);
    setMacType(m.type);
    setMacCompanyId(m.companyId);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!macName.trim() || macName.trim().length < 2) {
      setFormError('La identificación o modelo de la máquina es obligatoria.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const companyId = macCompanyId || state.companies[0]?.id || '';
      if (editingMac) {
        obraStore.updateMachinery(editingMac.id, {
          name: macName.trim(),
          type: macType,
          companyId
        });
        toast.success(`Maquinaria "${macName}" actualizada.`);
      } else {
        obraStore.createMachinery({
          name: macName.trim(),
          type: macType,
          companyId,
          active: true
        });
        toast.success(`Maquinaria "${macName}" registrada.`);
      }
      setModalOpen(false);
      setIsSaving(false);
    }, 400);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas retirar la máquina "${name}"?`)) {
      const res = obraStore.deleteMachinery(id);
      if (res) {
        toast.success(`Maquinaria "${name}" retirada.`);
      } else {
        toast.error("No se pudo dar de baja.");
      }
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Maquinaria Pesada y Medios Auxiliares ({list.length})
        </span>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="self-start sm:self-auto bg-brand-accent hover:bg-brand-accent/90 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Maquinaria</span>
          </button>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        {list.map(mac => {
          const company = state.companies.find(c => c.id === mac.companyId);
          return (
            <div key={mac.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-brand-accent/40 transition-all shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-accent transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    mac.active ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    {mac.active ? 'OPERATIVA' : 'BAJA'}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight line-clamp-1">{mac.name}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{mac.type}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px]">
                  {company ? company.name : 'Externa'}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(mac)} className="p-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(mac.id, mac.name)} className="p-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMac ? 'Editar Maquinaria' : 'Homologar Maquinaria Pesada'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-xs font-bold text-rose-400 uppercase">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Identificación o Modelo</label>
            <input
              type="text"
              required
              value={macName}
              onChange={(e) => setMacName(e.target.value)}
              placeholder="Ej. Excavadora Caterpillar 320"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Clasificación de Maquinaria</label>
            <select
              value={macType}
              onChange={(e) => setMacType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            >
              <option value="Excavadora">Excavadora</option>
              <option value="Grúa Torre / Móvil">Grúa Torre / Móvil</option>
              <option value="Camión Bañera / Volquete">Camión Bañera / Volquete</option>
              <option value="Plataforma Elevadora">Plataforma Elevadora</option>
              <option value="Grupo Electrógeno">Grupo Electrógeno</option>
              <option value="Otros Equipos Auxiliares">Otros Equipos Auxiliares</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Propietario Legal</label>
            <select
              value={macCompanyId}
              onChange={(e) => setMacCompanyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            >
              {state.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : editingMac ? 'Guardar Cambios' : 'Registrar Maquinaria'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
