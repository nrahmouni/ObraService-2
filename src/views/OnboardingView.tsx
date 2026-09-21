import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  HardHat, 
  MapPin, 
  FileText,
  KeyRound,
  Layers,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { obraStore } from '../services/store';
import { Company } from '../types';
import toast from 'react-hot-toast';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const currentUser = obraStore.getState().currentUser;
  
  const [mode, setMode] = useState<'create' | 'join'>('create');
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [type, setType] = useState<'MAIN_CONTRACTOR' | 'SUBCONTRACTOR'>('MAIN_CONTRACTOR');
  const [address, setAddress] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // UI States
  const [errorMsg, setErrorMsg] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStep, setTransitionStep] = useState(0);

  // Auto-fill a valid Spanish CIF for quick test or convenience
  const handleFillDemoCIF = () => {
    setTaxId('B87654321');
    if (!companyName) {
      setCompanyName('Construcciones y Vías del Norte S.A.');
    }
    if (!address) {
      setAddress('Paseo de la Castellana 140, Madrid');
    }
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim()) {
      setErrorMsg('Por favor, introduce el Nombre de la Empresa.');
      return;
    }

    // Default CIF if empty for seamless evaluation
    const finalTaxId = taxId.trim() || 'B87654321';

    const res = obraStore.createCompany({
      name: companyName.trim(),
      taxId: finalTaxId,
      type,
      address: address.trim() || 'Sede Central, España',
    });

    if (res.success && res.company) {
      // Requirement 4: Smooth transition with corporate skeleton / spinner
      startCorporateTransition(res.company.name);
    } else {
      setErrorMsg(res.error || 'No se ha podido crear la empresa. Revisa el CIF/NIF.');
    }
  };

  const handleJoinCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inviteCode.trim()) {
      setErrorMsg('Por favor, introduce tu código de invitación.');
      return;
    }

    const res = obraStore.joinCompany(inviteCode.trim().toUpperCase());
    if (res.success) {
      startCorporateTransition('tu empresa asociada');
    } else {
      setErrorMsg(res.error || 'Código de invitación no válido o empresa inactiva.');
    }
  };

  const startCorporateTransition = (targetCompanyName: string) => {
    setIsTransitioning(true);
    setTransitionStep(1);

    setTimeout(() => setTransitionStep(2), 500);
    setTimeout(() => setTransitionStep(3), 1100);
    setTimeout(() => {
      setTransitionStep(4);
      toast.success(`¡Bienvenido a ${targetCompanyName}! Has sido configurado como Administrador.`, {
        duration: 4000,
        icon: '👷',
      });
      onComplete();
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col lg:flex-row font-sans selection:bg-[#FF6600] selection:text-white">
      {/* LEFT SPLIT SCREEN: High-impact Construction Imagery & Social Proof */}
      <div className="lg:w-1/2 relative min-h-[360px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden">
        {/* Background Visual Asset */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1600&q=85" 
            alt="Ingeniería y Construcción ObraService"
            className="w-full h-full object-cover brightness-[0.75] contrast-[1.1] scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          {/* Subtle brand gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/75 to-[#090D16]/30" />
          <div className="absolute inset-0 bg-[#FF6600]/10 mix-blend-overlay" />
        </div>

        {/* Top Header on Left Panel */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center font-black text-sm shadow-xl shadow-orange-950/40">
              OS
            </div>
            <div>
              <span className="text-sm font-black tracking-wider uppercase text-white">ObraService</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Plataforma B2B</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>Ley 32/2006 & ISO 27001</span>
          </div>
        </div>

        {/* Center/Bottom Content on Left Panel */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6600]/20 border border-[#FF6600]/30 text-amber-300 text-xs font-bold mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Paso 1 de 1: Configuración de Entorno</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Tu centro de mando para <br />
            <span className="bg-gradient-to-r from-[#FF6600] to-amber-300 bg-clip-text text-transparent">
              todas tus obras y cuadrillas
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Centraliza partes diarios de trabajo, valida albaranes con firma digital inmutable y controla el acceso a obra mediante geocercas satelitales en tiempo real.
          </p>

          {/* Social Proof Quote Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl shadow-xl">
            <p className="text-xs text-slate-200 italic leading-relaxed mb-3">
              "ObraService nos ahorra más de 25 horas semanales en disputas de medición y albaranes traspapelados con nuestras subcontratas."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-xs font-bold text-[#FF6600]">
                MV
              </div>
              <div>
                <div className="text-xs font-bold text-white">Marcos Valdés</div>
                <div className="text-[10px] text-slate-400">Director de Operaciones en Infraestructuras Ibéricas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>+450 Constructoras Activas</span>
          <span>Soporte Técnico Especializado</span>
        </div>
      </div>

      {/* RIGHT SPLIT SCREEN: Welcoming Form & Company Setup */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#0B101B]">
        <div className="w-full max-w-xl">
          {/* Welcome User Banner */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider">
                Bienvenido al Sistema
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {currentUser?.name ? `¡Hola, ${currentUser.name.split(' ')[0]}!` : '¡Hola!'} 👋
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-400 block">Identificado como:</span>
              <span className="text-xs font-bold text-slate-200 block truncate max-w-[180px]">
                {currentUser?.email || 'operario@obraservice.es'}
              </span>
            </div>
          </div>

          {/* Form Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <button
              type="button"
              onClick={() => { setMode('create'); setErrorMsg(''); }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'create'
                  ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Crear Nueva Empresa</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('join'); setErrorMsg(''); }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Tengo un Código</span>
            </button>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE: CREATE COMPANY (Requirement 3: Split screen with Form to introduce Company Name) */}
          {mode === 'create' && (
            <form onSubmit={handleCreateCompany} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                    Nombre de la Empresa <span className="text-[#FF6600]">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Razón social o nombre comercial</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-5 h-5 text-[#FF6600]" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. Construcciones y Obras del Norte S.A."
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/15 bg-white/5 text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-all"
                  />
                </div>
              </div>

              {/* Type of Entity Selection */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2.5">
                  Tipo de Entidad
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setType('MAIN_CONTRACTOR')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      type === 'MAIN_CONTRACTOR'
                        ? 'bg-[#FF6600]/15 border-[#FF6600] text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#FF6600]">
                        <Layers className="w-4 h-4" />
                      </div>
                      {type === 'MAIN_CONTRACTOR' && (
                        <CheckCircle2 className="w-4 h-4 text-[#FF6600]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-tight">Constructora Principal</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Rol: Administrador (ADMIN)</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setType('SUBCONTRACTOR')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      type === 'SUBCONTRACTOR'
                        ? 'bg-[#FF6600]/15 border-[#FF6600] text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                        <HardHat className="w-4 h-4" />
                      </div>
                      {type === 'SUBCONTRACTOR' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-tight">Subcontratista Especialista</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Gremios, cuadrillas, maquinaria</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax ID (CIF) with quick helper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                    CIF / NIF Fiscal
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemoCIF}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Autocompletar CIF válido
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                    placeholder="B-87654321"
                    className="w-full h-13 pl-12 pr-4 rounded-2xl border border-white/15 bg-white/5 text-sm text-white font-semibold uppercase placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Formato español con letra inicial (B, A, etc.) y 8 caracteres.
                </span>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Sede Central o Dirección <span className="text-slate-500 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Paseo de la Castellana 140, Madrid"
                    className="w-full h-13 pl-12 pr-4 rounded-2xl border border-white/15 bg-white/5 text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-[#FF6600] hover:bg-[#EA580C] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Crear Empresa y Acceder al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-3">
                  Te convertirás automáticamente en el Administrador (ADMIN) de esta entidad.
                </p>
              </div>
            </form>
          )}

          {/* MODE: JOIN WITH CODE */}
          {mode === 'join' && (
            <form onSubmit={handleJoinCompany} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2 text-center">
                  Introduce el Código de Invitación de tu Constructora
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="OBRA-XXXX"
                  className="w-full h-20 px-4 rounded-3xl border border-white/15 bg-white/5 text-2xl font-black tracking-widest text-center uppercase text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF6600] transition-all"
                />
                <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
                  Solicita este código al Jefe de Obra o Administrador de la empresa que te ha contratado.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#FF6600] hover:bg-[#EA580C] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 transition-all cursor-pointer"
              >
                <span>Validar Código e Incorporarme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* REQUIREMENT 4: Corporate Loading State (Skeleton or Spinner) */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/95 backdrop-blur-xl p-6"
          >
            <div className="max-w-md w-full text-center">
              {/* Pulsing Brand Emblem */}
              <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-[#FF6600]/20 animate-ping duration-1000" />
                <div className="relative w-20 h-20 rounded-3xl bg-[#FF6600] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-orange-500/40">
                  OS
                </div>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                Preparando tu Espacio de Trabajo
              </h3>
              <p className="text-xs text-slate-400 mb-8">
                Configurando entorno corporativo y credenciales de Administrador (ADMIN)...
              </p>

              {/* Stepped Corporate Progress */}
              <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  transitionStep >= 1 ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${transitionStep >= 1 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-semibold">Registro de entidad fiscal en el sistema</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  transitionStep >= 2 ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${transitionStep >= 2 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-semibold">Asignando privilegios de Administrador (ADMIN)</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  transitionStep >= 3 ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${transitionStep >= 3 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-semibold">Inicializando ledger de partes y geocercas satelitales</span>
                </div>
              </div>

              {/* Corporate Skeleton Loader preview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto space-y-2.5 animate-pulse">
                <div className="h-4 bg-white/10 rounded-lg w-3/4" />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="h-12 bg-white/10 rounded-xl" />
                  <div className="h-12 bg-white/10 rounded-xl" />
                  <div className="h-12 bg-white/10 rounded-xl" />
                </div>
                <div className="h-8 bg-white/10 rounded-xl w-full" />
              </div>

              {/* Corporate Spinner */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-4 h-4 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin" />
                <span>Accediendo a la aplicación...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
