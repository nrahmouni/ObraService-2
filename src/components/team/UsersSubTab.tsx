import React, { useState } from 'react';
import { UserPlus, Clock, Copy, ExternalLink, Send, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AppState, User } from '../../types';
import { obraStore } from '../../services/store';
import { Table } from '../ui/Table';
import { StatusPill } from '../ui/StatusPill';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { connectGmailAccount, sendGmailEmail, isGoogleGmailConnected, disconnectGmail, GMAIL_TEMPLATES } from '../../services/gmail';

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
      toast.success('¡Gmail conectado correctamente!');
    } else {
      toast.error(res.error || 'No se pudo conectar la cuenta de Google.');
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailConnected(false);
    toast.success('Cuenta de Gmail desconectada');
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
      toast.error('Por favor, indica un correo electrónico de invitación válido.');
      return;
    }
    if (selectedProjectIds.length === 0) {
      toast.error('Por favor, selecciona al menos una obra a la que tendrá acceso.');
      return;
    }

    setIsInviting(true);
    try {
      const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
      const companyName = activeCompany?.name || currentUser.companyName || 'Constructora Principal';
      const roleLabel = inviteRole === 'SITE_MANAGER' ? 'Jefe de Obra (Manager)' : 'Operario de Obra (Worker)';

      const res = obraStore.createInvitation(
        inviteEmail,
        inviteRole,
        currentUser.companyId || activeCompany?.id || '',
        currentUser.name,
        selectedProjectIds
      );

      if (!res.success || !res.invitation) {
        toast.error(res.error || 'Error al generar la invitación.');
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
          `[Invitación ObraService] Únete al equipo de ${companyName}`,
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

      toast.success(gmailConnected ? '¡Invitación enviada por Gmail!' : '¡Invitación y Magic Link generados!');
      setIsInviting(false);
    } catch (error: any) {
      setIsInviting(false);
      toast.error(error.message || 'Error al procesar invitación.');
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
    <div className="space-y-4 font-sans text-slate-300">
      {/* Pills, Filter and Gmail Connector Card */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'SITE_MANAGER', 'SUBCONTRACTOR_USER', 'PENDING'] as const).map(role => (
            <button
              key={role}
              onClick={() => setUserFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                userFilterRole === role ? 'bg-brand-accent text-white' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === 'ALL' ? 'Todos' : role === 'SITE_MANAGER' ? 'Jefes de Obra' : role === 'SUBCONTRACTOR_USER' ? 'Operarios' : 'Pendientes'}
            </button>
          ))}
        </div>

        {/* Gmail Integration Toggle */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs shrink-0">
          <span className="font-bold text-slate-400">Canal Gmail:</span>
          {gmailConnected ? (
            <button onClick={handleDisconnectGmail} className="text-[10px] font-black uppercase text-rose-400 hover:underline cursor-pointer">Desconectar</button>
          ) : (
            <button onClick={handleConnectGmail} className="text-[10px] font-black uppercase text-brand-accent hover:underline cursor-pointer">Conectar Cuenta Google</button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Table headers={['Colaborador / Email', 'Rol de Acceso', 'Proyectos con Acceso', 'Estado', 'Link de Acceso']}>
          {combined.map(row => {
            const assignedProjects = state.projects.filter(p => row.projectIds.includes(p.id));
            return (
              <tr key={row.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-300 uppercase">
                      {row.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-200 uppercase">{row.name}</div>
                      <div className="text-[10px] font-bold text-slate-500">{row.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-300">
                    {row.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Administrador' : row.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
                  </span>
                </td>

                <td className="px-6 py-4.5">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {assignedProjects.length > 0 ? (
                      assignedProjects.map(p => (
                        <span key={p.id} className="text-[9px] bg-slate-950 border border-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Todas las obras</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4.5 text-center">
                  {row.isPending ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900">
                      Invitado
                    </span>
                  ) : (
                    <StatusPill status={row.active ? 'Active' : 'Paused'} />
                  )}
                </td>

                <td className="px-6 py-4.5 text-right">
                  {row.isPending ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?invite=${row.code}`);
                          toast.success('¡Magic link copiado!');
                        }}
                        className="px-2 py-1 bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-300 rounded cursor-pointer hover:bg-slate-900"
                      >
                        Copiar Link
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Activo</span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </div>

      {/* Invite Modal Form */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={createdInviteResult ? "Invitación Generada" : "Nueva Invitación de Acceso"}
      >
        {createdInviteResult ? (
          <div className="space-y-4 text-center text-slate-300">
            <div className="w-12 h-12 rounded-lg bg-emerald-950/40 border border-emerald-900 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-200">¡Invitación Registrada!</h3>
              <p className="text-[11px] text-slate-500 mt-1">Comparte este link para el registro automático.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left space-y-2 font-mono text-[10px]">
              <div><strong>Invitado:</strong> {createdInviteResult.email}</div>
              <div><strong>Enlace:</strong> {createdInviteResult.magicLink}</div>
            </div>
            <button
              onClick={() => setInviteModalOpen(false)}
              className="w-full py-2 bg-brand-accent text-white text-xs font-black uppercase tracking-widest rounded-lg"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-4 text-slate-300">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Email del Colaborador</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="ej: jefe@obra.es"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Rol Autorizado</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
              >
                <option value="SITE_MANAGER">Jefe de Obra (SITE MANAGER)</option>
                <option value="SUBCONTRACTOR_USER">Usuario Subcontrata</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="w-full py-2.5 bg-brand-accent text-white text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isInviting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generar Magic Link'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
