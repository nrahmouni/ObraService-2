import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Camera, 
  AlertTriangle, 
  Package, 
  HelpCircle, 
  CheckCircle2, 
  HardHat, 
  Building2,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, ChatMessage, UserRole } from '../types';
import { toast } from 'react-hot-toast';

interface MobileChatViewProps {
  state: AppState;
}

export const MobileChatView: React.FC<MobileChatViewProps> = ({ state }) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'delivery_notes' | 'coordination'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = state.currentUser;
  const activeProject = state.projects[0];
  const messages = (state.messages || []).filter(m => m.channelId === activeChannel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderCompanyName: currentUser.companyName || 'Subcontrata',
      channelId: activeChannel,
      text: text,
      createdAt: new Date().toISOString()
    };

    obraStore.postChatMessage(newMessage);
    setInputText('');

    // In demo mode or for site simulation, generate instant response from Site Manager if text was an alert
    if (state.isDemoMode || true) {
      setTimeout(() => {
        let replyText = 'Recibido en caseta. Javier Ortiz lo revisa en la próxima ronda.';
        if (text.includes('PRL') || text.includes('Incidencia')) {
          replyText = '⚠️ Notificación PRL recibida. Paramos el tajo afectado hasta que el técnico de seguridad revise la zona.';
        } else if (text.includes('Material') || text.includes('hormigón') || text.includes('acero')) {
          replyText = '📦 El camión de suministro está programado para llegar antes de las 14:00. Prepara el albarán en la app.';
        } else if (text.includes('Terminada') || text.includes('completada')) {
          replyText = '✅ Perfecto. Pasa al siguiente punto marcado en el parte diario.';
        }

        const replyMessage: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderId: 'usr_site_manager',
          senderName: 'Javier Ortiz (Jefe de Obra)',
          senderRole: 'SITE_MANAGER' as UserRole,
          senderCompanyName: 'Construcciones Norte S.L.',
          channelId: activeChannel,
          text: replyText,
          createdAt: new Date().toISOString()
        };
        obraStore.postChatMessage(replyMessage);
      }, 900);
    }
  };

  const handleQuickTag = (tag: string) => {
    handleSendMessage(`[${tag}]: `);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col max-w-xl mx-auto border-x border-slate-900 shadow-2xl">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-3.5 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/mobile/dashboard')}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white uppercase tracking-tight">Comunicación de Tajo</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Obra: {activeProject?.name || 'Ampliación Metro L5'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500">
            <HardHat className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Channel Switcher */}
      <nav aria-label="Canales de comunicación" className="bg-slate-900/60 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'general', label: 'General Tajo' },
          { id: 'delivery_notes', label: 'Materiales & Albaranes' },
          { id: 'coordination', label: 'Seguridad PRL' }
        ].map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeChannel === ch.id 
                ? 'bg-amber-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </nav>

      {/* Quick Action Chips */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => handleQuickTag('INCIDENCIA PRL')}
          className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1 hover:bg-rose-500/20"
        >
          <AlertTriangle className="w-3 h-3" /> Incidencia PRL
        </button>
        <button
          onClick={() => handleQuickTag('FALTA MATERIAL')}
          className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1 hover:bg-amber-500/20"
        >
          <Package className="w-3 h-3" /> Falta Material
        </button>
        <button
          onClick={() => handleQuickTag('TAREA COMPLETADA')}
          className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1 hover:bg-emerald-500/20"
        >
          <CheckCircle2 className="w-3 h-3" /> Tarea Lista
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">Canal Directo de Obra</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Envía dudas, notificaciones de seguridad o incidencias directamente a la caseta del Jefe de Obra.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-amber-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => {
              toast.success('Captura de foto de incidencia simulada añadida.');
              handleSendMessage('📷 [Foto de Incidencia adjunta]');
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white shrink-0 cursor-pointer"
            title="Adjuntar foto de obra"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje o aviso..."
            className="flex-1 bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-xl bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-amber-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
