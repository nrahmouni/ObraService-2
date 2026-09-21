import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Building2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { obraStore } from '../services/store';
import { signInWithGoogle } from '../services/firebase';

interface AuthModalProps {
  initialMode: 'login' | 'register' | 'join_code' | 'forgot_password' | 'choose_role';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'join_code' | 'forgot_password' | 'choose_role'>(initialMode);
  
  // Selected role for registration
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Company fields (for integrated reg)
  const [companyName, setCompanyName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  
  // States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const DEMO_ACCOUNTS = [
    { name: 'Carlos Mendoza', role: 'Admin', email: 'carlos.mendoza@construccionesnorte.es', icon: Building2 },
    { name: 'Javier Ortiz', role: 'Jefe de Obra', email: 'javier.ortiz@construccionesnorte.es', icon: KeyRound },
    { name: 'Elena Ramos', role: 'Subcontrata', email: 'elena.ramos@estructuraslevante.es', icon: UserPlus },
  ];

  const fillQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('demo-access'); // Placeholder for UI
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
      setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (honeypot) {
      // Quietly reject bot submissions by simulating a loading state then closing
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1000);
      return;
    }

    if (mode === 'login') {
      // Check if it's a demo account
      const isDemo = DEMO_ACCOUNTS.some(acc => acc.email === email);
      if (isDemo) {
        obraStore.enterDemoMode();
      }

      const res = obraStore.login(email);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error || 'El correo electrónico o la contraseña no son correctos.');
      }
    } else if (mode === 'register') {
      const res = obraStore.register(name, email);
      if (res.success && res.user) {
        // If we have company data, create it immediately
        if (companyName && companyTaxId) {
          const compRes = obraStore.createCompany({
            name: companyName,
            taxId: companyTaxId,
            type: selectedRole === 'SUBCONTRACTOR_USER' ? 'SUBCONTRACTOR' : 'MAIN_CONTRACTOR',
            address: companyAddress || 'Dirección no especificada',
          });
          if (!compRes.success) {
            setErrorMessage(`Usuario creado, pero hubo un error con la empresa: ${compRes.error}`);
            setLoading(false);
            return;
          }
        }
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setErrorMessage(res.error || 'No se pudo completar el registro.');
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
        setErrorMessage('Por favor, indica tu correo electrónico.');
        return;
      }
      setSuccessMessage('Si tu cuenta existe, recibirás un enlace de restablecimiento seguro en tu bandeja de entrada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-orange-500/20">
              OS
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                {mode === 'login' && 'Acceso al Sistema'}
                {mode === 'choose_role' && 'Nuevo Registro'}
                {mode === 'register' && 'Crear Perfil'}
                {mode === 'join_code' && 'Unirse con Código'}
                {mode === 'forgot_password' && 'Recuperar Cuenta'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                ObraService v2.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] flex items-start gap-3 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] flex items-start gap-3 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Direct Firebase Google Sign-In */}
          <div className="mb-8">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-12 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              Continuar con Google
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative bg-white px-4 text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">
                O acceso manual
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anti-Spam Honeypot Field */}
                <div className="hidden absolute w-0 h-0 overflow-hidden" aria-hidden="true">
                  <input 
                    type="text" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    placeholder="No rellenar" 
                    tabIndex={-1} 
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@empresa.es"
                      className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña</label>
                      <button type="button" onClick={() => setMode('forgot_password')} className="text-[9px] text-[#FF6600] font-black uppercase tracking-widest hover:underline">¿La olvidaste?</button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98] shadow-xl shadow-slate-900/10"
                >
                  {loading ? 'Validando...' : 'Acceder al Sistema'}
                </button>

                {/* Compact Quick Access */}
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-center">Acceso Rápido Demo</p>
                  <div className="grid grid-cols-3 gap-3">
                    {DEMO_ACCOUNTS.map((acc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => fillQuickAccount(acc.email)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/30 hover:bg-white transition-all group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#FF6600] group-hover:scale-110 transition-all">
                          <acc.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-center line-clamp-1">{acc.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anti-Spam Honeypot Field */}
                <div className="hidden absolute w-0 h-0 overflow-hidden" aria-hidden="true">
                  <input 
                    type="text" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    placeholder="No rellenar" 
                    tabIndex={-1} 
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Javier Ortiz"
                      className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Correo Corporativo</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@empresa.es"
                      className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {(selectedRole === 'MAIN_CONTRACTOR_ADMIN' || selectedRole === 'SUBCONTRACTOR_USER') && (
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="text-[9px] font-black text-[#FF6600] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      Datos de Empresa
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Nombre Fiscal</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Construcciones Levante S.A."
                        className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98] shadow-xl shadow-slate-900/10">
                  {loading ? 'Procesando...' : 'Completar Registro'}
                </button>
                <button type="button" onClick={() => setMode('choose_role')} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">← Cambiar perfil</button>
              </form>
            )}

            {mode === 'choose_role' && (
              <div className="space-y-4">
                {[
                  { id: 'MAIN_CONTRACTOR_ADMIN', label: 'Constructora', desc: 'Gestión total de obras', icon: Building2 },
                  { id: 'SITE_MANAGER', label: 'Jefe de Obra', desc: 'Control de tajo y partes', icon: KeyRound },
                  { id: 'SUBCONTRACTOR_USER', label: 'Subcontrata', desc: 'Registro de operarios', icon: UserPlus },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => { setSelectedRole(role.id); setMode('register'); }}
                    className="w-full flex items-center gap-5 p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:border-[#FF6600]/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 text-left transition-all group cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:text-[#FF6600] transition-all">
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{role.label}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{role.desc}</div>
                    </div>
                  </button>
                ))}
                <button onClick={() => setMode('login')} className="w-full text-[9px] font-black text-[#FF6600] uppercase tracking-widest hover:underline pt-4 transition-colors">← Volver al login</button>
              </div>
            )}

            {mode === 'join_code' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-center">Introduce tu Código</label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="OBRA-XXXX"
                    className="w-full h-20 px-6 rounded-3xl border border-slate-100 bg-slate-50/50 text-2xl font-black tracking-[0.3em] text-center uppercase text-slate-900 focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all placeholder:text-slate-200"
                  />
                  <p className="text-[8px] text-slate-400 font-bold text-center uppercase tracking-widest mt-4 leading-relaxed">
                    Solicita este código al administrador de tu constructora para unirte a la red de confianza.
                  </p>
                </div>
                <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-xl shadow-slate-900/10">Validar Código</button>
                <button onClick={() => setMode('login')} className="w-full text-[9px] font-black text-[#FF6600] uppercase tracking-widest hover:underline transition-colors">← Volver al login</button>
              </form>
            )}

            {mode === 'forgot_password' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Correo de Recuperación</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@empresa.es"
                    className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF6600]/30 focus:bg-white transition-all"
                  />
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-4 leading-relaxed">
                    Te enviaremos un enlace seguro para restablecer tu contraseña.
                  </p>
                </div>
                <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-xl shadow-slate-900/10">Enviar Enlace</button>
                <button onClick={() => setMode('login')} className="w-full text-[9px] font-black text-[#FF6600] uppercase tracking-widest hover:underline transition-colors">← Volver al login</button>
              </form>
            )}
          </div>

          {/* Bottom Switchers for Login/Register */}
          {mode === 'login' && (
            <div className="mt-10 pt-6 border-t border-slate-100 text-center space-y-4">
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                ¿Nuevo en ObraService?{' '}
                <button onClick={() => setMode('choose_role')} className="text-[#FF6600] hover:underline ml-1">Crear Cuenta</button>
              </div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                ¿Tienes invitación?{' '}
                <button onClick={() => setMode('join_code')} className="text-slate-900 hover:underline ml-1">Usar Código</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
