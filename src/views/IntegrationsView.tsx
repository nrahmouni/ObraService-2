import React, { useState } from 'react';
import { 
  Puzzle, 
  Key, 
  Webhook, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  ExternalLink,
  Code,
  Lock,
  Plus,
  Eye,
  EyeOff,
  Cloud,
  Globe,
  Settings,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  Cpu,
  Unplug,
  Fingerprint,
  Copy,
  X
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { AppState } from '../types';
import { toast } from 'react-hot-toast';

interface IntegrationsViewProps {
  state?: AppState;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ state }) => {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKey, setApiKey] = useState('os_live_51P2jA9H3LqW4XzR7V8m9N0k2B1C3D4E5');

  const [connectors, setConnectors] = useState([
    { id: 'sap', name: 'SAP S/4HANA', type: 'ERP', status: 'Available', icon: Database, color: 'text-blue-500' },
    { id: 'dynamics', name: 'Microsoft Dynamics 365', type: 'ERP', status: 'Available', icon: Cloud, color: 'text-blue-600' },
    { id: 'autodesk', name: 'Autodesk Construction', type: 'BIM', status: 'Connected', icon: Layers, color: 'text-rose-500' },
    { id: 'google', name: 'Google Workspace', type: 'Auth / Storage', status: 'Connected', icon: Globe, color: 'text-emerald-500' },
    { id: 'sage', name: 'Sage 50 Cloud', type: 'Contabilidad', status: 'Available', icon: Database, color: 'text-emerald-500' },
    { id: 'dropbox', name: 'Dropbox Business', type: 'Cloud Storage', status: 'Available', icon: ExternalLink, color: 'text-blue-400' },
  ]);

  const [webhooks, setWebhooks] = useState([
    { id: 'wh_1', url: 'https://api.constructora.com/webhooks/daily-reports', event: 'REPORT_SUBMITTED', status: 'Active' },
    { id: 'wh_2', url: 'https://hooks.slack.com/services/T000/B000/XXXX', event: 'DELIVERY_NOTE_DISPUTED', status: 'Inactive' },
  ]);

  // Modal States
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvent, setNewWebhookEvent] = useState('REPORT_SUBMITTED');

  const [selectedConnector, setSelectedConnector] = useState<{ id: string; name: string } | null>(null);
  const [connectorApiKey, setConnectorApiKey] = useState('');

  const handleRegenerateToken = () => {
    const newToken = `os_live_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    setApiKey(newToken);
    toast.success('Nueva Master API Key generada con éxito.');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('Clave API copiada al portapapeles.');
  };

  const handleConnectConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setConnectors(prev => prev.map(c => 
      c.id === selectedConnector.id ? { ...c, status: 'Connected' } : c
    ));
    toast.success(`Conexión establecida con ${selectedConnector.name}.`);
    setSelectedConnector(null);
    setConnectorApiKey('');
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) {
      toast.error('Indica una URL HTTPS válida.');
      return;
    }

    setWebhooks(prev => [
      ...prev,
      {
        id: `wh_${Date.now()}`,
        url: newWebhookUrl,
        event: newWebhookEvent,
        status: 'Active'
      }
    ]);
    toast.success('Nuevo endpoint de Webhook registrado.');
    setIsWebhookModalOpen(false);
    setNewWebhookUrl('');
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">
            <Cpu className="w-3.5 h-3.5" />
            Ecosistema API & ERP
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase leading-none">
            Interconectividad
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-medium max-w-xl">
            Sincroniza ObraService con tu software de gestión ERP y plataformas BIM mediante protocolos REST certificados.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-brand-surface border border-brand-border">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Gateway v2.4 Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Main Integration Controls */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          {/* API Access Card */}
          <div className="card p-5 sm:p-10 space-y-6 sm:space-y-10 group overflow-hidden relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <Fingerprint className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                    Acceso Programático
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-muted font-medium">Clave maestra de entorno (Bearer Auth).</p>
                </div>
              </div>
              <button 
                onClick={handleRegenerateToken} 
                className="btn-secondary h-11 px-5 sm:px-6 text-xs uppercase tracking-wider cursor-pointer"
              >
                Regenerar Token
              </button>
            </div>

            <div className="p-4 sm:p-8 bg-brand-bg border border-brand-border rounded-2xl sm:rounded-[2.5rem] space-y-4 sm:space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Production Master Key</span>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Verificada
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 bg-brand-surface p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-brand-border font-mono text-xs sm:text-sm">
                <div className="flex-1 truncate text-brand-accent tracking-wider font-semibold">
                  {apiKeyVisible ? apiKey : '••••••••••••••••••••••••••••••••••••'}
                </div>
                <button 
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-white transition-colors cursor-pointer"
                  title={apiKeyVisible ? "Ocultar clave" : "Mostrar clave"}
                >
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleCopyKey}
                  className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-accent transition-colors cursor-pointer"
                  title="Copiar clave"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="card p-5 sm:p-10 space-y-6 sm:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <Webhook className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                    Flujos Outbound
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-muted font-medium">Eventos en tiempo real mediante Webhooks.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWebhookModalOpen(true)} 
                className="btn-primary h-11 px-5 sm:px-6 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Añadir Endpoint
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 sm:p-6 bg-brand-surface border border-brand-border rounded-xl sm:rounded-[2rem] hover:border-brand-accent/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-black text-white font-mono tracking-tight truncate">
                        {webhook.url}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                        webhook.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-brand-bg text-brand-muted border-brand-border'
                      }`}>
                        {webhook.status === 'Active' ? 'Live' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="text-brand-accent flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Trigger: {webhook.event}
                      </span>
                      <span className="text-brand-border">•</span>
                      <span className="text-brand-muted uppercase">Protocolo: HTTPS JSON</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success(`Ping de prueba enviado a ${webhook.url}`);
                    }}
                    className="btn-secondary h-9 px-4 text-[10px] font-bold uppercase self-start md:self-auto cursor-pointer"
                  >
                    Test Ping
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Marketplace */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-10">
          <div className="card p-5 sm:p-8 space-y-6 sm:space-y-8 bg-gradient-to-br from-brand-surface to-brand-bg border-brand-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                <Puzzle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-display font-black text-white uppercase tracking-tight">Marketplace</h2>
                <p className="text-xs text-brand-muted font-medium">Conectores Nativos.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {connectors.map((connector) => (
                <div key={connector.id} className="p-3.5 sm:p-4 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-between group hover:border-brand-accent/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center ${connector.color} shrink-0`}>
                      <connector.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-tight">{connector.name}</div>
                      <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{connector.type}</div>
                    </div>
                  </div>
                  {connector.status === 'Connected' ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedConnector({ id: connector.id, name: connector.name })}
                      className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Enlazar
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 sm:p-6 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-accent/30 flex items-center justify-center mx-auto text-brand-accent">
                <Unplug className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-tight">Custom ETL Solutions</h4>
                <p className="text-[10px] text-brand-muted font-medium leading-relaxed">
                  ¿Tienes un ERP propietario o base de datos en local? Desarrollamos adaptadores certificados.
                </p>
              </div>
              <button 
                onClick={() => toast.success('Solicitud enviada al equipo de arquitectura de datos.')}
                className="btn-primary w-full h-10 text-xs font-bold uppercase cursor-pointer"
              >
                Contactar Arquitectura
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Webhook Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                    Nuevo Webhook Outbound
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Notificaciones HTTPS en tiempo real para eventos de obra.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  URL del Endpoint (HTTPS Obligatorio)
                </label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.tuempresa.com/hooks/obra"
                  className="input h-11 w-full text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Evento Disparador (CRM & Obra)
                </label>
                <select
                  value={newWebhookEvent}
                  onChange={(e) => setNewWebhookEvent(e.target.value)}
                  className="input h-11 w-full text-xs font-medium"
                >
                  <option value="CRM_LEAD_CREATED">CRM_LEAD_CREATED (Nuevo lead / licitación registrada)</option>
                  <option value="CRM_DEAL_WON">CRM_DEAL_WON (Propuesta comercial adjudicada)</option>
                  <option value="CRM_CLIENT_SYNCED">CRM_CLIENT_SYNCED (Ficha de promotor actualizada)</option>
                  <option value="REPORT_SUBMITTED">REPORT_SUBMITTED (Nuevo parte de obra enviado)</option>
                  <option value="DELIVERY_NOTE_CONFIRMED">DELIVERY_NOTE_CONFIRMED (Albarán firmado digitalmente)</option>
                  <option value="CERTIFICATION_APPROVED">CERTIFICATION_APPROVED (Certificación oficial emitida)</option>
                  <option value="DISPUTE_OPENED">DISPUTE_OPENED (Disputa de horas abierta)</option>
                  <option value="CLOCK_IN_WARNING">CLOCK_IN_WARNING (Fichaje fuera de radio GPS)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="btn-secondary h-11 px-5 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary h-11 px-6 text-xs font-bold cursor-pointer"
                >
                  Registrar Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                    Enlazar con {selectedConnector.name}
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Configuración de credenciales de API.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectConnector} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Tenant ID / URL de Instancia
                </label>
                <input
                  type="text"
                  placeholder="https://instancia.corp.com:443"
                  className="input h-11 w-full text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  API Token / Secret Key
                </label>
                <input
                  type="password"
                  value={connectorApiKey}
                  onChange={(e) => setConnectorApiKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="input h-11 w-full text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedConnector(null)}
                  className="btn-secondary h-11 px-5 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary h-11 px-6 text-xs font-bold cursor-pointer"
                >
                  Verificar y Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
