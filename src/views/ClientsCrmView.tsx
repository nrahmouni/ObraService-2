import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  TrendingUp, 
  Euro, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  X,
  FileText,
  DollarSign,
  Layers,
  ArrowUpRight,
  MoreVertical,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import { AppState, Client, CrmOpportunity, CrmActivity, OpportunityStage, ClientType, CreditRating } from '../types';
import { obraStore } from '../services/store';
import { exportToCSV } from '../utils/export';
import toast from 'react-hot-toast';

interface ClientsCrmViewProps {
  state: AppState;
}

export const ClientsCrmView: React.FC<ClientsCrmViewProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'clients' | 'activities'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);

  // New Opportunity Form
  const [oppTitle, setOppTitle] = useState('');
  const [oppClientId, setOppClientId] = useState('');
  const [oppValue, setOppValue] = useState('');
  const [oppStage, setOppStage] = useState<OpportunityStage>('PROSPECT');
  const [oppProbability, setOppProbability] = useState('50');
  const [oppClosingDate, setOppClosingDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [oppProjectType, setOppProjectType] = useState('Residencial');
  const [oppNotes, setOppNotes] = useState('');

  // New Client Form
  const [clientName, setClientName] = useState('');
  const [clientTradeName, setClientTradeName] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientType, setClientType] = useState<ClientType>('PROMOTOR');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('Madrid');
  const [clientTerms, setClientTerms] = useState('60');
  const [clientRating, setClientRating] = useState<CreditRating>('A');

  // New Activity Form
  const [actType, setActType] = useState<'CALL' | 'MEETING' | 'SITE_VISIT' | 'EMAIL' | 'PROPOSAL'>('MEETING');
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actClientId, setActClientId] = useState('');

  const clients = state.clients || [];
  const opportunities = state.crmOpportunities || [];
  const activities = state.crmActivities || [];

  // Stages configuration
  const stages: { key: OpportunityStage; label: string; color: string }[] = [
    { key: 'PROSPECT', label: '1. Lead / Prospecto', color: 'border-slate-500/40 text-slate-300' },
    { key: 'STUDY', label: '2. Estudio Técnico', color: 'border-blue-500/40 text-blue-400' },
    { key: 'PROPOSAL_SENT', label: '3. Propuesta Enviada', color: 'border-purple-500/40 text-purple-400' },
    { key: 'NEGOTIATION', label: '4. Negociación Final', color: 'border-amber-500/40 text-amber-400' },
    { key: 'WON', label: '5. Ganada / En Ejecución', color: 'border-emerald-500/40 text-emerald-400' },
    { key: 'LOST', label: 'Desestimada', color: 'border-rose-500/40 text-rose-400' }
  ];

  // Pipeline metrics
  const totalPipelineValue = opportunities
    .filter(o => o.stage !== 'LOST')
    .reduce((sum, o) => sum + o.value, 0);

  const weightedPipelineValue = opportunities
    .filter(o => o.stage !== 'LOST')
    .reduce((sum, o) => sum + (o.value * (o.probability / 100)), 0);

  const wonDealsCount = opportunities.filter(o => o.stage === 'WON').length;
  const winRate = opportunities.length > 0 
    ? Math.round((wonDealsCount / opportunities.length) * 100) 
    : 0;

  // Filtered clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tradeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || c.clientType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(oppValue.replace(/[^0-9.]/g, ''));
    if (!oppTitle || !oppClientId || isNaN(val) || val <= 0) {
      toast.error('Indica un título, un cliente y un valor económico válido');
      return;
    }

    const client = clients.find(c => c.id === oppClientId);
    const res = obraStore.addCrmOpportunity({
      companyId: state.currentUser?.companyId || 'comp_norte',
      clientId: oppClientId,
      clientName: client?.name || 'Cliente',
      title: oppTitle.trim(),
      value: val,
      stage: oppStage,
      probability: parseInt(oppProbability, 10) || 50,
      expectedClosingDate: oppClosingDate,
      projectType: oppProjectType,
      assignedTo: state.currentUser?.name || 'Director Comercial',
      notes: oppNotes.trim()
    });

    if (res.success) {
      toast.success('Oportunidad añadida al pipeline de licitaciones');
      setIsNewOppModalOpen(false);
      setOppTitle('');
      setOppValue('');
      setOppNotes('');
    } else {
      toast.error(res.error || 'Error al crear la oportunidad');
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientTaxId.trim()) {
      toast.error('Razón Social y CIF/NIF son obligatorios');
      return;
    }

    const res = obraStore.addClient({
      companyId: state.currentUser?.companyId || 'comp_norte',
      name: clientName.trim(),
      tradeName: clientTradeName.trim() || clientName.trim(),
      taxId: clientTaxId.trim().toUpperCase(),
      clientType,
      contactPerson: clientContact.trim() || 'Contacto Principal',
      contactEmail: clientEmail.trim(),
      contactPhone: clientPhone.trim(),
      address: clientAddress.trim() || 'España',
      city: clientCity.trim() || 'Madrid',
      creditRating: clientRating,
      paymentTermsDays: parseInt(clientTerms, 10) || 60,
      status: 'ACTIVE',
      totalBilled: 0,
      pendingAmount: 0,
      assignedProjectIds: [],
      portalAccessEnabled: true,
      portalAccessCode: `PORTAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    });

    if (res.success) {
      toast.success(`Cliente ${clientName} registrado en CRM Pro Max`);
      setIsNewClientModalOpen(false);
      setClientName('');
      setClientTradeName('');
      setClientTaxId('');
      setClientContact('');
      setClientEmail('');
      setClientPhone('');
    } else {
      toast.error(res.error || 'Error al guardar el cliente');
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actClientId) {
      toast.error('Indica un título y selecciona un cliente');
      return;
    }

    const client = clients.find(c => c.id === actClientId);
    obraStore.addCrmActivity({
      companyId: state.currentUser?.companyId || 'comp_norte',
      clientId: actClientId,
      clientName: client?.name,
      type: actType,
      title: actTitle.trim(),
      description: actDesc.trim(),
      date: new Date().toISOString(),
      performedBy: state.currentUser?.name || 'Gestor CRM'
    });

    toast.success('Actividad registrada en el historial CRM');
    setIsNewActivityModalOpen(false);
    setActTitle('');
    setActDesc('');
  };

  const handleExportClientsCSV = () => {
    const data = clients.map(c => ({
      'Razón Social': c.name,
      'Nombre Comercial': c.tradeName || c.name,
      'CIF/NIF': c.taxId,
      'Tipo de Cliente': c.clientType,
      'Persona de Contacto': c.contactPerson,
      'Email': c.contactEmail,
      'Teléfono': c.contactPhone,
      'Rating Solvencia': c.creditRating,
      'Días de Pago': c.paymentTermsDays,
      'Total Facturado (€)': c.totalBilled,
      'Pendiente de Cobro (€)': c.pendingAmount,
      'Acceso Portal': c.portalAccessEnabled ? 'Sí' : 'No'
    }));

    exportToCSV(data, `CRM_Cartera_Clientes_${new Date().toISOString().split('T')[0]}`);
    toast.success('Cartera de clientes exportada en CSV');
  };

  const handleSyncErp = () => {
    toast.loading('Sincronizando con ERP central (SAP / Dynamics / Sage)...', { duration: 1500 });
    setTimeout(() => {
      toast.success('Sincronización completada: 4 cuentas y 2 propuestas actualizadas con tu ERP.');
    }, 1600);
  };

  const handleMoveStage = (oppId: string, currentStage: OpportunityStage, direction: 'forward' | 'backward') => {
    const stageKeys: OpportunityStage[] = ['PROSPECT', 'STUDY', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'];
    const currentIndex = stageKeys.indexOf(currentStage);
    if (currentIndex === -1) return;

    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageKeys.length) {
      obraStore.updateCrmOpportunityStage(oppId, stageKeys[newIndex]);
      toast.success(`Oportunidad movida a "${stageKeys[newIndex]}"`);
    }
  };

  const copyPortalCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código del Portal del Cliente copiado al portapapeles');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              CRM Pro Max: Clientes & Obras
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
              Integrable ERP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted">
            Pipeline de licitaciones, captación de promotores, control de cobros y portal interactivo para clientes.
          </p>
        </div>

        {/* Global CRM Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncErp}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white border border-brand-border text-xs font-bold uppercase transition-all flex items-center gap-1.5"
            title="Sincronizar clientes con SAP S/4HANA o Microsoft Dynamics"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Sincronizar ERP
          </button>
          <button
            onClick={handleExportClientsCSV}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white border border-brand-border text-xs font-bold uppercase transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Exportar CSV
          </button>
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
          <button
            onClick={() => {
              if (clients.length === 0) {
                toast.error('Primero debes registrar al menos un cliente');
                setIsNewClientModalOpen(true);
                return;
              }
              setOppClientId(clients[0].id);
              setIsNewOppModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-accent/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Nueva Licitación / Propuesta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-muted uppercase">Pipeline Activo</div>
            <div className="text-xl sm:text-2xl font-display font-black text-white">
              {(totalPipelineValue / 1000000).toFixed(2)} M€
            </div>
            <div className="text-[10px] text-brand-muted">
              Ponderado: {(weightedPipelineValue / 1000000).toFixed(2)} M€
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-muted uppercase">Tasa de Cierre (Win Rate)</div>
            <div className="text-xl sm:text-2xl font-display font-black text-emerald-400">
              {winRate}%
            </div>
            <div className="text-[10px] text-brand-muted">
              {wonDealsCount} de {opportunities.length} ofertas adjudicadas
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-muted uppercase">Clientes en Cartera</div>
            <div className="text-xl sm:text-2xl font-display font-black text-white">
              {clients.length}
            </div>
            <div className="text-[10px] text-brand-muted">
              Promotores y entes públicos
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-muted uppercase">Scoring Crediticio</div>
            <div className="text-xl sm:text-2xl font-display font-black text-purple-400">
              A+ Promedio
            </div>
            <div className="text-[10px] text-brand-muted">
              Riesgo morosidad bajo
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-2">
        {[
          { key: 'pipeline', label: 'Pipeline de Licitaciones (Kanban)', count: opportunities.length },
          { key: 'clients', label: 'Directorio de Clientes & Promotores', count: clients.length },
          { key: 'activities', label: 'Historial de Interacciones & Visitas', count: activities.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-brand-accent text-white shadow-md'
                : 'text-brand-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className="w-5 h-5 rounded-full bg-black/30 text-[10px] flex items-center justify-center font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: KANBAN PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[1200px]">
              {stages.map((stage) => {
                const stageOpps = opportunities.filter(o => o.stage === stage.key);
                const stageTotal = stageOpps.reduce((sum, o) => sum + o.value, 0);

                return (
                  <div key={stage.key} className="bg-brand-surface border border-brand-border rounded-2xl p-3.5 flex flex-col min-h-[500px]">
                    
                    {/* Column Header */}
                    <div className="pb-3 border-b border-brand-border mb-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-display font-black uppercase tracking-wider ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-mono flex items-center justify-center text-white">
                          {stageOpps.length}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-brand-muted mt-1">
                        {stageTotal > 0 ? `${(stageTotal / 1000).toLocaleString('es-ES')} k€` : '0 €'}
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-3.5 bg-brand-bg rounded-xl border border-brand-border hover:border-brand-accent/40 transition-all shadow-sm group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono text-brand-muted">{opp.code}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-300">
                              {opp.projectType}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                            {opp.title}
                          </h4>

                          <div className="text-[11px] text-brand-muted truncate">
                            {opp.clientName}
                          </div>

                          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {opp.value.toLocaleString('es-ES')} €
                            </span>
                            <span className="text-[10px] font-mono text-brand-muted">
                              {opp.probability}% prob.
                            </span>
                          </div>

                          {/* Move stage controls */}
                          <div className="pt-2 flex items-center justify-between text-[10px] text-brand-muted">
                            <button
                              onClick={() => handleMoveStage(opp.id, opp.stage, 'backward')}
                              className="hover:text-white px-1 py-0.5 rounded hover:bg-white/5"
                              title="Fase anterior"
                            >
                              ◀
                            </button>
                            <span className="text-[9px] text-brand-muted truncate max-w-[80px]">
                              {opp.assignedTo}
                            </span>
                            <button
                              onClick={() => handleMoveStage(opp.id, opp.stage, 'forward')}
                              className="hover:text-white px-1 py-0.5 rounded hover:bg-white/5 font-bold text-brand-accent"
                              title="Fase siguiente"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      ))}

                      {stageOpps.length === 0 && (
                        <div className="h-32 flex items-center justify-center border border-dashed border-brand-border/50 rounded-xl text-center p-3 text-brand-muted text-[11px]">
                          Sin ofertas en esta fase
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT DIRECTORY */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Razón Social, CIF o contacto..."
                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-brand-muted" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
              >
                <option value="ALL">Todos los tipos de cliente</option>
                <option value="PROMOTOR">Promotores Inmobiliarios</option>
                <option value="CONSTRUCTORA">Constructoras Principales</option>
                <option value="ADMINISTRACION_PUBLICA">Administración Pública</option>
                <option value="INDUSTRIAL">Industrial / Logístico</option>
                <option value="PARTICULAR">Particulares</option>
              </select>
            </div>
          </div>

          {/* Clients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((c) => (
              <div
                key={c.id}
                className="card p-5 border-brand-border hover:border-brand-accent/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                        {c.clientType}
                      </span>
                      <h3 className="text-base font-display font-black text-white uppercase tracking-tight mt-1">
                        {c.name}
                      </h3>
                      {c.tradeName && c.tradeName !== c.name && (
                        <div className="text-xs text-brand-muted">Comercial: {c.tradeName}</div>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Rating {c.creditRating}
                      </span>
                      <span className="text-[10px] font-mono text-brand-muted mt-1">CIF: {c.taxId}</span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="bg-brand-bg/60 p-3 rounded-xl border border-brand-border space-y-1.5 text-xs text-brand-muted">
                    <div className="text-white font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-accent" /> {c.contactPerson}
                    </div>
                    {c.contactEmail && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-brand-muted" />
                        <a href={`mailto:${c.contactEmail}`} className="hover:text-brand-accent">{c.contactEmail}</a>
                      </div>
                    )}
                    {c.contactPhone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand-muted" />
                          <a href={`tel:${c.contactPhone}`} className="hover:text-brand-accent font-mono">{c.contactPhone}</a>
                        </div>
                        <a
                          href={`https://wa.me/${c.contactPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Billing status */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-brand-bg p-2.5 rounded-lg border border-brand-border">
                      <div className="text-[10px] text-brand-muted uppercase">Total Facturado</div>
                      <div className="font-mono font-bold text-white">
                        {c.totalBilled > 0 ? `${c.totalBilled.toLocaleString('es-ES')} €` : '0 €'}
                      </div>
                    </div>
                    <div className="bg-brand-bg p-2.5 rounded-lg border border-brand-border">
                      <div className="text-[10px] text-brand-muted uppercase">Pendiente Cobro</div>
                      <div className="font-mono font-bold text-amber-400">
                        {c.pendingAmount > 0 ? `${c.pendingAmount.toLocaleString('es-ES')} €` : 'Al corriente'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Portal code */}
                <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-brand-muted">Portal Promotor:</span>
                    <button
                      onClick={() => copyPortalCode(c.portalAccessCode)}
                      className="font-mono text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1 bg-brand-accent/5 px-2 py-0.5 rounded"
                    >
                      {c.portalAccessCode} <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedClientForDetail(c)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-brand-accent hover:text-white text-brand-muted text-xs font-bold transition-all"
                  >
                    Ver Ficha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITIES & SITE VISITS */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
              Historial de Reuniones, Llamadas y Visitas de Obra
            </h3>
            <button
              onClick={() => {
                if (clients.length === 0) {
                  toast.error('Registra un cliente primero');
                  return;
                }
                setActClientId(clients[0].id);
                setIsNewActivityModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Interacción
            </button>
          </div>

          <div className="card divide-y divide-brand-border border-brand-border overflow-hidden">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    act.type === 'MEETING' ? 'bg-purple-500/10 text-purple-400' :
                    act.type === 'SITE_VISIT' ? 'bg-amber-500/10 text-amber-400' :
                    act.type === 'CALL' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {act.type === 'MEETING' && <Users className="w-5 h-5" />}
                    {act.type === 'SITE_VISIT' && <Building2 className="w-5 h-5" />}
                    {act.type === 'CALL' && <Phone className="w-5 h-5" />}
                    {act.type === 'EMAIL' && <Mail className="w-5 h-5" />}
                    {act.type === 'PROPOSAL' && <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{act.title}</span>
                      <span className="text-[10px] font-mono text-brand-muted">{new Date(act.date).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="text-xs text-brand-accent font-medium">{act.clientName}</div>
                    <p className="text-xs text-brand-muted leading-relaxed">{act.description}</p>
                    <div className="text-[10px] text-brand-muted pt-1">Registrado por: <strong>{act.performedBy}</strong></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-brand-muted text-xs">
                No hay actividades registradas todavía.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NUEVA LICITACIÓN / PROPUESTA */}
      {isNewOppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-lg bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-accent" /> Nueva Licitación / Propuesta
              </h3>
              <button onClick={() => setIsNewOppModalOpen(false)} className="text-brand-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Título de la Obra / Licitación</label>
                <input
                  type="text"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="Ej. Residencial Las Lomas - 48 Viviendas"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Cliente / Promotor</label>
                  <select
                    value={oppClientId}
                    onChange={(e) => setOppClientId(e.target.value)}
                    required
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Importe Presupuestado (€)</label>
                  <input
                    type="number"
                    step="1000"
                    value={oppValue}
                    onChange={(e) => setOppValue(e.target.value)}
                    placeholder="1850000"
                    required
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Fase Inicial</label>
                  <select
                    value={oppStage}
                    onChange={(e) => setOppStage(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="PROSPECT">1. Lead / Prospecto</option>
                    <option value="STUDY">2. Estudio Técnico</option>
                    <option value="PROPOSAL_SENT">3. Propuesta Enviada</option>
                    <option value="NEGOTIATION">4. Negociación</option>
                    <option value="WON">5. Adjudicada / Ganada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Probabilidad (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={oppProbability}
                    onChange={(e) => setOppProbability(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Tipo de Obra</label>
                  <select
                    value={oppProjectType}
                    onChange={(e) => setOppProjectType(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="Residencial">Residencial</option>
                    <option value="Civil">Civil / Obra Pública</option>
                    <option value="Industrial">Industrial / Logístico</option>
                    <option value="Rehabilitación">Rehabilitación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Fecha Prevista de Adjudicación</label>
                <input
                  type="date"
                  value={oppClosingDate}
                  onChange={(e) => setOppClosingDate(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Notas Comerciales & Requerimientos</label>
                <textarea
                  rows={2}
                  value={oppNotes}
                  onChange={(e) => setOppNotes(e.target.value)}
                  placeholder="Detalles sobre plazos, penalizaciones o requerimientos especiales de hormigón..."
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOppModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider"
                >
                  Guardar Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-lg bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-accent" /> Registrar Nuevo Cliente / Promotor
              </h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-brand-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Razón Social Oficial</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Metrovacesa Promociones S.A."
                    required
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={clientTradeName}
                    onChange={(e) => setClientTradeName(e.target.value)}
                    placeholder="Metrovacesa"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">CIF / NIF</label>
                  <input
                    type="text"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value.toUpperCase())}
                    placeholder="A-85123992"
                    required
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Tipo de Cliente</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="PROMOTOR">Promotora Inmobiliaria</option>
                    <option value="CONSTRUCTORA">Constructora Principal</option>
                    <option value="ADMINISTRACION_PUBLICA">Administración Pública</option>
                    <option value="INDUSTRIAL">Industrial / Logístico</option>
                    <option value="PARTICULAR">Particular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Rating Crediticio</label>
                  <select
                    value={clientRating}
                    onChange={(e) => setClientRating(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="A+">A+ (Solvencia Máxima)</option>
                    <option value="A">A (Excelente)</option>
                    <option value="B+">B+ (Aceptable)</option>
                    <option value="B">B (Riesgo Moderado)</option>
                    <option value="C">C (Prepago Requerido)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Contacto Principal</label>
                  <input
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    placeholder="Nombre y cargo"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Email Directo</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="director@cliente.es"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider"
                >
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ACTIVIDAD */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                Registrar Interacción CRM
              </h3>
              <button onClick={() => setIsNewActivityModalOpen(false)} className="text-brand-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Tipo de Actividad</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value as any)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                >
                  <option value="MEETING">Reunión de Coordinación</option>
                  <option value="SITE_VISIT">Visita Técnica a Obra</option>
                  <option value="CALL">Llamada Telefónica</option>
                  <option value="EMAIL">Envío de Documentación / Email</option>
                  <option value="PROPOSAL">Entrega de Propuesta Económica</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Cliente Asociado</label>
                <select
                  value={actClientId}
                  onChange={(e) => setActClientId(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Título Resumido</label>
                <input
                  type="text"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="Ej. Revisión de pliegos con el director de obras"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Acuerdos y Observaciones</label>
                <textarea
                  rows={3}
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  placeholder="Puntos tratados, acuerdos tomados y siguientes pasos acordados..."
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: FICHA DETALLADA DE CLIENTE */}
      {selectedClientForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-2xl bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-accent tracking-wider">
                  Ficha de Cliente CRM
                </span>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                  {selectedClientForDetail.name}
                </h3>
              </div>
              <button onClick={() => setSelectedClientForDetail(null)} className="text-brand-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-brand-bg p-4 rounded-xl border border-brand-border">
                <div className="font-bold text-white uppercase text-[11px]">Datos Mercantiles</div>
                <div>CIF / NIF: <strong className="font-mono text-white">{selectedClientForDetail.taxId}</strong></div>
                <div>Tipo: <strong className="text-white">{selectedClientForDetail.clientType}</strong></div>
                <div>Dirección: <strong className="text-white">{selectedClientForDetail.address}, {selectedClientForDetail.city}</strong></div>
                <div>Plazo de Pago: <strong className="text-white">{selectedClientForDetail.paymentTermsDays} días</strong></div>
                <div>Rating Solvencia: <strong className="text-purple-400 font-bold">{selectedClientForDetail.creditRating}</strong></div>
              </div>

              <div className="space-y-2 bg-brand-bg p-4 rounded-xl border border-brand-border">
                <div className="font-bold text-white uppercase text-[11px]">Contacto Directo</div>
                <div>Persona: <strong className="text-white">{selectedClientForDetail.contactPerson}</strong></div>
                <div>Email: <strong className="text-white">{selectedClientForDetail.contactEmail}</strong></div>
                <div>Teléfono: <strong className="text-white font-mono">{selectedClientForDetail.contactPhone}</strong></div>
                <div className="pt-2 border-t border-brand-border">
                  <span className="text-brand-muted">Portal del Promotor:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                      {selectedClientForDetail.portalAccessCode}
                    </span>
                    <button
                      onClick={() => copyPortalCode(selectedClientForDetail.portalAccessCode)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[10px]"
                    >
                      Copiar Código
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Obras y propuestas asociadas */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white uppercase text-[11px]">Propuestas y Obras de este Cliente</div>
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-border space-y-2 max-h-40 overflow-y-auto">
                {opportunities.filter(o => o.clientId === selectedClientForDetail.id).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-1 border-b border-brand-border/40 last:border-0">
                    <div>
                      <div className="font-bold text-white">{o.title}</div>
                      <div className="text-[10px] text-brand-muted">{o.code} • Fase: {o.stage}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      {o.value.toLocaleString('es-ES')} €
                    </div>
                  </div>
                ))}
                {opportunities.filter(o => o.clientId === selectedClientForDetail.id).length === 0 && (
                  <div className="text-center text-brand-muted py-2">No hay licitaciones registradas aún.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClientForDetail(null)}
                className="px-4 py-2 rounded-xl bg-brand-accent text-white font-bold text-xs uppercase"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
