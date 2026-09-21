import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  HardHat, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  User, 
  Mail, 
  MapPin, 
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Invitation, Project, Role } from '../types';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface InviteAcceptanceViewProps {
  initialCode?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const InviteAcceptanceView: React.FC<InviteAcceptanceViewProps> = ({
  initialCode = '',
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code') || initialCode;
  
  const [code, setCode] = useState(queryCode);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [searchError, setSearchError] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (queryCode) {
      handleLookup(queryCode);
    }
  }, [queryCode]);

  const handleLookup = (codeToSearch: string) => {
    setSearchError('');
    const clean = codeToSearch.trim();
    if (!clean) return;

    const inv = obraStore.getInvitationByCodeOrEmail(clean);
    if (inv) {
      setInvitation(inv);
      if (inv.status === 'Accepted') {
        setSearchError('Esta invitación ya fue utilizada anteriormente. Por favor, inicia sesión con tu cuenta.');
      } else if (inv.status === 'Expired') {
        setSearchError('Esta invitación ha caducado. Solicita al Administrador un nuevo enlace.');
      }
    } else {
      setInvitation(null);
      setSearchError('No hemos encontrado ninguna invitación válida con este código.');
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Por favor, indica tu nombre completo.');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas introducidas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = obraStore.acceptInvitation(invitation.code || invitation.id, {
        name: fullName.trim(),
        password: password
      });

      if (res.success && res.user) {
        toast.success(`¡Bienvenido a ${invitation.companyName}!`);
        if (onSuccess) {
          onSuccess();
        } else {
          if (res.user.role === Role.WORKER) {
            navigate('/mobile/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }
      } else {
        toast.error(res.error || 'No se pudo activar la cuenta.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la invitación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const state = obraStore.getState();
  const assignedProjects: Project[] = (invitation?.assignedProjectIds || [])
    .map(id => state.projects.find(p => p.id === id))
    .filter((p): p is Project => !!p);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-amber-600">
      <div className="max-w-xl w-full space-y-6">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Iniciar Sesión</span>
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-500 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso Seguro por Invitación</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Alta de Subcontrata / Operario
                </h1>
                <p className="text-xs text-slate-400">
                  Activación oficial de credenciales para acceso a tajos y obras.
                </p>
              </div>
            </div>
          </div>

          {/* Invitation Lookup / Input if no invitation found yet */}
          {!invitation ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Código de Invitación o Correo Electrónico
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: INV-92834 o tu correo corporativo"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookup(code)}
                    className="h-12 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-amber-500/30"
                  >
                    Validar
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="p-4 bg-red-950/60 border border-red-800/60 rounded-2xl flex items-start gap-3 text-xs text-red-300">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>{searchError}</div>
                </div>
              )}
            </div>
          ) : (
            /* Acceptance Form when invitation is verified */
            <form onSubmit={handleAccept} className="space-y-5">
              {/* Invitation Verified Badge Details */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Empresa Contratista:</span>
                  <span className="font-black text-amber-400">{invitation.companyName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Email Registrado:</span>
                  <span className="font-bold text-white">{invitation.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Rol Asignado:</span>
                  <span className="font-bold text-blue-400 uppercase text-[10px] bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                    {invitation.role}
                  </span>
                </div>
                {assignedProjects.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Obras Asignadas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedProjects.map(p => (
                        <span key={p.id} className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg font-medium">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input: Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nombre y Apellidos del Responsable / Operario *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Manuel García Martínez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Crear Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-10 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-amber-950/50 transition-all cursor-pointer border border-amber-500/30 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Activando Cuenta...' : 'Aceptar Invitación y Acceder a Obra'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
