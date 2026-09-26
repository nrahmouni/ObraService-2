import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obraStore } from '../services/store';
import { Role } from '../types';
import { signInWithEmail } from '../services/firebase';
import { Building2, ArrowRight, AlertCircle, Loader2, FileCheck, HardHat, ChevronRight } from 'lucide-react';
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
    { name: 'Carlos Mendoza', role: 'Administrador', email: 'carlos.mendoza@construccionesnorte.es' },
    { name: 'Javier Ortiz', role: 'Jefe de Obra', email: 'javier.ortiz@construccionesnorte.es' },
    { name: 'Elena Ramos', role: 'Subcontrata', email: 'elena.ramos@estructuraslevante.es' },
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
      toast.error(`Acceso bloqueado temporalmente. Reintente en ${lockSeconds}s.`);
      return;
    }

    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const isDemo = DEMO_ACCOUNTS.some(acc => acc.email.toLowerCase() === cleanEmail);

    try {
      if (isDemo) {
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

      try {
        await signInWithEmail(cleanEmail, password);
      } catch (fbErr) {
        const res = obraStore.login(cleanEmail);
        if (!res.success) {
          throw new Error('Credenciales incorrectas.');
        }
      }

      setLoading(false);
      setFailedAttempts(0);
      toast.success('Bienvenido de nuevo');
      redirectUserByRole();
    } catch (err: any) {
      setLoading(false);
      setPassword('');
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setLockSeconds(30);
        setError('Demasiados intentos fallidos. Bloqueo de 30 segundos activado por seguridad.');
        toast.error('Seguridad: Bloqueo activado');
      } else {
        setError(err.message || 'Credenciales incorrectas. Verifique su correo y contraseña.');
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
      toast.success(`Acceso como ${demoEmail}`);
      redirectUserByRole();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#18181b] text-white flex flex-col justify-center items-center px-4 py-8 sm:p-6 theme-neumorphic" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/20 group-hover:scale-110 transition-transform">
              <HardHat className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter text-white uppercase">ObraService B2B</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Acceso a la plataforma</h1>
            <p className="text-sm text-zinc-400">Gestione sus obras, partes y equipos en tiempo real.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8 rounded-3xl neu-dark-flat space-y-6 border border-white/[0.04]">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-500 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="label-text">Correo Electrónico Corporativo</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                className="input-field neu-dark-pressed"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label-text">Contraseña</label>
                <a href="#" className="text-[11px] font-bold text-brand-accent hover:underline">¿Olvidó su contraseña?</a>
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field neu-dark-pressed"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || lockSeconds > 0}
              className="btn-primary w-full h-12 text-sm uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/20 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Entrar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-[#18181b] px-4 text-zinc-400">O accede con demo</span></div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDemo(acc.email)}
                className="flex items-center justify-between p-3.5 rounded-2xl neu-dark-button border border-white/[0.03] transition-all group text-left cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-brand-accent">{acc.name}</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-0.5">{acc.role}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-zinc-400 font-medium">
            ¿No tienes una cuenta?{' '}
            <button onClick={() => navigate('/onboarding')} className="text-brand-accent font-bold hover:underline cursor-pointer">Regístrate gratis</button>
          </p>
          <button
            onClick={() => navigate('/invitation')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-dark-button text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-blue-500" />
            <span>Tengo un código de invitación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
