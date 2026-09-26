import React, { useState } from 'react';
import { UserPlus, Clock, Copy, ExternalLink, Send, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Mail, Shield, ShieldAlert, Key, Globe, Search, X } from 'lucide-react';
import { AppState, User } from '../../types';
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
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(isGoogleGmailConnected());
  const [createdInviteResult, setCreatedInviteResult] = useState<any | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN' || currentUser.role === 'SITE_MANAGER';

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
    setSelectedProjectIds((state.projects || []).map(p => p.id));
    setCreatedInviteResult(null);
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Email inválido.');
      return;
    }

    setIsInviting(true);
    try {
      const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
      const companyName = activeCompany?.name || currentUser.companyName || 'ObraService';
      const roleLabel = inviteRole === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario';

      const res = obraStore.createInvitation(
        inviteEmail,
        inviteRole,
        currentUser.companyId || activeCompany?.id || '',
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

      const link = res.magicLink || `${window.location.origin}/?invite=${res.invitation.code}`;
      const assignedNames = selectedProjectIds
        .map(id => state.projects.find(p => p.id === id)?.name || id);

      setCreatedInviteResult({
        code: res.invitation.code,
        magicLink: link,
        email: inviteEmail,
        role: roleLabel,
        projectNames: assignedNames
      });

      toast.success(gmailConnected ? 'Invitación enviada' : 'Magic Link generado');
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
      projectIds: inv.assignedProjectIds || [],
      active: false,
      code: inv.code,
    }));

  const combined = [...activeRows, ...inviteRows];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl">
          {(['ALL', 'SITE_MANAGER', 'SUBCONTRACTOR_USER', 'PENDING'] as const).map(role => (
            <button
              key={role}
              onClick={() => setUserFilterRole(role)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                userFilterRole === role 
                  ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {role === 'ALL' ? 'Todos' : role === 'SITE_MANAGER' ? 'Jefes' : role === 'SUBCONTRACTOR_USER' ? 'Operarios' : 'Pendientes'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 transition-all ${
             gmailConnected 
               ? 'bg-brand-accent/5 border-brand-accent/20 text-brand-accent' 
               : 'bg-brand-surface border-brand-border text-brand-muted'
           }`}>
              <Mail className={`w-4 h-4 ${gmailConnected ? 'text-brand-accent' : 'text-brand-muted'}`} />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest leading-none">Canal Gmail</span>
                 <button 
                   onClick={gmailConnected ? handleDisconnectGmail : handleConnectGmail}
                   className="text-[10px] font-bold hover:underline text-left mt-0.5"
                 >
                   {gmailConnected ? 'Desconectar' : 'Conectar'}
                 </button>
              </div>
           </div>

           <button onClick={openInviteModal} className="btn-primary h-10 px-6">
              <UserPlus className="w-4 h-4" />
              <span>Invitar</span>
           </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combined.map(row => {
          const assignedProjects = state.projects.filter(p => row.projectIds.includes(p.id));
          return (
            <div key={row.id} className="card group hover:border-brand-accent/40 transition-all duration-300">
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent font-display font-black text-lg group-hover:bg-brand-accent group-hover:text-white transition-all uppercase">
                      {row.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[10px] font-bold text-brand-muted truncate max-w-[150px]">
                        {row.email}
                      </div>
                    </div>
                  </div>
                  {row.isPending ? (
                    <Badge status="Pending" className="text-[9px] px-2 py-0.5 rounded uppercase font-black">Invitado</Badge>
                  ) : (
                    <Badge status={row.active ? 'Active' : 'Paused'} className="text-[9px] px-2 py-0.5 rounded uppercase font-black" />
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-brand-border/50">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                       <Shield className="w-3 h-3 text-brand-accent" />
                       Rol Autorizado
                    </div>
                    <div className="text-[11px] font-bold text-white uppercase">
                      {row.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Admin' : row.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                       <Globe className="w-3 h-3 text-brand-accent" />
                       Alcance de Acceso
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assignedProjects.length > 0 ? (
                        assignedProjects.map(p => (
                          <span key={p.id} className="text-[8px] bg-brand-bg border border-brand-border text-brand-muted font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-white font-bold uppercase">Todas las obras</span>
                      )}
                    </div>
                  </div>
                </div>

                {row.isPending && (
                  <div className="pt-2 border-t border-brand-border/50 flex items-center justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?invite=${row.code}`);
                        toast.success('Link copiado');
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-accent hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Magic Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {combined.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-16 text-center flex flex-col items-center gap-4 border-dashed border-brand-border">
            <div className="w-20 h-20 rounded-3xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted opacity-30">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Sin usuarios registrados</p>
          </div>
        )}
      </div>

      {/* Invite Modal Overhaul */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={createdInviteResult ? "Invitación Generada" : "Invitar Colaborador"}
      >
        {createdInviteResult ? (
          <div className="space-y-6 p-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black uppercase text-white tracking-tight">¡Invitación Registrada!</h3>
              <p className="text-xs text-brand-muted mt-1 font-medium">Comparte este enlace para permitir el registro automático.</p>
            </div>
            
            <div className="space-y-4 text-left">
               <div className="card p-4 bg-brand-bg/50 space-y-3">
                  <div>
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Destinatario</div>
                    <div className="text-sm font-bold text-white truncate">{createdInviteResult.email}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Enlace de Registro</div>
                    <div className="flex items-center gap-2">
                       <code className="text-[10px] bg-brand-bg p-2 rounded border border-brand-border flex-1 truncate text-brand-accent font-mono">
                         {createdInviteResult.magicLink}
                       </code>
                       <button 
                         onClick={() => {
                            navigator.clipboard.writeText(createdInviteResult.magicLink);
                            toast.success('Copiado');
                         }}
                         className="p-2 rounded bg-brand-accent text-white"
                       >
                         <Copy className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            <button
              onClick={() => setInviteModalOpen(false)}
              className="btn-primary w-full h-12"
            >
              Finalizar Proceso
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-5 p-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Email Profesional</label>
              <div className="relative">
                 <Mail className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
                 <input
                   type="email"
                   required
                   value={inviteEmail}
                   onChange={(e) => setInviteEmail(e.target.value)}
                   placeholder="colaborador@constructora.com"
                   className="input pl-11"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block ml-1">Rol de Acceso</label>
              <div className="relative">
                 <Key className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
                 <select
                   value={inviteRole}
                   onChange={(e) => setInviteRole(e.target.value as any)}
                   className="select pl-11"
                 >
                   <option value="SITE_MANAGER">Jefe de Obra (Manager)</option>
                   <option value="SUBCONTRACTOR_USER">Usuario Subcontrata</option>
                 </select>
              </div>
            </div>

            <div className="p-4 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <p className="text-[11px] text-brand-muted font-medium leading-relaxed">
                 Al invitar, el usuario podrá registrarse sin aprobación manual y accederá a los proyectos seleccionados por defecto.
               </p>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="btn-primary w-full h-12"
            >
              {isInviting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generar Invitación Digital'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
