import React, { useState } from 'react';
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
  Send
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Worker, User, WorkerCategory, Machinery, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { UnifiedCrudModal } from '../components/UnifiedCrudModal';
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

  // Invitation Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MAIN_CONTRACTOR_ADMIN' | 'SITE_MANAGER' | 'SUBCONTRACTOR_USER'>('SITE_MANAGER');
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

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Por favor, indica un correo electrónico de invitación.');
      return;
    }

    setIsInviting(true);
    try {
      const activeCompany = state.companies.find(c => c.id === currentUser.companyId);
      const companyName = activeCompany?.name || 'Nuestra Constructora';
      const inviteCode = activeCompany?.inviteCode || 'OBRA-GENERICA';
      const roleLabel = getRoleLabel(inviteRole);

      // Build beautiful HTML email using standard template
      const emailBody = GMAIL_TEMPLATES.invitation(
        companyName,
        inviteCode,
        currentUser.name,
        roleLabel
      );

      const result = await sendGmailEmail(
        inviteEmail,
        `[Invitación ObraService] Únete a la empresa ${companyName}`,
        emailBody
      );

      setIsInviting(false);
      if (result.success) {
        // Log in store
        obraStore.createInvitation(inviteEmail, inviteRole, currentUser.companyId || '', currentUser.name);
        
        toast.success(result.isSimulated 
          ? '¡Invitación registrada con éxito (Simulado)!' 
          : '¡Invitación enviada con éxito vía Gmail!'
        );
        setInviteModalOpen(false);
        setInviteEmail('');
      } else {
        toast.error(result.error || 'Error al enviar la invitación.');
      }
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

      {/* Users List */}
      {activeSubTab === 'users' && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuario</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Rol</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {u.name[0]}
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-slate-500">{u.email}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="neutral" className="text-[8px] px-1.5 py-0">{getRoleLabel(u.role)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={u.active ? 'success' : 'neutral'} className="text-[8px] px-1.5 py-0">
                      {u.active ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Invitations Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#FF6600]" />
              Invitaciones Enviadas Pendientes (Gmail)
            </h3>
            <span className="text-[9px] bg-[#FF6600]/10 text-[#FF6600] font-bold px-2 py-0.5 rounded-full uppercase">
              {state.invitations?.length || 0} Enviadas
            </span>
          </div>

          {(!state.invitations || state.invitations.length === 0) ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              No hay invitaciones enviadas pendientes.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Email Destinatario</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Rol Asignado</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Fecha</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {state.invitations.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black text-slate-900">{inv.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral" className="text-[8px] px-1.5 py-0">{getRoleLabel(inv.role)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[9px] text-slate-400 font-bold">{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="warning" className="text-[8px] px-1.5 py-0">
                          PENDIENTE
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
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
      <UnifiedCrudModal 
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
      </UnifiedCrudModal>

      {/* Machinery Modal */}
      <UnifiedCrudModal 
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
      </UnifiedCrudModal>

      {/* Gmail Invitation Modal */}
      <UnifiedCrudModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invitar Miembro por Gmail"
      >
        <form onSubmit={handleSendInvitation} className="space-y-5">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6600]" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Cuenta de Gmail</span>
              </div>
              {gmailConnected ? (
                <span className="text-[8px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">CONECTADO</span>
              ) : (
                <span className="text-[8px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">SIMULADOR ACTIVO</span>
              )
            }
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Conecta tu Gmail oficial para que tus invitaciones se envíen desde tu dirección real. Si no lo conectas, la invitación se registrará en el sistema y se simulará su envío.
            </p>

            {gmailConnected ? (
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-600 truncate uppercase">Google Workspace Listo</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-600 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectGmail}
                disabled={connectingGmail}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {connectingGmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Autenticando con Google...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Conectar Gmail Oficial
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo del Destinatario</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="ej: socio@subcontrata.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol en la Constructora</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all uppercase"
            >
              <option value="SITE_MANAGER">Jefe de Obra (SITE_MANAGER)</option>
              <option value="SUBCONTRACTOR_USER">Subcontrata (SUBCONTRACTOR_USER)</option>
              <option value="MAIN_CONTRACTOR_ADMIN">Admin Contratista (MAIN_CONTRACTOR_ADMIN)</option>
            </select>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vista Previa de la Invitación</div>
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-[10px] text-slate-500 space-y-1 italic leading-relaxed">
              <div><strong className="text-slate-700">De:</strong> {currentUser.name} {gmailConnected ? `(${currentUser.email})` : '(vía ObraService)'}</div>
              <div><strong className="text-slate-700">Para:</strong> {inviteEmail || 'destinatario@correo.com'}</div>
              <div><strong className="text-slate-700">Asunto:</strong> [Invitación ObraService] Únete a la empresa ...</div>
              <div className="border-t border-slate-200/60 mt-2 pt-2 text-[9px] text-slate-400 not-italic uppercase tracking-wider font-bold">
                * Contenido: Código de invitación único de constructora para registro directo.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isInviting}
            className="w-full py-4 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e65c00] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isInviting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Enviando invitación...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Enviar Invitación vía Gmail
              </>
            )}
          </button>
        </form>
      </UnifiedCrudModal>

      {/* Subcontractor Company Registration Modal */}
      <UnifiedCrudModal
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
      </UnifiedCrudModal>
    </div>
  );
};
