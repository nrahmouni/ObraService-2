import React, { useState } from 'react';
import { Building2, Users, ArrowRight, CheckCircle2, Copy, AlertCircle, Sparkles, Zap, Briefcase, HardHat } from 'lucide-react';
import { obraStore } from '../services/store';
import { Company } from '../types';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'choose' | 'create_company' | 'join_company' | 'success_company'>('choose');

  // Create form
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [type, setType] = useState<'MAIN_CONTRACTOR' | 'SUBCONTRACTOR'>('MAIN_CONTRACTOR');
  const [address, setAddress] = useState('');

  // Join form
  const [inviteCode, setInviteCode] = useState('');

  // Created company result
  const [createdCompany, setCreatedCompany] = useState<Company | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fillCompanyPreset = (presetName: string, presetTaxId: string, presetType: 'MAIN_CONTRACTOR' | 'SUBCONTRACTOR', presetAddr: string) => {
    setName(presetName);
    setTaxId(presetTaxId);
    setType(presetType);
    setAddress(presetAddr);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = obraStore.createCompany({
      name,
      taxId,
      type,
      address,
    });

    if (res.success && res.company) {
      setCreatedCompany(res.company);
      setStep('success_company');
    } else {
      setErrorMsg(res.error || 'No se ha podido crear la empresa.');
    }
  };

  const handleJoinCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = obraStore.joinCompany(inviteCode);
    if (res.success) {
      onComplete();
    } else {
      setErrorMsg(res.error || 'Código de invitación no válido.');
    }
  };

  const handleCopyCode = () => {
    if (createdCompany?.inviteCode) {
      navigator.clipboard.writeText(createdCompany.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full bg-[var(--brand-bg)] rounded-2xl shadow-xl border border-[var(--brand-border)] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[var(--brand-text)] text-[var(--brand-bg)] flex items-center justify-between border-b border-[var(--brand-border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D97706] font-display">
                Incorporación Inmediata (Máx 3 Clics)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display">
              Configura tu espacio de trabajo en ObraService
            </h1>
          </div>
          <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center font-black text-[#D97706] text-lg font-display">
            OS
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded bg-[#FFE4E6] border border-[#E11D48]/40 text-[#9F1239] text-xs flex items-start gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'choose' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Para comenzar a emitir partes diarios o revisar albaranes, vincula tu cuenta a una empresa constructora o subcontratista:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setStep('create_company'); setErrorMsg(''); }}
                  className="p-6 rounded border-2 border-[var(--brand-border)] hover:border-[#D97706] hover:bg-amber-50/30 text-left transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-amber-100 text-[#92400E] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-black text-[var(--brand-text)] mb-1 font-display uppercase tracking-tight">
                    Alta de Empresa
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Soy el <strong>Gerente o Administrador</strong> y quiero dar de alta mi Constructora o Subcontrata para gestionar obras y personal.
                  </p>
                </button>

                <button
                  onClick={() => { setStep('join_company'); setErrorMsg(''); }}
                  className="p-6 rounded border-2 border-[var(--brand-border)] hover:border-[#D97706] hover:bg-amber-50/30 text-left transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-slate-100 text-[#0F172A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-black text-[var(--brand-text)] mb-1 font-display uppercase tracking-tight">
                    Unirme como Jefe de Obra
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Mi empresa ya está registrada. Tengo un <strong>código de invitación</strong> para empezar a reportar partes diarios.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 'create_company' && (
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
                <h2 className="text-base font-black text-[#0F172A] font-display">
                  Alta de Empresa (Contratista o Subcontrata)
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                >
                  ← Volver
                </button>
              </div>

              {/* 1-Click Preset (Click 2) */}
              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase tracking-wide">
                  Plantilla Rápida de Ejemplo (Clic 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCompanyPreset('Obras y Edificaciones Ibéricas S.A.', 'A28901234', 'MAIN_CONTRACTOR', 'Paseo de la Castellana 140, Madrid')}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-amber-50 text-left text-slate-700 hover:text-[#92400E] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    🏢 Constructora Principal Ibérica S.A.
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCompanyPreset('Instalaciones & Climatización Centro S.L.', 'B87654321', 'SUBCONTRACTOR', 'Pol. Ind. Vallecas, C/ Silicio 8, Madrid')}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-amber-50 text-left text-slate-700 hover:text-[#92400E] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    🔧 Subcontrata Climatización Centro S.L.
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Construcciones García & Hijos S.L."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded border border-[#CBD5E1] text-xs text-[#0F172A] font-medium focus:outline-hidden focus:border-[#D97706]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                    NIF / CIF Español *
                  </label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                    placeholder="Ej. B12345678"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded border border-[#CBD5E1] text-xs uppercase font-mono font-bold text-[#0F172A] focus:outline-hidden focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                    Tipo de Empresa *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded border border-[#CBD5E1] text-xs font-bold text-[#0F172A] bg-white focus:outline-hidden"
                  >
                    <option value="MAIN_CONTRACTOR">Contratista Principal (Constructora)</option>
                    <option value="SUBCONTRACTOR">Empresa Subcontratista</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Domicilio Social / Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, código postal y ciudad"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded border border-[#CBD5E1] text-xs text-[#0F172A] font-medium focus:outline-hidden focus:border-[#D97706]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 rounded text-xs font-black uppercase tracking-wider text-white bg-[#D97706] hover:bg-[#B45309] transition-colors shadow-xs cursor-pointer active:translate-y-px"
                >
                  Registrar Empresa y Continuar (Clic 3)
                </button>
              </div>
            </form>
          )}

          {step === 'join_company' && (
            <form onSubmit={handleJoinCompany} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
                <h2 className="text-base font-black text-[#0F172A] font-display">
                  Unirse con Código de Invitación
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                >
                  ← Volver
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Introduce el código facilitado por tu empresa
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Ej. OBRA-NORTE-2026"
                  className="w-full min-h-[48px] px-4 py-3 rounded border border-[#CBD5E1] text-base font-mono tracking-widest text-center uppercase font-black text-[#0F172A] focus:outline-hidden focus:border-[#D97706]"
                />
                <p className="text-[11px] text-slate-700 mt-2 font-medium">
                  Si no dispones del código de invitación, solicítalo al administrador de tu constructora.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 rounded text-xs font-black uppercase tracking-wider text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-xs cursor-pointer active:translate-y-px"
                >
                  Confirmar y Entrar a la Empresa
                </button>
              </div>
            </form>
          )}

          {step === 'success_company' && createdCompany && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
                <h2 className="text-base font-black text-[#0F172A] font-display">
                  ¡Empresa Vinculada!
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-xs text-[#D97706] font-bold hover:underline cursor-pointer"
                >
                  ← Inicio
                </button>
              </div>

              <div className="p-4 rounded bg-[#D1FAE5] border border-[#059669]/40 text-[#065F46] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-black font-display">¡Empresa constituida con éxito!</h2>
                  <p className="text-xs font-medium mt-0.5">
                    Has sido asignado como <strong>Administrador de Contratista Principal</strong> para {createdCompany.name}.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded bg-[var(--brand-surface)] border border-[var(--brand-border)]">
                <span className="text-xs font-extrabold uppercase text-slate-700 block mb-2">
                  Código de Invitación para tu equipo y subcontratas:
                </span>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded bg-[var(--brand-bg)] border border-[var(--brand-border)] font-mono font-black text-lg tracking-wider text-[var(--brand-text)] flex-1 text-center">
                    {createdCompany.inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="min-h-[44px] px-4 py-2.5 rounded bg-[var(--brand-text)] text-[var(--brand-bg)] text-xs font-black uppercase tracking-wider hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedCode ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-700 mt-2 block font-medium">
                  Comparte este código con tus Jefes de Obra para que se unan a tu panel.
                </span>
              </div>

              <button
                onClick={onComplete}
                className="w-full min-h-[48px] py-3 rounded text-xs font-black uppercase tracking-wider text-white bg-[#D97706] hover:bg-[#B45309] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-px"
              >
                <span>Acceder al Panel de Control</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
