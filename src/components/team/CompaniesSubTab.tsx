import React, { useState } from 'react';
import { Building2, Plus, Sparkles, RefreshCw, IdCard, MapPin, Hash, Trash2, Edit2, X } from 'lucide-react';
import { AppState, Company } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui/Badge';

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
      setFormError('Nombre inválido.');
      return;
    }
    if (!taxId.trim() || taxId.trim().length < 6) {
      setFormError('CIF inválido.');
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
        toast.success(`Empresa registrada: ${name.trim()}`);
        setModalOpen(false);
        setName('');
        setTaxId('');
        setAddress('');
      } else {
        setFormError(res.error || 'Error al guardar.');
      }
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em]">Proveedores y Subcontratas</h2>
        
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="btn-primary h-10 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20">
            <Plus className="w-4 h-4" />
            <span>Homologar Empresa</span>
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(c => (
          <div key={c.id} className="card group hover:border-brand-accent/40 transition-all duration-300">
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="max-w-[140px]">
                    <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors truncate">
                      {c.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase">
                      <IdCard className="w-3 h-3 text-brand-accent" />
                      <span>{c.taxId}</span>
                    </div>
                  </div>
                </div>
                <Badge status={c.type === 'MAIN_CONTRACTOR' ? 'Active' : 'Paused'} className="text-[9px] px-2 py-0.5 rounded uppercase font-black">
                  {c.type === 'MAIN_CONTRACTOR' ? 'Contratista' : 'Subcontrata'}
                </Badge>
              </div>

              <div className="pt-4 border-t border-brand-border/50 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-brand-accent" />
                      Código Acceso
                   </div>
                   <div className="text-[10px] font-black text-brand-accent font-mono bg-brand-accent/5 px-2 py-0.5 rounded border border-brand-accent/10">
                      {c.inviteCode}
                   </div>
                </div>

                <div className="space-y-1">
                   <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-brand-accent" />
                      Sede Social
                   </div>
                   <div className="text-[10px] font-medium text-brand-muted truncate uppercase">
                      {c.address || 'No declarada'}
                   </div>
                </div>
              </div>

              {isAdmin && c.type !== 'MAIN_CONTRACTOR' && (
                <div className="pt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-accent transition-colors flex items-center justify-center">
                      <Edit2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Homologar Subcontrata"
      >
        <form onSubmit={handleCreate} className="space-y-5 p-2">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <X className="w-4 h-4" />
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Razón Social</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Estructuras y Forjados S.L."
              className="input uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">CIF / NIF</label>
            <input
              type="text"
              required
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="B12345678"
              className="input font-mono uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Domicilio Social</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. de la Innovación 14, Sevilla"
              className="input uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 mt-4"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirmar Homologación'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
