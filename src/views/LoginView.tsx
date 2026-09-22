import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { Role } from '../types';
import { signInWithEmail } from '../services/firebase';
import { Building2, ArrowRight, AlertCircle, Loader2, FileCheck, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);

  const DEMO_ACCOUNTS = [
    { name: 'Carlos Mendoza', role: 'Admin Constructora', email: 'carlos.mendoza@construccionesnorte.es' },
    { name: 'Javier Ortiz', role: 'Jefe de Obra', email: 'javier.ortiz@construccionesnorte.es' },
    { name: 'Elena Ramos', role: 'Subcontratista', email: 'elena.ramos@estructuraslevante.es' },
    { name: 'Super Admin', role: 'Super Admin', email: 'superadmin@obraservice.com' },
  ];

  useEffect(() => {
    let timer: any;
    if (lockSeconds > 0) {
      timer = setInterval(() => {
        setLockSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const redirectUserByRole = () => {
    const state = obraStore.getState();
    const isSuperAdminUser = state.currentUser?.isSuperAdmin === true || state.currentUser?.role === 'SUPER_ADMIN';

    if (isSuperAdminUser) {
      navigate('/admin/master');
    } else if (state.currentUser?.role === Role.WORKER) {
      navigate('/mobile/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSeconds > 0) {
      toast.error(`Formulario bloqueado. Reintente en ${lockSeconds}s.`);
      return;
    }

    if (!navigator.onLine) {
      toast.error('Sin conexión a internet');
    }

    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const isDemo = DEMO_ACCOUNTS.some(acc => acc.email.toLowerCase() === cleanEmail);

    try {
      if (isDemo || password === 'demo-2026') {
        obraStore.enterDemoMode();
        const res = obraStore.login(cleanEmail);
        if (res.success) {
          setLoading(false);
          setFailedAttempts(0);
          toast.success('Sesión iniciada correctamente');
          redirectUserByRole();
          return;
        }
      }

      // Try Firebase authentication first, with graceful fallback to demo mode if firebase is unconfigured
      try {
        await signInWithEmail(cleanEmail, password);
      } catch (fbErr) {
        // If Firebase auth fails and it's a valid demo email or test password, fallback to demo mode
        if (isDemo) {
          obraStore.enterDemoMode();
          const res = obraStore.login(cleanEmail);
          if (res.success) {
            setLoading(false);
            setFailedAttempts(0);
            toast.success('Sesión iniciada correctamente (Modo Demostración)');
            redirectUserByRole();
            return;
          }
        }
        throw fbErr;
      }

      setLoading(false);
      setFailedAttempts(0);
      toast.success('Sesión iniciada correctamente');
      redirectUserByRole();
    } catch (err: any) {
      setLoading(false);
      setPassword(''); // Clear password field on error
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setLockSeconds(30);
        setError('Demasiados intentos fallidos. El formulario ha sido bloqueado por 30 segundos por seguridad.');
        toast.error('Bloqueo de seguridad activado por 30s');
      } else {
        setError(err.message || 'El correo electrónico o la contraseña no son correctos.');
      }
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo-2026');
    setError('');
    
    obraStore.enterDemoMode();
    const res = obraStore.login(demoEmail);
    if (res.success) {
      toast.success(`Accediendo como ${demoEmail}`);
      redirectUserByRole();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 md:p-8 selection:bg-amber-600">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 bg-slate-950 text-white text-center border-b border-slate-800 relative">
          <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-950/50 border border-amber-500/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">ObraService B2B</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Control de Obras, Partes y Subcontratas</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-950/70 border border-red-800/80 rounded-2xl flex items-center gap-2.5 text-red-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Correo Electrónico Corporativo
            </label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@constructora.es"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-base sm:text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Contraseña
            </label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-base sm:text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || lockSeconds > 0}
            className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-amber-950/50 transition-all cursor-pointer border border-amber-500/30 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : lockSeconds > 0 ? (
              <span>Bloqueado ({lockSeconds}s)</span>
            ) : (
              <>
                <span>Iniciar Sesión en Obra</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Register Company / Onboarding Direct Link */}
          <div className="pt-2 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>¿Nueva Empresa? Registrar y Crear Espacio</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/invitation')}
              className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center justify-center gap-1.5 py-1"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>¿Tienes código de invitación de obra? Activa tu cuenta</span>
            </button>
          </div>

          {import.meta.env.DEV && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500">Perfiles de Prueba</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="flex flex-col space-y-2">
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickDemo(acc.email)}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-black text-slate-200 truncate group-hover:text-amber-400">{acc.name}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase truncate mt-0.5">{acc.role}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
