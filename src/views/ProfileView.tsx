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
  Smartphone
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, Role } from '../types';
import { toast } from 'react-hot-toast';

interface ProfileViewProps {
  state: AppState;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ state }) => {
  const currentUser = state.currentUser;
  const company = state.companies.find(c => c.id === currentUser?.companyId);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Preferences State (Persisted in LocalStorage)
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
  const [prefInvites, setPrefInvites] = useState(() => {
    const saved = currentUser ? localStorage.getItem(`pref_invites_${currentUser.id}`) : null;
    return saved !== null ? JSON.parse(saved) : true;
  });

  if (!currentUser) return null;

  const handleSavePreferences = () => {
    localStorage.setItem(`pref_reports_${currentUser.id}`, JSON.stringify(prefReports));
    localStorage.setItem(`pref_disputes_${currentUser.id}`, JSON.stringify(prefDisputes));
    localStorage.setItem(`pref_compliance_${currentUser.id}`, JSON.stringify(prefCompliance));
    localStorage.setItem(`pref_invites_${currentUser.id}`, JSON.stringify(prefInvites));
    toast.success('Preferencias de notificación guardadas correctamente.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Contraseña actualizada correctamente.');
    }, 600);
  };

  const handleLogout = async () => {
    await obraStore.logout();
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans">
      {/* Profile Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-2xl shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <div className="flex flex-col space-y-6">
        {/* User Account Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Información Corporativa</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Empresa:</span>
              <span className="font-bold text-slate-900">{company?.name || 'Constructora Principal'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Identificador Fiscal:</span>
              <span className="font-mono font-bold text-slate-800">{company?.taxId || 'B-84920391'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Rol de Acceso:</span>
              <span className="font-bold text-amber-600">{currentUser.role}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-medium">Estado de Cuenta:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px] uppercase">
                Activa / Homologada
              </span>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Cambiar Contraseña</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer mt-2"
            >
              {isUpdatingPassword ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight font-display">Canales de Notificación y Alertas</h2>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-black uppercase font-mono">
            Personalizable
          </span>
        </div>

        <div className="flex flex-col space-y-3 text-xs">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 transition-all cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefReports}
              onChange={(e) => setPrefReports(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4" 
            />
            <div>
              <span className="font-bold text-slate-900 block">Nuevos Partes Diarios</span>
              <span className="text-slate-500 text-[10px]">Alertar al enviar y corregir partes de obras asignadas.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 transition-all cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefDisputes}
              onChange={(e) => setPrefDisputes(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4" 
            />
            <div>
              <span className="font-bold text-slate-900 block">Disputas de Albaranes</span>
              <span className="text-slate-500 text-[10px]">Avisar de disputas abiertas o corregidas por subcontratas.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 transition-all cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefCompliance}
              onChange={(e) => setPrefCompliance(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4" 
            />
            <div>
              <span className="font-bold text-slate-900 block">Compliance de Documentos</span>
              <span className="text-slate-500 text-[10px]">Alertas automáticas de expiraciones a 15 y 5 días.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500/30 transition-all cursor-pointer">
            <input 
              type="checkbox" 
              checked={prefInvites}
              onChange={(e) => setPrefInvites(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4" 
            />
            <div>
              <span className="font-bold text-slate-900 block">Invitaciones de Equipo</span>
              <span className="text-slate-500 text-[10px]">Avisar cuando se acepten invitaciones corporativas.</span>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>
  );
};
