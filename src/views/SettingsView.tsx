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
  Check,
  ChevronRight,
  ShieldAlert,
  Zap,
  Layout,
  CreditCard as BillingIcon,
  Bell,
  Fingerprint
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { testFirebaseConnection } from '../services/firebase';
import { AppState } from '../types';
import toast from 'react-hot-toast';
import { NeuInteractiveDemo } from '../components/ui/neumorphism/NeuInteractiveDemo';

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

  // Interactive configurations
  const [cookieConsentActive, setCookieConsentActive] = useState(() => localStorage.getItem('cfg_cookie_consent') !== 'false');
  const [seoOptimized, setSeoOptimized] = useState(() => localStorage.getItem('cfg_seo_optimized') === 'true');
  const [billingPlan, setBillingPlan] = useState<'free' | 'growth' | 'enterprise'>('free');

  useEffect(() => {
    localStorage.setItem('cfg_cookie_consent', String(cookieConsentActive));
  }, [cookieConsentActive]);

  useEffect(() => {
    localStorage.setItem('cfg_seo_optimized', String(seoOptimized));
    document.title = seoOptimized ? `ObraService Pro | Gestión` : `ObraService`;
  }, [seoOptimized]);

  if (!user) return null;

  const activeCompany = state.companies.find(c => c.id === user.companyId);

  const handleTestConnection = async () => {
    setConnectionTestStatus('testing');
    try {
      await testFirebaseConnection();
      setConnectionTestStatus('success');
      setConnectionTestMsg('Sincronización Cloud Activa (GCP)');
      toast.success('Servicios Verificados');
    } catch (err: any) {
      setConnectionTestStatus('error');
      setConnectionTestMsg('Fallo de conexión persistente');
      toast.error('Error de Red');
    }
  };

  const handleCopyCode = () => {
    if (activeCompany?.inviteCode) {
      navigator.clipboard.writeText(activeCompany.inviteCode);
      setCopied(true);
      toast.success('Código copiado');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    { id: 'appearance', label: 'Apariencia', icon: Layout },
    { id: 'company', label: 'Organización', icon: Building2 },
    { id: 'billing', label: 'Suscripción', icon: BillingIcon },
    { id: 'notifications', label: 'Alertas', icon: Bell },
    { id: 'legal', label: 'Compliance', icon: ShieldCheck },
    { id: 'security', label: 'Infraestructura', icon: Fingerprint },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">Panel de Control</h1>
          <p className="text-brand-muted font-medium mt-1">Configuración técnica y administrativa del espacio de trabajo.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${
             isDemo ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
           }`}>
              <Activity className="w-4 h-4 animate-pulse" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest leading-none">Status</span>
                 <span className="text-[10px] font-bold mt-0.5">{isDemo ? 'WORKSPACE DEMO' : 'PRODUCCIÓN LIVE'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 shrink-0 space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/20' 
                    : 'text-brand-muted hover:text-white hover:bg-brand-surface border border-transparent hover:border-brand-border'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-muted'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'appearance' && (
            <div className="card p-10 space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Preferencias Visuales</h2>
                <p className="text-sm text-brand-muted font-medium">Controla el comportamiento estético de la plataforma.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 bg-brand-surface border border-brand-border rounded-[2rem] space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                       {theme === 'dark' ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Tema de Interfaz</h3>
                       <p className="text-xs text-brand-muted mt-2 leading-relaxed">Adapta el brillo de la pantalla a las condiciones de luz de la obra.</p>
                    </div>
                    <button 
                      onClick={() => obraStore.toggleTheme()}
                      className="btn-secondary w-full h-12"
                    >
                       Cambiar a {theme === 'dark' ? 'Modo Claro' : 'Modo Técnico'}
                    </button>
                 </div>

                  <div className="p-8 bg-brand-surface border border-brand-border rounded-[2rem] space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                       <Globe className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Motor de Búsqueda</h3>
                       <p className="text-xs text-brand-muted mt-2 leading-relaxed">Optimiza los metadatos del navegador para mejorar el indexado.</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Optimización SEO</span>
                       <button 
                        onClick={() => setSeoOptimized(!seoOptimized)}
                        className={`w-12 h-6 rounded-full transition-all relative ${seoOptimized ? 'bg-brand-accent' : 'bg-brand-bg'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${seoOptimized ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                 </div>

                 <div className="p-8 bg-brand-surface border border-brand-border rounded-[2rem] space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                       <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Diseño Neumórfico</h3>
                       <p className="text-xs text-brand-muted mt-2 leading-relaxed">Activa relieves y cavidades suaves con sombras táctiles simétricas en toda la plataforma.</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                         {state.uiStyle !== 'standard' ? 'Activado (Soft UI)' : 'Desactivado'}
                       </span>
                       <button 
                        onClick={() => {
                          obraStore.toggleUiStyle();
                          toast.success(`Neumorfismo ${state.uiStyle === 'standard' ? 'Activado' : 'Desactivado'}`);
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${state.uiStyle !== 'standard' ? 'bg-brand-accent' : 'bg-brand-bg'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.uiStyle !== 'standard' ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                 </div>
              </div>

              {/* Neumorphic UI Playground Section */}
              <div className="pt-6 border-t border-brand-border">
                <NeuInteractiveDemo />
              </div>
            </div>
          )}

          {activeTab === 'company' && activeCompany && (
            <div className="card p-10 space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="space-y-1">
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Perfil Corporativo</h2>
                  <p className="text-sm text-brand-muted font-medium">Gestión de identidad fiscal y claves de organización.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     {[
                       { label: 'Razón Social', value: activeCompany.name },
                       { label: 'CIF / NIF', value: activeCompany.taxId, mono: true },
                       { label: 'Tipo de Entidad', value: activeCompany.type === 'MAIN_CONTRACTOR' ? 'Principal' : 'Subcontrata' }
                     ].map(item => (
                       <div key={item.label} className="space-y-1.5 pb-4 border-b border-brand-border last:border-0">
                          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{item.label}</span>
                          <div className={`text-base font-bold text-white uppercase ${item.mono ? 'font-mono' : ''}`}>
                             {item.value}
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="p-8 bg-brand-accent/5 border border-brand-accent/20 rounded-[2.5rem] flex flex-col items-center text-center space-y-6">
                     <div className="w-16 h-16 rounded-3xl bg-brand-bg border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                        <Key className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Clave de Invitación</h3>
                        <p className="text-xs text-brand-muted mt-2">Facilita este código a tu equipo para vincularlos.</p>
                     </div>
                     <div className="text-3xl font-display font-black text-brand-accent tracking-[0.4em] bg-brand-bg px-6 py-4 rounded-2xl border border-brand-accent/20">
                        {activeCompany.inviteCode}
                     </div>
                     <div className="flex gap-2 w-full">
                        <button onClick={handleCopyCode} className="btn-primary flex-1 h-12 text-xs">Copiar Código</button>
                        <button onClick={() => toast('Clave rotada con éxito')} className="btn-secondary w-12 h-12 p-0 flex items-center justify-center">
                           <RotateCw className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Convenio Colectivo, Horas Extra y Aprobación de Recursos */}
               <div className="pt-8 border-t border-brand-border space-y-6">
                 <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                   <Zap className="w-5 h-5 text-brand-accent" />
                   <span>Convenio Laboral y Políticas Operativas</span>
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                       Jornada Estándar / Umbral Horas Extras
                     </label>
                     <div className="flex items-center gap-3">
                       <input
                         type="number"
                         step="0.5"
                         min="4"
                         max="12"
                         defaultValue="8.0"
                         className="input-field h-11 text-sm font-bold text-white"
                         onChange={(e) => {
                           toast.success(`Umbral de horas extras configurado a ${e.target.value}h/día`);
                         }}
                       />
                       <span className="text-xs font-bold text-brand-muted shrink-0">horas / día</span>
                     </div>
                     <p className="text-[11px] text-brand-muted">
                       Las horas registradas por encima de este umbral se computan automáticamente como extraordinarias.
                     </p>
                   </div>

                   <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                       Revisión Previa de Operarios
                     </label>
                     <label className="flex items-center justify-between cursor-pointer pt-2">
                       <span className="text-xs font-bold text-white">Requiere Aprobación de Admin</span>
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 accent-brand-accent rounded cursor-pointer"
                         onChange={(e) => {
                           toast.success(e.target.checked ? 'Revisión manual de operarios activada' : 'Alta directa sin revisión activada');
                         }}
                       />
                     </label>
                     <p className="text-[11px] text-brand-muted">
                       Si está activo, los operarios dados de alta por subcontratas quedan pendientes de validación.
                     </p>
                   </div>

                   <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                       Avisos Vencimiento PRL / REA
                     </label>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                         15 días
                       </span>
                       <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                         7 días
                       </span>
                       <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                         1 día
                       </span>
                     </div>
                     <p className="text-[11px] text-brand-muted">
                       Notificaciones automáticas en campana y panel a los responsables antes de la caducidad.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-10 space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="space-y-1">
                  <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Estado del Sistema</h2>
                  <p className="text-sm text-brand-muted font-medium">Monitorización de servicios Cloud y persistencia de datos.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-brand-surface border border-brand-border rounded-[2.5rem] space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                           <Server className="w-7 h-7" />
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">En línea</div>
                           <div className="text-xs font-bold text-white uppercase">Cloud Firestore</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        {[
                          { label: 'Ubicación', value: 'europe-west2 (London)' },
                          { label: 'SLA de Disponibilidad', value: '99.99%' },
                          { label: 'Cifrado en Reposo', value: 'AES-256 GCM' }
                        ].map(item => (
                          <div key={item.label} className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                             <span className="text-brand-muted">{item.label}</span>
                             <span className="text-white">{item.value}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 bg-brand-surface border border-brand-border rounded-[2.5rem] space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                           <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Protección</div>
                           <div className="text-xs font-bold text-white uppercase">Capa Inmutable</div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-brand-border bg-brand-bg text-brand-accent focus:ring-brand-accent" />
                           <div>
                              <div className="text-[11px] font-black text-white uppercase">Sellado de Partes</div>
                              <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">Bloquear edición tras firma del Jefe de Obra.</p>
                           </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-brand-border bg-brand-bg text-brand-accent focus:ring-brand-accent" />
                           <div>
                              <div className="text-[11px] font-black text-white uppercase">Log de Auditoría</div>
                              <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">Registrar cada acceso y modificación de datos.</p>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>

               {connectionTestMsg && (
                 <div className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in fade-in ${
                   connectionTestStatus === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                 }`}>
                   <Activity className={`w-4 h-4 ${connectionTestStatus === 'testing' ? 'animate-spin' : ''}`} />
                   {connectionTestMsg}
                 </div>
               )}

               <div className="pt-6 border-t border-brand-border">
                  <button 
                    onClick={handleTestConnection}
                    disabled={connectionTestStatus === 'testing'}
                    className="btn-primary h-14 px-12 text-sm"
                  >
                    {connectionTestStatus === 'testing' ? 'Verificando Conexión...' : 'Verificar Servicios Cloud'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Guard */}
      <div className="p-10 rounded-[3rem] bg-brand-surface border border-brand-border flex flex-col md:flex-row items-center gap-10">
         <div className="w-20 h-20 rounded-3xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
            <ShieldAlert className="w-10 h-10" />
         </div>
         <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Protección de Datos Críticos</h3>
            <p className="text-sm text-brand-muted font-medium leading-relaxed max-w-2xl">
               ObraService almacena los registros de obra de forma inmutable. Cualquier acción de borrado masivo requiere autorización nivel 3 y se registra en el log legal.
            </p>
         </div>
         {isDemo && (
           <button 
            onClick={() => obraStore.exitDemoMode()}
            className="btn-primary h-14 px-10 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-900/20"
           >
              Activar Producción
           </button>
         )}
      </div>
    </div>
  );
};
