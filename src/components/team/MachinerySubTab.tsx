import React, { useState } from 'react';
import { Truck, Plus, Trash2, Edit2, RefreshCw, Box, Activity, Building2, Tag, Wrench, X } from 'lucide-react';
import { AppState, Machinery } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui/Badge';

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
      setFormError('Identificación obligatoria.');
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
        toast.success(`Actualizada: ${macName}`);
      } else {
        obraStore.createMachinery({
          name: macName.trim(),
          type: macType,
          companyId,
          active: true
        });
        toast.success(`Registrada: ${macName}`);
      }
      setModalOpen(false);
      setIsSaving(false);
    }, 400);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Retirar máquina "${name}"?`)) {
      const res = obraStore.deleteMachinery(id);
      if (res) {
        toast.success(`Máquina retirada.`);
      } else {
        toast.error("Error al procesar baja.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em]">Registro de Maquinaria</h2>
        
        {isAdmin && (
          <button onClick={handleOpenCreate} className="btn-primary h-10 px-6 bg-blue-600 hover:bg-blue-700 shadow-blue-900/20">
            <Plus className="w-4 h-4" />
            <span>Registrar Equipo</span>
          </button>
        )}
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(mac => {
          const company = state.companies.find(c => c.id === mac.companyId);
          return (
            <div key={mac.id} className="card group hover:border-blue-500/40 transition-all duration-300">
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="max-w-[140px]">
                      <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors truncate">
                        {mac.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase">
                        <Tag className="w-3 h-3 text-blue-500" />
                        <span>{mac.type}</span>
                      </div>
                    </div>
                  </div>
                  <Badge status={mac.active ? 'Active' : 'Paused'} className="text-[9px] px-2 py-0.5 rounded uppercase font-black" />
                </div>

                <div className="pt-4 border-t border-brand-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-blue-500" />
                        Propietario
                     </div>
                     <div className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">
                        {company ? company.name : 'Externo'}
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Estado Uso
                     </div>
                     <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        Operativa
                     </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(mac)}
                      className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mac.id, mac.name)}
                      className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-rose-500 hover:border-rose-500 transition-all flex items-center justify-center"
                      title="Retirar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-16 text-center flex flex-col items-center gap-4 border-dashed border-brand-border">
            <div className="w-20 h-20 rounded-3xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted opacity-30">
              <Wrench className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Sin maquinaria registrada</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMac ? 'Editar Maquinaria' : 'Homologar Maquinaria'}
      >
        <form onSubmit={handleSave} className="space-y-5 p-2">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <X className="w-4 h-4" />
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Modelo / Identificación</label>
            <input
              type="text"
              required
              value={macName}
              onChange={(e) => setMacName(e.target.value)}
              placeholder="Excavadora Caterpillar 320"
              className="input uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Tipo de Equipo</label>
            <select
              value={macType}
              onChange={(e) => setMacType(e.target.value)}
              className="select"
            >
              <option value="Excavadora">Excavadora</option>
              <option value="Grúa Torre / Móvil">Grúa Torre / Móvil</option>
              <option value="Camión Bañera / Volquete">Camión Bañera / Volquete</option>
              <option value="Plataforma Elevadora">Plataforma Elevadora</option>
              <option value="Grupo Electrógeno">Grupo Electrógeno</option>
              <option value="Otros Equipos Auxiliares">Otros Equipos Auxiliares</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Empresa Propietaria</label>
            <select
              value={macCompanyId}
              onChange={(e) => setMacCompanyId(e.target.value)}
              className="select"
            >
              {state.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-blue-900/20 mt-4"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : editingMac ? 'Guardar Cambios' : 'Confirmar Registro'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
