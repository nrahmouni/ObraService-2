import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Copy, 
  RotateCw, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  Key, 
  Sparkles,
  Info,
  Server,
  Database,
  Activity,
  Moon,
  Sun,
  Mail,
  Share2,
  CreditCard,
  BellRing,
  Globe,
  Lock,
  Eye,
  Check
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { testFirebaseConnection } from '../services/firebase';
import { AppState } from '../types';
import toast from 'react-hot-toast';

interface SettingsViewProps {
  state: AppState;
}

type TabType = 'appearance' | 'company' | 'billing' | 'notifications' | 'legal' | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({ state }) => {
  const user = state.currentUser;
  const isDemo = state.isDemoMode;
  const theme = state.theme;

  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [copied, setCopied] = useState(false);
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionTestMsg, setConnectionTestMsg] = useState<string>('');

  // Interactive configurations saved to LocalStorage
  const [cookieConsentActive, setCookieConsentActive] = useState(() => {
    return localStorage.getItem('cfg_cookie_consent') !== 'false';
  });
  const [seoOptimized, setSeoOptimized] = useState(() => {
    return localStorage.getItem('cfg_seo_optimized') === 'true';
  });
  const [honeypotActive, setHoneypotActive] = useState(() => {
    return localStorage.getItem('cfg_honeypot') === 'true';
  });

  // Billing configuration states
  const [billingPlan, setBillingPlan] = useState<'free' | 'growth' | 'enterprise'>('free');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(() => {
    return localStorage.getItem(`cfg_notify_email_${user?.id}`) !== 'false';
  });
  const [notifyWeb, setNotifyWeb] = useState(() => {
    return localStorage.getItem(`cfg_notify_web_${user?.id}`) !== 'false';
  });

  // Effects connected to toggles
  useEffect(() => {
    localStorage.setItem('cfg_cookie_consent', String(cookieConsentActive));
    // Emit dynamic custom event to let other views render a cookie banner
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: cookieConsentActive }));
  }, [cookieConsentActive]);

  useEffect(() => {
    localStorage.setItem('cfg_seo_optimized', String(seoOptimized));
    if (seoOptimized) {
      document.title = `ObraService Pro | Panel de Gestión Operativa`;
    } else {
      document.title = `ObraService`;
    }
  }, [seoOptimized]);

  useEffect(() => {
    localStorage.setItem('cfg_honeypot', String(honeypotActive));
  }, [honeypotActive]);

  if (!user) return null;

  const activeCompany = state.companies.find(c => c.id === user.companyId);
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN';

  // Checklist dynamic calculations
  const hasProject = state.projects.length > 0;
  const hasWorkers = state.workers.length > 0;
  const hasSubcontractors = state.companies.some(c => c.type === 'SUBCONTRACTOR');
  const hasTeam = state.users.length > 1;
  const hasSubmittedReport = state.reports.some(r => r.status === 'Submitted' || r.status === 'Corrected');

  const checklist = [
    { label: 'Crear el primer proyecto de obra con geocerca', completed: hasProject },
    { label: 'Añadir trabajadores propios al catálogo', completed: hasWorkers },
    { label: 'Registrar las empresas subcontratistas habituales', completed: hasSubcontractors },
    { label: 'Invitar a miembros del equipo (Jefes de Obra)', completed: hasTeam },
    { label: 'Emitir y validar el primer parte diario de obra', completed: hasSubmittedReport },
  ];

  const completedCount = checklist.filter(c => c.completed).length;

  const handleTestConnection = async () => {
    setConnectionTestStatus('testing');
    setConnectionTestMsg('');
    try {
      await testFirebaseConnection();
      setConnectionTestStatus('success');
      setConnectionTestMsg('¡Conexión verificada con éxito con Cloud Firestore (europe-west2)!');
      toast.success('Conexión con la base de datos verificada con éxito.');
    } catch (err: any) {
      setConnectionTestStatus('error');
      setConnectionTestMsg(err.message || 'Error al conectar con Firestore.');
      toast.error('Fallo en la prueba de conexión.');
    }
  };

  const handleCopyCode = () => {
    if (activeCompany?.inviteCode) {
      navigator.clipboard.writeText(activeCompany.inviteCode);
      setCopied(true);
      toast.success('Código de invitación copiado al portapapeles.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareInvite = () => {
    if (activeCompany?.inviteCode && navigator.share) {
      navigator.share({
        title: `Únete a ${activeCompany.name} en ObraService`,
        text: `Hola, únete a nuestro espacio de trabajo en ObraService usando el código: ${activeCompany.inviteCode}`,
        url: window.location.origin
      }).catch(console.error);
    } else {
      handleCopyCode();
    }
  };

  const handleRegenerateCode = () => {
    if (!activeCompany) return;
    if (window.confirm('¿Deseas regenerar el código de invitación? El código anterior dejará de ser válido.')) {
      obraStore.regenerateInviteCode(activeCompany.id);
      toast.success('Código de invitación regenerado correctamente.');
    }
  };

  const saveBillingSettings = () => {
    localStorage.setItem(`cfg_billing_plan_${user.id}`, billingPlan);
    localStorage.setItem(`cfg_billing_email_${user.id}`, billingEmail);
    toast.success('Información de facturación actualizada.');
  };

  const saveNotificationChannels = () => {
    localStorage.setItem(`cfg_notify_email_${user.id}`, String(notifyEmail));
    localStorage.setItem(`cfg_notify_web_${user.id}`, String(notifyWeb));
    toast.success('Canales de alerta guardados.');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-display">
          Consola Administrativa de ObraService
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-display">
          Ajustes de Plataforma
        </h1>
        <p className="text-xs text-slate-700 mt-1 font-medium">
          Control completo del entorno de producción, apariencia visual, cumplimiento corporativo y seguridad de datos.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none pb-px">
        {[
          { id: 'appearance', label: 'Apariencia', icon: Sun },
          { id: 'company', label: 'Empresa', icon: Building2 },
          { id: 'billing', label: 'Facturación', icon: CreditCard },
          { id: 'notifications', label: 'Notificaciones', icon: BellRing },
          { id: 'legal', label: 'Cumplimiento', icon: Globe },
          { id: 'security', label: 'Seguridad', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-amber-600 text-amber-600 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 font-bold'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="mt-4 transition-all">
        {activeTab === 'appearance' && (
          <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Apariencia del Sistema</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Configura el entorno visual para obra y campo</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#0F172A] uppercase">Modo de Pantalla</h3>
                  <p className="text-[10px] text-slate-500">Alterna entre interfaz de alto contraste y modo nocturno industrial.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  obraStore.toggleTheme();
                  toast.success(`Apariencia cambiada a modo ${theme === 'light' ? 'técnico' : 'claro'}`);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all shadow-xs cursor-pointer"
              >
                {theme === 'dark' ? 'Establecer Modo Claro' : 'Establecer Modo Técnico (Oscuro)'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-6">
            {/* Setup Progress */}
            <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] font-display">
                    Progreso Corporativo
                  </span>
                  <h2 className="text-base font-extrabold text-[#0F172A] font-display">
                    Lista de Preparación Comercial ({completedCount} de {checklist.length})
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#D97706] font-mono">
                    {Math.round((completedCount / checklist.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-[#CBD5E1]">
                <div 
                  className="bg-[#D97706] h-full transition-all duration-500" 
                  style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                />
              </div>

              <div className="flex flex-col space-y-2.5 pt-2">
                {checklist.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 font-bold ${
                      item.completed 
                        ? 'bg-[#D1FAE5]/60 border-[#059669]/40 text-[#065F46]' 
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-slate-700'
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Details */}
            <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">
                    Razón Social e Identificación Fiscal
                  </h2>
                </div>
                {activeCompany && (
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    activeCompany.type === 'MAIN_CONTRACTOR' ? 'bg-[#0F172A] text-white' : 'bg-amber-100 text-[#92400E]'
                  }`}>
                    {activeCompany.type === 'MAIN_CONTRACTOR' ? 'Contratista Principal' : 'Subcontrata'}
                  </span>
                )}
              </div>

              {activeCompany ? (
                <div className="flex flex-col space-y-3 text-xs">
                  <div>
                    <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">Razón Social</span>
                    <strong className="text-[#0F172A] text-sm">{activeCompany.name}</strong>
                  </div>

                  <div>
                    <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">NIF / CIF</span>
                    <strong className="text-[#0F172A] text-sm font-mono">{activeCompany.taxId}</strong>
                  </div>

                  <div className="w-full">
                    <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">Domicilio Social</span>
                    <span className="text-[#0F172A] font-medium">{activeCompany.address}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin datos de empresa asignados en el perfil.</p>
              )}
            </div>

            {/* Invite system */}
            {activeCompany && (
              <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Key className="w-5 h-5 text-[#D97706]" />
                  <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">
                    Código de Registro Corporativo
                  </h2>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Usa este código único de invitación para vincular nuevos jefes de obra o encargados directamente al espacio de la constructora.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-5 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] font-mono font-black text-lg tracking-widest text-[#0F172A]">
                    {activeCompany.inviteCode}
                  </div>

                  <button
                    onClick={handleShareInvite}
                    className="min-h-[44px] px-5 py-2 rounded-2xl bg-[#0F172A] text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copied ? '¡Copiado!' : 'Compartir Código'}</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleRegenerateCode}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-[#CBD5E1] bg-white text-slate-700 text-xs font-bold uppercase hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Regenerar Acceso</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Información y Planes de Facturación</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Configuración legal de pagos corporativos</p>
            </div>

            <div className="flex flex-col space-y-3">
              {[
                { id: 'free', label: 'Plan Gratuito', price: '0€ / mes', limit: 'Hasta 1 proyecto' },
                { id: 'growth', label: 'Plan Growth (Pymes)', price: '89€ / mes', limit: 'Proyectos ilimitados, 20 operarios' },
                { id: 'enterprise', label: 'Plan Enterprise', price: 'Consultar', limit: 'Todo ilimitado, soporte SLA 24/7' },
              ].map(plan => {
                const isSelected = billingPlan === plan.id;
                return (
                  <div 
                    key={plan.id}
                    onClick={() => setBillingPlan(plan.id as any)}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all select-none ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/25' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase">{plan.label}</span>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                    </div>
                    <div className="text-lg font-black text-slate-950 mt-2 font-mono">{plan.price}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{plan.limit}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-3">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-700 block mb-1">Email de Destino para Facturas</label>
                <input 
                  type="email" 
                  value={billingEmail} 
                  onChange={(e) => setBillingEmail(e.target.value)} 
                  placeholder="ejemplo@constructora.com"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-amber-500 bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveBillingSettings}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  Guardar Facturación
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Canales de Notificación y Alertas</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Activa o desactiva alertas a nivel de plataforma</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <label className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyWeb} 
                  onChange={(e) => setNotifyWeb(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4.5 w-4.5"
                />
                <div>
                  <strong className="text-xs text-slate-900 block font-black">Notificaciones Web Push (En App)</strong>
                  <span className="text-[10px] text-slate-500">Recibe alertas en tiempo real en la campana de la cabecera.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyEmail} 
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4.5 w-4.5"
                />
                <div>
                  <strong className="text-xs text-slate-900 block font-black">Alertas por Correo Electrónico (Gmail API)</strong>
                  <span className="text-[10px] text-slate-500">Reenvío automático de alertas críticas (Disputas y Compliance) a tu email corporativo.</span>
                </div>
              </label>

              <div className="flex justify-end pt-2">
                <button
                  onClick={saveNotificationChannels}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  Guardar Canales
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Cumplimiento Legal y SEO</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Administración de cookies, política RGPD y posicionamiento web</p>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="p-4 border border-slate-100 rounded-2xl space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-900">Cumplimiento Legal</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={cookieConsentActive}
                      onChange={(e) => {
                        setCookieConsentActive(e.target.checked);
                        toast.success(`Banner de cookies ${e.target.checked ? 'activado' : 'desactivado'}`);
                      }}
                      className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Banner de Cookies Informativo</span>
                      <span className="text-[10px] text-slate-500">Muestra la barra de consentimiento RGPD regulada por el marco europeo.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-2xl space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-900">Optimización SEO y Posicionamiento</h3>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={seoOptimized}
                      onChange={(e) => {
                        setSeoOptimized(e.target.checked);
                        toast.success(`Optimización SEO ${e.target.checked ? 'activada' : 'desactivada'}`);
                      }}
                      className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Títulos y Metaetiquetas Dinámicas</span>
                      <span className="text-[10px] text-slate-500">Optimiza los títulos de página para mejorar la indexación en motores de búsqueda.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                El sistema de compliance verifica automáticamente que los datos de tus subcontratistas estén actualizados con REA y seguros de responsabilidad civil en regla cada vez que se carga el panel operativo.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Seguridad e Infraestructura de Base de Datos</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Estado del backend, reglas de protección y test de latencia en vivo</p>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="p-4 border border-slate-100 rounded-2xl space-y-3 bg-slate-50/50">
                <h3 className="text-xs font-black uppercase text-slate-900">Protección del Sistema</h3>
                
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={honeypotActive}
                    onChange={(e) => {
                      setHoneypotActive(e.target.checked);
                      toast.success(`Honeypot de formularios ${e.target.checked ? 'activo' : 'desactivado'}`);
                    }}
                    className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Filtro Spam (Campos Honeypots)</span>
                    <span className="text-[10px] text-slate-500">Añade campos invisibles para interceptar ataques automatizados en registros.</span>
                  </div>
                </label>
              </div>

              <div className="p-4 border border-slate-100 rounded-2xl space-y-3.5 bg-slate-50/50">
                <h3 className="text-xs font-black uppercase text-slate-900">Estado del Cluster Firestore</h3>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">GCP Project ID:</span>
                    <strong className="text-slate-900 font-mono">gen-lang-client-0682563463</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Ubicación Multirregión:</span>
                    <strong className="text-slate-900 font-mono">europe-west2</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Seguridad de Acceso:</span>
                    <strong className="text-emerald-700">Normas estricta ABAC</strong>
                  </div>
                </div>
              </div>
            </div>

            {connectionTestMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                connectionTestStatus === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}>
                <Activity className="w-4 h-4 shrink-0" />
                <span>{connectionTestMsg}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#CBD5E1]">
              <span className="text-xs text-slate-600 font-medium">
                Comprobación en vivo de latencia y lectura/escritura en Firebase Firestore:
              </span>
              <button
                type="button"
                disabled={connectionTestStatus === 'testing'}
                onClick={handleTestConnection}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Server className="w-3.5 h-3.5 text-amber-500" />
                <span>{connectionTestStatus === 'testing' ? 'Comprobando...' : 'Probar Firestore'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Demo notice block */}
      <div className="p-5 rounded-3xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-[#0F172A] uppercase text-[11px]">
              {isDemo ? 'Estás operando en MODO DEMO' : 'Estás en Entorno de PRODUCCIÓN'}
            </div>
            <p className="text-[11px] text-slate-700 mt-1 leading-relaxed font-medium">
              {isDemo
                ? 'El Modo Demo aísla las operaciones en una sesión precargada con datos realistas. Puedes salir a producción para empezar con tus propios datos.'
                : 'En Producción, todos los datos se persisten de forma segura y auditada.'}
            </p>
          </div>
        </div>
        
        {isDemo && (
          <button
            onClick={() => {
              obraStore.exitDemoMode();
              toast.success('Cambio de entorno a PRODUCCIÓN completado.');
            }}
            className="shrink-0 px-4 py-2.5 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e65c00] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Salir a Producción
          </button>
        )}
      </div>
    </div>
  );
};
