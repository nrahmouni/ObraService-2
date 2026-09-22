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
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Código de Invitación o Código de Empresa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: NORTE2026 o LEVANTE2026"
                    className="flex-1 bg-[#121214] border border-[#27272A] rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EA580C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookup(code)}
                    className="h-11 px-5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Validar
                  </button>
                </div>
              </div>

              {/* Direct Access Quick Chips */}
              <div className="space-y-2 pt-1 border-t border-[#27272A]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Códigos directos de prueba:</span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCode('NORTE2026');
                      handleLookup('NORTE2026');
                    }}
                    className="w-full text-left bg-[#18181B] hover:bg-[#202024] border border-[#27272A] p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">NORTE2026 — Constructora Principal</div>
                      <div className="text-[11px] text-zinc-400">Construcciones Norte S.L. (Jefe de Obra)</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EA580C]/20 text-[#EA580C] border border-[#EA580C]/30">Usar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCode('LEVANTE2026');
                      handleLookup('LEVANTE2026');
                    }}
                    className="w-full text-left bg-[#18181B] hover:bg-[#202024] border border-[#27272A] p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">LEVANTE2026 — Subcontrata</div>
                      <div className="text-[11px] text-zinc-400">Estructuras Levante S.L. (Operario)</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">Usar</span>
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
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
              <div className="flex flex-col gap-3">
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
