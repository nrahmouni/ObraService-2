import React, { useState } from 'react';
import { Building2, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { AppState, Company } from '../../types';
import { obraStore } from '../../services/store';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';

interface CompaniesSubTabProps {
  state: AppState;
  searchQuery: string;
}

export const CompaniesSubTab: React.FC<CompaniesSubTabProps> = ({ state, searchQuery }) => {
  const currentUser = state.currentUser;
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  const list = (state.companies || []).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.taxId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || name.trim().length < 3) {
      setFormError('La razón social de la subcontrata es obligatoria (mínimo 3 caracteres).');
      return;
    }
    if (!taxId.trim() || taxId.trim().length < 6) {
      setFormError('El CIF/NIF de la subcontrata debe ser válido (mínimo 6 caracteres).');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const res = obraStore.createSubcontractor({
        name: name.trim(),
        taxId: taxId.trim().toUpperCase(),
        address: address.trim()
      });

      if (res.success) {
        toast.success(`Empresa "${name.trim()}" dada de alta correctamente.`);
        setModalOpen(false);
        setName('');
        setTaxId('');
        setAddress('');
      } else {
        setFormError(res.error || 'Error al guardar la empresa.');
      }
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-4 font-sans text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Empresas Contratistas y Subcontratas Homologadas ({list.length})
        </span>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="self-start sm:self-auto bg-[#10B981] hover:bg-[#10B981]/90 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Homologar Subcontrata</span>
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(c => (
          <div key={c.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl hover:border-brand-accent/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-brand-accent transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                c.type === 'MAIN_CONTRACTOR' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                {c.type === 'MAIN_CONTRACTOR' ? 'Contratista' : 'Subcontrata'}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight truncate">{c.name}</h3>
            <div className="mt-3 space-y-1.5 font-mono text-[10px] text-slate-400">
              <div><span className="text-slate-600 font-bold">TAX ID:</span> {c.taxId}</div>
              <div><span className="text-slate-600 font-bold">CÓDIGO:</span> <span className="text-brand-accent font-bold">{c.inviteCode}</span></div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Homologar Nueva Empresa Subcontratista"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-xs font-bold text-rose-400 uppercase">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Razón Social</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Estructuras y Forjados S.L."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Identificación Fiscal (CIF / NIF)</label>
            <input
              type="text"
              required
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Ej. B12345678"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Domicilio Social</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Av. de la Innovación 14, Sevilla"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Homologar Empresa'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
