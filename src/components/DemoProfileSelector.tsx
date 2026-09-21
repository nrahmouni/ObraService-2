import React from 'react';
import { Building2, User, HardHat, Briefcase, X, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';
import { obraStore } from '../services/store';
import { useNavigate } from 'react-router-dom';

interface DemoProfileSelectorProps {
  onClose: () => void;
}

export const DemoProfileSelector: React.FC<DemoProfileSelectorProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  const profiles = [
    {
      id: 'usr_main_admin',
      name: 'Carmen Vega',
      role: 'MAIN_CONTRACTOR_ADMIN' as UserRole,
      roleLabel: 'Admin Contratista Principal',
      company: 'Constructora Ibérica S.A.',
      icon: Briefcase,
      color: 'bg-indigo-50 text-indigo-600',
      description: 'Control total de proyectos, equipos y auditoría de albaranes.'
    },
    {
      id: 'usr_site_manager',
      name: 'Javier Ortiz',
      role: 'SITE_MANAGER' as UserRole,
      roleLabel: 'Jefe de Obra',
      company: 'Constructora Ibérica S.A.',
      icon: HardHat,
      color: 'bg-amber-50 text-amber-600',
      description: 'Gestión diaria a pie de obra y reporte de partes de trabajo.'
    },
    {
      id: 'usr_sub_admin',
      name: 'Elena Garrido',
      role: 'SUBCONTRACTOR_USER' as UserRole,
      roleLabel: 'Gerente Subcontrata',
      company: 'Instalaciones Técnicas S.L.',
      icon: User,
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Recepción y validación de albaranes de su propia empresa.'
    }
  ];

  const handleSelectProfile = (profileId: string) => {
    obraStore.enterDemoMode();
    obraStore.switchDemoRole(profileId);
    navigate('/app');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Selecciona tu Perfil Demo</h2>
            <p className="text-slate-500 text-sm font-medium">Explora la plataforma desde diferentes roles de la industria.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 gap-4">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            return (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className="flex items-center gap-6 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xl transition-all group text-left"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${profile.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{profile.roleLabel}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Simulación</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{profile.name}</h3>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {profile.company}
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{profile.description}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-2 transition-all" />
              </button>
            );
          })}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[70%]">
            Nota: Todos los cambios realizados en el modo demo se guardarán localmente en tu navegador.
          </p>
          <button 
            onClick={onClose}
            className="text-xs font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
