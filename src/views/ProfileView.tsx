import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Key, 
  LogOut, 
  Check, 
  Lock, 
  Sparkles,
  Smartphone,
  Fingerprint,
  Bell,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  Globe
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, Role } from '../types';
import { toast } from 'react-hot-toast';
import { useI18n } from '../i18n';

interface ProfileViewProps {
  state: AppState;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ state }) => {
  const { language, setLanguage, t } = useI18n();
  const currentUser = state.currentUser;
  const company = state.companies.find(c => c.id === currentUser?.companyId);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Preferences State
  const [prefReports, setPrefReports] = useState(() => {
    const saved = currentUser ? localStorage.getItem(`pref_reports_${currentUser.id}`) : null;
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [prefDisputes, setPrefDisputes] = useState(() => {
    const saved = currentUser ? localStorage.getItem(`pref_disputes_${currentUser.id}`) : null;
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [prefCompliance, setPrefCompliance] = useState(() => {
    const saved = currentUser ? localStorage.getItem(`pref_compliance_${currentUser.id}`) : null;
    return saved !== null ? JSON.parse(saved) : true;
  });

  if (!currentUser) return null;

  const handleSavePreferences = () => {
    localStorage.setItem(`pref_reports_${currentUser.id}`, JSON.stringify(prefReports));
    localStorage.setItem(`pref_disputes_${currentUser.id}`, JSON.stringify(prefDisputes));
    localStorage.setItem(`pref_compliance_${currentUser.id}`, JSON.stringify(prefCompliance));
    toast.success('Preferencias e idioma guardados correctamente');
  };


  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Contraseña demasiado corta');
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Seguridad actualizada');
    }, 600);
  };

  const handleLogout = async () => {
    await obraStore.logout();
    toast.success('Sesión finalizada');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Identity Header */}
      <div className="p-8 md:p-12 rounded-[40px] bg-brand-accent border border-brand-accent relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-white/10 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-5xl font-display font-black shadow-2xl">
              {currentUser.name.charAt(0)}
           </div>
           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">{currentUser.name}</h1>
                    <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
                       {currentUser.role}
                    </div>
                 </div>
                 <p className="text-white/70 font-medium flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {currentUser.email}
                 </p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                 <div className="flex items-center gap-2 px-4 py-2 bg-brand-bg/20 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                    <Fingerprint className="w-4 h-4" />
                    ID: {currentUser.id.slice(0, 8)}
                 </div>
                 <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-xl border border-rose-500/30 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/40 transition-all">
                    <LogOut className="w-4 h-4" />
                    Desconectar
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="space-y-8">
          {/* Corporate Info */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Afiliación</h2>
            </div>
            
            <div className="space-y-4">
               {[
                 { label: 'Organización', value: company?.name || 'Constructora Principal' },
                 { label: 'Identificador Fiscal', value: company?.taxId || 'B-84920391' },
                 { label: 'Nivel de Acceso', value: currentUser.role },
                 { label: 'Estado Operativo', value: 'Verificado', status: 'success' }
               ].map(item => (
                 <div key={item.label} className="flex items-center justify-between py-3 border-b border-brand-border last:border-0">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{item.label}</span>
                    <span className={`text-xs font-bold ${item.status === 'success' ? 'text-emerald-500' : 'text-white'}`}>
                       {item.value}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          {/* Security */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Seguridad</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Contraseña Actual</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input h-12" 
                    placeholder="••••••••" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input h-12" 
                    placeholder="Mínimo 8 caracteres" 
                  />
               </div>
               <button type="submit" disabled={isUpdatingPassword} className="btn-secondary w-full h-12 mt-2">
                  {isUpdatingPassword ? 'Procesando...' : 'Actualizar Credenciales'}
               </button>
            </form>
          </div>
          {/* Language Selector Card */}
          <div className="card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                    {t('language.select', 'Idioma')}
                  </h2>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-0.5">
                    Preferencias regionales y localización
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    language === 'es'
                      ? 'bg-brand-accent/15 border-brand-accent text-white shadow-md'
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🇪🇸</span>
                    {language === 'es' && <Check className="w-4 h-4 text-brand-accent" />}
                  </div>
                  <div className="font-bold text-sm text-white mt-2">Español</div>
                  <div className="text-[10px] text-brand-muted">Predeterminado</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-brand-accent/15 border-brand-accent text-white shadow-md'
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🇬🇧</span>
                    {language === 'en' && <Check className="w-4 h-4 text-brand-accent" />}
                  </div>
                  <div className="font-bold text-sm text-white mt-2">English</div>
                  <div className="text-[10px] text-brand-muted">International</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="card p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
              <Bell className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Notificaciones</h2>
               <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-0.5">Gestión de alertas en tiempo real</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
             {[
               { id: 'reports', label: 'Seguimiento de Partes', desc: 'Alertas de firma y validación de partes diarios.', state: prefReports, setter: setPrefReports },
               { id: 'disputes', label: 'Resolución de Conflictos', desc: 'Avisos inmediatos sobre disputas en albaranes.', state: prefDisputes, setter: setPrefDisputes },
               { id: 'compliance', label: 'Compliance & REA', desc: 'Vencimientos de documentación y certificados.', state: prefCompliance, setter: setPrefCompliance }
             ].map(pref => (
               <label key={pref.id} className="flex items-start gap-4 p-5 rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-accent/30 transition-all cursor-pointer group">
                  <div className={`mt-1 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${
                    pref.state ? 'bg-brand-accent border-brand-accent' : 'bg-brand-bg border-brand-border group-hover:border-brand-accent/50'
                  }`}>
                    {pref.state && <Check className="w-3.5 h-3.5 text-white" />}
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={pref.state}
                      onChange={(e) => pref.setter(e.target.checked)}
                    />
                  </div>
                  <div className="space-y-1">
                     <span className="text-sm font-black text-white uppercase tracking-tight">{pref.label}</span>
                     <p className="text-[11px] font-medium text-brand-muted leading-relaxed">{pref.desc}</p>
                  </div>
               </label>
             ))}
          </div>

          <div className="mt-8 pt-8 border-t border-brand-border">
             <button onClick={handleSavePreferences} className="btn-primary w-full h-14 text-base">
                Guardar Configuración
             </button>
             <p className="text-[9px] text-center text-brand-muted font-bold uppercase tracking-widest mt-4">
                Última sincronización: Hoy, 14:22
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
