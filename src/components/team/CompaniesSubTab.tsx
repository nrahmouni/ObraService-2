import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  IdCard, 
  MapPin, 
  Hash, 
  Trash2, 
  Edit2, 
  X, 
  Users, 
  FolderKanban, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Copy,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { AppState, Company, Project, Worker, User } from '../../types';
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
  
  // Modals & Active Selections
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'projects' | 'workers' | 'users' | 'deliveryNotes'>('projects');

  // New Company Form
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [initialProjectIds, setInitialProjectIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Worker Modal from Company
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerDni, setNewWorkerDni] = useState('');
  const [newWorkerCategory, setNewWorkerCategory] = useState('Oficial 1ª');
  const [workerTargetCompany, setWorkerTargetCompany] = useState<Company | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  const companiesList = (state.companies || []).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.taxId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculations for a given company
  const getCompanyStats = (comp: Company) => {
    const isMain = comp.type === 'MAIN_CONTRACTOR';
    
    // Workers linked to this company
    const linkedWorkers = (state.workers || []).filter(w => w.companyId === comp.id);
    
    // Projects where this company is assigned
    const assignedProjects = (state.projects || []).filter(p => 
      isMain ? p.companyId === comp.id : (p.assignedSubcontractorIds || []).includes(comp.id)
    );

    // App users and pending invites
    const registeredUsers = (state.users || []).filter(u => u.companyId === comp.id);
    const pendingInvites = (state.invitations || []).filter(i => i.companyId === comp.id && i.status === 'Pending');

    // Delivery notes (albaranes)
    const notes = (state.deliveryNotes || []).filter(n => n.subcontractorCompanyId === comp.id);
    const totalHours = notes.reduce((acc, n) => acc + (n.totalHours || 0), 0);

    return {
      linkedWorkers,
      assignedProjects,
      registeredUsers,
      pendingInvites,
      notes,
      totalHours
    };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || name.trim().length < 3) {
      setFormError('Por favor introduce una Razón Social válida.');
      return;
    }
    if (!taxId.trim() || taxId.trim().length < 6) {
      setFormError('CIF / NIF no válido.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const res = obraStore.createSubcontractor({
        name: name.trim(),
        taxId: taxId.trim().toUpperCase(),
        address: address.trim(),
        assignedProjectIds: initialProjectIds
      });

      if (res.success && res.company) {
        toast.success(`Subcontrata "${name.trim()}" homologada con éxito.`);
        setModalOpen(false);
        setName('');
        setTaxId('');
        setAddress('');
        setInitialProjectIds([]);
      } else {
        setFormError(res.error || 'Error al guardar la subcontrata.');
      }
      setIsSaving(false);
    }, 300);
  };

  const handleToggleProjectForCompany = (comp: Company, projectId: string) => {
    const isAssigned = (state.projects || []).some(
      p => p.id === projectId && (p.assignedSubcontractorIds || []).includes(comp.id)
    );

    const currentlyAssignedIds = (state.projects || [])
      .filter(p => (p.assignedSubcontractorIds || []).includes(comp.id))
      .map(p => p.id);

    const newProjectIds = isAssigned
      ? currentlyAssignedIds.filter(id => id !== projectId)
      : [...currentlyAssignedIds, projectId];

    obraStore.updateCompanyProjectAssignments(comp.id, newProjectIds);
    toast.success(
      isAssigned
        ? `Empresa desvinculada de la obra.`
        : `Empresa autorizada en la obra con éxito.`
    );
  };

  const handleQuickAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerTargetCompany) return;
    if (!newWorkerName.trim()) {
      toast.error('Nombre de operario requerido.');
      return;
    }

    obraStore.createWorker({
      name: newWorkerName.trim(),
      nationalId: newWorkerDni.trim().toUpperCase() || 'S/N',
      category: newWorkerCategory as any,
      companyId: workerTargetCompany.id,
      companyNameSnapshot: workerTargetCompany.name,
      isSubcontractor: workerTargetCompany.type === 'SUBCONTRACTOR',
      active: true,
      assignedProjectIds: (state.projects || [])
        .filter(p => (p.assignedSubcontractorIds || []).includes(workerTargetCompany.id))
        .map(p => p.id)
    });

    toast.success(`Operario ${newWorkerName.trim()} dado de alta en ${workerTargetCompany.name}`);
    setWorkerModalOpen(false);
    setNewWorkerName('');
    setNewWorkerDni('');
  };

  const copyInviteLink = (comp: Company) => {
    const link = `${window.location.origin}/invitation?code=${comp.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success(`Enlace de acceso para ${comp.name} copiado al portapapeles.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Red de Contratas y Subcontratistas
          </h2>
          <p className="text-xs text-brand-muted font-medium mt-0.5">
            Estructura jerárquica de empresas, obras autorizadas y asignación de operarios.
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => {
              setName('');
              setTaxId('');
              setAddress('');
              setInitialProjectIds((state.projects || []).map(p => p.id));
              setFormError('');
              setModalOpen(true);
            }} 
            className="btn-primary h-11 px-5 shadow-lg shadow-brand-accent/20 cursor-pointer text-xs uppercase tracking-wider gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Homologar Subcontrata</span>
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companiesList.map(c => {
          const stats = getCompanyStats(c);
          const isMain = c.type === 'MAIN_CONTRACTOR';

          return (
            <div 
              key={c.id} 
              className={`card group hover:border-brand-accent/40 transition-all duration-300 flex flex-col justify-between ${
                isMain ? 'border-brand-accent/30 bg-gradient-to-b from-brand-surface to-brand-bg' : ''
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-lg shrink-0 transition-transform group-hover:scale-105 ${
                      isMain 
                        ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/25' 
                        : 'bg-brand-surface border border-brand-border text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-brand-accent transition-colors">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase mt-0.5">
                        <span className="font-mono bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border text-slate-300">
                          {c.taxId}
                        </span>
                        <span>•</span>
                        <span className="truncate">{c.address || 'Sede España'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                    isMain ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isMain ? 'Principal' : 'Subcontrata'}
                  </span>
                </div>

                {/* Metrics Badges Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 px-2.5 rounded-xl bg-brand-bg/80 border border-brand-border/60 text-center">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Operarios</div>
                    <div className="text-base font-black text-white mt-0.5">{stats.linkedWorkers.length}</div>
                  </div>
                  <div className="border-x border-brand-border/60">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Obras</div>
                    <div className="text-base font-black text-brand-accent mt-0.5">{stats.assignedProjects.length}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Usuarios</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {stats.registeredUsers.length + stats.pendingInvites.length}
                    </div>
                  </div>
                </div>

                {/* Assigned Projects Preview Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3 h-3 text-brand-accent" />
                      Obras Autorizadas
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {stats.assignedProjects.length} de {state.projects?.length || 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stats.assignedProjects.slice(0, 3).map(p => (
                      <span 
                        key={p.id}
                        className="text-[9px] font-bold bg-brand-surface border border-brand-border text-slate-300 px-2 py-0.5 rounded-lg truncate max-w-[150px]"
                        title={p.name}
                      >
                        {p.name}
                      </span>
                    ))}
                    {stats.assignedProjects.length > 3 && (
                      <span className="text-[9px] font-bold bg-brand-surface border border-brand-border text-brand-accent px-1.5 py-0.5 rounded-lg">
                        +{stats.assignedProjects.length - 3} más
                      </span>
                    )}
                    {stats.assignedProjects.length === 0 && (
                      <span className="text-[10px] text-amber-400/90 font-medium italic">
                        Sin obras asignadas todavía
                      </span>
                    )}
                  </div>
                </div>

                {/* Access Code and Copy Link */}
                <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-brand-accent" />
                    <span className="text-[10px] font-mono font-bold text-white uppercase bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
                      {c.inviteCode}
                    </span>
                  </div>

                  <button
                    onClick={() => copyInviteLink(c)}
                    className="text-[10px] font-bold text-brand-muted hover:text-brand-accent flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copiar enlace de acceso"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-brand-bg/50 border-t border-brand-border/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setWorkerTargetCompany(c);
                    setNewWorkerName('');
                    setNewWorkerDni('');
                    setNewWorkerCategory('Oficial 1ª');
                    setWorkerModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-[10px] font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Añadir trabajador a esta empresa"
                >
                  <UserPlus className="w-3.5 h-3.5 text-brand-accent" />
                  <span>+ Operario</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCompany(c);
                    setDetailTab('projects');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-orange-600 text-[10px] font-bold text-white uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>Gestionar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL: COMPLETE VIEW OF COMPANY, ITS WORKERS, ASSIGNED OBRAS, & USERS */}
      {selectedCompany && (
        <Modal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          title={`Gestión de Empresa: ${selectedCompany.name}`}
        >
          {(() => {
            const stats = getCompanyStats(selectedCompany);
            const isMain = selectedCompany.type === 'MAIN_CONTRACTOR';

            return (
              <div className="space-y-5">
                {/* Header Summary Card */}
                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent font-black text-xl">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white uppercase">{selectedCompany.name}</h3>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                          isMain ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isMain ? 'Contratista General' : 'Subcontrata'}
                        </span>
                      </div>
                      <div className="text-xs text-brand-muted font-medium mt-0.5">
                        CIF: <strong className="text-slate-300 font-mono">{selectedCompany.taxId}</strong> • Código: <strong className="text-brand-accent font-mono">{selectedCompany.inviteCode}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => copyInviteLink(selectedCompany)}
                    className="btn-secondary h-9 px-3 text-xs gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace Registro</span>
                  </button>
                </div>

                {/* Subtabs Navigation */}
                <div className="flex items-center gap-1 border-b border-brand-border pb-1 overflow-x-auto no-scrollbar">
                  {[
                    { key: 'projects', label: 'Obras Asignadas', count: stats.assignedProjects.length, icon: FolderKanban },
                    { key: 'workers', label: 'Cuadrilla / Operarios', count: stats.linkedWorkers.length, icon: Users },
                    { key: 'users', label: 'Usuarios App', count: stats.registeredUsers.length + stats.pendingInvites.length, icon: ShieldCheck },
                    { key: 'deliveryNotes', label: 'Albaranes Registrados', count: stats.notes.length, icon: FileText }
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setDetailTab(t.key as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        detailTab === t.key 
                          ? 'bg-brand-accent text-white shadow' 
                          : 'text-brand-muted hover:text-white hover:bg-brand-surface'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        detailTab === t.key ? 'bg-black/30 text-white' : 'bg-brand-surface text-slate-300'
                      }`}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Tab 1: OBRAS ASIGNADAS (DIRECT 1-CLICK TOGGLE) */}
                {detailTab === 'projects' && (
                  <div className="space-y-3">
                    <p className="text-xs text-brand-muted font-medium">
                      Marca las obras en las que esta empresa está autorizada para trabajar. Los operarios y encargados de esta empresa solo podrán registrar partes y albaranes en las obras autorizadas.
                    </p>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {(state.projects || []).map(p => {
                        const isAssigned = (p.assignedSubcontractorIds || []).includes(selectedCompany.id) || (isMain && p.companyId === selectedCompany.id);

                        return (
                          <div
                            key={p.id}
                            onClick={() => !isMain && handleToggleProjectForCompany(selectedCompany, p.id)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                              isMain 
                                ? 'bg-brand-surface/40 border-brand-border opacity-80 cursor-default'
                                : isAssigned
                                  ? 'bg-orange-500/10 border-brand-accent cursor-pointer'
                                  : 'bg-brand-surface border-brand-border hover:border-brand-accent/50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                                isAssigned 
                                  ? 'bg-brand-accent border-brand-accent text-white' 
                                  : 'bg-brand-bg border-slate-700 text-transparent'
                              }`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-white uppercase">{p.name}</div>
                                <div className="text-[10px] font-mono text-brand-muted">
                                  {p.code} • {p.client || 'Cliente General'} • {p.address || 'España'}
                                </div>
                              </div>
                            </div>

                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isAssigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isAssigned ? 'Autorizada' : 'No Asignada'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: CUADRILLA / OPERARIOS */}
                {detailTab === 'workers' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-muted font-medium">
                        Personal operativo registrado bajo {selectedCompany.name}.
                      </span>
                      <button
                        onClick={() => {
                          setWorkerTargetCompany(selectedCompany);
                          setNewWorkerName('');
                          setNewWorkerDni('');
                          setWorkerModalOpen(true);
                        }}
                        className="btn-primary h-8 px-3 text-[11px] uppercase tracking-wider gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Añadir Operario</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {stats.linkedWorkers.map(w => (
                        <div key={w.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-white uppercase">{w.name}</div>
                            <div className="text-[10px] font-bold text-brand-muted uppercase flex items-center gap-2 mt-0.5">
                              <span className="text-brand-accent">{w.category}</span>
                              <span>•</span>
                              <span>DNI: {w.nationalId || 'S/N'}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            w.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {w.active ? 'Activo' : 'Baja'}
                          </span>
                        </div>
                      ))}

                      {stats.linkedWorkers.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-muted border border-dashed border-brand-border rounded-xl">
                          No hay operarios registrados todavía para esta empresa. Haz clic en "+ Añadir Operario" para dar de alta al primero.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: USUARIOS DE LA APP */}
                {detailTab === 'users' && (
                  <div className="space-y-3">
                    <p className="text-xs text-brand-muted font-medium">
                      Personas de esta empresa con acceso digital a la app de ObraService.
                    </p>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {stats.registeredUsers.map(u => (
                        <div key={u.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-white uppercase">{u.name}</div>
                            <div className="text-[10px] text-brand-muted">{u.email}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-[9px] font-black uppercase">
                            {u.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : u.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
                          </span>
                        </div>
                      ))}

                      {stats.pendingInvites.map(inv => (
                        <div key={inv.id} className="p-3 rounded-xl bg-brand-surface/60 border border-amber-500/30 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-amber-200">{inv.email}</div>
                            <div className="text-[10px] text-amber-400 font-mono">Código: {inv.code}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                            Invitación Pendiente
                          </span>
                        </div>
                      ))}

                      {stats.registeredUsers.length === 0 && stats.pendingInvites.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-muted border border-dashed border-brand-border rounded-xl">
                          Esta empresa aún no tiene usuarios registrados. Comparte el código <strong>{selectedCompany.inviteCode}</strong> o el enlace de registro para que se unan.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: ALBARANES Y PARTES */}
                {detailTab === 'deliveryNotes' && (
                  <div className="space-y-3">
                    <p className="text-xs text-brand-muted font-medium">
                      Historial de albaranes de subcontrata y horas computadas.
                    </p>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {stats.notes.map(note => (
                        <div key={note.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-white uppercase font-mono">{note.code}</div>
                            <div className="text-[10px] text-brand-muted">
                              {note.date} • {note.projectNameSnapshot || 'Obra'} • {note.totalHours} horas
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            note.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {note.status === 'Confirmed' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                      ))}

                      {stats.notes.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-muted border border-dashed border-brand-border rounded-xl">
                          No constan albaranes generados para esta empresa hasta la fecha.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* QUICK ADD WORKER MODAL */}
      {workerModalOpen && workerTargetCompany && (
        <Modal
          isOpen={workerModalOpen}
          onClose={() => setWorkerModalOpen(false)}
          title={`Alta de Operario para ${workerTargetCompany.name}`}
        >
          <form onSubmit={handleQuickAddWorker} className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-xs text-slate-300">
              El operario quedará vinculado directamente a <strong className="text-brand-accent">{workerTargetCompany.name}</strong> y estará disponible para fichajes y partes de obra.
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Nombre y Apellidos</label>
              <input
                type="text"
                required
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                placeholder="Ej. Carlos Mendoza Gil"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">DNI / NIE / Pasaporte</label>
                <input
                  type="text"
                  value={newWorkerDni}
                  onChange={(e) => setNewWorkerDni(e.target.value)}
                  placeholder="12345678X"
                  className="input-field font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Categoría Profesional</label>
                <select
                  value={newWorkerCategory}
                  onChange={(e) => setNewWorkerCategory(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="Oficial 1ª">Oficial 1ª</option>
                  <option value="Oficial 2ª">Oficial 2ª</option>
                  <option value="Encofrador">Encofrador</option>
                  <option value="Ferrallista">Ferrallista</option>
                  <option value="Peón Especialista">Peón Especialista</option>
                  <option value="Peón Ordinario">Peón Ordinario</option>
                  <option value="Encargado General">Encargado General</option>
                  <option value="Maquinista">Maquinista</option>
                  <option value="Electricista">Electricista</option>
                  <option value="Fontanero">Fontanero</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWorkerModalOpen(false)}
                className="btn-secondary h-10 px-4 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary h-10 px-5 text-xs uppercase tracking-wider cursor-pointer"
              >
                Registrar en Cuadrilla
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE SUBCONTRACTOR MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Homologar Nueva Subcontrata"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Razón Social</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Estructuras y Forjados Levante S.L."
              className="input-field uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">CIF / NIF</label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="B12345678"
                className="input-field font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Domicilio Social</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. de la Industria 45, Madrid"
                className="input-field"
              />
            </div>
          </div>

          {/* Obras Asignadas Iniciales */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
              Obras en las que trabajará (Asignación Automática)
            </label>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {(state.projects || []).map(p => {
                const checked = initialProjectIds.includes(p.id);
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
                        setInitialProjectIds(prev => 
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
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : 'Confirmar Homologación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
