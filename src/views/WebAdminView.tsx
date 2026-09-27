import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Settings, 
  Radio, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Activity, 
  Plus, 
  Trash2, 
  Sparkles, 
  Globe, 
  Lock, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  UserSquare2
} from 'lucide-react';
import { AppState, Company, SubscriptionPlanId } from '../types';
import { obraStore } from '../services/store';
import toast from 'react-hot-toast';

interface WebAdminViewProps {
  state: AppState;
}

export const WebAdminView: React.FC<WebAdminViewProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'tenants' | 'settings' | 'audit'>('metrics');
  
  // Platform settings local state
  const platformSettings = state.platformSettings || {
    announcementBanner: {
      enabled: false,
      message: '',
      type: 'info'
    },
    features: {
      enablePublicRegistration: true,
      enablePaymentGatewaySandbox: true,
      enableOcrScanning: true,
      enableGpsGeofencing: true,
      maintenanceMode: false
    },
    supportContactEmail: 'soporte@obraservice.pro',
    lastUpdated: new Date().toISOString()
  };

  const [bannerEnabled, setBannerEnabled] = useState(platformSettings.announcementBanner.enabled);
  const [bannerMessage, setBannerMessage] = useState(platformSettings.announcementBanner.message);
  const [bannerType, setBannerType] = useState<'info' | 'warning' | 'success'>(platformSettings.announcementBanner.type);

  const [featurePublicReg, setFeaturePublicReg] = useState(platformSettings.features.enablePublicRegistration);
  const [featurePaymentSandbox, setFeaturePaymentSandbox] = useState(platformSettings.features.enablePaymentGatewaySandbox);
  const [featureOcr, setFeatureOcr] = useState(platformSettings.features.enableOcrScanning);
  const [featureGps, setFeatureGps] = useState(platformSettings.features.enableGpsGeofencing);
  const [featureMaintenance, setFeatureMaintenance] = useState(platformSettings.features.maintenanceMode);

  // New Tenant Modal
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantTaxId, setTenantTaxId] = useState('');
  const [tenantType, setTenantType] = useState<'MAIN_CONTRACTOR' | 'SUBCONTRACTOR'>('MAIN_CONTRACTOR');
  const [tenantPlan, setTenantPlan] = useState<SubscriptionPlanId>('promax');

  const companies = state.companies || [];
  const users = state.users || [];
  const projects = state.projects || [];
  const auditEvents = state.auditEvents || [];

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    obraStore.updatePlatformSettings({
      announcementBanner: {
        enabled: bannerEnabled,
        message: bannerMessage.trim(),
        type: bannerType
      },
      features: {
        enablePublicRegistration: featurePublicReg,
        enablePaymentGatewaySandbox: featurePaymentSandbox,
        enableOcrScanning: featureOcr,
        enableGpsGeofencing: featureGps,
        maintenanceMode: featureMaintenance
      }
    });

    toast.success('Configuración global de la plataforma web actualizada con éxito.');
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantTaxId.trim()) {
      toast.error('Nombre y CIF son obligatorios');
      return;
    }

    const res = obraStore.createCompany({
      name: tenantName.trim(),
      taxId: tenantTaxId.trim().toUpperCase(),
      type: tenantType,
      address: 'España'
    });

    if (res.success) {
      toast.success(`Empresa ${tenantName} creada con plan ${tenantPlan.toUpperCase()}`);
      setIsNewTenantModalOpen(false);
      setTenantName('');
      setTenantTaxId('');
    } else {
      toast.error(res.error || 'Error al crear la empresa');
    }
  };

  const handleChangeTenantPlan = (companyId: string, planId: SubscriptionPlanId) => {
    obraStore.setCompanyPlan(companyId, planId);
    toast.success(`Plan de la empresa actualizado a ${planId.toUpperCase()}`);
  };

  const handleToggleCompany = (companyId: string) => {
    const success = obraStore.toggleCompanyActive(companyId, 'Acción ejecutada por el Super Administrador Web');
    if (success) {
      toast.success('Estado de la empresa actualizado');
    } else {
      toast.error('No se pudo modificar el estado de la empresa');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              Administración de la Web & Super Admin
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Master Backoffice
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted">
            Control de empresas registradas, pasarela de cobros SaaS, configuración de la web pública y auditoría forense.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl overflow-x-auto max-w-full no-scrollbar whitespace-nowrap scroll-smooth w-full sm:w-auto">
          {[
            { key: 'metrics', label: 'Métricas SaaS' },
            { key: 'tenants', label: 'Empresas & Tenants' },
            { key: 'settings', label: 'Control Web & Flags' },
            { key: 'audit', label: 'Logs Auditoría' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-brand-accent text-white shadow-md'
                  : 'text-brand-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SAAS METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 space-y-2 border-brand-accent/30 bg-gradient-to-br from-brand-surface to-brand-accent/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-muted uppercase">Ingresos Recurrentes (MRR)</span>
                <DollarSign className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="text-3xl font-display font-black text-white">
                52.450 €
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% este mes
              </div>
            </div>

            <div className="card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-muted uppercase">ARR Proyectado</span>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-display font-black text-white">
                629.400 €
              </div>
              <div className="text-[11px] text-brand-muted">
                Margen bruto SaaS: 84%
              </div>
            </div>

            <div className="card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-muted uppercase">Constructoras Activas</span>
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-display font-black text-white">
                {companies.length}
              </div>
              <div className="text-[11px] text-brand-muted">
                {users.length} usuarios totales
              </div>
            </div>

            <div className="card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-muted uppercase">Obras Digitalizadas</span>
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-display font-black text-white">
                {projects.length}
              </div>
              <div className="text-[11px] text-brand-muted">
                100% cumplimiento Ley 32/2006
              </div>
            </div>
          </div>

          {/* SaaS Infrastructure Status */}
          <div className="card p-6 border-brand-border space-y-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-accent" /> Estado de la Infraestructura en Producción
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-brand-bg rounded-xl border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Servidor & API Core</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-emerald-400 font-bold">Operativo (99.98% SLA)</div>
                <div className="text-[10px] text-brand-muted">Latencia media: 42ms</div>
              </div>

              <div className="p-4 bg-brand-bg rounded-xl border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Pasarela de Pago PSD2</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-emerald-400 font-bold">3D Secure Conectado</div>
                <div className="text-[10px] text-brand-muted">Transacciones en tiempo real</div>
              </div>

              <div className="p-4 bg-brand-bg rounded-xl border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">API REST & Webhooks</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-emerald-400 font-bold">Eventos en Tiempo Real</div>
                <div className="text-[10px] text-brand-muted">Notificaciones HTTP activas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANTS & COMPANIES */}
      {activeTab === 'tenants' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
              Directorio de Empresas & Tenants SaaS
            </h3>
            <button
              onClick={() => setIsNewTenantModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-accent/20"
            >
              <Plus className="w-4 h-4" /> Alta de Empresa
            </button>
          </div>

          <div className="card overflow-hidden border-brand-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/50 text-brand-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Empresa</th>
                    <th className="p-3.5">CIF</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Plan Contratado</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-slate-300">
                  {companies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{comp.name}</div>
                        <div className="text-[10px] text-brand-muted font-mono">{comp.id}</div>
                      </td>
                      <td className="p-3.5 font-mono text-brand-muted">{comp.taxId}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-300">
                          {comp.type === 'MAIN_CONTRACTOR' ? 'Contratista Principal' : 'Subcontrata'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={comp.subscriptionStatus === 'Active' ? 'promax' : 'starter'}
                          onChange={(e) => handleChangeTenantPlan(comp.id, e.target.value as any)}
                          className="bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-accent font-bold"
                        >
                          <option value="starter">Starter (49€/m)</option>
                          <option value="promax">Pro Max (149€/m)</option>
                          <option value="enterprise">Enterprise (399€/m)</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          comp.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {comp.active ? 'Activa' : 'Suspendida'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleCompany(comp.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                            comp.active 
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20'
                          }`}
                        >
                          {comp.active ? 'Suspender' : 'Activar'}
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

      {/* TAB 3: PLATFORM & WEB SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSavePlatformSettings} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Announcement Banner */}
          <div className="card p-6 border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-accent" /> Banner Global de Avisos en la Web
                </h3>
                <p className="text-xs text-brand-muted">
                  Mensaje destacado en la cabecera superior para todos los usuarios y visitantes de la web.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="rounded text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-xs font-bold text-white">Banner Activo</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Texto del Mensaje</label>
                <input
                  type="text"
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  placeholder="Ej. ⚡ Mantenimiento programado el domingo de 02:00 a 04:00"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Tipo de Notificación</label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as any)}
                  className="w-full sm:w-48 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                >
                  <option value="info">Informativo (Azul/Naranja)</option>
                  <option value="warning">Alerta / Mantenimiento (Ámbar)</option>
                  <option value="success">Novedad / Éxito (Esmeralda)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="card p-6 border-brand-border space-y-4">
            <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2 pb-3 border-b border-brand-border">
              <Settings className="w-5 h-5 text-brand-accent" /> Control de Características de la Web (Feature Flags)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { 
                  id: 'publicReg', 
                  label: 'Registro Público Abierto', 
                  desc: 'Permite a nuevas empresas registrarse directamente desde la landing page.',
                  checked: featurePublicReg,
                  onChange: setFeaturePublicReg
                },
                { 
                  id: 'paymentSandbox', 
                  label: 'Pasarela de Pago Activa (Modo Seguro)', 
                  desc: 'Procesamiento de tarjetas de crédito y domiciliaciones SEPA B2B.',
                  checked: featurePaymentSandbox,
                  onChange: setFeaturePaymentSandbox
                },
                { 
                  id: 'ocr', 
                  label: 'Módulo de Escáner OCR de Albaranes', 
                  desc: 'Digitalización automática con visión artificial de notas de entrega físicas.',
                  checked: featureOcr,
                  onChange: setFeatureOcr
                },
                { 
                  id: 'gps', 
                  label: 'Geocercas GPS de Obra Obligatorias', 
                  desc: 'Valida que los partes de trabajo se firmen dentro del radio de la obra.',
                  checked: featureGps,
                  onChange: setFeatureGps
                },
                { 
                  id: 'maintenance', 
                  label: 'Modo Mantenimiento Web', 
                  desc: 'Bloquea el acceso temporal mostrando pantalla de mantenimiento a usuarios.',
                  checked: featureMaintenance,
                  onChange: setFeatureMaintenance
                }
              ].map((flag) => (
                <div key={flag.id} className="p-4 bg-brand-bg rounded-xl border border-brand-border flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{flag.label}</div>
                    <div className="text-[11px] text-brand-muted mt-0.5">{flag.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={flag.checked}
                    onChange={(e) => flag.onChange(e.target.checked)}
                    className="mt-1 rounded text-brand-accent focus:ring-brand-accent"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-brand-border flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-accent/20 transition-all"
              >
                Guardar Cambios de Configuración
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card p-6 border-brand-border space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-brand-accent" /> Registro Forense de Eventos de la Plataforma
            </h3>
            <span className="text-xs text-brand-muted font-mono">{auditEvents.length} eventos registrados</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto font-mono text-xs">
            {auditEvents.map((e) => (
              <div key={e.id} className="p-3 bg-brand-bg rounded-lg border border-brand-border flex items-start justify-between gap-4">
                <div>
                  <div className="text-white font-bold">{e.operation}</div>
                  <div className="text-brand-muted text-[11px]">{e.details}</div>
                  <div className="text-[10px] text-brand-accent mt-0.5">Actor: {e.actorName} ({e.actorRole})</div>
                </div>
                <div className="text-[10px] text-brand-muted shrink-0 text-right">
                  {new Date(e.timestamp).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NUEVA EMPRESA */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md bg-brand-surface border-brand-border relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                Alta de Nueva Empresa
              </h3>
              <button onClick={() => setIsNewTenantModalOpen(false)} className="text-brand-muted hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Razón Social</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Ej. Dragados Estructuras S.A."
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">CIF / NIF</label>
                <input
                  type="text"
                  value={tenantTaxId}
                  onChange={(e) => setTenantTaxId(e.target.value.toUpperCase())}
                  placeholder="A-28000000"
                  required
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Tipo</label>
                  <select
                    value={tenantType}
                    onChange={(e) => setTenantType(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="MAIN_CONTRACTOR">Contratista Principal</option>
                    <option value="SUBCONTRACTOR">Subcontrata</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">Plan Inicial</label>
                  <select
                    value={tenantPlan}
                    onChange={(e) => setTenantPlan(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="starter">Starter</option>
                    <option value="promax">Pro Max</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider"
                >
                  Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
