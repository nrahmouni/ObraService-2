import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Hash, 
  Clock, 
  Building2, 
  HardHat, 
  User, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { AppState, ChatMessage } from '../types';
import { obraStore } from '../services/store';

interface ChatViewProps {
  state: AppState;
}

const CHANNELS = [
  { id: 'general', name: 'Canal General', desc: 'Comunicados globales y coordinación tripartita principal de obra.' },
  { id: 'delivery_notes', name: 'Incidencias Albaranes', desc: 'Disputas, aclaraciones y discrepancias de horas reportadas.' },
  { id: 'coordination', name: 'Coordinación Campo', desc: 'Sincronización diaria de tajos, cuadrillas y maquinaria.' }
];

// High fidelity mock tripartite representatives for simulation
const SIMULATED_PARTICIPANTS = [
  { 
    id: 'usr_admin', 
    name: 'Carlos Mendoza', 
    role: 'MAIN_CONTRACTOR_ADMIN', 
    company: 'Construcciones Norte S.L.', 
    title: 'Administrador de Constructora',
    avatar: 'CM', 
    color: 'border-amber-400 text-amber-700 bg-amber-50' 
  },
  { 
    id: 'usr_site_manager', 
    name: 'Javier Ortiz', 
    role: 'SITE_MANAGER', 
    company: 'Construcciones Norte S.L.', 
    title: 'Jefe de Obra (Director)',
    avatar: 'JO', 
    color: 'border-blue-400 text-blue-700 bg-blue-50' 
  },
  { 
    id: 'usr_sub_levante', 
    name: 'Elena Ramos', 
    role: 'SUBCONTRACTOR_USER', 
    company: 'Estructuras Levante S.L.', 
    title: 'Representante de Subcontrata',
    avatar: 'ER', 
    color: 'border-emerald-400 text-emerald-700 bg-emerald-50' 
  },
];

// Interactive Quick-Scenario Prompts for one-click testing
const PRESET_SCENARIOS = [
  {
    title: "⚠️ Retraso de Hormigón",
    text: "La cuba de hormigón H-25 lleva 30 minutos de retraso en la entrada de la zona Norte. ¿Alguien tiene novedades?",
    channel: "coordination"
  },
  {
    title: "📊 Discrepancia Albarán",
    text: "Hola, en el albarán de Estructuras Levante aparecen 4 horas extras de operarios que no estaban registrados en el control de firmas. ¿Podemos cotejarlo?",
    channel: "delivery_notes"
  },
  {
    title: "🦺 Inspección de Seguridad",
    text: "Mañana a las 9:30 tendremos visita de la inspección técnica de seguridad. Por favor, revisad barandillas y arneses.",
    channel: "general"
  }
];

