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
  Smartphone,
  X,
  Target,
  Construction
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
  
  const [mode, setMode] = useState<'wizard' | 'join'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Admin
  const [adminName, setAdminName] = useState(existingUser?.name || '');
  const [adminEmail, setAdminEmail] = useState(existingUser?.email || '');
  const [adminPassword, setAdminPassword] = useState('');

  // Step 2: Company
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('MAIN_CONTRACTOR');

  // Step 3: Project
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(300);

  // Step 4: Team
  const [teamMembers, setTeamMembers] = useState<TeamInviteDraft[]>([
    { id: '1', name: '', email: '', role: 'SITE_MANAGER' }
  ]);

  // Join Code Mode
  const [inviteCode, setInviteCode] = useState('');

  // UI States
  const [errorMsg, setErrorMsg] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalCompanyCode, setFinalCompanyCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.taxId) setTaxId(parsed.taxId);
        if (parsed.projectName) setProjectName(parsed.projectName);
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (currentStep < 5) {
      const draft = { currentStep, companyName, taxId, projectName };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [currentStep, companyName, taxId, projectName]);

  const handleNextStep = () => {
    if (currentStep === 1 && !existingUser && !adminEmail) {
      setErrorMsg('El correo es obligatorio');
      return;
    }
    if (currentStep === 2 && !companyName) {
      setErrorMsg('La razón social es obligatoria');
      return;
    }
    if (currentStep === 3 && !projectName) {
      setErrorMsg('El nombre de la obra es obligatorio');
      return;
    }

    if (currentStep === 4) {
      handleFinalize();
      return;
    }

    setErrorMsg('');
    setCurrentStep(prev => prev + 1);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      // Logic for finalizing onboarding
      let user = existingUser;
      if (!user) {
        const res = obraStore.register(adminName || 'Admin', adminEmail);
        user = res.user!;
      }

      const compRes = obraStore.createCompany({
        name: companyName,
        taxId: taxId,
        type: companyType,
        address: 'Sede Central'
      });

      if (compRes.company) {
        setFinalCompanyCode(compRes.company.inviteCode);
        
        if (projectName) {
          obraStore.createProject({
            name: projectName,
            address: projectAddress,
            validationRadiusMeters: geofenceRadius,
            status: 'Active',
            location: { lat: 40.4168, lng: -3.7038, address: projectAddress }
          });
        }
      }

      localStorage.removeItem(STORAGE_KEY);
      setCurrentStep(5);
    } catch (e) {
      setErrorMsg('Error al finalizar el registro');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    const res = obraStore.joinCompany(inviteCode.toUpperCase());
    if (res.success) {
      onComplete();
    } else {
      setErrorMsg('Código no válido');
    }
  };

  const steps = [
    { id: 1, title: 'Usuario', icon: UserCheck },
    { id: 2, title: 'Empresa', icon: Building2 },
    { id: 3, title: 'Proyecto', icon: Construction },
    { id: 4, title: 'Equipo', icon: Users }
  ];

  if (currentStep === 5) {
    return (
      <div className="min-h-[100dvh] bg-brand-bg flex items-center justify-center p-4 sm:p-6">
        <div className="card p-6 sm:p-12 max-w-lg w-full text-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">¡Todo Listo!</h1>
              <p className="text-xs sm:text-sm text-brand-muted font-medium">Tu espacio de trabajo ha sido configurado correctamente.</p>
           </div>

           <div className="bg-brand-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border space-y-3 sm:space-y-4">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Código de Invitación Corporativa</span>
              <div className="flex items-center gap-2 sm:gap-3">
                 <div className="flex-1 h-12 sm:h-14 bg-brand-bg rounded-xl border border-brand-accent/30 flex items-center justify-center text-xl sm:text-2xl font-mono font-black text-white tracking-widest">
                    {finalCompanyCode}
                 </div>
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(finalCompanyCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-accent text-white flex items-center justify-center hover:bg-brand-accent/80 transition-all shrink-0 min-h-[44px]"
                 >
                    {copiedCode ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Copy className="w-5 h-5 sm:w-6 sm:h-6" />}
                 </button>
              </div>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-tighter">Comparte este código con tu equipo para vincularlos a la organización.</p>
           </div>

           <button onClick={onComplete} className="btn-primary w-full h-12 sm:h-14 text-sm sm:text-base">
              Comenzar Operativa
              <ArrowRight className="w-5 h-5 ml-2" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-brand-bg flex flex-col items-center justify-center px-4 py-8 sm:p-6 relative overflow-hidden" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              ObraService Onboarding
           </div>
           <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">Configura tu Entorno</h1>
           <p className="text-xs sm:text-sm text-brand-muted font-medium">Digitaliza tu obra en menos de 3 minutos.</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-brand-surface border border-brand-border rounded-xl sm:rounded-2xl">
           <button 
            onClick={() => setMode('wizard')}
            className={`flex-1 h-11 sm:h-12 rounded-lg sm:rounded-xl text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${mode === 'wizard' ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-muted hover:text-white'}`}
           >
              Nueva Empresa
           </button>
           <button 
            onClick={() => setMode('join')}
            className={`flex-1 h-11 sm:h-12 rounded-lg sm:rounded-xl text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${mode === 'join' ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-muted hover:text-white'}`}
           >
              Unirse con Código
           </button>
        </div>

        {mode === 'wizard' ? (
          <div className="card p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             {/* Mobile Stepper Indicator */}
             <div className="sm:hidden flex items-center justify-between pb-4 border-b border-brand-border">
               <div className="flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-accent text-white text-[11px] font-black flex items-center justify-center shrink-0">
                   {currentStep}
                 </span>
                 <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                   Paso {currentStep}/4: {steps.find(s => s.id === currentStep)?.title}
                 </span>
               </div>
               <div className="flex gap-1.5 shrink-0">
                 {steps.map(s => (
                   <div 
                     key={s.id} 
                     className={`h-1.5 rounded-full transition-all ${
                       currentStep === s.id ? 'bg-brand-accent w-6' : 
                       currentStep > s.id ? 'bg-emerald-500 w-3' : 'bg-brand-border w-3'
                     }`} 
                   />
                 ))}
               </div>
             </div>

             {/* Desktop Stepper */}
             <div className="hidden sm:flex items-center justify-between relative mb-12">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-border -translate-y-1/2 z-0" />
                {steps.map(step => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                       currentStep === step.id ? 'bg-brand-accent border-brand-accent text-white scale-110 shadow-lg shadow-brand-accent/20' : 
                       currentStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-brand-bg border-brand-border text-brand-muted'
                     }`}>
                        {currentStep > step.id ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? 'text-white' : 'text-brand-muted'}`}>
                        {step.title}
                     </span>
                  </div>
                ))}
             </div>

             {/* Steps Content */}
             <div className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Tu Nombre</label>
                        <input 
                          type="text" 
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="input h-14" 
                          placeholder="Ej. Juan Pérez" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Email Corporativo</label>
                        <input 
                          type="email" 
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="input h-14" 
                          placeholder="nombre@empresa.com" 
                        />
                     </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Razón Social</label>
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="input h-14" 
                          placeholder="Ej. Construcciones Ibéricas S.L." 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">CIF / Identificación Fiscal</label>
                        <input 
                          type="text" 
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="input h-14" 
                          placeholder="B87654321" 
                        />
                     </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Nombre de la Obra</label>
                        <input 
                          type="text" 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="input h-14" 
                          placeholder="Ej. Edificio Las Rosas" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Ubicación</label>
                        <input 
                          type="text" 
                          value={projectAddress}
                          onChange={(e) => setProjectAddress(e.target.value)}
                          className="input h-14" 
                          placeholder="Calle Mayor 12, Madrid" 
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1 block">Radio de Validación (GPS)</label>
                        <div className="flex gap-4">
                           {[150, 300, 500].map(r => (
                             <button 
                              key={r}
                              onClick={() => setGeofenceRadius(r)}
                              className={`flex-1 h-12 rounded-xl text-xs font-bold border transition-all ${geofenceRadius === r ? 'bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-accent/30'}`}
                             >
                                {r}m
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className="bg-brand-surface p-6 rounded-3xl border border-brand-border space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                              <Users className="w-6 h-6" />
                           </div>
                           <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">Invitaciones</h3>
                        </div>
                        <p className="text-xs text-brand-muted font-medium">Podrás invitar a tu equipo y subcontratas una vez finalices la configuración.</p>
                     </div>
                  </div>
                )}
             </div>

             {/* Actions */}
             <div className="flex gap-4 pt-8">
                {currentStep > 1 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="btn-secondary h-14 px-8"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Atrás
                  </button>
                )}
                <button 
                  onClick={handleNextStep}
                  disabled={isFinalizing}
                  className="btn-primary h-14 flex-1 text-base group"
                >
                  {isFinalizing ? 'Configurando...' : currentStep === 4 ? 'Finalizar Registro' : 'Continuar'}
                  {!isFinalizing && <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />}
                </button>
             </div>
          </div>
        ) : (
          <div className="card p-8 md:p-12 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="space-y-6">
                <div className="text-center space-y-2">
                   <div className="w-16 h-16 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mx-auto mb-4">
                      <KeyRound className="w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Vincularse con Código</h2>
                   <p className="text-sm text-brand-muted font-medium">Introduce el código corporativo facilitado por tu administrador.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                   {errorMsg && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                      {errorMsg}
                    </div>
                   )}
                   <input 
                    type="text" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input h-16 text-center text-3xl font-mono font-black tracking-[0.5em]" 
                    placeholder="ABC-123" 
                   />
                   <button type="submit" className="btn-primary w-full h-14 text-base">
                      Acceder a la Organización
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] relative z-10">
        Cumplimiento Normativo Ley 32/2006 • REA Digital
      </p>
    </div>
  );
};
