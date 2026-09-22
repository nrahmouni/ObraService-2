import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { Company, User, Project, Worker, AuditEvent, Role, UserRole } from '../types';
import { 
  Building2, 
  Database, 
  UserSquare2, 
  Wifi, 
  History, 
  ShieldCheck, 
  Power, 
  Plus, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Layers, 
  Activity, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle,
  Radio,
  FileText,
  Clock,
  LogOut,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

type MasterTab = 'companies' | 'database' | 'impersonation' | 'offline' | 'audit';

export const MasterDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MasterTab>('companies');
  const [appState, setAppState] = useState(obraStore.getState());

  useEffect(() => {
    const unsub = obraStore.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsub();
  }, []);

  const { companies, users, projects, workers, reports, deliveryNotes, auditEvents, invitations, timeLogs, complianceDocuments, isDemoMode } = appState;

  // --- TAB 1: Companies ---
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTax, setNewCompanyTax] = useState('');
  const [newCompanyType, setNewCompanyType] = useState<'MAIN_CONTRACTOR' | 'SUBCONTRACTOR'>('MAIN_CONTRACTOR');
  const [newCompanyAddr, setNewCompanyAddr] = useState('');

  // States for toggle/suspension reason modal
  const [toggleCompanyId, setToggleCompanyId] = useState<string | null>(null);
  const [toggleReason, setToggleReason] = useState('');
  const [showToggleModal, setShowToggleModal] = useState(false);

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCompanyTax.trim()) {
      toast.error('Nombre y CIF son requeridos');
      return;
    }

    const res = obraStore.createCompany({
      name: newCompanyName.trim(),
      taxId: newCompanyTax.trim().toUpperCase(),
      type: newCompanyType,
      address: newCompanyAddr.trim() || 'España'
    });

    if (res.success) {
      toast.success('Empresa registrada con éxito en el ecosistema');
      setNewCompanyName('');
      setNewCompanyTax('');
      setNewCompanyAddr('');
    } else {
      toast.error(res.error || 'Error al registrar la empresa');
    }
  };

  const handleToggleCompanyClick = (companyId: string) => {
    setToggleCompanyId(companyId);
    setToggleReason('');
    setShowToggleModal(true);
  };

  const handleConfirmToggleCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toggleCompanyId) return;
    if (!toggleReason.trim()) {
      toast.error('El motivo de la acción es obligatorio');
      return;
    }

    const company = companies.find(c => c.id === toggleCompanyId);
    if (!company) return;

    const success = obraStore.toggleCompanyActive(toggleCompanyId, toggleReason.trim());
    if (success) {
      toast.success(`Estado de la empresa "${company.name}" modificado correctamente`);
      setShowToggleModal(false);
      setToggleCompanyId(null);
      setToggleReason('');
    } else {
      toast.error('No se pudo modificar el estado de la empresa');
    }
  };

  // --- TAB 2: Database Inspector ---
  const [selectedInspectCollection, setSelectedInspectCollection] = useState<string>('users');
  const getInspectData = () => {
    switch (selectedInspectCollection) {
      case 'companies': return companies;
      case 'users': return users;
      case 'projects': return projects;
      case 'workers': return workers;
      case 'reports': return reports;
      case 'deliveryNotes': return deliveryNotes;
      case 'auditEvents': return auditEvents;
      case 'invitations': return invitations;
      case 'timeLogs': return timeLogs;
      case 'complianceDocuments': return complianceDocuments;
      default: return [];
    }
  };

  // --- TAB 3: Impersonation ---
  const [impersonateQuery, setImpersonateQuery] = useState('');
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(impersonateQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(impersonateQuery.toLowerCase()) ||
    (u.companyName || '').toLowerCase().includes(impersonateQuery.toLowerCase())
  );

  const handleImpersonate = (user: User) => {
    toast.success(`Iniciando suplantación de ${user.name}...`);
    obraStore.impersonateUser(user.id);
    
    setTimeout(() => {
      if (user.role === 'SUBCONTRACTOR_USER') {
        navigate('/mobile/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }, 500);
  };

  const handleStopImpersonation = () => {
    const success = obraStore.stopImpersonation();
    if (success) {
      toast.success('Has vuelto a tu sesión de Super Administrador ("King Master")');
      navigate('/admin/master');
    } else {
      toast.error('No se ha podido revertir la suplantación.');
    }
  };

  const isImpersonating = !!sessionStorage.getItem('king_master_original_uid');

  // --- TAB 4: Offline Queue Control ---
  const [offlineSimulated, setOfflineSimulated] = useState(false);
  const [mockQueue, setMockQueue] = useState([
    { id: 'off_1', entity: 'dailyReport', action: 'CREATE', timestamp: new Date(Date.now() - 50000).toISOString(), size: '2.4KB' },
    { id: 'off_2', entity: 'deliveryNote', action: 'UPDATE', timestamp: new Date(Date.now() - 20000).toISOString(), size: '1.1KB' }
  ]);

  const toggleSimulatedOffline = () => {
    setOfflineSimulated(!offlineSimulated);
    toast.success(`Modo sin conexión simulado: ${!offlineSimulated ? 'ACTIVO' : 'DESACTIVADO'}`);
  };

  const handleClearQueue = () => {
    setMockQueue([]);
    toast.success('Cola de operaciones local vaciada');
  };

  const handleForceFlush = () => {
    if (offlineSimulated) {
      toast.error('No se puede sincronizar mientras el dispositivo esté en modo Offline.');
      return;
    }
    toast.success('¡Sincronización forzada! Sincronizados 2 elementos pendientes.');
    setMockQueue([]);
  };

  // --- TAB 5: Global Audit Trail ---
  const [auditQuery, setAuditQuery] = useState('');
  const [auditSeverity, setAuditSeverity] = useState<string>('all');

  const sampleAuditEvents: AuditEvent[] = auditEvents.length > 0 ? auditEvents : [
    {
      id: 'aud_1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actorId: 'usr_admin',
      actorName: 'Carlos Mendoza',
      actorRole: 'MAIN_CONTRACTOR_ADMIN',
      actorCompanyName: 'Construcciones Norte S.L.',
      affectedEntity: 'Company',
      recordId: 'comp_norte',
      operation: 'COMPANY_CREATED',
      details: 'Inicio de sesión exitoso desde IP 85.123.4.12.',
      action: 'LOGIN_SUCCESS',
      category: 'Security',
      severity: 'Info',
      description: 'Inicio de sesión exitoso desde IP 85.123.4.12.',
    },
    {
      id: 'aud_2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actorId: 'usr_worker_4',
      actorName: 'Luis Ramírez (Operario)',
      actorRole: 'SUBCONTRACTOR_USER',
      actorCompanyName: 'Subcontratas Madrid',
      affectedEntity: 'Worker',
      recordId: 'w_4',
      operation: 'WORKER_UPDATED',
      details: 'Fichaje denegado: posición GPS fuera de geocerca permitida (Línea 5). Desviación de 1450 metros.',
      action: 'PROJECT_GEOCERCA_BREACH',
      category: 'Security',
      severity: 'Warning',
      description: 'Fichaje denegado: posición GPS fuera de geocerca permitida (Línea 5). Desviación de 1450 metros.',
    },
    {
      id: 'aud_3',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      actorId: 'usr_site_manager',
      actorName: 'Javier Ortiz',
      actorRole: 'SITE_MANAGER',
      actorCompanyName: 'Construcciones Norte S.L.',
      affectedEntity: 'DeliveryNote',
      recordId: 'dn_84092',
      operation: 'DELIVERY_NOTE_CONFIRMED',
      details: 'Albarán ALB-84092 firmado y conciliado en tajo de obra.',
      action: 'DELIVERY_NOTE_SIGN',
      category: 'Financial',
      severity: 'Success',
      description: 'Albarán ALB-84092 firmado y conciliado en tajo de obra.',
    }
  ];

  const filteredAudits = sampleAuditEvents.filter(evt => {
    const act = evt.action || evt.operation || '';
    const desc = evt.description || evt.details || '';
    const matchesQuery = 
      evt.actorName.toLowerCase().includes(auditQuery.toLowerCase()) ||
      act.toLowerCase().includes(auditQuery.toLowerCase()) ||
      desc.toLowerCase().includes(auditQuery.toLowerCase());
    
    const matchesSeverity = auditSeverity === 'all' || evt.severity === auditSeverity;
    
    return matchesQuery && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-600 font-sans">
      
      {/* Impersonation Warning Banner */}
      {isImpersonating && (
        <div className="bg-amber-600 text-white font-black text-xs uppercase px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>Estás en modo de suplantación activa de {appState.currentUser?.name} ({appState.currentUser?.role})</span>
          </div>
          <button 
            onClick={handleStopImpersonation}
            className="px-3 py-1.5 bg-slate-950 text-amber-400 border border-amber-500 rounded-lg font-black hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Volver a mi Cuenta de Master Admin
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-950/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Panel Maestro del Sistema</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[8px] font-black uppercase tracking-widest">King Master Privileged</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">ObraService Command Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir a Dashboard de Obra</span>
            </button>
            <button
              onClick={() => {
                obraStore.logout();
                navigate('/');
              }}
              className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-rose-900/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Overview Stats Bar */}
      <section className="bg-slate-900/40 border-b border-slate-900 p-6">
        <div className="max-w-7xl mx-auto flex flex-col space-y-2">
          {[
            { label: 'Empresas Unidas', val: companies.length, color: 'text-blue-400' },
            { label: 'Usuarios Totales', val: users.length, color: 'text-amber-500' },
            { label: 'Obras Activas', val: projects.length, color: 'text-emerald-400' },
            { label: 'Operarios Registrados', val: workers.length, color: 'text-purple-400' },
            { label: 'Eventos Auditados', val: sampleAuditEvents.length, color: 'text-rose-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <span className={`text-2xl font-black ${stat.color} mt-2`}>{stat.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs navigation */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          {[
            { key: 'companies', label: 'Empresas Globales', icon: Building2 },
            { key: 'database', label: 'Inspector Firestore', icon: Database },
            { key: 'impersonation', label: 'Suplantación Directa', icon: UserSquare2 },
            { key: 'offline', label: 'Cola Offline (' + mockQueue.length + ')', icon: Wifi },
            { key: 'audit', label: 'Auditoría Global', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as MasterTab)}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                  active 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="mt-6">
          
          {/* TAB 1: Companies */}
          {activeTab === 'companies' && (
            <div className="flex flex-col space-y-6">
              
              {/* Add Company Column */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 self-start">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Registrar Nueva Empresa</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Crea entidades en el sistema como Contratista Principal o Subcontratista homologada.
                  </p>
                </div>

                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Razón Social / Nombre Comercial</label>
                    <input 
                      type="text" 
                      required 
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Ej: Construcciones del Ebro S.A."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Identificador Fiscal CIF/NIF</label>
                    <input 
                      type="text" 
                      required 
                      value={newCompanyTax}
                      onChange={(e) => setNewCompanyTax(e.target.value)}
                      placeholder="Ej: B12345678"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Tipo de Contrato Comercial</label>
                    <select 
                      value={newCompanyType}
                      onChange={(e) => setNewCompanyType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="MAIN_CONTRACTOR">Contratista Principal (Admin)</option>
                      <option value="SUBCONTRACTOR">Empresa Subcontratada</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Dirección de Sede Central</label>
                    <input 
                      type="text" 
                      value={newCompanyAddr}
                      onChange={(e) => setNewCompanyAddr(e.target.value)}
                      placeholder="Ej: Avda de la Constitución 12, Zaragoza"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Dar de Alta Empresa</span>
                  </button>
                </form>
              </div>

              {/* Companies List Column */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Building2 className="w-4.5 h-4.5 text-amber-500" />
                    <span>Listado de Empresas Homologadas</span>
                  </h3>
                  <span className="px-2 py-1 rounded bg-slate-850 border border-slate-850 text-slate-400 text-[10px] font-bold">
                    {companies.length} en total
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-500">
                        <th className="py-3 px-2">Razón Social</th>
                        <th className="py-3 px-2">CIF/NIF</th>
                        <th className="py-3 px-2">Tipo</th>
                        <th className="py-3 px-2">Código Invitación</th>
                        <th className="py-3 px-2">Suscripción</th>
                        <th className="py-3 px-2">Estado</th>
                        <th className="py-3 px-2 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs font-semibold">
                      {companies.map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-900/50">
                          <td className="py-3 px-2">
                            <span className="font-black text-white block">{comp.name}</span>
                            <span className="text-[10px] text-slate-400 block">{comp.address}</span>
                          </td>
                          <td className="py-3 px-2 font-mono text-amber-500 font-bold">{comp.taxId}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              comp.type === 'MAIN_CONTRACTOR' ? 'bg-orange-950/60 text-orange-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {comp.type === 'MAIN_CONTRACTOR' ? 'Principal' : 'Subcontrata'}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-[11px] font-bold text-blue-400">{comp.inviteCode || 'N/A'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              comp.subscriptionStatus === 'Suspended' ? 'bg-rose-950/60 text-rose-400' :
                              comp.subscriptionStatus === 'Expired' ? 'bg-yellow-950/60 text-yellow-400' :
                              'bg-emerald-950/60 text-emerald-400'
                            }`}>
                              {comp.subscriptionStatus || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              comp.active ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${comp.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                              {comp.active ? 'Activo' : 'Suspendido'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleToggleCompanyClick(comp.id)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                                comp.active 
                                  ? 'bg-rose-950/20 text-rose-400 border-rose-900/30 hover:bg-rose-900/20' 
                                  : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20'
                              }`}
                              title={comp.active ? 'Suspender Empresa' : 'Activar Empresa'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Database Inspector */}
          {activeTab === 'database' && (
            <div className="flex flex-col space-y-6">
              
              {/* Collections Selector Sidebar */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block px-2 mb-2">Colecciones de Sistema</span>
                {[
                  { key: 'companies', label: 'companies', count: companies.length },
                  { key: 'users', label: 'users', count: users.length },
                  { key: 'projects', label: 'projects', count: projects.length },
                  { key: 'workers', label: 'workers', count: workers.length },
                  { key: 'reports', label: 'dailyReports', count: reports.length },
                  { key: 'deliveryNotes', label: 'deliveryNotes', count: deliveryNotes.length },
                  { key: 'auditEvents', label: 'auditEvents', count: auditEvents.length },
                  { key: 'invitations', label: 'invitations', count: invitations.length },
                  { key: 'timeLogs', label: 'timeLogs', count: timeLogs.length },
                  { key: 'complianceDocuments', label: 'complianceDocs', count: complianceDocuments.length }
                ].map((col) => {
                  const active = selectedInspectCollection === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => setSelectedInspectCollection(col.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active 
                          ? 'bg-[#FF6600]/10 text-white border-l-4 border-[#FF6600]' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <span className="font-mono">{col.label}</span>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-950 rounded-md font-black text-slate-300">{col.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Data Inspector Display Console */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white font-mono flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#FF6600]" />
                      <span>db.collection('{selectedInspectCollection}')</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Analizador y visor JSON en tiempo real.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400">Live Sync</span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto max-h-[450px]">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(getInspectData(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Impersonation */}
          {activeTab === 'impersonation' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <UserSquare2 className="w-5 h-5 text-amber-500" />
                    <span>Suplantación Segura (Impersonation Portal)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bypass de sesión: actúa temporalmente como cualquier Jefe de Obra o Subcontrata para auditar su vista operativa.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre, correo, empresa..."
                    value={impersonateQuery}
                    onChange={(e) => setImpersonateQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {filteredUsers.map((u) => {
                  // Don't let King Master impersonate themselves
                  if (u.id === appState.currentUser?.id) return null;

                  return (
                    <div key={u.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ID: {u.id.substring(0, 10)}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            u.role === 'MAIN_CONTRACTOR_ADMIN' ? 'bg-orange-950 text-orange-400 border border-orange-900/30' :
                            u.role === 'SITE_MANAGER' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                            'bg-blue-950 text-blue-400 border border-blue-900/30'
                          }`}>
                            {u.role === 'MAIN_CONTRACTOR_ADMIN' ? 'Contratista Admin' : u.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Subcontrata'}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-black text-white mt-3">{u.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                        <p className="text-[10px] text-amber-500/90 font-bold mt-1.5 uppercase tracking-wider">
                          🏢 {u.companyName || 'Sin Empresa'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Estado: {u.active ? 'Activo' : 'Inactivo'}</span>
                        <button
                          onClick={() => handleImpersonate(u)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] rounded-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Suplantar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Offline Queue Control */}
          {activeTab === 'offline' && (
            <div className="flex flex-col space-y-6">
              
              {/* Queue Control Column */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 self-start">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-amber-500" />
                    <span>Control de Sincronización</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Simula escenarios de campo de baja conectividad o audita el comportamiento de reintento.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">Modo Offline Simulado</span>
                    <button
                      onClick={toggleSimulatedOffline}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        offlineSimulated ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        offlineSimulated ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    Si se activa, el SDK bloqueará el tráfico saliente y encolará todas las escrituras locales.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleForceFlush}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Forzar Sincronización</span>
                  </button>
                  <button
                    onClick={handleClearQueue}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Vaciar Cola Local</span>
                  </button>
                </div>
              </div>

              {/* Pending Queue Items */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Radio className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                    <span>Cola de Transacciones Locales Pendientes</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    offlineSimulated ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {offlineSimulated ? 'Simulado Offline' : 'Online'}
                  </span>
                </div>

                {mockQueue.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 space-y-2 flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-white mt-3">Cola Totalmente Vacía</span>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                      Todas las mutaciones se encuentran conciliadas y confirmadas en los servidores de Firebase.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockQueue.map((item) => (
                      <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-white">{item.entity}</span>
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                                {item.action}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Encolado: {new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-slate-400">{item.size}</span>
                          <span className="px-2 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-900/30 rounded text-[8px] font-black uppercase">
                            Esperando Red
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Global Audit Trail */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-500" />
                    <span>Registro de Auditoría Maestro (Audit Trail)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Buzón inmutable e histórico de operaciones sensibles y de seguridad de todo el ecosistema.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <select
                    value={auditSeverity}
                    onChange={(e) => setAuditSeverity(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="all">Todas las Severidades</option>
                    <option value="Info">Info</option>
                    <option value="Warning">Advertencias</option>
                    <option value="Success">Éxito</option>
                  </select>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar actor o acción..."
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAudits.map((evt) => (
                  <div key={evt.id} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-800 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        evt.severity === 'Success' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                        evt.severity === 'Warning' ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' :
                        'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        <Activity className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider">{evt.action}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            evt.severity === 'Success' ? 'bg-emerald-950 text-emerald-400' :
                            evt.severity === 'Warning' ? 'bg-amber-950 text-amber-400' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {evt.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">{evt.category}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-0.5">
                          <span>👤 {evt.actorName}</span>
                          <span>•</span>
                          <span>🏢 {evt.actorCompanyName}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono self-end md:self-center font-bold">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toggle / Suspension Mandate Modal */}
      {showToggleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black uppercase tracking-widest text-orange-500 font-display">
              Confirmar cambio de estado comercial
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              De acuerdo con las políticas del sistema, es obligatorio registrar un motivo de auditoría al suspender o reactivar empresas del ecosistema.
            </p>

            <form onSubmit={handleConfirmToggleCompany} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Motivo obligatorio de la acción
                </label>
                <textarea
                  required
                  rows={3}
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                  placeholder="Ej: Incumplimiento de póliza REA / Puesta al día de cuotas de suscripción contratadas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowToggleModal(false);
                    setToggleCompanyId(null);
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Registrar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