export const ChatView: React.FC<ChatViewProps> = ({ state }) => {
  const user = state.currentUser;
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageText, setMessageText] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState(user?.id || 'usr_site_manager');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = state.messages || [];
  const filteredMessages = messages.filter(msg => msg.channelId === activeChannel);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, isTyping]);

  if (!user) return null;

  // Active simulated sender info
  const activeSender = SIMULATED_PARTICIPANTS.find(p => p.id === selectedSenderId) || {
    id: user.id,
    name: user.name,
    role: user.role,
    company: user.companyName || 'Constructora S.L.',
    title: 'Tú (Usuario Activo)'
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Send simulated message through store
    obraStore.sendSimulatedChatMessage(activeChannel, textToSend.trim(), {
      id: activeSender.id,
      name: activeSender.name,
      role: activeSender.role,
      company: activeSender.company
    });

    // Trigger Smart Construction Simulated Reply
    triggerSimulatedReply(textToSend.trim());
  };

  const triggerSimulatedReply = (userMsg: string) => {
    const textLower = userMsg.toLowerCase();
    
    // Choose which other character should reply (one that was NOT the sender)
    const potentialRepliers = SIMULATED_PARTICIPANTS.filter(p => p.id !== selectedSenderId);
    const replier = potentialRepliers[Math.floor(Math.random() * potentialRepliers.length)] || SIMULATED_PARTICIPANTS[0];

    setIsTyping(replier.name);

    setTimeout(() => {
      setIsTyping(null);

      // Context-aware clever construction replies
      let replyText = `Entendido. Tomo nota del comentario para el seguimiento diario de la obra. Lo revisamos ahora mismo.`;

      if (textLower.includes('hormigon') || textLower.includes('cuba') || textLower.includes('losa') || textLower.includes('vertido')) {
        replyText = `El laboratorio de control de calidad me confirma que las probetas del hormigonado de ayer han dado resistencias óptimas. Respecto a la cuba de hoy, el camión H-25 ya está saliendo de báscula de la planta.`;
      } else if (textLower.includes('horas') || textLower.includes('extra') || textLower.includes('albaran') || textLower.includes('firma') || textLower.includes('discrepancia')) {
        replyText = `He comprobado las firmas de Estructuras Levante. Las 4 horas extras corresponden al apuntalamiento de seguridad del sector B tras el aviso de viento. Se autorizó por libro de órdenes del Jefe de Obra.`;
      } else if (textLower.includes('seguridad') || textLower.includes('inspeccion') || textLower.includes('arnes') || textLower.includes('casco') || textLower.includes('riesgo')) {
        replyText = `Entendido. El recurso preventivo de la subcontrata ya está en tajo supervisando la colocación de redes de seguridad tipo horca. No entra nadie sin EPI completo.`;
      } else if (textLower.includes('retraso') || textLower.includes('acero') || textLower.includes('ferralla') || textLower.includes('material')) {
        replyText = `El proveedor de acero de refuerzo indica que tienen huelga de transporte parcial, pero han metido un camión de noche para no paralizar el armado de los pilares. Se mantiene el planning.`;
      } else if (textLower.includes('maquinaria') || textLower.includes('grua') || textLower.includes('averia')) {
        replyText = `El técnico de la grúa torre ya está de camino para revisar el limitador de par que saltaba esta mañana. Estará operativa antes del mediodía.`;
      }

      obraStore.sendSimulatedChatMessage(activeChannel, replyText, {
        id: replier.id,
        name: replier.name,
        role: replier.role,
        company: replier.company
      });
    }, 1200);
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'MAIN_CONTRACTOR_ADMIN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SITE_MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUBCONTRACTOR_USER': return 'bg-emerald-100 text-[#047857] border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MAIN_CONTRACTOR_ADMIN': return 'Constructora (Admin)';
      case 'SITE_MANAGER': return 'Jefe de Obra';
      case 'SUBCONTRACTOR_USER': return 'Subcontratista';
      default: return 'Usuario';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-170px)] min-h-[580px] flex flex-col lg:flex-row animate-in fade-in duration-300" id="chat-simulation-workspace">
      
      {/* Channels & Simulator Controls Sidebar */}
      <div className="w-full lg:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
        
        {/* Header Title */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-[#FF6600]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Salas de Coordinación</h2>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Canales de la Obra Activa</p>
        </div>

        {/* Channels List */}
        <div className="p-2 space-y-1">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                activeChannel === ch.id 
                  ? 'bg-white border-slate-200 shadow-xs text-slate-900 font-bold' 
                  : 'border-transparent text-slate-600 hover:bg-slate-100/60'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeChannel === ch.id ? 'bg-[#FF6600]/10 text-[#FF6600]' : 'bg-slate-200/50 text-slate-400'}`}>
                <Hash className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black uppercase tracking-tight truncate leading-none mb-1">{ch.name}</div>
                <div className="text-[9px] text-slate-400 font-semibold leading-tight truncate">{ch.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Sandbox Role Switcher Controller */}
        <div className="p-4 border-t border-b border-slate-200 bg-amber-50/40 space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-amber-700">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider">Simulador Tripartita</span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Cambia de personaje para simular las opiniones y respuestas de cada agente implicado en la obra:
          </p>
          
          <div className="space-y-2">
            {SIMULATED_PARTICIPANTS.map((p) => {
              const isSelected = selectedSenderId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedSenderId(p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected 
                      ? 'border-[#FF6600] bg-white shadow-sm ring-1 ring-[#FF6600]' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${p.color}`}>
                    {p.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-slate-950 uppercase leading-none truncate flex items-center gap-1.5 justify-between">
                      <span>{p.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]" />}
                    </div>
                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">{p.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick-Preset triggers for testing */}
          <div className="pt-2">
            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Plantillas de Prueba</span>
            </div>
            <div className="space-y-1">
              {PRESET_SCENARIOS.map((sc, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveChannel(sc.channel);
                    handleSendMessage(sc.text);
                  }}
                  className="w-full text-left p-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:border-[#FF6600]/40 hover:text-slate-900 transition-colors cursor-pointer truncate uppercase block"
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Active User Profile Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-slate-900 truncate uppercase leading-none mb-1">{user.name}</div>
            <div className="text-[8px] font-black text-[#FF6600] truncate uppercase tracking-widest">{user.companyName}</div>
          </div>
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        
        {/* Chat Window Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-extrabold text-sm">#</span>
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {CHANNELS.find(ch => ch.id === activeChannel)?.name}
              </h1>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
              {CHANNELS.find(ch => ch.id === activeChannel)?.desc}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Simulación Activa
            </span>
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Canal vacío</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase leading-normal">
                  Escribe un mensaje o activa una plantilla para ver cómo conversan el contratista, jefe de obra y subcontratas.
                </p>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, i) => {
              const isSimulatedSender = msg.senderId === selectedSenderId;
              const isMyRealAccount = msg.senderId === user.id;
              const messageTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div 
                  key={msg.id || i} 
                  className={`flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${isSimulatedSender ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* User Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm border ${
                    isSimulatedSender 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {msg.senderName.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Message Bubble Block */}
                  <div className="space-y-1 min-w-0">
                    <div className={`flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-tight text-slate-400 ${
                      isSimulatedSender ? 'justify-end' : ''
                    }`}>
                      <span className="text-slate-800 font-extrabold">{msg.senderName}</span>
                      <span className="text-[7px] font-medium">•</span>
                      <span className="text-slate-500">{msg.senderCompanyName}</span>
                      <span className="text-[7px] font-medium">•</span>
                      <span className={`px-1.5 py-0.2 rounded border text-[7px] font-black ${getRoleBadgeClasses(msg.senderRole)}`}>
                        {getRoleLabel(msg.senderRole)}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl text-[11px] leading-relaxed shadow-xs border ${
                      isSimulatedSender 
                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    <div className={`text-[7px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 ${
                      isSimulatedSender ? 'justify-end' : ''
                    }`}>
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      {messageTime}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                ...
              </div>
              <div className="space-y-1">
                <div className="text-[8px] font-bold uppercase tracking-tight text-slate-400">
                  {isTyping} está escribiendo...
                </div>
                <div className="p-3 bg-white border border-slate-100 text-slate-400 text-xs rounded-xl rounded-tl-none italic font-medium">
                  Escribiendo mensaje...
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!messageText.trim()) return;
            handleSendMessage(messageText);
            setMessageText('');
          }} 
          className="p-4 border-t border-slate-200 bg-white shrink-0"
        >
          <div className="flex flex-col gap-2">
            
            {/* Sender simulation hint bar */}
            <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5">
              <span className="flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                <span>Mensaje emitido como:</span>
                <strong className="text-slate-800 font-extrabold">{activeSender.name}</strong>
                <span className="text-slate-300">({activeSender.company})</span>
              </span>
              <span className="text-[#FF6600]">Misión Tripartita Activa</span>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Enviar mensaje como ${activeSender.name.split(' ')[0]} a #${CHANNELS.find(ch => ch.id === activeChannel)?.name.toLowerCase()}...`}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="bg-[#FF6600] text-white p-2.5 rounded-xl hover:bg-[#e65c00] transition-all disabled:opacity-50 disabled:hover:bg-[#FF6600] active:scale-95 flex items-center justify-center shrink-0 shadow-sm cursor-pointer min-h-[40px]"
              >
                <Send className="w-3.5 h-3.5 fill-current stroke-[2]" />
              </button>
            </div>
          </div>
          <div className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest text-center">
            Conversación y chat cruzado en tiempo real entre empresa contratista, jefatura de obra y subcontratistas autorizadas.
          </div>
        </form>

      </div>
    </div>
  );
};
