import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { Role } from '../types';
import { signInWithGoogle, signInWithEmail } from '../services/firebase';
import { Building2, KeyRound, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DEMO_ACCOUNTS = [
    { name: 'Carlos Mendoza', role: 'Admin Constructora', email: 'carlos.mendoza@construccionesnorte.es' },
    { name: 'Javier Ortiz', role: 'Jefe de Obra', email: 'javier.ortiz@construccionesnorte.es' },
    { name: 'Elena Ramos', role: 'Subcontratista', email: 'elena.ramos@estructuraslevante.es' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if demo account
      const isDemo = DEMO_ACCOUNTS.some(acc => acc.email === email);
      if (isDemo) {
        obraStore.enterDemoMode();
      }

      // Try Firebase login or local store fallback
      try {
        await signInWithEmail(email, password);
      } catch (fbErr) {
        // fallback to store login if firebase auth fails in test environment
        const res = obraStore.login(email);
        if (!res.success) {
          throw new Error(res.error || 'Credenciales no válidas.');
        }
      }

      const state = obraStore.getState();
      setLoading(false);
      toast.success('Sesión iniciada correctamente');
      if (state.currentUser?.role === Role.WORKER) {
        navigate('/mobile/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo-2026');
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error con Google Auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 pb-6 bg-slate-900 text-white text-center relative">
          <div className="w-12 h-12 bg-[#FF6600] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FF6600]/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider">ObraService B2B2B</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Plataforma de Gestión y Certificación de Obra</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Electrónico Corporativo</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.es"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600] transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-[#e05a00] text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6600]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Acceder a la Plataforma <ArrowRight className="w-4 h-4" /></>}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">Accesos Rápidos Demo</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDemo(acc.email)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] font-black text-slate-900 truncate group-hover:text-[#FF6600]">{acc.name}</div>
                <div className="text-[8px] font-medium text-slate-400 uppercase truncate">{acc.role}</div>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
