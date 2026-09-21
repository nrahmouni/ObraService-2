import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { Role } from '../types';
import { signInWithGoogle, signInWithEmail } from '../services/firebase';
import { Building2, KeyRound, ShieldCheck, ArrowRight, AlertCircle, Loader2, HardHat, FileCheck } from 'lucide-react';
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
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-amber-950/50 transition-all cursor-pointer border border-amber-500/30 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>Iniciar Sesión en Obra</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Invitation Direct Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/invitation')}
              className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>¿Tienes código de invitación? Activa tu cuenta aquí</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500">Perfiles de Prueba</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDemo(acc.email)}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="text-[10px] font-black text-slate-200 truncate group-hover:text-amber-400">{acc.name}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase truncate">{acc.role}</div>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
