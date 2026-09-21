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
  EyeOff
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Invitation, Project } from '../types';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  const [code, setCode] = useState(initialCode);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [searchError, setSearchError] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleLookup(initialCode);
    }
  }, [initialCode]);

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
          navigate('/app');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-widest uppercase bg-[#FF6600] text-white px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Invitación Oficial
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
            Únete a la Plataforma
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Acceso seguro y verificado para personal de obra
          </p>
        </div>

        {/* Code Search fallback if not found */}
        {!invitation ? (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                Introduce tu Código de Invitación (Magic Code)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ej. INV-8X92K"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600]"
                />
                <button
                  type="button"
                  onClick={() => handleLookup(code)}
                  className="px-4 py-3 bg-[#FF6600] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#e65c00] transition-colors"
                >
                  Buscar
                </button>
              </div>
              {searchError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Invitation Found: Guest Flow with Auto-Bound Company */
          <div className="p-6 space-y-6">
            {/* Invitation Details Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Empresa Contratista
                  </div>
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#FF6600]" />
                    {invitation.companyName}
                  </div>
                </div>
                <Badge variant="purple" className="text-[9px] font-black uppercase px-2 py-0.5">
                  {invitation.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario en Tajo'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Invitado por</span>
                  <span className="font-bold text-slate-800">{invitation.invitedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Email Asignado</span>
                  <span className="font-bold text-slate-800 truncate block">{invitation.email}</span>
                </div>
              </div>

              {assignedProjects.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[9px] uppercase font-bold block mb-1.5">
                    Obras Asignadas ({assignedProjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedProjects.map(p => (
                      <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                        <MapPin className="w-2.5 h-2.5 text-[#FF6600]" />
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {searchError ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            ) : (
              /* Password Creation Form (Company name is strictly hidden and preset) */
              <form onSubmit={handleAccept} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Tu Nombre y Apellidos
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ej. Carlos Ruiz Delgado"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Crea tu Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tu cuenta quedará vinculada automáticamente a {invitation.companyName}.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#FF6600] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#e65c00] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Configurando tu cuenta...' : 'Completar Registro y Acceder'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
