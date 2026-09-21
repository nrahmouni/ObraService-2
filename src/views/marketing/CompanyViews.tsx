import React, { useState } from 'react';
import { PageTemplate } from '../../components/marketing/PageTemplate';
import { LandingAbout } from '../../components/landing/LandingAbout';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  connectGmailAccount, 
  sendGmailEmail, 
  isGoogleGmailConnected, 
  disconnectGmail,
  GMAIL_TEMPLATES 
} from '../../services/gmail';

export const CompanyAboutView = () => (
  <PageTemplate 
    title="Quiénes Somos" 
    subtitle="Digitalizando el tajo desde 2021 con una misión clara: devolver la confianza a la industria de la construcción."
  >
    <div className="space-y-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10">
          <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter text-[#FF6600]">Nuestra Misión</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">
            ObraService nació tras años de observar la ineficiencia en el registro de jornadas en grandes obras de ingeniería. Nuestra misión es crear una capa de datos inmutable que elimine las disputas entre contratistas y subcontratistas.
          </p>
          <div className="flex gap-8 border-t border-white/5 pt-8">
            <div>
              <div className="text-3xl font-black text-white tracking-tighter">150+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Obras Digitalizadas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tighter">€4M+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ahorro en Disputas</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-4xl font-black mb-8 uppercase tracking-tighter">Valores que construyen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { t: 'Transparencia Total', d: 'Datos verificados por GPS y marcas de tiempo.' },
              { t: 'Soberanía del Dato', d: 'El cliente es el único dueño de su información.' },
              { t: 'Innovación Pragmática', d: 'IA aplicada a problemas reales del barro.' },
              { t: 'Compromiso Legal', d: 'Firmas con plena validez jurídica europea.' }
            ].map((v, i) => (
              <div key={i}>
                <h5 className="font-black text-[#FF6600] uppercase text-[10px] tracking-widest mb-2">{v.t}</h5>
                <p className="text-slate-500 text-sm">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <LandingAbout />
    </div>
  </PageTemplate>
);
export const CompanyContactView = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentViaGmail, setSentViaGmail] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(isGoogleGmailConnected());

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    const res = await connectGmailAccount();
    setConnectingGmail(false);
    if (res.success) {
      setGmailConnected(true);
      toast.success('¡Gmail conectado correctamente! Los correos se enviarán desde tu dirección real.');
    } else {
      toast.error(res.error || 'No se pudo conectar la cuenta de Google.');
    }
  };

  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailConnected(false);
    toast.success('Gmail desconectado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error('Por favor, rellena todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build a beautiful support email body in HTML format
      const bodyHtml = GMAIL_TEMPLATES.contactSupport(name, email, subject, message);
      
      // Send message
      const result = await sendGmailEmail(
        'naimrahmouni1998@gmail.com', // Sent to the user/support email
        `[Soporte ObraService] ${subject}`,
        bodyHtml
      );

      setIsSubmitting(false);
      if (result.success) {
        setSuccess(true);
        setSentViaGmail(!result.isSimulated);
        toast.success(result.isSimulated 
          ? '¡Mensaje enviado (Simulado para demostración)!' 
          : '¡Mensaje enviado con éxito vía Gmail!'
        );
      } else {
        toast.error(result.error || 'Error al enviar el mensaje.');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.message || 'Error inesperado al enviar el mensaje.');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSuccess(false);
    setSentViaGmail(false);
  };

  return (
    <PageTemplate 
      title="Contacto" 
      subtitle="Estamos aquí para ayudarte a digitalizar tu obra. Respondemos en menos de 2 horas."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column: Cards with contact info & Gmail integration status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6600] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Ventas y Demo</h4>
              <p className="text-slate-400 text-xs">ventas@obraservice.es</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Contrataciones de volumen y planes personalizados.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Soporte Técnico</h4>
              <p className="text-slate-400 text-xs">+34 910 000 000</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Asistencia inmediata para jefes de obra en el tajo.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Oficina Central</h4>
              <p className="text-slate-400 text-xs">Paseo de la Castellana, Madrid</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Centro de innovación y desarrollo de software.</p>
            </div>
          </div>

          {/* Connected Gmail Account Settings widget */}
          <div className="bg-gradient-to-br from-[#1F2329] to-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6600]" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Integración con Gmail</h4>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Puedes conectar tu cuenta de Google para enviar tus mensajes de contacto e invitaciones de equipo directamente usando tu propio correo de Gmail en tiempo real.
            </p>

            {gmailConnected ? (
              <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">● Cuenta Conectada</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase">API de Gmail</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Los correos se enviarán de forma segura desde tu dirección oficial de Gmail.
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Desconectar Cuenta
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectGmail}
                disabled={connectingGmail}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {connectingGmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Conectando con Google...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Conectar cuenta de Gmail
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right column: Interactive Form / Success Screen */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-[#1F2329] to-[#17191E] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]" />

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="pb-2 border-b border-white/5 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Formulario de Contacto</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Envía tus dudas, solicitudes o sugerencias</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Carmen Vega" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6600]/30 focus:bg-black/60 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carmen.vega@constructora.es" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6600]/30 focus:bg-black/60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto del Mensaje</label>
                  <input 
                    type="text" 
                    required 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Solicitar demo corporativa para constructora" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6600]/30 focus:bg-black/60 transition-all uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje o Consulta</label>
                  <textarea 
                    required 
                    rows={6}
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe detalladamente tu consulta para que podamos preparar tu respuesta..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6600]/30 focus:bg-black/60 transition-all min-h-[120px]"
                  />
                </div>

                {gmailConnected && (
                  <div className="flex items-center gap-2.5 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-400 font-bold">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Este mensaje se enviará directamente a soporte desde tu Gmail conectado.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e65c00] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-orange-950/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Enviando mensaje...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Enviar Mensaje de Contacto
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">¡Mensaje Enviado!</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Tu consulta ha sido procesada correctamente</p>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto text-slate-300">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Resumen de Envío</div>
                  <div className="text-xs space-y-2">
                    <div><span className="font-bold text-slate-400">Asunto:</span> {subject}</div>
                    <div><span className="font-bold text-slate-400">Email:</span> {email}</div>
                    <div><span className="font-bold text-slate-400">Estado:</span> {sentViaGmail ? 'Enviado con éxito (Gmail Real API)' : 'Transmitido con éxito (Simulador)'}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Gracias por ponerte en contacto. Nos pondremos en contacto contigo en la dirección <strong>{email}</strong> en un plazo máximo de 2 horas.
                </p>

                <button 
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Enviar otro mensaje
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export const CompanyBlogView = () => (
  <PageTemplate title="Blog de Obra" subtitle="Perspectivas sobre la digitalización del sector de la construcción.">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { t: 'El fin del papel en la obra: ¿Cómo empezar?', d: 'Guía paso a paso para digitalizar tus subcontratas.', date: '12 Sep 2026' },
        { t: 'IA y Construcción: Más allá del hype', d: 'Cómo Gemini está detectando sobrecostes en tiempo real.', date: '05 Sep 2026' },
        { t: 'Novedades Legales: Registro de Jornada 2027', d: 'Análisis de la nueva normativa de inspección de trabajo.', date: '28 Ago 2026' },
        { t: 'Geocercas: El aliado del Jefe de Obra', d: 'Por qué el GPS es la mejor herramienta de confianza.', date: '15 Ago 2026' }
      ].map((post, i) => (
        <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:border-[#FF6600]/30 transition-all cursor-pointer group">
          <div className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest mb-4">{post.date}</div>
          <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{post.t}</h3>
          <p className="text-slate-400 leading-relaxed mb-6">{post.d}</p>
          <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            Leer más <div className="w-4 h-px bg-[#FF6600]" />
          </div>
        </div>
      ))}
    </div>
  </PageTemplate>
);

export const CompanyPressView = () => (
  <PageTemplate title="Prensa" subtitle="Material corporativo y últimas noticias de ObraService.">
    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
      <p className="text-slate-500 font-bold uppercase tracking-widest">Kit de prensa en preparación</p>
    </div>
  </PageTemplate>
);
