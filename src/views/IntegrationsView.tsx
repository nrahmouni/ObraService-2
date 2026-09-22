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
  Plus
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { AppState } from '../types';

import { toast } from 'react-hot-toast';

interface IntegrationsViewProps {
  state?: AppState;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ state }) => {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const handleAction = (label: string) => {
    toast.success(`${label} solicitada`, {
      icon: '🔌',
      style: {
        borderRadius: '16px',
        background: '#1F2329',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    });
  };

  const connectors = [
    { name: 'SAP S/4HANA', type: 'ERP', status: 'Available', icon: Database, color: 'text-blue-500' },
    { name: 'Microsoft Navision', type: 'ERP', status: 'Available', icon: Database, color: 'text-blue-600' },
    { name: 'Google Drive', type: 'Storage', status: 'Connected', icon: ExternalLink, color: 'text-green-500' },
    { name: 'Dropbox', type: 'Storage', status: 'Available', icon: ExternalLink, color: 'text-blue-400' },
    { name: 'Sage 50', type: 'Contabilidad', status: 'Coming Soon', icon: Database, color: 'text-emerald-500' },
  ];

  const webhooks = [
    { url: 'https://api.constructora.com/webhooks/daily-reports', event: 'REPORT_SUBMITTED', status: 'Active' },
    { url: 'https://hooks.slack.com/services/T000/B000/XXXX', event: 'DELIVERY_NOTE_DISPUTED', status: 'Inactive' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Conexiones e Intercambio</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Integración con el Ecosistema de Construcción</p>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Left Col: API & Webhooks */}
        <div className="w-full space-y-8">
          {/* API Keys Card */}
          <div className="bg-[#1F2329] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Key className="text-[#FF6600] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">API de Red Abierta</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acceso Programático v2.0</p>
                </div>
              </div>
              <button 
                onClick={() => handleAction('Nueva API Key')}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Generar Nueva Key
              </button>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PROD_KEY_OBRA_SERVER</span>
                <Badge variant="success">Activa</Badge>
              </div>
              <div className="flex items-center gap-4 bg-black/60 p-4 rounded-xl font-mono text-sm border border-white/5">
                <div className="flex-1 truncate text-[#FF6600]">
                  {apiKeyVisible ? 'os_live_51P2jA9H3LqW4XzR7V8m9N0k2B1C3D4E5' : '••••••••••••••••••••••••••••••••••••'}
                </div>
                <button 
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                Utiliza esta clave para integrar ObraService con tus sistemas internos. No compartas esta clave en entornos públicos.
              </div>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="bg-[#1F2329] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Webhook className="text-[#5B8CFF] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Webhooks</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eventos en Tiempo Real</p>
                </div>
              </div>
              <button 
                onClick={() => handleAction('Configuración de Webhook')}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#e65c00] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-orange-950/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nuevo Endpoint
              </button>
            </div>

            <div className="space-y-4">
              {webhooks.map((webhook, i) => (
                <div key={i} className="bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-[#FF6600]/30 transition-all flex items-center justify-between group">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-white tracking-tight">{webhook.url}</span>
                      <Badge variant={webhook.status === 'Active' ? 'success' : 'neutral'}>
                        {webhook.status === 'Active' ? 'Activo' : 'Pausado'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-[#FF6600]" />
                      Evento: {webhook.event}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAction('Refresco de Webhook')}
                    className="p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Connectors Marketplace */}
        <div className="space-y-8">
          <div className="bg-[#1F2329] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Puzzle className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Conectores</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ERP e Infraestructura</p>
              </div>
            </div>

            <div className="space-y-4">
              {connectors.map((connector, i) => (
                <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-black/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${connector.color}`}>
                      <connector.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-white uppercase tracking-tight">{connector.name}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{connector.type}</div>
                    </div>
                  </div>
                  {connector.status === 'Connected' ? (
                    <Badge variant="success">Conectado</Badge>
                  ) : (
                    <button 
                      onClick={() => handleAction(`Conexión con ${connector.name}`)}
                      className="text-[9px] font-black uppercase text-[#FF6600] tracking-widest opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      {connector.status === 'Coming Soon' ? 'Prox.' : 'Conectar'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-2xl text-center">
              <Zap className="w-8 h-8 text-[#FF6600] mx-auto mb-4" />
              <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Solicitar Integración</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6">
                ¿Usas un ERP propietario o necesitas un flujo específico? Nuestro equipo técnico puede desarrollar conectores a medida.
              </p>
              <button 
                onClick={() => handleAction('Integración a medida')}
                className="w-full py-3 bg-[#FF6600] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#e65c00] transition-all cursor-pointer"
              >
                Contactar Engineering
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
