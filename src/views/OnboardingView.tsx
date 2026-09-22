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
  Users, 
  UserPlus, 
  Trash2, 
  Share2, 
  Copy, 
  Briefcase, 
  Navigation, 
  Check, 
  Lock, 
  Mail, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Clock, 
  Sparkle,
  Smartphone
} from 'lucide-react';
import { obraStore } from '../services/store';
import { UserRole, CompanyType } from '../types';
import toast from 'react-hot-toast';

interface OnboardingViewProps {
  onComplete: () => void;
}

export interface TeamInviteDraft {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const STORAGE_KEY = 'obraservice_onboarding_draft';

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const existingUser = obraStore.getState().currentUser;
  
  // Mode: 'wizard' (stepper from scratch) or 'join' (join with corporate code)
  const [mode, setMode] = useState<'wizard' | 'join'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Admin Account Creation
  const [adminName, setAdminName] = useState(existingUser?.name || '');
  const [adminEmail, setAdminEmail] = useState(existingUser?.email || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  // Step 2: Company Details & Fiscal Data
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('MAIN_CONTRACTOR');
  const [address, setAddress] = useState('');

  // Step 3: First Project Setup & Geofence
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(300);
  const [projectBudget, setProjectBudget] = useState<string>('250000');

  // Step 4: Team Members & Role Invitations
  const [teamMembers, setTeamMembers] = useState<TeamInviteDraft[]>([
    { id: '1', name: '', email: '', role: 'SITE_MANAGER' }
  ]);

  // Join Code Mode
  const [inviteCode, setInviteCode] = useState('');

  // UI, Draft & Finalizing States
  const [errorMsg, setErrorMsg] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalCompanyCode, setFinalCompanyCode] = useState('');
  const [createdSummary, setCreatedSummary] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // 1. Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep && parsed.currentStep <= 4) {
          setCurrentStep(parsed.currentStep);
        }
        if (parsed.adminName && !existingUser) setAdminName(parsed.adminName);
        if (parsed.adminEmail && !existingUser) setAdminEmail(parsed.adminEmail);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.taxId) setTaxId(parsed.taxId);
        if (parsed.companyType) setCompanyType(parsed.companyType);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.projectAddress) setProjectAddress(parsed.projectAddress);
        if (parsed.geofenceRadius) setGeofenceRadius(parsed.geofenceRadius);
        if (parsed.projectBudget) setProjectBudget(parsed.projectBudget);
        if (Array.isArray(parsed.teamMembers) && parsed.teamMembers.length > 0) {
          setTeamMembers(parsed.teamMembers);
        }
        setHasRestoredDraft(true);
      }
    } catch (e) {
      console.warn('Could not read onboarding draft from storage', e);
    }
  }, [existingUser]);

  // 2. Persist progress to localStorage on changes
  useEffect(() => {
    if (currentStep >= 5) return;
    try {
      const draft = {
        currentStep,
        adminName,
        adminEmail,
        companyName,
        taxId,
        companyType,
        address,
        projectName,
        projectAddress,
        geofenceRadius,
        projectBudget,
        teamMembers,
        lastSavedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save onboarding draft', e);
    }
  }, [
    currentStep,
    adminName,
    adminEmail,
    companyName,
    taxId,
    companyType,
    address,
    projectName,
    projectAddress,
    geofenceRadius,
    projectBudget,
    teamMembers
  ]);

  // Clear draft action
  const handleResetDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdminName(existingUser?.name || '');
    setAdminEmail(existingUser?.email || '');
    setAdminPassword('');
    setAdminPasswordConfirm('');
    setCompanyName('');
    setTaxId('');
    setCompanyType('MAIN_CONTRACTOR');
    setAddress('');
    setProjectName('');
    setProjectAddress('');
    setGeofenceRadius(300);
    setProjectBudget('250000');
    setTeamMembers([{ id: '1', name: '', email: '', role: 'SITE_MANAGER' }]);
    setCurrentStep(1);
    setErrorMsg('');
    setHasRestoredDraft(false);
    toast.success('Borrador restablecido.');
  };

  // Demo autofill helper
  const handleAutofillDemo = () => {
    if (!existingUser) {
      setAdminName('Carlos Mendoza');
      setAdminEmail('carlos.mendoza@ibéricos-obras.es');
      setAdminPassword('Obra2026!');
      setAdminPasswordConfirm('Obra2026!');
    }

    setCompanyName('Construcciones & Desarrollos Ibéricos S.A.');
    setTaxId('B87654321');
    setCompanyType('MAIN_CONTRACTOR');
    setAddress('Paseo de la Castellana 180, Madrid');

    setProjectName('Residencial Puerta de Hierro - Fase II');
    setProjectAddress('Calle de la Isla de Oza 12, Madrid');
    setGeofenceRadius(300);
    setProjectBudget('450000');

    setTeamMembers([
      { id: '1', name: 'Javier Ortiz', email: 'javier.ortiz@ibéricos-obras.es', role: 'SITE_MANAGER' },
      { id: '2', name: 'Elena Ramos', email: 'elena.ramos@estructuraslevante.es', role: 'SUBCONTRACTOR_USER' }
    ]);

    toast.success('Formulario completado con datos de prueba.');
  };

  // Team Draft Management
  const addTeamMemberRow = () => {
    setTeamMembers(prev => [
      ...prev,
      { id: String(Date.now()), name: '', email: '', role: 'SITE_MANAGER' }
    ]);
  };

  const removeTeamMemberRow = (id: string) => {
    if (teamMembers.length <= 1) {
      setTeamMembers([{ id: '1', name: '', email: '', role: 'SITE_MANAGER' }]);
    } else {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamInviteDraft, value: string) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Step 1 Validation (Admin Account)
  const validateStep1 = (): boolean => {
    setErrorMsg('');
    if (existingUser) return true;
    if (!adminName.trim()) {
      setErrorMsg('Por favor, indica tu nombre y apellidos.');
      return false;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMsg('Por favor, introduce un correo electrónico corporativo válido.');
      return false;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setErrorMsg('La contraseña debe contener al menos 6 caracteres.');
      return false;
    }
    if (adminPassword !== adminPasswordConfirm) {
      setErrorMsg('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  // Step 2 Validation (Company & Tax Data)
  const validateStep2 = (): boolean => {
    setErrorMsg('');
    if (!companyName.trim()) {
      setErrorMsg('Por favor, indica el nombre o razón social de la empresa.');
      return false;
    }
    if (!taxId.trim()) {
      setErrorMsg('Por favor, introduce el CIF / NIF fiscal de la empresa.');
      return false;
    }
    return true;
  };

  // Step 3 Validation (Project & Geofence)
  const validateStep3 = (): boolean => {
    setErrorMsg('');
    if (!projectName.trim()) {
      setErrorMsg('Indica el nombre de tu primer proyecto de obra.');
      return false;
    }
    return true;
  };

  // Step 4 Validation (Team)
  const validateStep4 = (): boolean => {
    setErrorMsg('');
    for (const m of teamMembers) {
      if (m.name.trim() && (!m.email.trim() || !m.email.includes('@'))) {
        setErrorMsg(`El correo de ${m.name} no parece ser un email válido.`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;

    if (currentStep === 4) {
      executeCompleteOnboarding();
      return;
    }

    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Execution
  const executeCompleteOnboarding = async () => {
    setIsFinalizing(true);
    setErrorMsg('');

    try {
      // 1. Ensure user is registered
      let activeUser = existingUser;
      if (!activeUser) {
        const regRes = obraStore.register(adminName.trim(), adminEmail.trim());
        if (!regRes.success || !regRes.user) {
          throw new Error(regRes.error || 'No se pudo crear la cuenta de usuario.');
        }
        activeUser = regRes.user;
      }

      // 2. Create the company
      const compRes = obraStore.createCompany({
        name: companyName.trim(),
        taxId: taxId.trim().toUpperCase(),
        type: companyType,
        address: address.trim() || 'Sede Central, España',
      });

      if (!compRes.success || !compRes.company) {
        throw new Error(compRes.error || 'No se pudo registrar la entidad fiscal.');
      }

      const createdCompany = compRes.company;
      setFinalCompanyCode(createdCompany.inviteCode);

      // 3. Create First Project
      let createdProject: any = null;
      if (projectName.trim()) {
        const projRes = obraStore.createProject({
          name: projectName.trim(),
          status: 'Active',
          location: {
            address: projectAddress.trim() || 'Dirección de obra principal',
            lat: 40.4168,
            lng: -3.7038,
            latitude: 40.4168,
            longitude: -3.7038,
          },
          address: projectAddress.trim() || 'Dirección de obra principal',
          latitude: 40.4168,
          longitude: -3.7038,
          validationRadiusMeters: geofenceRadius || 300,
          budget: Number(projectBudget) || 250000,
          spentBudget: 0,
          plannedWorkloadHours: 1200,
          assignedUserIds: [activeUser.id],
          assignedSubcontractorIds: [],
          startDate: new Date().toISOString().split('T')[0],
          description: 'Obra inicial creada durante la configuración del espacio de trabajo.'
        });
        if (projRes.success) {
          createdProject = projRes.project;
        }
      }

      // 4. Send Team Invitations
      const validInvites = teamMembers.filter(m => m.name.trim() && m.email.trim());
      let invitesSent = 0;
      for (const invitee of validInvites) {
        const invRes = obraStore.createInvitation(
          invitee.email.trim().toLowerCase(),
          invitee.role,
          createdCompany.id,
          activeUser.id,
          createdProject ? [createdProject.id] : []
        );
        if (invRes.success) invitesSent++;
      }

      // 5. Clear draft from localStorage on success
      localStorage.removeItem(STORAGE_KEY);

      // 6. Summary for Step 5
      setCreatedSummary({
        company: createdCompany,
        user: activeUser,
        project: createdProject,
        invitesCount: invitesSent
      });

      setIsFinalizing(false);
      setCurrentStep(5);
      toast.success(`¡Espacio de ${createdCompany.name} creado con éxito!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsFinalizing(false);
      setErrorMsg(err.message || 'Ocurrió un error al configurar el espacio de trabajo.');
      toast.error(err.message || 'Error en la configuración.');
    }
  };

  // Join Existing Company Handler
  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inviteCode.trim()) {
      setErrorMsg('Introduce el código de invitación corporativo.');
      return;
    }

    if (!existingUser && (!adminName.trim() || !adminEmail.trim())) {
      setErrorMsg('Por favor, indica tu nombre y correo para vincular la cuenta.');
      return;
    }

    if (!existingUser) {
      const reg = obraStore.register(adminName.trim(), adminEmail.trim());
      if (!reg.success) {
        setErrorMsg(reg.error || 'Error al crear perfil de usuario.');
        return;
      }
    }

    const res = obraStore.joinCompany(inviteCode.trim().toUpperCase());
    if (res.success) {
      localStorage.removeItem(STORAGE_KEY);
      toast.success('¡Te has vinculado con éxito a la empresa!');
      onComplete();
    } else {
      setErrorMsg(res.error || 'Código de invitación no válido o empresa inactiva.');
    }
  };

  const handleCopyCode = () => {
    if (finalCompanyCode) {
      navigator.clipboard.writeText(finalCompanyCode);
      setCopiedCode(true);
      toast.success('Código copiado al portapapeles.');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareCode = () => {
    if (finalCompanyCode && navigator.share) {
      navigator.share({
        title: `Únete a ${companyName} en ObraService`,
        text: `Hola, únete a nuestro entorno de obra en ObraService con el código: ${finalCompanyCode}`,
        url: window.location.origin
      }).catch(console.error);
    } else {
      handleCopyCode();
    }
  };

  const STEPS = [
    { num: 1, title: 'Cuenta Admin', desc: 'Credenciales de acceso', mobileShort: 'Cuenta' },
    { num: 2, title: 'Datos Empresa', desc: 'Identidad y CIF fiscal', mobileShort: 'Empresa' },
    { num: 3, title: 'Primer Proyecto', desc: 'Geocerca y presupuesto', mobileShort: 'Obra' },
    { num: 4, title: 'Equipo y Roles', desc: 'Jefes y subcontratas', mobileShort: 'Equipo' },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FF6600] selection:text-white pb-12 sm:pb-8">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0B101D]/95 backdrop-blur-md px-3 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-950/50 border border-orange-500/30 shrink-0">
            OS
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>ObraService</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Setup
              </span>
            </div>
            <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium block truncate max-w-[170px] sm:max-w-none">
              Puesta en Marcha
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentStep < 5 && (
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">Auto-Demo</span>
            </button>
          )}

          {hasRestoredDraft && currentStep < 5 && (
            <button
              type="button"
              onClick={handleResetDraft}
              title="Borrar borrador guardado"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-950/40 hover:text-rose-400 border border-white/10 text-slate-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
            <span>Ley 32/2006</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 flex flex-col justify-start sm:justify-center">
        {/* Switcher Mode: Wizard vs Join with Code */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 w-full max-w-sm">
            <button
              type="button"
              onClick={() => { setMode('wizard'); setErrorMsg(''); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'wizard'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Nueva Empresa</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('join'); setErrorMsg(''); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'join'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>Tengo Código</span>
            </button>
          </div>
        </div>

        {/* WIZARD STEPPER */}
        {mode === 'wizard' && (
          <div className="bg-[#0B101D] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-2xl relative overflow-hidden">
            {/* Stepper Header */}
            {currentStep < 5 && (
              <div className="mb-6 sm:mb-8">
                {/* Mobile Stepper Header (< sm) */}
                <div className="block sm:hidden mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                      Paso {currentStep} de 4: {STEPS[currentStep - 1].title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {Math.round((currentStep / 4) * 100)}%
                    </span>
                  </div>
                  <div className="flex gap-1.5 w-full [&>*]:flex-1">
                    {STEPS.map((s) => {
                      const isPassed = currentStep > s.num;
                      const isCurrent = currentStep === s.num;
                      return (
                        <div
                          key={s.num}
                          onClick={() => { if (isPassed) setCurrentStep(s.num); }}
                          className={`h-2 rounded-full transition-all ${
                            isPassed 
                              ? 'bg-emerald-500 cursor-pointer' 
                              : isCurrent 
                              ? 'bg-[#FF6600]' 
                              : 'bg-white/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Stepper Header (>= sm) */}
                <div className="hidden sm:flex flex-col space-y-2 mb-3">
                  {STEPS.map((s) => {
                    const isPassed = currentStep > s.num;
                    const isCurrent = currentStep === s.num;
                    return (
                      <div 
                        key={s.num}
                        onClick={() => {
                          if (isPassed) setCurrentStep(s.num);
                        }}
                        className={`p-2.5 rounded-2xl border transition-all select-none ${
                          isPassed
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 cursor-pointer'
                            : isCurrent
                            ? 'bg-orange-950/40 border-[#FF6600] text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            Paso {s.num}
                          </span>
                          {isPassed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-white truncate">{s.title}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Smooth Progress Line (Desktop) */}
                <div className="hidden sm:block w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#EA580C] to-[#F97316] h-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Creación de Cuenta de Administrador */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                    Paso 1 de 4 • Perfil de Administrador
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                    Crea tu Cuenta de Administrador
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Configura tus credenciales para gestionar el panel de obras y emitir informes oficiales.
                  </p>
                </div>

                {existingUser ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Sesión Activa Detectada</span>
                      <strong className="text-xs sm:text-sm font-black text-white block">{existingUser.name}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">{existingUser.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 sm:space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                        Nombre y Apellidos <span className="text-[#FF6600]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Ej. Carlos Mendoza Fernández"
                        className="w-full h-12 sm:h-13 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                        Correo Corporativo <span className="text-[#FF6600]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="carlos.mendoza@constructora.es"
                          className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3.5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                          Contraseña Segura <span className="text-[#FF6600]">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                          Confirmar Contraseña <span className="text-[#FF6600]">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={adminPasswordConfirm}
                            onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                            placeholder="Repite la contraseña"
                            className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Registro de Datos de Empresa */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                    Paso 2 de 4 • Entidad Corporativa & Fiscal
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                    Datos de la Empresa
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Esta entidad figurará como titular en los partes inmutables de trabajo y albaranes.
                  </p>
                </div>

                <div className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                      Nombre o Razón Social <span className="text-[#FF6600]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6600]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Construcciones y Obras del Norte S.A."
                        className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                      />
                    </div>
                  </div>

                  {/* Company Type Picker */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Tipo de Entidad
                    </label>
                    <div className="flex flex-col space-y-3">
                      <div
                        onClick={() => setCompanyType('MAIN_CONTRACTOR')}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          companyType === 'MAIN_CONTRACTOR'
                            ? 'bg-[#FF6600]/15 border-[#FF6600] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#FF6600]">
                            <Layers className="w-4 h-4" />
                          </div>
                          {companyType === 'MAIN_CONTRACTOR' && (
                            <CheckCircle2 className="w-4 h-4 text-[#FF6600]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-tight text-white">Constructora Principal</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Control central de tajos, jefes de obra y certificaciones.</div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCompanyType('SUBCONTRACTOR')}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          companyType === 'SUBCONTRACTOR'
                            ? 'bg-[#FF6600]/15 border-[#FF6600] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                            <HardHat className="w-4 h-4" />
                          </div>
                          {companyType === 'SUBCONTRACTOR' && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-tight text-white">Subcontratista Especialista</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Estructuras, albañilería, fontanería, electricidad o maquinaria.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CIF & Address */}
                  <div className="flex flex-col space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                          CIF / NIF Fiscal <span className="text-[#FF6600]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setTaxId('B87654321')}
                          className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Usar Ejemplo
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                          placeholder="B87654321"
                          className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-mono font-bold uppercase placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                        Sede Fiscal / Domicilio
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Paseo de la Castellana 140, Madrid"
                          className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Configuración Inicial de Primer Proyecto */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                    Paso 3 de 4 • Centro Operativo Inicial
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                    Configuración de tu Primera Obra
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Crea tu primer tajo con geocerca GPS para controlar la ubicación real de firmas y partes diarios.
                  </p>
                </div>

                <div className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                      Nombre del Proyecto / Obra <span className="text-[#FF6600]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6600]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Ej. Residencial Puerta de Hierro - Fase II"
                        className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3.5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                        Emplazamiento / Dirección
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={projectAddress}
                          onChange={(e) => setProjectAddress(e.target.value)}
                          placeholder="Calle de la Isla de Oza 12, Madrid"
                          className="w-full h-12 sm:h-13 pl-10 sm:pl-12 pr-3.5 sm:pr-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                        Presupuesto Estimado (€)
                      </label>
                      <input
                        type="number"
                        value={projectBudget}
                        onChange={(e) => setProjectBudget(e.target.value)}
                        placeholder="250000"
                        className="w-full h-12 sm:h-13 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Radio de Geocerca GPS de Validación
                    </label>
                    <div className="flex flex-col space-y-2">
                      {[150, 300, 500].map((radius) => (
                        <button
                          key={radius}
                          type="button"
                          onClick={() => setGeofenceRadius(radius)}
                          className={`h-11 sm:h-12 rounded-xl sm:rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            geofenceRadius === radius
                              ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{radius}m</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      El sistema comparará las coordenadas GPS del móvil con este radio ({geofenceRadius}m) para asegurar que las firmas se ejecutan a pie de obra.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Invitación Rápida a Miembros del Equipo */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
                      Paso 4 de 4 • Estructura de Equipo
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                      Invitación a Jefes y Subcontratas
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Agrega los miembros que emitirán partes o certificarán albaranes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addTeamMemberRow}
                    className="self-start sm:self-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#FF6600]" />
                    <span>Añadir Miembro</span>
                  </button>
                </div>

                {/* Team Draft Cards */}
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={member.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6600]">
                          Miembro #{index + 1}
                        </span>
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTeamMemberRow(member.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2.5">
                        <div className="w-full">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                            placeholder="Ej. Javier Ortiz"
                            className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-base sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF6600]"
                          />
                        </div>

                        <div className="w-full">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Email Corporativo
                          </label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                            placeholder="javier@constructora.es"
                            className="w-full h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-base sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF6600]"
                          />
                        </div>

                        <div className="w-full">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Rol Asignado
                          </label>
                          <select
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, 'role', e.target.value as UserRole)}
                            className="w-full h-11 px-3 rounded-xl border border-white/15 bg-[#0B101D] text-base sm:text-xs text-white focus:outline-none focus:border-[#FF6600]"
                          >
                            <option value="SITE_MANAGER">Jefe de Obra (SITE_MANAGER)</option>
                            <option value="SUBCONTRACTOR_USER">Subcontratista (SUBCONTRACTOR_USER)</option>
                            <option value="MAIN_CONTRACTOR_ADMIN">Administrador</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Final Confirmation & Activation */}
            {currentStep === 5 && createdSummary && (
              <div className="space-y-6 text-center py-2 sm:py-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping duration-1000" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl shadow-emerald-950/50">
                    <Check className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
                    ¡Entorno Listo para Operar!
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1">
                    {createdSummary.company.name}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    CIF <strong className="text-slate-200 font-mono">{createdSummary.company.taxId}</strong> • Administrador activado
                  </p>
                </div>

                {/* Invite Code Sharing Card */}
                <div className="max-w-md mx-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/15 text-left space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <KeyRound className="w-4 h-4 text-[#FF6600]" />
                      <span>Código de Invitación</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold uppercase">Único</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-[#070B14] p-3 rounded-xl sm:rounded-2xl border border-white/10 font-mono text-lg sm:text-xl font-black tracking-widest text-white">
                    <span>{finalCompanyCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copiar código"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Comparte este código con tus encargados y subcontratas para que se incorporen instantáneamente.
                  </p>

                  <button
                    type="button"
                    onClick={handleShareCode}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#FF6600]" />
                    <span>Compartir Código</span>
                  </button>
                </div>

                {/* Entry CTA */}
                <div className="pt-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={onComplete}
                    className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#d84f09] hover:to-[#ea580c] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/50 transition-all cursor-pointer"
                  >
                    <span>Entrar a mi Panel de Control</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons (Steps 1 to 4) */}
            {currentStep < 5 && (
              <div className="pt-5 sm:pt-7 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-3.5 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  disabled={isFinalizing}
                  onClick={handleNextStep}
                  className="px-5 sm:px-7 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#d84f09] hover:to-[#ea580c] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isFinalizing ? (
                    <span>Configurando...</span>
                  ) : currentStep === 4 ? (
                    <>
                      <span>Crear Empresa</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Continuar</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* JOIN MODE: Existing invitation code */}
        {mode === 'join' && (
          <div className="bg-[#0B101D] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-2xl max-w-xl mx-auto w-full">
            <div className="text-center mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center mx-auto mb-2.5">
                <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                Vincularme a una Empresa
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Introduce el código facilitado por tu constructora.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleJoinWithCode} className="space-y-4">
              {!existingUser && (
                <div className="space-y-3 pb-1">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                      Nombre y Apellidos <span className="text-[#FF6600]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Ej. Javier Ortiz"
                      className="w-full h-12 px-3.5 rounded-xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                      Correo Electrónico <span className="text-[#FF6600]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="javier.ortiz@constructora.es"
                      className="w-full h-12 px-3.5 rounded-xl border border-white/15 bg-white/5 text-base sm:text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 text-center">
                  Código Corporativo
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="NORTE2026"
                  className="w-full h-14 sm:h-16 px-4 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 text-xl sm:text-2xl font-black tracking-widest text-center uppercase text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF6600] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#d84f09] hover:to-[#ea580c] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 transition-all cursor-pointer"
              >
                <span>Validar Código e Incorporarme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
