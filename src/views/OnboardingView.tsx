import React, { useState, useRef } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  HardHat, 
  MapPin, 
  KeyRound, 
  Users, 
  Copy, 
  Check, 
  Lock, 
  Mail, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Construction,
  Edit3
} from 'lucide-react';
import { obraStore } from '../services/store';
import { UserRole, CompanyType } from '../types';
import { validateSpanishTaxId } from '../domain/rules';
import toast from 'react-hot-toast';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const existingUser = obraStore.getState().currentUser;
  
  const [mode, setMode] = useState<'wizard' | 'join'>('wizard');

  // Progressive section expansion state (1: User, 2: Company, 3: Project, 4: Finish)
  const [unlockedSection, setUnlockedSection] = useState<number>(1);
  const [expandedSection, setExpandedSection] = useState<number>(1);

  // Section 1: User data
  const [adminName, setAdminName] = useState(existingUser?.name || '');
  const [adminEmail, setAdminEmail] = useState(existingUser?.email || '');
  const [adminPassword, setAdminPassword] = useState('');

  // Section 2: Company data
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('MAIN_CONTRACTOR');
  const [companyAddress, setCompanyAddress] = useState('');

  // Section 3: Project data
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(300);

  // Join Code Mode
  const [inviteCode, setInviteCode] = useState('');

  // UI States
  const [errorMsg, setErrorMsg] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalCompanyCode, setFinalCompanyCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Refs for scrolling smoothly to newly unlocked sections
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  // Validations & Progressive Unlocking
  const handleCompleteSection1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminName.trim()) {
      setErrorMsg('Por favor, indica tu nombre completo.');
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMsg('Por favor, introduce un correo electrónico válido.');
      return;
    }
    setErrorMsg('');
    setUnlockedSection(prev => Math.max(prev, 2));
    setExpandedSection(2);
    setTimeout(() => {
      section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCompleteSection2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('La Razón Social de la empresa es obligatoria.');
      return;
    }
    if (!taxId.trim()) {
      setErrorMsg('El CIF o NIF de la empresa es obligatorio.');
      return;
    }
    const cleanTax = taxId.trim().toUpperCase();
    if (!validateSpanishTaxId(cleanTax)) {
      setErrorMsg('El formato del CIF/NIF no es válido (ej. B12345678, A28000000 o 12345678Z).');
      return;
    }

    setErrorMsg('');
    setUnlockedSection(prev => Math.max(prev, 3));
    setExpandedSection(3);
    setTimeout(() => {
      section3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFinalizeRegistration = async () => {
    if (!projectName.trim()) {
      setErrorMsg('Indica el nombre de tu primera obra o proyecto.');
      return;
    }

    setErrorMsg('');
    setIsFinalizing(true);
    try {
      // 1. Create or register user
      let user = existingUser;
      if (!user) {
        const res = obraStore.register(adminName.trim(), adminEmail.trim());
        user = res.user!;
      }

      // 2. Persist new Company in store & Firestore
      const compRes = obraStore.createCompany({
        name: companyName.trim(),
        taxId: taxId.trim().toUpperCase(),
        type: companyType,
        address: companyAddress.trim() || 'España'
      });

      if (compRes.company) {
        setFinalCompanyCode(compRes.company.inviteCode);
        
        // 3. Persist initial Project in store & Firestore
        obraStore.createProject({
          name: projectName.trim(),
          address: projectAddress.trim() || 'Ubicación de obra',
          validationRadiusMeters: geofenceRadius,
          status: 'Active',
          location: { lat: 40.4168, lng: -3.7038, address: projectAddress.trim() || 'Madrid, España' }
        });
      }

      setIsCompleted(true);
      toast.success('🎉 ¡Empresa y obra inicial creadas con éxito!');
    } catch (e) {
      console.error(e);
      setErrorMsg('Error al persistir el registro. Por favor, inténtalo de nuevo.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Introduce el código de invitación recibido.');
      return;
    }
    const res = obraStore.joinCompany(inviteCode.trim().toUpperCase());
    if (res.success) {
      toast.success('Te has vinculado a la empresa correctamente.');
      onComplete();
    } else {
      setErrorMsg(res.error || 'El código introducido no es válido o ha expirado.');
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center p-4 sm:p-6 font-body">
        <div className="card p-6 sm:p-10 max-w-lg w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              ¡Empresa Configurada!
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted">
              Tu organización <strong className="text-white">{companyName}</strong> y la obra <strong className="text-white">{projectName}</strong> están listas para operar.
            </p>
          </div>

          <div className="bg-brand-surface p-4 sm:p-6 rounded-2xl border border-brand-border space-y-3 text-left">
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-wider block">
              Código de Invitación Corporativo
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-brand-bg rounded-xl border border-brand-accent/30 flex items-center justify-center text-lg sm:text-xl font-mono font-black text-white tracking-widest">
                {finalCompanyCode}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(finalCompanyCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                  toast.success('Código copiado al portapapeles');
                }}
                className="w-12 h-12 rounded-xl bg-brand-accent text-white flex items-center justify-center hover:bg-brand-accent/80 transition-all shrink-0 cursor-pointer"
                title="Copiar código de invitación"
              >
                {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Comparte este código con tus jefes de obra, encargados y subcontratas para que se unan al entorno de trabajo.
            </p>
          </div>

          <button 
            onClick={onComplete}
            className="btn-primary w-full h-12 sm:h-14 text-sm font-bold uppercase tracking-wider gap-2 cursor-pointer shadow-xl shadow-brand-accent/20"
          >
            <span>Acceder al Panel de Control</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-brand-bg flex flex-col items-center justify-start px-4 py-6 sm:py-12 font-body selection:bg-brand-accent selection:text-white">
      
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black text-brand-accent uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ObraService Registro Directo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Alta de Empresa y Obra
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Configuración progresiva en una sola pantalla. Completa cada bloque para avanzar.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-brand-surface border border-brand-border rounded-xl">
          <button 
            onClick={() => setMode('wizard')}
            className={`flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'wizard' ? 'bg-brand-accent text-white shadow-md' : 'text-brand-muted hover:text-white'
            }`}
          >
            Crear Empresa
          </button>
          <button 
            onClick={() => setMode('join')}
            className={`flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'join' ? 'bg-brand-accent text-white shadow-md' : 'text-brand-muted hover:text-white'
            }`}
          >
            Unirme con Código
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'wizard' ? (
          <div className="space-y-4">
            
            {/* PROGRESS VISUAL GUIDE */}
            <div className="bg-brand-surface/60 border border-brand-border p-3 rounded-2xl flex items-center justify-between gap-2">
              {[
                { step: 1, label: 'Tus Datos' },
                { step: 2, label: 'Empresa & CIF' },
                { step: 3, label: 'Primera Obra' }
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => {
                    if (unlockedSection >= s.step) {
                      setExpandedSection(s.step);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                    expandedSection === s.step 
                      ? 'bg-brand-accent text-white shadow-md' 
                      : unlockedSection >= s.step
                        ? 'bg-white/5 text-slate-300 hover:text-white cursor-pointer'
                        : 'text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px]">
                    {unlockedSection > s.step ? '✓' : s.step}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>

            {/* SECTION 1: USER DATA */}
            <div 
              ref={section1Ref}
              className={`card p-5 sm:p-6 transition-all duration-300 ${
                expandedSection === 1 ? 'border-brand-accent/50 ring-1 ring-brand-accent/20' : 'opacity-90'
              }`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 1 ? 0 : 1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    unlockedSection > 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-brand-accent text-white'
                  }`}>
                    {unlockedSection > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                      1. Datos de Administrador
                    </h2>
                    <p className="text-[11px] text-brand-muted">
                      {adminName ? `${adminName} (${adminEmail})` : 'Tu perfil de acceso y credenciales'}
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-lg text-brand-muted hover:text-white">
                  {expandedSection === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {expandedSection === 1 && (
                <div className="pt-4 mt-4 border-t border-brand-border space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Tu Nombre y Apellidos <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="input h-11 text-sm placeholder:text-zinc-500" 
                      placeholder="Ej. Juan Gómez Ruiz" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Correo Electrónico Corporativo <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="input h-11 text-sm placeholder:text-zinc-500" 
                      placeholder="juan@tuconstructora.es" 
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCompleteSection1}
                      className="btn-primary w-full h-11 text-xs font-bold uppercase tracking-wider gap-2 cursor-pointer"
                    >
                      <span>Continuar a Datos de Empresa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: COMPANY DATA (Unfolds progressively) */}
            {unlockedSection >= 2 && (
              <div 
                ref={section2Ref}
                className={`card p-5 sm:p-6 transition-all duration-300 animate-in slide-in-from-top-4 duration-200 ${
                  expandedSection === 2 ? 'border-brand-accent/50 ring-1 ring-brand-accent/20' : 'opacity-90'
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === 2 ? 0 : 2)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      unlockedSection > 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-brand-accent text-white'
                    }`}>
                      {unlockedSection > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                        2. Datos Fiscales de la Empresa
                      </h2>
                      <p className="text-[11px] text-brand-muted">
                        {companyName ? `${companyName} (${taxId})` : 'Razón social, CIF y tipo de contratista'}
                      </p>
                    </div>
                  </div>
                  <div className="p-1 rounded-lg text-brand-muted hover:text-white">
                    {expandedSection === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {expandedSection === 2 && (
                  <div className="pt-4 mt-4 border-t border-brand-border space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Razón Social / Nombre Comercial <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="input h-11 text-sm placeholder:text-zinc-500" 
                        placeholder="Ej. Construcciones Ibéricas Levante S.L." 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          CIF / NIF Español <span className="text-rose-400">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                          className="input h-11 text-sm uppercase placeholder:text-zinc-500 font-mono" 
                          placeholder="Ej. B12345678" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          Tipo de Empresa
                        </label>
                        <select
                          value={companyType}
                          onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                          className="input h-11 text-sm"
                        >
                          <option value="MAIN_CONTRACTOR">Contratista Principal</option>
                          <option value="SUBCONTRACTOR">Subcontratista Especializado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Domicilio Social / Sede Central
                      </label>
                      <input 
                        type="text" 
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="input h-11 text-sm placeholder:text-zinc-500" 
                        placeholder="Ej. Paseo de la Castellana 45, Madrid" 
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleCompleteSection2}
                        className="btn-primary w-full h-11 text-xs font-bold uppercase tracking-wider gap-2 cursor-pointer"
                      >
                        <span>Continuar a Configurar Obra</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: INITIAL PROJECT (Unfolds progressively) */}
            {unlockedSection >= 3 && (
              <div 
                ref={section3Ref}
                className={`card p-5 sm:p-6 transition-all duration-300 animate-in slide-in-from-top-4 duration-200 ${
                  expandedSection === 3 ? 'border-brand-accent/50 ring-1 ring-brand-accent/20' : 'opacity-90'
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === 3 ? 0 : 3)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-accent text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                        3. Primera Obra & Geocerca GPS
                      </h2>
                      <p className="text-[11px] text-brand-muted">
                        {projectName ? `${projectName} (${geofenceRadius}m)` : 'Nombre de la obra y radio de validación'}
                      </p>
                    </div>
                  </div>
                  <div className="p-1 rounded-lg text-brand-muted hover:text-white">
                    {expandedSection === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {expandedSection === 3 && (
                  <div className="pt-4 mt-4 border-t border-brand-border space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Nombre de la Obra <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="input h-11 text-sm placeholder:text-zinc-500" 
                        placeholder="Ej. Residencial Las Canteras - Fase I" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Dirección / Emplazamiento
                      </label>
                      <input 
                        type="text" 
                        value={projectAddress}
                        onChange={(e) => setProjectAddress(e.target.value)}
                        className="input h-11 text-sm placeholder:text-zinc-500" 
                        placeholder="Ej. Avda. de la Construcción 14, Valencia" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Radio de Validación GPS (Geofence en Tajo)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[150, 300, 500].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setGeofenceRadius(r)}
                            className={`h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              geofenceRadius === r 
                                ? 'bg-brand-accent border-brand-accent text-white shadow-md' 
                                : 'bg-brand-surface border-brand-border text-brand-muted hover:text-white'
                            }`}
                          >
                            {r} metros
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-brand-muted mt-1 block">
                        Margen de presencia permitido para emitir partes y fichajes en el tajo.
                      </span>
                    </div>

                    {/* Finalize Action Button */}
                    <div className="pt-3 border-t border-brand-border">
                      <button
                        type="button"
                        onClick={handleFinalizeRegistration}
                        disabled={isFinalizing}
                        className="btn-primary w-full h-12 text-sm font-bold uppercase tracking-wider gap-2 cursor-pointer shadow-xl shadow-brand-accent/25"
                      >
                        {isFinalizing ? (
                          <span>Guardando datos en Firestore...</span>
                        ) : (
                          <>
                            <span>Finalizar y Crear Espacio de Trabajo</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* JOIN WITH INVITE CODE VIEW */
          <div className="card p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Vincularse con Código de Obra
              </h2>
              <p className="text-xs text-brand-muted">
                Introduce el código corporativo que te ha proporcionado el contratista principal.
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-center">
                  Código de Invitación (6-8 Caracteres)
                </label>
                <input 
                  type="text" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input h-14 text-center text-2xl font-mono font-black tracking-widest uppercase placeholder:text-zinc-600" 
                  placeholder="OBRA-ABC12" 
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full h-12 text-xs font-bold uppercase tracking-wider gap-2 cursor-pointer"
              >
                <span>Acceder a la Organización</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <div className="pt-2 text-center">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            <span>Datos protegidos con cifrado y trazabilidad inmutable</span>
          </p>
        </div>

      </div>
    </div>
  );
};
