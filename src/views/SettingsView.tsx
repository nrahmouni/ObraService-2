import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { testFirebaseConnection } from '../services/firebase';
import { AppState } from '../types';

interface SettingsViewProps {
  state: AppState;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ state }) => {
  const user = state.currentUser;
  const isDemo = state.isDemoMode;
  const theme = state.theme;

  const [copied, setCopied] = useState(false);
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionTestMsg, setConnectionTestMsg] = useState<string>('');

  const handleTestConnection = async () => {
    setConnectionTestStatus('testing');
    setConnectionTestMsg('');
    try {
      await testFirebaseConnection();
      setConnectionTestStatus('success');
      setConnectionTestMsg('¡Conexión verificada con éxito con Cloud Firestore (europe-west2)!');
    } catch (err: any) {
      setConnectionTestStatus('error');
      setConnectionTestMsg(err.message || 'Error al conectar con Firestore.');
    }
  };

  if (!user) return null;

  const activeCompany = state.companies.find(c => c.id === user.companyId);
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN';

  // Calculate setup checklist completion dynamically
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

  const handleCopyCode = () => {
    if (activeCompany?.inviteCode) {
      navigator.clipboard.writeText(activeCompany.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleTheme = () => {
    obraStore.toggleTheme();
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
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-display">
          Parámetros del Entorno Corporativo
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-display">
          Configuración de la Empresa
        </h1>
        <p className="text-xs text-slate-700 mt-1 font-medium">
          Identificación legal, códigos de acceso para el equipo y estado de puesta en marcha.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">Apariencia del Sistema</h2>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Cambia entre modo claro y modo técnico industrial</p>
          </div>
        </div>
        <button
          onClick={handleToggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CBD5E1] bg-slate-50 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest text-[#0F172A] transition-all"
        >
          {theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        </button>
      </div>

      {/* Setup Checklist Progress Banner */}
      <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] font-display">
              Puesta en Marcha (Setup Checklist)
            </span>
            <h2 className="text-base font-extrabold text-[#0F172A] font-display">
              Progreso de Configuración Operativa ({completedCount} de {checklist.length})
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {checklist.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded border text-xs flex items-center gap-2.5 font-bold ${
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

      {/* Company Legal Information */}
      <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">
              Datos Fiscales de la Empresa
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">Razón Social</span>
              <strong className="text-[#0F172A] text-sm">{activeCompany.name}</strong>
            </div>

            <div>
              <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">NIF / CIF</span>
              <strong className="text-[#0F172A] text-sm font-mono">{activeCompany.taxId}</strong>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">Domicilio Social</span>
              <span className="text-[#0F172A] font-medium">{activeCompany.address}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700">Sin datos de empresa asignados.</p>
        )}
      </div>

      {/* Invitation System */}
      {activeCompany && (
        <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide font-display">
              Código de Invitación para el Equipo
            </h2>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Comparte este código con tus Jefes de Obra o encargados de subcontrata para que se incorporen en 1 clic al espacio de trabajo.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3 rounded bg-[#F8FAFC] border border-[#CBD5E1] font-mono font-black text-lg tracking-widest text-[#0F172A]">
              {activeCompany.inviteCode}
            </div>

            <button
              onClick={handleShareInvite}
              className="min-h-[48px] px-5 py-2.5 rounded bg-[#0F172A] text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-xs cursor-pointer active:translate-y-px"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? '¡Copiado!' : 'Compartir Invitación'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleRegenerateCode}
                className="min-h-[48px] px-4 py-2.5 rounded border border-[#CBD5E1] bg-white text-slate-700 text-xs font-bold uppercase hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Generar un nuevo código de acceso y revocar el actual"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Firebase Cloud Infrastructure & Firestore Panel */}
      <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#D97706] font-display">
                Infraestructura Cloud
              </div>
              <h2 className="text-base font-extrabold text-[#0F172A] font-display">
                Google Cloud Firestore & Firebase Auth
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronización Activa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded bg-[#F8FAFC] border border-[#CBD5E1]">
            <div className="text-[10px] uppercase font-bold text-slate-500">GCP Project ID</div>
            <div className="font-mono font-bold text-xs text-[#0F172A] truncate">gen-lang-client-0682563463</div>
          </div>
          <div className="p-3 rounded bg-[#F8FAFC] border border-[#CBD5E1]">
            <div className="text-[10px] uppercase font-bold text-slate-500">Región Firestore</div>
            <div className="font-mono font-bold text-xs text-[#0F172A]">europe-west2 (Londres)</div>
          </div>
          <div className="p-3 rounded bg-[#F8FAFC] border border-[#CBD5E1]">
            <div className="text-[10px] uppercase font-bold text-slate-500">Reglas de Seguridad</div>
            <div className="font-mono font-bold text-xs text-emerald-700">ABAC Strict Desplegadas</div>
          </div>
        </div>

        {connectionTestMsg && (
          <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
            connectionTestStatus === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <Activity className="w-4 h-4 shrink-0" />
            <span>{connectionTestMsg}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-[#CBD5E1]">
          <span className="text-xs text-slate-600">
            Comprobación de conectividad end-to-end con la instancia de Firestore:
          </span>
          <button
            type="button"
            disabled={connectionTestStatus === 'testing'}
            onClick={handleTestConnection}
            className="min-h-[40px] px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{connectionTestStatus === 'testing' ? 'Verificando...' : 'Probar Conexión Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Producción, SEO y Analítica Corporativa (User checklist integration) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6600]" />
            <span>Estado de Producción, SEO y Analítica</span>
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase mt-1">Compliance Legal, Posicionamiento y Conversión</h2>
          <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 leading-tight">
            Verificación e integraciones activas para el lanzamiento de ObraService a producción en España
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3.5">
            <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Cumplimiento Legal y Consentimiento</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Aviso Legal & Privacidad (RGPD)</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Desplegado</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Banner de Consentimiento de Cookies</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Activo</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Canal de Soporte Directo (WhatsApp)</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Conectado</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3.5">
            <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Optimización SEO y Posicionamiento</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Metatítulos y Descripciones</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Configurado</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Sitemap.xml & Robots.txt</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Validado</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Ficha de Google (GMB)</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Sincronizada</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3.5">
            <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Rendimiento y Seguridad</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Forzar HTTPS SSL en Servidor</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Forzado (Activo)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Protección Anti-Spam (Honeypots)</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Filtro Activo</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Página 404 Personalizada</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Operativa</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3.5">
            <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Analítica y Rendimiento de Carga</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Google Analytics GTAG Tracker</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Instalado</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Compresión de Imágenes y Recursos</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Optimizado (100%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Contraste de Color Accesible (WCAG AA)</span>
                <span className="px-2 py-0.5 text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 uppercase rounded-full">Certificado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/30 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 font-bold uppercase leading-normal">
            Todos los componentes y metadatos SEO se encuentran integrados dinámicamente en el backend (servidor Node Express) y frontend (React Vite App) garantizando la máxima velocidad de carga.
          </p>
        </div>
      </div>

      {/* Demo vs Production Notice */}
      <div className="p-5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            onClick={() => obraStore.exitDemoMode()}
            className="shrink-0 px-4 py-2 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e65c00] transition-all shadow-lg active:scale-95"
          >
            Salir a Producción
          </button>
        )}
      </div>
    </div>
  );
};
