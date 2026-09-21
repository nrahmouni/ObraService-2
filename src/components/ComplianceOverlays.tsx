import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  MessageCircle, 
  HelpCircle, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Check,
  Send,
  Sparkles,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ComplianceOverlays: React.FC = () => {
  // State for Cookie Banner
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  // State for Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'legal' | 'privacy' | 'cookies' | null>(null);
  
  // State for WhatsApp floating chat box
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'agent', text: string, time: string }>>([
    { sender: 'agent', text: '¡Hola! Bienvenido al soporte técnico de ObraService. ¿Tienes alguna duda con el alta de subcontratas o la firma digital de albaranes?', time: 'Ahora' }
  ]);

  useEffect(() => {
    const consent = localStorage.getItem('obraservice-cookie-consent');
    if (!consent) {
      // Small timeout to animate nicely
      const timer = setTimeout(() => setShowCookieBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = (all: boolean) => {
    localStorage.setItem('obraservice-cookie-consent', all ? 'all' : 'essential');
    setShowCookieBanner(false);
    toast.success(all ? 'Cookies de rendimiento y análisis aceptadas' : 'Cookies esenciales aceptadas');
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppMessage.trim()) return;

    const userMsg = whatsAppMessage.trim();
    const newHistory = [...chatHistory, { sender: 'user' as const, text: userMsg, time: 'Ahora' }];
    setChatHistory(newHistory);
    setWhatsAppMessage('');

    // Simulated automated assistant reply with typical construction humor or helpfulness
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: 'Entendido. Un asesor técnico especializado en el sector de la construcción en España se pondrá en contacto contigo en este mismo número de WhatsApp en menos de 5 minutos.',
          time: 'Ahora'
        }
      ]);
    }, 1000);
  };

  return (
    <>
      {/* 1. Dynamic Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-6 md:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-5 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-[#FF6600]/10 text-[#FF6600] rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900">Uso de Cookies y Privacidad</h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Utilizamos cookies propias y de terceros para optimizar la velocidad de carga de la plataforma y garantizar el contraste de color según WCAG AA.
              </p>
            </div>
            <button 
              onClick={() => setShowCookieBanner(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAcceptCookies(true)}
              className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Aceptar Todo
            </button>
            <button
              onClick={() => handleAcceptCookies(false)}
              className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/50"
            >
              Solo Esenciales
            </button>
            <button
              onClick={() => setActiveLegalModal('cookies')}
              className="text-[9px] text-[#FF6600] font-black uppercase tracking-wider px-2 py-2 hover:underline cursor-pointer"
            >
              Configurar
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <button onClick={() => setActiveLegalModal('legal')} className="hover:text-slate-700 cursor-pointer">Aviso Legal</button>
            <span>•</span>
            <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-slate-700 cursor-pointer">Privacidad</button>
            <span>•</span>
            <button onClick={() => setActiveLegalModal('cookies')} className="hover:text-slate-700 cursor-pointer">Cookies</button>
          </div>
        </div>
      )}



      {/* 3. Legal and Compliance Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col h-[450px] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {activeLegalModal === 'legal' && 'Aviso Legal'}
                  {activeLegalModal === 'privacy' && 'Política de Privacidad'}
                  {activeLegalModal === 'cookies' && 'Política de Cookies'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-slate-600 text-[11px] leading-relaxed">
              {activeLegalModal === 'legal' && (
                <>
                  <p className="font-bold text-slate-800">1. Datos Identificativos</p>
                  <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se reflejan los siguientes datos:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Titular:</strong> ObraService Soluciones Digitales S.L.</li>
                    <li><strong>CIF:</strong> B-88776655</li>
                    <li><strong>Domicilio Social:</strong> Paseo de la Castellana 120, Madrid, España</li>
                    <li><strong>Email de Contacto:</strong> legal@obraservice.com</li>
                  </ul>
                  <p className="font-bold text-slate-800">2. Usuarios e Infracciones</p>
                  <p>El acceso y/o uso de este portal de ObraService atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.</p>
                  <p>ObraService se reserva el derecho a denegar el acceso a la plataforma sin necesidad de preaviso a aquellos usuarios que incumplan las presentes condiciones de uso.</p>
                </>
              )}

              {activeLegalModal === 'privacy' && (
                <>
                  <p className="font-bold text-slate-800">1. Protección de Datos (RGPD)</p>
                  <p>ObraService cumple con las directrices del Reglamento General de Protección de Datos (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), velando por garantizar un correcto uso y tratamiento de los datos personales del usuario.</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Responsable:</strong> ObraService Soluciones Digitales S.L.</li>
                    <li><strong>Finalidad:</strong> Gestión de partes de trabajo, altas de subcontratas y coordinación tripartita de obras de construcción en España.</li>
                    <li><strong>Legitimación:</strong> Ejecución de un contrato de servicio de software.</li>
                    <li><strong>Destinatarios:</strong> No se cederán datos a terceros salvo obligación legal expresa.</li>
                    <li><strong>Derechos:</strong> Acceso, rectificación, supresión, oposición, portabilidad y limitación enviando correo a legal@obraservice.com.</li>
                  </ul>
                  <p className="font-bold text-slate-800">2. Spam y Formularios Protegidos</p>
                  <p>Todos nuestros formularios de invitación y registro implementan mecanismos antispam avanzados y filtros honeypot invisibles para evitar registros automatizados no autorizados.</p>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <p className="font-bold text-slate-800">1. ¿Qué son las cookies?</p>
                  <p>Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario.</p>
                  <p className="font-bold text-slate-800">2. Configuración y Consentimiento</p>
                  <p>Este sitio web utiliza cookies técnicas para garantizar la legibilidad visual (contraste accesible WCAG AA) y la seguridad de las sesiones de usuario.</p>
                  <table className="min-w-full border border-slate-100 text-[10px] mt-2">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border-b border-slate-100 p-2 text-left font-black">Nombre</th>
                        <th className="border-b border-slate-100 p-2 text-left font-black">Tipo</th>
                        <th className="border-b border-slate-100 p-2 text-left font-black">Finalidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-b border-slate-100">obraservice-consent</td>
                        <td className="p-2 border-b border-slate-100">Especial</td>
                        <td className="p-2 border-b border-slate-100">Almacenar preferencias de cookies</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-slate-100">firebase-token</td>
                        <td className="p-2 border-b border-slate-100">Seguridad</td>
                        <td className="p-2 border-b border-slate-100">Mantener sesión cifrada segura</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
