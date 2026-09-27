import React, { useState } from 'react';
import { 
  UserPlus, 
  Clock, 
  Copy, 
  ExternalLink, 
  Send, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Shield, 
  ShieldAlert, 
  Key, 
  Globe, 
  Search, 
  X,
  Building2,
  FolderKanban
} from 'lucide-react';
import { AppState, User, Company } from '../../types';
import { obraStore } from '../../services/store';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { connectGmailAccount, sendGmailEmail, isGoogleGmailConnected, disconnectGmail, GMAIL_TEMPLATES } from '../../services/gmail';
import { Badge } from '../ui/Badge';

interface UsersSubTabProps {
  state: AppState;
  searchQuery: string;
}

export const UsersSubTab: React.FC<UsersSubTabProps> = ({ state, searchQuery }) => {
  const currentUser = state.currentUser;
  
  // States
  const [userFilterRole, setUserFilterRole] = useState<'ALL' | 'SITE_MANAGER' | 'SUBCONTRACTOR_USER' | 'PENDING'>('ALL');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'SITE_MANAGER' | 'SUBCONTRACTOR_USER'>('SITE_MANAGER');
  const [inviteCompanyId, setInviteCompanyId] = useState<string>('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(isGoogleGmailConnected());
  const [createdInviteResult, setCreatedInviteResult] = useState<any | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

  const mainCompany = (state.companies || []).find(c => c.type === 'MAIN_CONTRACTOR') || state.companies[0];
  const subcontractors = (state.companies || []).filter(c => c.type === 'SUBCONTRACTOR');

  const handleConnectGmail = async () => {
    const res = await connectGmailAccount();
    if (res.success) {
      setGmailConnected(true);
      toast.success('Gmail conectado.');
    } else {
      toast.error(res.error || 'Error al conectar Google.');
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailConnected(false);
    toast.success('Gmail desconectado');
  };

  const openInviteModal = () => {
    setInviteEmail('');
    setInviteRole('SITE_MANAGER');
    setInviteCompanyId(mainCompany?.id || '');
    setSelectedProjectIds((state.projects || []).map(p => p.id));
    setCreatedInviteResult(null);
    setInviteModalOpen(true);
  };

  const handleRoleChange = (newRole: 'SITE_MANAGER' | 'SUBCONTRACTOR_USER') => {
    setInviteRole(newRole);
    if (newRole === 'SUBCONTRACTOR_USER') {
      const defaultSub = subcontractors[0]?.id || '';
      setInviteCompanyId(defaultSub);
      // Pre-select projects assigned to this subcontractor
      const subProjects = (state.projects || [])
        .filter(p => (p.assignedSubcontractorIds || []).includes(defaultSub))
        .map(p => p.id);
      setSelectedProjectIds(subProjects.length > 0 ? subProjects : (state.projects || []).map(p => p.id));
    } else {
      setInviteCompanyId(mainCompany?.id || '');
      setSelectedProjectIds((state.projects || []).map(p => p.id));
    }
  };

  const handleCompanyChange = (targetCompId: string) => {
    setInviteCompanyId(targetCompId);
    const subProjects = (state.projects || [])
      .filter(p => (p.assignedSubcontractorIds || []).includes(targetCompId))
      .map(p => p.id);
    setSelectedProjectIds(subProjects.length > 0 ? subProjects : (state.projects || []).map(p => p.id));
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Email no válido.');
      return;
    }

    const targetCompId = inviteRole === 'SUBCONTRACTOR_USER' ? inviteCompanyId : (mainCompany?.id || currentUser.companyId);
    if (!targetCompId) {
      toast.error('Por favor, selecciona una empresa para la invitación.');
      return;
    }

    setIsInviting(true);
    try {
      const targetCompany = state.companies.find(c => c.id === targetCompId);
      const companyName = targetCompany?.name || 'ObraService';
      const roleLabel = inviteRole === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Usuario Subcontrata';

      const res = obraStore.createInvitation(
        inviteEmail,
        inviteRole,
        targetCompId,
        currentUser.name,
        selectedProjectIds
      );

      if (!res.success || !res.invitation) {
        toast.error(res.error || 'Error al generar invitación.');
        setIsInviting(false);
        return;
      }

      if (gmailConnected) {
        const emailBody = GMAIL_TEMPLATES.invitation(
          companyName,
          res.invitation.code,
          currentUser.name,
          roleLabel
        );
        await sendGmailEmail(
          inviteEmail,
          `[Invitación] Únete a ${companyName} en ObraService`,
          emailBody
        );
      }

      const link = res.magicLink || `${window.location.origin}/invitation?code=${res.invitation.code}`;
      const assignedNames = selectedProjectIds
        .map(id => state.projects.find(p => p.id === id)?.name || id);

      setCreatedInviteResult({
        code: res.invitation.code,
        magicLink: link,
        email: inviteEmail,
        role: roleLabel,
        companyName,
        projectNames: assignedNames
      });

      toast.success(gmailConnected ? 'Invitación enviada por Gmail' : 'Enlace de acceso generado');
      setIsInviting(false);
    } catch (error: any) {
      setIsInviting(false);
      toast.error(error.message || 'Error en invitación.');
    }
  };

  const pendingInvs = (state.invitations || []).filter(i => i.status === 'Pending');

  const activeRows = (state.users || [])
    .filter(u => {
      if (userFilterRole === 'PENDING') return false;
      if (userFilterRole === 'SITE_MANAGER') return u.role === 'SITE_MANAGER';
      if (userFilterRole === 'SUBCONTRACTOR_USER') return u.role === 'SUBCONTRACTOR_USER';
      return true;
    })
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(u => ({
      id: u.id,
      isPending: false,
      name: u.name,
      email: u.email,
      role: u.role,
      companyId: u.companyId,
      projectIds: u.assignedProjectIds || [],
      active: u.active,
      code: '',
    }));

  const inviteRows = pendingInvs
    .filter(inv => {
      if (userFilterRole === 'SITE_MANAGER') return inv.role === 'SITE_MANAGER';
      if (userFilterRole === 'SUBCONTRACTOR_USER') return inv.role === 'SUBCONTRACTOR_USER';
      return true;
    })
    .filter(inv => inv.email.toLowerCase().includes(searchQuery.toLowerCase()) || inv.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(inv => ({
      id: inv.id,
      isPending: true,
      name: inv.email.split('@')[0],
      email: inv.email,
      role: inv.role,
      companyId: inv.companyId,
      projectIds: inv.assignedProjectIds || [],
      active: false,
      code: inv.code,
    }));

  const combined = [...activeRows, ...inviteRows];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl">
          {(['ALL', 'SITE_MANAGER', 'SUBCONTRACTOR_USER', 'PENDING'] as const).map(role => (
            <button
              key={role}
              onClick={() => setUserFilterRole(role)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                userFilterRole === role 
                  ? 'bg-brand-accent text-white shadow' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {role === 'ALL' ? 'Todos los Usuarios' : role === 'SITE_MANAGER' ? 'Jefes de Obra' : role === 'SUBCONTRACTOR_USER' ? 'Subcontratas' : 'Pendientes'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
            gmailConnected 
              ? 'bg-brand-accent/5 border-brand-accent/20 text-brand-accent' 
              : 'bg-brand-surface border-brand-border text-brand-muted'
          }`}>
            <Mail className={`w-4 h-4 ${gmailConnected ? 'text-brand-accent' : 'text-brand-muted'}`} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">Canal Gmail</span>
              <button 
                onClick={gmailConnected ? handleDisconnectGmail : handleConnectGmail}
                className="text-[10px] font-bold hover:underline text-left mt-0.5 cursor-pointer"
              >
                {gmailConnected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          </div>

          <button onClick={openInviteModal} className="btn-primary h-10 px-5 text-xs uppercase tracking-wider gap-2 cursor-pointer shadow-md">
            <UserPlus className="w-4 h-4" />
            <span>Invitar Usuario</span>
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {combined.map(row => {
          const comp = (state.companies || []).find(c => c.id === row.companyId);
          const isMain = comp?.type === 'MAIN_CONTRACTOR' || row.role === 'SITE_MANAGER' || row.role === 'MAIN_CONTRACTOR_ADMIN';
          const assignedProjects = (state.projects || []).filter(p => row.projectIds.includes(p.id));

          return (
            <div key={row.id} className="card group hover:border-brand-accent/40 transition-all duration-300 flex flex-col justify-between">
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent font-display font-black text-base shrink-0 group-hover:bg-brand-accent group-hover:text-white transition-all uppercase">
                      {row.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-brand-accent transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[10px] font-medium text-brand-muted truncate">
                        {row.email}
                      </div>
                    </div>
                  </div>

                  {row.isPending ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider shrink-0 border border-amber-500/30">
                      Invitado
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      row.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {row.active ? 'Activo' : 'Pausado'}
                    </span>
                  )}
                </div>

                {/* Company & Role Badges */}
                <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold truncate">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isMain ? 'text-blue-400' : 'text-emerald-400'}`} />
                      <span className="truncate">{comp ? comp.name : 'Empresa General'}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                      isMain ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isMain ? 'Principal' : 'Subcontrata'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-brand-muted pt-1 border-t border-brand-border/40">
                    <span className="font-semibold uppercase">Rol de Acceso:</span>
                    <span className="font-bold text-white uppercase">
                      {row.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : row.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario / Subcontrata'}
                    </span>
                  </div>
                </div>

                {/* Scope of Access */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-brand-muted">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3 h-3 text-brand-accent" />
                      Alcance de Obras
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {assignedProjects.length > 0 ? `${assignedProjects.length} obras` : 'Todas'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {assignedProjects.length > 0 ? (
                      assignedProjects.slice(0, 3).map(p => (
                        <span key={p.id} className="text-[9px] font-bold bg-brand-surface border border-brand-border text-slate-300 px-2 py-0.5 rounded-lg truncate max-w-[150px]">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Acceso a todas las obras</span>
                    )}
                    {assignedProjects.length > 3 && (
                      <span className="text-[9px] font-bold bg-brand-surface border border-brand-border text-brand-accent px-1.5 py-0.5 rounded-lg">
                        +{assignedProjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending invite action: copy link */}
              {row.isPending && (
                <div className="p-3 bg-brand-bg/50 border-t border-brand-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400">{row.code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/invitation?code=${row.code}`);
                      toast.success('Enlace de invitación copiado');
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-accent hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* INVITE MODAL */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invitar Usuario al Sistema"
      >
        {createdInviteResult ? (
          <div className="space-y-4 p-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-white uppercase">¡Invitación Creada con Éxito!</h3>
              <p className="text-xs text-brand-muted mt-1">
                Generada para <strong>{createdInviteResult.email}</strong> en <strong>{createdInviteResult.companyName}</strong>.
              </p>
            </div>

            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border text-left space-y-2">
              <div className="text-[10px] font-bold uppercase text-brand-muted">Enlace Directo de Acceso:</div>
              <div className="p-2 bg-brand-bg rounded-lg font-mono text-xs text-brand-accent break-all select-all">
                {createdInviteResult.magicLink}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdInviteResult.magicLink);
                  toast.success('Enlace copiado al portapapeles');
                }}
                className="btn-primary flex-1 h-11 text-xs uppercase tracking-wider cursor-pointer"
              >
                Copiar Enlace
              </button>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="btn-secondary h-11 px-4 text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                Email Profesional <span className="text-brand-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ejemplo@subcontrata.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                Rol de Acceso <span className="text-brand-accent">*</span>
              </label>
              <select
                value={inviteRole}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="input-field cursor-pointer"
              >
                <option value="SITE_MANAGER">Jefe de Obra (Manager - Contratista Principal)</option>
                <option value="SUBCONTRACTOR_USER">Usuario Subcontrata (Operario / Proveedor Externo)</option>
              </select>
            </div>

            {/* Subcontractor Company Selector (Appears when SUBCONTRACTOR_USER is selected) */}
            {inviteRole === 'SUBCONTRACTOR_USER' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted flex items-center justify-between">
                  <span>Seleccionar Subcontrata <span className="text-brand-accent">*</span></span>
                  <span className="text-emerald-400 font-bold">Empresa Externa</span>
                </label>
                <select
                  value={inviteCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="input-field cursor-pointer border-emerald-500/40 focus:border-emerald-500"
                  required
                >
                  <option value="" disabled>-- Elige una subcontrata homologada --</option>
                  {subcontractors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.taxId})
                    </option>
                  ))}
                </select>
                {subcontractors.length === 0 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    No hay subcontratistas dadas de alta. Ve a la pestaña Subcontratas para homologar una primero.
                  </p>
                )}
              </div>
            )}

            {/* Obras Asignadas */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
                Obras a las que tendrá acceso
              </label>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {(state.projects || []).map(p => {
                  const checked = selectedProjectIds.includes(p.id);
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
                          setSelectedProjectIds(prev =>
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
                onClick={() => setInviteModalOpen(false)}
                className="btn-secondary h-11 px-4 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="btn-primary h-11 px-6 text-xs uppercase tracking-wider cursor-pointer"
              >
                {isInviting ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : 'Generar Invitación Digital'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
