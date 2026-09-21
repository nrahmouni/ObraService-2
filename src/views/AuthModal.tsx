import React, { useState, useEffect } from 'react';
import { obraStore } from '../services/store';
import { 
  Building2, 
  KeyRound, 
  UserPlus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';

interface AuthModalProps {
  initialMode: 'login' | 'register' | 'join_code' | 'forgot_password';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  
  // Sync if initialMode changes while component stays mounted
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialMode]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const DEMO_ACCOUNTS = [
    { name: 'Carlos Mendoza', role: 'Admin Constructora', email: 'carlos.mendoza@construccionesnorte.es', icon: Building2 },
    { name: 'Javier Ortiz', role: 'Jefe de Obra', email: 'javier.ortiz@construccionesnorte.es', icon: KeyRound },
    { name: 'Elena Ramos', role: 'Subcontratista', email: 'elena.ramos@estructuraslevante.es', icon: UserPlus },
  ];

  const fillQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('demo-2026');
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setLoading(false);
      if (user) {
        onSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Error al conectar con Google. Por favor, utiliza el registro manual.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (honeypot) {
      // Quietly reject bot submissions
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 800);
      return;
    }

    if (mode === 'login') {
      const isDemo = DEMO_ACCOUNTS.some(acc => acc.email === email);
      if (isDemo) {
        obraStore.enterDemoMode();
      }

      const res = obraStore.login(email);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Credenciales no válidas. Revisa el correo y contraseña.');
      }
    } else if (mode === 'register') {
      const res = obraStore.register(name, email);
      setLoading(false);
      if (res.success && res.user) {
        // Successful registration -> Next screen is OnboardingView (Split screen) to enter Company Name!
        onSuccess();
      } else {
        setErrorMessage(res.error || 'No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } else if (mode === 'join_code') {
      const res = obraStore.joinCompany(inviteCode);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Código de invitación no válido o empresa inactiva.');
      }
    } else if (mode === 'forgot_password') {
      setLoading(false);
      if (!email.trim()) {
        setErrorMessage('Por favor, introduce tu correo corporativo.');
        return;
      }
      setSuccessMessage('Si tu cuenta existe, recibirás un enlace de restablecimiento en tu bandeja de entrada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/85 backdrop-blur-md p-4 font-sans overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6600] flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/20">
              OS
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Prueba Gratuita (14 días)'}
                {mode === 'join_code' && 'Unirse con Código de Obra'}
                {mode === 'forgot_password' && 'Recuperar Contraseña'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight">
                {mode === 'register' ? 'Configuración en 2 min • Sin tarjeta' : 'Plataforma B2B para Construcción'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2.5 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-start gap-2.5 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Direct Google Sign-In */}
          <div className="mb-6">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              {mode === 'register' ? 'Registrarse con Google' : 'Continuar con Google'}
            </button>

            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
                O con tu email corporativo
              </span>
            </div>
          </div>

          {/* Form switch by mode */}
          <div className="space-y-4">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field */}
                <input 
                  type="text" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  className="hidden" 
                  tabIndex={-1} 
                />

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@constructora.es"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot_password')} 
                      className="text-[10px] text-[#FF6600] font-bold hover:underline"
                    >
                      ¿La olvidaste?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 mt-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>

                {/* Quick Access Demo Profiles */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider text-center">
                    Acceso Rápido de Prueba
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((acc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => fillQuickAccount(acc.email)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/40 hover:bg-white transition-all cursor-pointer text-center"
                      >
                        <acc.icon className="w-4 h-4 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-700 leading-tight">
                          {acc.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* REGISTER MODE (High Conversion CRO: 1 step, immediately followed by Company Setup in OnboardingView) */}
            {mode === 'register' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  className="hidden" 
                  tabIndex={-1} 
                />

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                    Tu Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Javier Ortiz"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                    Correo Corporativo de Empresa
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@constructora.es"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <span>En el siguiente paso podrás registrar el nombre y datos de tu constructora.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#FF6600] hover:bg-[#EA580C] disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-orange-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Creando cuenta...' : 'Continuar a Configurar Empresa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* JOIN WITH CODE */}
            {mode === 'join_code' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider text-center">
                    Código de Invitación de Obra
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="OBRA-XXXX"
                    className="w-full h-16 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black tracking-widest text-center uppercase text-slate-900 focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                    Pide este código a la constructora principal o al administrador de tu empresa para incorporarte al tajo.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-md"
                >
                  {loading ? 'Verificando...' : 'Unirme a la Empresa'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                    Correo Registrado
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@constructora.es"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-md"
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Switchers */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2 text-[11px] font-semibold text-slate-500">
            {mode === 'login' ? (
              <>
                <div>
                  ¿No tienes cuenta?{' '}
                  <button 
                    onClick={() => setMode('register')} 
                    className="text-[#FF6600] font-bold hover:underline ml-0.5 cursor-pointer"
                  >
                    Crear Cuenta Gratuita
                  </button>
                </div>
                <div>
                  ¿Tienes un código de tu obra?{' '}
                  <button 
                    onClick={() => setMode('join_code')} 
                    className="text-slate-800 font-bold hover:underline ml-0.5 cursor-pointer"
                  >
                    Unirse con Código
                  </button>
                </div>
              </>
            ) : (
              <div>
                ¿Ya tienes cuenta activa?{' '}
                <button 
                  onClick={() => setMode('login')} 
                  className="text-[#FF6600] font-bold hover:underline ml-0.5 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
