import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Building2, 
  ShieldCheck, 
  HardHat, 
  Briefcase, 
  Search, 
  X,
  Zap,
  MoreVertical,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  RefreshCw,
  Mail,
  Check,
  Send,
  Copy,
  ExternalLink,
  Link,
  Clock,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Worker, User, WorkerCategory, Machinery, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  connectGmailAccount, 
  sendGmailEmail, 
  isGoogleGmailConnected, 
  disconnectGmail,
  GMAIL_TEMPLATES 
} from '../services/gmail';

interface TeamViewProps {
  state: AppState;
}

export const TeamView: React.FC<TeamViewProps> = ({ state }) => {
  const currentUser = state.currentUser;

  const [activeSubTab, setActiveSubTab] = useState<'workers' | 'users' | 'companies' | 'machinery'>('workers');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [machineryModalOpen, setMachineryModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editingMachinery, setEditingMachinery] = useState<Machinery | null>(null);
  
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Subcontractor Company Form State
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [subcontractorName, setSubcontractorName] = useState('');
  const [subcontractorTaxId, setSubcontractorTaxId] = useState('');
  const [subcontractorAddress, setSubcontractorAddress] = useState('');

  const handleCreateSubcontractor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Robust validations
    if (!subcontractorName.trim() || subcontractorName.trim().length < 3) {
      setFormError('La razón social de la subcontrata es obligatoria (mínimo 3 caracteres).');
      toast.error('Nombre de empresa demasiado corto.');
      return;
    }
    if (!subcontractorTaxId.trim() || subcontractorTaxId.trim().length < 6) {
      setFormError('El CIF/NIF de la subcontrata debe ser válido (mínimo 6 caracteres).');
      toast.error('Identificador fiscal incorrecto.');
      return;
    }
    if (!subcontractorAddress.trim() || subcontractorAddress.trim().length < 5) {
      setFormError('La dirección de la oficina principal es obligatoria (mínimo 5 caracteres).');
      toast.error('Dirección insuficiente.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const res = obraStore.createSubcontractor({
        name: subcontractorName.trim(),
        taxId: subcontractorTaxId.trim().toUpperCase(),
        address: subcontractorAddress.trim()
      });

      if (res.success) {
        toast.success(`Subcontratista "${subcontractorName.trim()}" registrado con éxito.`);
        setCompanyModalOpen(false);
        setSubcontractorName('');
        setSubcontractorTaxId('');
        setSubcontractorAddress('');
      } else {
        setFormError(res.error || 'Error al registrar la subcontrata.');
      }
      setIsSaving(false);
    }, 400);
  };

  const navigate = useNavigate();

  // Invitation Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'SITE_MANAGER' | 'SUBCONTRACTOR_USER'>('SITE_MANAGER');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [createdInviteResult, setCreatedInviteResult] = useState<{
    code: string;
    magicLink: string;
    email: string;
    role: string;
    projectNames: string[];
  } | null>(null);
  const [userFilterRole, setUserFilterRole] = useState<'ALL' | 'SITE_MANAGER' | 'SUBCONTRACTOR_USER' | 'PENDING'>('ALL');
  const [isInviting, setIsInviting] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(isGoogleGmailConnected());

  // Worker Form State
  const [workerName, setWorkerName] = useState('');
  const [workerCategory, setWorkerCategory] = useState<WorkerCategory>('Oficial de 1ª');
  const [workerCompanyId, setWorkerCompanyId] = useState(currentUser?.companyId || '');
  const [workerDni, setWorkerDni] = useState('');

  // Machinery Form State
  const [macName, setMacName] = useState('');
  const [macType, setMacType] = useState('Excavadora');
  const [macCompanyId, setMacCompanyId] = useState(currentUser?.companyId || '');

  if (!currentUser) return null;

  const filteredWorkers = (state.workers || []).filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMachinery = (state.machinery || []).filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = (state.users || []).filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyWorkerPreset = (name: string, cat: WorkerCategory) => {
    setWorkerName(name);
    setWorkerCategory(cat);
    setWorkerDni('5' + Math.floor(1000000 + Math.random() * 9000000) + 'X');
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Robust validations
    if (!workerName.trim() || workerName.trim().length < 3) {
      setFormError('El nombre completo del operario es obligatorio (mínimo 3 caracteres).');
      toast.error('Nombre no válido.');
      return;
    }
    if (!workerDni.trim() || workerDni.trim().length < 5) {
      setFormError('El DNI, NIE o documento nacional de identidad es obligatorio (mínimo 5 caracteres).');
      toast.error('DNI inválido.');
      return;
    }

    const targetCompanyId = workerCompanyId || state.companies[0]?.id;
    if (!targetCompanyId) {
      setFormError('Se requiere asignar una empresa contratista/subcontratista autorizada.');
      toast.error('Falta empresa asignada.');
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
      
      setWorkerModalOpen(false);
      setEditingWorker(null);
      setWorkerName('');
      setWorkerDni('');
      setIsSaving(false);
    }, 400);
  };

  const handleCreateMachinery = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Robust validations
    if (!macName.trim() || macName.trim().length < 2) {
      setFormError('La designación o modelo de la maquinaria es obligatoria (mínimo 2 caracteres).');
      toast.error('Modelo no válido.');
      return;
    }
    if (!macType.trim()) {
      setFormError('Debe clasificar el tipo de maquinaria.');
      return;
    }

    const targetCompanyId = macCompanyId || state.companies[0]?.id;
    if (!targetCompanyId) {
      setFormError('Se requiere vincular un propietario asignado para la maquinaria.');
      toast.error('Falta propietario asignado.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      if (editingMachinery) {
        obraStore.updateMachinery(editingMachinery.id, {
          name: macName.trim(),
          type: macType,
          companyId: targetCompanyId
        });
        toast.success(`Maquinaria "${macName.trim()}" actualizada con éxito.`);
      } else {
        obraStore.createMachinery({
          name: macName.trim(),
          type: macType,
          companyId: targetCompanyId,
          active: true
        });
        toast.success(`Maquinaria "${macName.trim()}" registrada con éxito.`);
      }
      setMachineryModalOpen(false);
      setEditingMachinery(null);
      setMacName('');
      setIsSaving(false);
    }, 400);
  };

  const handleDeleteWorker = (workerId: string, name: string) => {
    const res = obraStore.deleteWorker(workerId);
    if (res) {
      toast.success(`Operario "${name}" eliminado con éxito.`);
    } else {
      toast.error("Error al eliminar el operario.");
    }
  };

  const handleDeleteMachinery = (machineryId: string, name: string) => {
    const res = obraStore.deleteMachinery(machineryId);
    if (res) {
      toast.success(`Maquinaria "${name}" de baja/eliminada con éxito.`);
    } else {
      toast.error("Error al eliminar la maquinaria.");
    }
  };

  const openEditWorker = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name);
    setWorkerCategory(w.category);
    setWorkerCompanyId(w.companyId);
    setWorkerDni(w.nationalId || '');
    setWorkerModalOpen(true);
  };

  const openEditMachinery = (m: Machinery) => {
    setEditingMachinery(m);
    setMacName(m.name);
    setMacType(m.type);
    setMacCompanyId(m.companyId);
    setMachineryModalOpen(true);
  };

  const handleToggleWorker = (worker: Worker) => {
    obraStore.toggleWorkerActive(worker.id);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MAIN_CONTRACTOR_ADMIN': return 'Admin Contratista';
      case 'SITE_MANAGER': return 'Jefe de Obra';
      case 'SUBCONTRACTOR_USER': return 'Subcontrata';
      default: return role;
    }
  };

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    const res = await connectGmailAccount();
    setConnectingGmail(false);
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

      const assignedNames = selectedProjectIds
        .map(id => state.projects.find(p => p.id === id)?.name || id)
        .filter(Boolean);

      // If Gmail is connected, send real email, else simulate
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

      setCreatedInviteResult({
        code: res.invitation.code,
        magicLink: link,
        email: inviteEmail,
        role: roleLabel,
        projectNames: assignedNames
      });

      toast.success(
        gmailConnected
          ? '¡Invitación enviada por Gmail y registrada en el sistema!'
          : '¡Invitación y Magic Link generados correctamente!'
      );
      setIsInviting(false);
    } catch (error: any) {
      setIsInviting(false);
      toast.error(error.message || 'Error inesperado al enviar la invitación.');
    }
  };

  const viewPreference = state.viewPreference;

  return (
    <div className="animate-in fade-in duration-500">
      {/* View Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">Recursos</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equipo y Red</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Gestión de Personal</h1>
        </div>

        {activeSubTab === 'workers' && (
          <button
            onClick={() => { 
              setEditingWorker(null); 
              setWorkerName(''); 
              setWorkerDni(''); 
              setWorkerCompanyId(state.companies[0]?.id || currentUser?.companyId || '');
              setWorkerModalOpen(true); 
            }}
            className="bg-[#FF6600] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <UserPlus className="w-3 h-3" />
            Nuevo Operario
          </button>
        )}

        {activeSubTab === 'machinery' && (
          <button
            onClick={() => { 
              setEditingMachinery(null); 
              setMacName(''); 
              setMacCompanyId(state.companies[0]?.id || currentUser?.companyId || '');
              setMachineryModalOpen(true); 
            }}
            className="bg-[#5B8CFF] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#4a70cc] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Truck className="w-3 h-3" />
            Nueva Máquina
          </button>
        )}

        {activeSubTab === 'users' && (
          <button
            onClick={() => { setInviteEmail(''); setInviteModalOpen(true); }}
            className="bg-[#FF6600] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <UserPlus className="w-3 h-3" />
            Invitar Miembro
          </button>
        )}

        {activeSubTab === 'companies' && (
          <button
            onClick={() => { setSubcontractorName(''); setSubcontractorTaxId(''); setSubcontractorAddress(''); setCompanyModalOpen(true); }}
            className="bg-[#10B981] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#059669] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Building2 className="w-3 h-3" />
            Alta Subcontrata
          </button>
        )}
      </div>

      {/* Metrics Row (Recuentos de Recursos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 animate-in fade-in duration-300">
          <div className="p-3 bg-[#FF6600]/10 text-[#FF6600] rounded-xl">
            <HardHat className="w-5 h-5 shrink-0 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[20px] font-black text-slate-900 leading-none">
              {state.workers?.filter(w => w.active).length || 0}
              <span className="text-slate-400 font-medium text-xs ml-1">/ {state.workers?.length || 0}</span>
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Operarios Activos</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 animate-in fade-in duration-300">
          <div className="p-3 bg-[#5B8CFF]/10 text-[#5B8CFF] rounded-xl">
            <Truck className="w-5 h-5 shrink-0 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[20px] font-black text-slate-900 leading-none">
              {state.machinery?.filter(m => m.active).length || 0}
              <span className="text-slate-400 font-medium text-xs ml-1">/ {state.machinery?.length || 0}</span>
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Máquinas Operativas</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 animate-in fade-in duration-300">
          <div className="p-3 bg-emerald-500/10 text-[#10B981] rounded-xl">
            <Building2 className="w-5 h-5 shrink-0 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[20px] font-black text-slate-900 leading-none">
              {state.companies?.filter(c => c.type === 'SUBCONTRACTOR').length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Subcontratas de Obra</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 animate-in fade-in duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
            <Mail className="w-5 h-5 shrink-0 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[20px] font-black text-slate-900 leading-none">
              {state.invitations?.length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Invitaciones de Red</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
        {(['workers', 'machinery', 'users', 'companies'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab 
                ? 'border-[#FF6600] text-[#FF6600]' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'workers' ? 'Operarios' : tab === 'machinery' ? 'Maquinaria' : tab === 'users' ? 'Usuarios' : 'Empresas'}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all"
          />
        </div>
      </div>

      {/* Workers List */}
      {activeSubTab === 'workers' && (
        viewPreference === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredWorkers.map((worker) => {
              const company = (state.companies || []).find(c => c.id === worker.companyId);

              return (
                <div 
                  key={worker.id} 
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#FF6600]/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <HardHat className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600] transition-colors" />
                      </div>
                      <Badge variant={worker.active ? 'success' : 'neutral'} className="text-[8px] px-1.5 py-0">
                        {worker.active ? 'ACTIVO' : 'BAJA'}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{worker.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{worker.category}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{company?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditWorker(worker)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-[#FF6600] transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker.id, worker.name)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Operario</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredWorkers.map((worker) => {
                  const company = (state.companies || []).find(c => c.id === worker.companyId);
                  return (
                    <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <HardHat className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600]" />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase">{worker.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{worker.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{company?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={worker.active ? 'success' : 'neutral'} className="text-[8px] px-1.5 py-0">
                          {worker.active ? 'ACTIVO' : 'BAJA'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditWorker(worker)}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-[#FF6600] transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(worker.id, worker.name)}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Machinery List */}
      {activeSubTab === 'machinery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMachinery.map((mac) => {
            const company = (state.companies || []).find(c => c.id === mac.companyId);
            return (
              <div key={mac.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#5B8CFF]/40 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#5B8CFF]">
                      <Truck className="w-4 h-4" />
                    </div>
                    <Badge variant={mac.active ? 'success' : 'neutral'} className="text-[8px] px-1.5 py-0 uppercase">
                      {mac.active ? 'OPERATIVA' : 'MANTENIMIENTO'}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{mac.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{mac.type}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{company?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditMachinery(mac)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-[#5B8CFF]"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteMachinery(mac.id, mac.name)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users / Personnel List & Invitations */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Subtab Control & Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setUserFilterRole('ALL')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  userFilterRole === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos ({state.users.length + (state.invitations?.filter(i => i.status === 'Pending').length || 0)})
              </button>
              <button
                type="button"
                onClick={() => setUserFilterRole('SITE_MANAGER')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  userFilterRole === 'SITE_MANAGER'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Jefes de Obra ({state.users.filter(u => u.role === 'SITE_MANAGER').length + (state.invitations?.filter(i => i.role === 'SITE_MANAGER' && i.status === 'Pending').length || 0)})
              </button>
              <button
                type="button"
                onClick={() => setUserFilterRole('SUBCONTRACTOR_USER')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  userFilterRole === 'SUBCONTRACTOR_USER'
                    ? 'bg-[#FF6600] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Operarios ({state.users.filter(u => u.role === 'SUBCONTRACTOR_USER').length + (state.invitations?.filter(i => i.role === 'SUBCONTRACTOR_USER' && i.status === 'Pending').length || 0)})
              </button>
              <button
                type="button"
                onClick={() => setUserFilterRole('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  userFilterRole === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Invitaciones Pendientes ({state.invitations?.filter(i => i.status === 'Pending').length || 0})
              </button>
            </div>

            <button
              type="button"
              onClick={openInviteModal}
              className="bg-[#FF6600] text-white px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[10px] hover:bg-[#e65c00] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invitar Miembro
            </button>
          </div>

          {/* Unified Personal Table */}
          {(() => {
            const pendingInvs = (state.invitations || []).filter(i => i.status === 'Pending');
            
            // Build unified rows: Active Users + Pending Invitations
            const activeRows = filteredUsers
              .filter(u => {
                if (userFilterRole === 'PENDING') return false;
                if (userFilterRole === 'SITE_MANAGER') return u.role === 'SITE_MANAGER';
                if (userFilterRole === 'SUBCONTRACTOR_USER') return u.role === 'SUBCONTRACTOR_USER';
                return true;
              })
              .map(u => ({
                id: u.id,
                isPending: false,
                name: u.name,
                email: u.email,
                role: u.role,
                projectIds: u.assignedProjectIds || [],
                active: u.active,
                code: '',
                createdAt: u.createdAt || '',
              }));

            const inviteRows = pendingInvs
              .filter(inv => {
                if (userFilterRole === 'SITE_MANAGER') return inv.role === 'SITE_MANAGER';
                if (userFilterRole === 'SUBCONTRACTOR_USER') return inv.role === 'SUBCONTRACTOR_USER';
                return true;
              })
              .filter(inv => 
                inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.code.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(inv => ({
                id: inv.id,
                isPending: true,
                name: inv.email.split('@')[0],
                email: inv.email,
                role: inv.role,
                projectIds: inv.assignedProjectIds || [],
                active: false,
                code: inv.code,
                createdAt: inv.createdAt,
              }));

            const combined = [...activeRows, ...inviteRows];

            if (combined.length === 0) {
              return (
                <EmptyState
                  icon={Users}
                  title="No se encontraron miembros"
                  description="No hay personal ni invitaciones que coincidan con el filtro seleccionado. Puedes invitar a nuevos Jefes de Obra u Operarios pulsando el botón superior."
                  action={{
                    label: "Invitar Miembro",
                    onClick: openInviteModal
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-8"
                />
              );
            }

            return (
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-3">Personal / Email</th>
                      <th className="px-5 py-3">Rol</th>
                      <th className="px-5 py-3">Obras Asignadas</th>
                      <th className="px-5 py-3 text-center">Estado</th>
                      <th className="px-5 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {combined.map((row) => {
                      const isCurrentUser = row.id === currentUser?.id;
                      const assignedProjects = (state.projects || []).filter(p => row.projectIds.includes(p.id));

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black uppercase shrink-0 border ${
                                row.isPending 
                                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                  : row.role === 'SITE_MANAGER'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-orange-50 text-[#FF6600] border-orange-200'
                              }`}>
                                {row.name[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-900 uppercase">
                                    {row.name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                                      TÚ
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">{row.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <Badge 
                              variant={
                                row.role === 'MAIN_CONTRACTOR_ADMIN' ? 'purple' :
                                row.role === 'SITE_MANAGER' ? 'neutral' : 'warning'
                              } 
                              className="text-[9px] font-bold px-2 py-0.5"
                            >
                              {getRoleLabel(row.role)}
                            </Badge>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {assignedProjects.length > 0 ? (
                                assignedProjects.map(p => (
                                  <span key={p.id} className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md truncate max-w-[130px]">
                                    {p.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Todas las obras</span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {row.isPending ? (
                              <div className="inline-flex flex-col items-center">
                                <Badge variant="warning" className="text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> INVITADO
                                </Badge>
                                <span className="font-mono text-[8px] font-bold text-slate-400 mt-0.5">{row.code}</span>
                              </div>
                            ) : (
                              <Badge variant={row.active ? 'success' : 'neutral'} className="text-[9px] font-bold px-2 py-0.5">
                                {row.active ? 'ACTIVO' : 'INACTIVO'}
                              </Badge>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {row.isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = `${window.location.origin}/?invite=${row.code}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success('¡Enlace de invitación copiado!');
                                  }}
                                  title="Copiar Magic Link"
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate(`/?invite=${row.code}`);
                                  }}
                                  title="Probar acceso como este invitado"
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Probar
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                En regla
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Companies List */}
      {activeSubTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(state.companies || []).map((company) => (
            <div key={company.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#FF6600]/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Building2 className="w-5 h-5 text-slate-300 group-hover:text-[#FF6600] transition-colors" />
                </div>
                <Badge variant={company.type === 'MAIN_CONTRACTOR' ? 'success' : 'neutral'} className="text-[8px] px-1.5 py-0 uppercase">
                  {company.type === 'MAIN_CONTRACTOR' ? 'Contratista' : 'Subcontrata'}
                </Badge>
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{company.name}</h3>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span className="opacity-50">CIF:</span> <span className="font-mono">{company.taxId}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span className="opacity-50">Invitación:</span> <span className="font-mono text-[#FF6600]">{company.inviteCode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified CRUD Modal for Workers */}
      <Modal 
        isOpen={workerModalOpen} 
        onClose={() => setWorkerModalOpen(false)} 
        title={editingWorker ? "Editar Operario" : "Nuevo Operario"}
      >
        <form onSubmit={handleCreateWorker} className="space-y-4">
          {!editingWorker && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button type="button" onClick={() => applyWorkerPreset('Manuel Sánchez', 'Oficial de 1ª')} className="text-[10px] font-black p-2 bg-slate-50 border border-slate-200 rounded text-slate-500 hover:bg-[#FF6600]/10 hover:text-[#FF6600] transition-colors uppercase tracking-widest">Oficial Albañil</button>
              <button type="button" onClick={() => applyWorkerPreset('Jesús Navarro', 'Gruista')} className="text-[10px] font-black p-2 bg-slate-50 border border-slate-200 rounded text-slate-500 hover:bg-[#FF6600]/10 hover:text-[#FF6600] transition-colors uppercase tracking-widest">Gruista</button>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <input type="text" required value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all uppercase" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
              <select value={workerCategory} onChange={(e) => setWorkerCategory(e.target.value as WorkerCategory)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all uppercase">
                <option value="Oficial de 1ª">Oficial de 1ª</option>
                <option value="Oficial de 2ª">Oficial de 2ª</option>
                <option value="Peón Especialista">Peón Especialista</option>
                <option value="Encargado General">Encargado General</option>
                <option value="Gruista">Gruista</option>
                <option value="Maquinista">Maquinista</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">DNI / NIE</label>
              <input type="text" value={workerDni} onChange={(e) => setWorkerDni(e.target.value)} placeholder="00000000X" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all uppercase" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
            <select value={workerCompanyId} onChange={(e) => setWorkerCompanyId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all uppercase">
              {(state.companies || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#FF6600] transition-all shadow-lg active:scale-95 mt-4 disabled:opacity-75 flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Guardando Operario...
              </>
            ) : (
              editingWorker ? 'Actualizar Operario' : 'Dar de Alta Operario'
            )}
          </button>
        </form>
      </Modal>

      {/* Machinery Modal */}
      <Modal 
        isOpen={machineryModalOpen} 
        onClose={() => setMachineryModalOpen(false)} 
        title={editingMachinery ? "Editar Máquina" : "Nueva Maquinaria"}
      >
        <form onSubmit={handleCreateMachinery} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación / Modelo</label>
            <input type="text" required value={macName} onChange={(e) => setMacName(e.target.value)} placeholder="Ej: Excavadora CAT 320" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#5B8CFF]/30 transition-all uppercase" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Máquina</label>
            <select value={macType} onChange={(e) => setMacType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#5B8CFF]/30 transition-all uppercase">
              <option value="Excavadora">Excavadora</option>
              <option value="Grúa">Grúa</option>
              <option value="Camión">Camión</option>
              <option value="Plataforma">Plataforma</option>
              <option value="Grupo Electrógeno">Grupo Electrógeno</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Propietario / Empresa</label>
            <select value={macCompanyId} onChange={(e) => setMacCompanyId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#5B8CFF]/30 transition-all uppercase">
              {(state.companies || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#5B8CFF] transition-all shadow-lg active:scale-95 mt-4 disabled:opacity-75 flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Registrando Maquinaria...
              </>
            ) : (
              editingMachinery ? 'Actualizar Máquina' : 'Registrar Máquina'
            )}
          </button>
        </form>
      </Modal>

      {/* Invitation Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setCreatedInviteResult(null);
        }}
        title={createdInviteResult ? "Invitación Generada" : "Invitar Miembro al Equipo"}
      >
        {createdInviteResult ? (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-slate-900">
                ¡Invitación Registrada con Éxito!
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                El invitado podrá unirse directamente sin crear empresa ni pasar por onboarding.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Código de Invitación
                </span>
                <span className="font-mono text-xs font-black text-[#FF6600] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                  {createdInviteResult.code}
                </span>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Magic Link de Acceso
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInviteResult.magicLink}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdInviteResult.magicLink);
                      toast.success('¡Enlace de invitación copiado al portapapeles!');
                    }}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                <div><strong>Destinatario:</strong> {createdInviteResult.email}</div>
                <div><strong>Rol Asignado:</strong> {createdInviteResult.role}</div>
                <div><strong>Obras:</strong> {createdInviteResult.projectNames.join(', ') || 'Todas las obras'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigate(`/?invite=${createdInviteResult.code}`);
                }}
                className="flex-1 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Probar Acceso Invitado
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedInviteResult(null);
                  setInviteEmail('');
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
              >
                Invitar a Otro
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Email del Invitado *
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="ej: jefe.obra@constructora.com o operario@subcontrata.es"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600] transition-all"
              />
            </div>

            {/* Role selection with 2 cards */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Rol a Desempeñar *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setInviteRole('SITE_MANAGER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    inviteRole === 'SITE_MANAGER'
                      ? 'border-sky-500 bg-sky-50/70 ring-1 ring-sky-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🏗️</span>
                    <span className="text-xs font-black uppercase text-slate-900">
                      Jefe de Obra
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Supervisa tajo, valida partes diarios y albaranes de sus obras.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setInviteRole('SUBCONTRACTOR_USER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    inviteRole === 'SUBCONTRACTOR_USER'
                      ? 'border-[#FF6600] bg-orange-50/70 ring-1 ring-[#FF6600]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">👷</span>
                    <span className="text-xs font-black uppercase text-slate-900">
                      Operario (Worker)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Fichaje por geovalla en tajo, partes de horas y fotos de avance.
                  </p>
                </button>
              </div>
            </div>

            {/* Project assignment with checkboxes */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Obras con Acceso * ({selectedProjectIds.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedProjectIds.length === (state.projects || []).length) {
                      setSelectedProjectIds([]);
                    } else {
                      setSelectedProjectIds((state.projects || []).map(p => p.id));
                    }
                  }}
                  className="text-[9px] font-black text-[#FF6600] uppercase hover:underline"
                >
                  {selectedProjectIds.length === (state.projects || []).length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {(state.projects || []).map(p => {
                  const checked = selectedProjectIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                        checked ? 'bg-white border-slate-300' : 'hover:bg-slate-100/60 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjectIds([...selectedProjectIds, p.id]);
                            } else {
                              setSelectedProjectIds(selectedProjectIds.filter(id => id !== p.id));
                            }
                          }}
                          className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                        />
                        <span className="text-xs font-bold text-slate-800 uppercase">{p.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{p.location?.address}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Simulation / Gmail Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
                <span className="font-bold text-slate-700">
                  {gmailConnected ? 'Envío por Gmail Oficial' : 'Magic Link + Firebase Firestore'}
                </span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                gmailConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {gmailConnected ? 'CONECTADO' : 'SIMULADO'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="w-full py-3.5 bg-[#FF6600] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e65c00] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInviting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generando Invitación...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Generar Invitación y Magic Link
                </>
              )}
            </button>
          </form>
        )}
      </Modal>

      {/* Subcontractor Company Registration Modal */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title="Dar de Alta Subcontratista"
      >
        <form onSubmit={handleCreateSubcontractor} className="space-y-4 font-sans text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-100 uppercase text-[9px] tracking-wide">
              ⚠️ {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social (Nombre)</label>
            <input
              type="text"
              required
              value={subcontractorName}
              onChange={(e) => setSubcontractorName(e.target.value)}
              placeholder="Ej: Estructuras S.L."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#10B981]/30 transition-all uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CIF / NIF (Identificación Fiscal)</label>
            <input
              type="text"
              required
              value={subcontractorTaxId}
              onChange={(e) => setSubcontractorTaxId(e.target.value)}
              placeholder="Ej: B12345678"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#10B981]/30 transition-all uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Fiscal / Sede</label>
            <input
              type="text"
              required
              value={subcontractorAddress}
              onChange={(e) => setSubcontractorAddress(e.target.value)}
              placeholder="Ej: Av. de la Constitución 45, Madrid"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#10B981]/30 transition-all uppercase"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-[10px] text-slate-500 space-y-2 leading-relaxed">
            <span className="text-[9px] font-black uppercase text-slate-700 tracking-wide block">Configuración Automática de Obra:</span>
            <p className="font-medium">
              Al dar de alta la subcontrata, el sistema generará un **Código de Invitación Único**. Comparte este código o invita a un representante por correo para que se asocie directamente a la obra y cargue sus albaranes.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-[#10B981] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#059669] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Registrando Subcontrata...
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5" />
                Registrar Alta de Subcontrata
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
