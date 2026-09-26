import React from 'react';
import { 
  Building2, 
  HardHat, 
  ShieldCheck, 
  Users, 
  Crown, 
  ArrowRight, 
  X, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  MapPin, 
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { obraStore } from '../../services/store';
import { Role } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface DemoLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoLauncherModal: React.FC<DemoLauncherModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLaunchRole = (email: string, targetPath: string, roleName: string) => {
    obraStore.enterDemoMode();
    const res = obraStore.login(email);
    if (res.success) {
      toast.success(`Acceso demo como: ${roleName}`, {
        icon: '🚀'
      });
      onClose();
      navigate(targetPath);
    } else {
      toast.error('No se pudo iniciar la sesión demo.');
    }
  };

  const handleResetDemo = () => {
    obraStore.resetDemoData();
    toast.success('Datos de la demo restablecidos al estado inicial.');
  };

  const demoRoles = [
    {
      title: 'Operario en Tajo (Móvil)',
      name: 'David Gómez',
      email: 'david.gomez@estructuraslevante.es',
      company: 'Estructuras Levante S.L.',
      icon: Smartphone,
      accent: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500',
      badge: 'App Móvil de Campo',
      path: '/mobile/dashboard',
      description: 'Emitir partes diarios con fotos de obra, geofencing GPS, fichaje y recepción de albaranes.',
      actions: ['Parte Diario en 30s', 'Fichaje Geoposicionado', 'Firma Táctil']
    },
    {
      title: 'Jefe de Obra (Validador)',
      name: 'Javier Ortiz',
      email: 'javier.ortiz@construccionesnorte.es',
      company: 'Construcciones Norte S.L.',
      icon: HardHat,
      accent: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      badge: 'Supervisión Técnica',
      path: '/admin/dashboard',
      description: 'Validar partes de trabajo pendientes, aprobar o disputar albaranes y supervisión cartográfica GPS.',
      actions: ['Validar Partes Diarios', 'Disputar Albaranes', 'Mapa de Tajos']
    },
    {
      title: 'Director General / Admin',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@construccionesnorte.es',
      company: 'Construcciones Norte S.L.',
      icon: Building2,
      accent: 'from-orange-500/20 to-red-500/10 border-brand-accent/40 text-brand-accent',
      badge: 'Control Global',
      path: '/admin/dashboard',
      description: 'Presupuestos de proyectos, homologación PRL de subcontratas, facturación y trazabilidad legal.',
      actions: ['Control PRL Ley 32/2006', 'Certificaciones y Costes', 'Trazabilidad Inmutable']
    },
    {
      title: 'Gerente Subcontrata',
      name: 'Elena Ramos',
      email: 'elena.ramos@estructuraslevante.es',
      company: 'Estructuras Levante S.L.',
      icon: Users,
      accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badge: 'Portal Subcontratista',
      path: '/admin/dashboard',
      description: 'Gestión de cuadrillas de operarios, asignación a tajos y justificación de horas frente a la contrata.',
      actions: ['Asignación de Personal', 'Resolución de Disputas', 'Control de Albaranes']
    },
    {
      title: 'Super Administrador Ecosistema',
      name: 'Super Admin',
      email: 'superadmin@obraservice.com',
      company: 'Plataforma ObraService',
      icon: Crown,
      accent: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
      badge: 'Master Multi-Empresa',
      path: '/admin/master',
      description: 'Gestión multi-tenant de constructoras, auditoría global y control de instancias de base de datos.',
      actions: ['Multi-Tenant Global', 'Alta de Organizaciones', 'Auditoría en Tiempo Real']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-surface via-brand-bg to-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-display font-black text-white uppercase tracking-tight">
                  Sandbox Demo Interactivo
                </h2>
                <span className="hidden sm:inline px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Acceso Inmediato
                </span>
              </div>
              <p className="text-xs text-brand-muted font-medium mt-0.5">
                Selecciona un rol para operar de inmediato sin contraseñas con datos precargados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              title="Restablecer datos originales de prueba"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-muted hover:text-white hover:bg-brand-surface transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Roles List Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {demoRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.email}
                  onClick={() => handleLaunchRole(role.email, role.path, role.name)}
                  className="card p-4 sm:p-5 group hover:border-brand-accent/50 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${role.accent} border flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-accent transition-colors">
                              {role.name}
                            </h3>
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-brand-muted block">
                            {role.title} • {role.company}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-muted shrink-0">
                        {role.badge}
                      </span>
                    </div>

                    <p className="text-xs text-brand-muted leading-relaxed font-medium">
                      {role.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.actions.map(action => (
                        <span key={action} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-brand-bg/80 border border-brand-border/60 text-zinc-300">
                          ✓ {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-accent group-hover:translate-x-1 transition-transform">
                    <span>Probar este rol ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-3 sm:p-4 bg-brand-bg border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shrink-0">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Los cambios que realices se guardan en la memoria local de tu navegador y no alteran la base de datos real.</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">v2.4.0 • ObraService Spain</span>
        </div>
      </div>
    </div>
  );
};
