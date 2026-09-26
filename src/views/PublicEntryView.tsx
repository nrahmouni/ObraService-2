import React from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingValueProp } from '../components/landing/LandingValueProp';
import { LandingPricing } from '../components/landing/LandingPricing';
import { 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Building2, 
  FileCheck,
  Globe,
  Lock,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

interface PublicEntryViewProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onOpenJoinCode: () => void;
  onDemoAccess: () => void;
}

export const PublicEntryView: React.FC<PublicEntryViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenJoinCode,
  onDemoAccess,
}) => {
  return (
    <div className="flex flex-col bg-brand-bg min-h-screen selection:bg-brand-accent selection:text-white">
      {/* Dynamic Header Overlay */}
      <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between pointer-events-none backdrop-blur-md bg-brand-bg/60 border-b border-white/5">
         <div className="flex items-center gap-2 pointer-events-auto group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 shrink-0">
               <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-widest">ObraService</span>
         </div>
         <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
            <button 
              onClick={onOpenLogin}
              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] sm:text-xs font-black text-white uppercase tracking-wider sm:tracking-widest hover:bg-white/10 transition-all min-h-[40px]"
            >
               Acceso
            </button>
            <button 
              onClick={() => onOpenRegister()}
              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-brand-accent text-[10px] sm:text-xs font-black text-white uppercase tracking-wider sm:tracking-widest hover:bg-brand-accent/80 transition-all shadow-xl shadow-brand-accent/20 min-h-[40px]"
            >
               <span className="hidden xs:inline">Comenzar </span>Gratis
            </button>
         </div>
      </header>

      <main>
        {/* Hero Section */}
        <LandingHero 
          onStart={() => onOpenRegister()} 
          onLogin={onOpenLogin} 
          onDemo={onDemoAccess}
        />
        
        {/* Trust Badges */}
        <div className="bg-brand-surface py-8 sm:py-12 border-y border-brand-border">
           <div className="container mx-auto px-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                 {['ACCIONA', 'SACYR', 'DRAGADOS', 'FERROVIAL', 'FCC'].map(brand => (
                    <span key={brand} className="text-sm sm:text-xl font-display font-black text-white tracking-tighter italic">{brand}</span>
                 ))}
              </div>
           </div>
        </div>

        {/* Feature Grid */}
        <section className="py-16 sm:py-24 lg:py-32 container mx-auto px-4 sm:px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  icon: FileCheck, 
                  title: 'Certificación Digital', 
                  desc: 'Firma inmutable de partes diarios y albaranes con validez jurídica ante inspecciones de trabajo.',
                  accent: 'text-brand-accent'
                },
                { 
                  icon: Globe, 
                  title: 'Modo Multinivel', 
                  desc: 'Conecta constructoras, subcontratas y operarios en una única red de confianza sin silos de datos.',
                  accent: 'text-blue-500'
                },
                { 
                  icon: Zap, 
                  title: 'Operativa en Tiempo Real', 
                  desc: 'Control de asistencia mediante geocercas GPS y notificaciones instantáneas de incidencias.',
                  accent: 'text-emerald-500'
                }
              ].map((feature, i) => (
                <div key={i} className="card p-6 sm:p-10 group hover:border-brand-accent/30 transition-all duration-500 flex flex-col justify-between">
                   <div>
                     <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.accent}`}>
                        <feature.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                     </div>
                     <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-3">{feature.title}</h3>
                     <p className="text-sm text-brand-muted font-medium leading-relaxed mb-6">{feature.desc}</p>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-brand-accent uppercase tracking-widest group-hover:gap-4 transition-all pt-4 border-t border-brand-border/40">
                      Más Información <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
              ))}
           </div>
        </section>

        <LandingValueProp />

        {/* Dynamic CTA */}
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-accent/5 -skew-y-6 transform translate-y-32" />
           <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="card p-6 sm:p-12 md:p-20 bg-gradient-to-br from-brand-surface to-brand-bg relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-brand-accent/10 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:bg-brand-accent/15 transition-all duration-700" />
                 
                 <div className="max-w-3xl space-y-6 sm:space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-[9px] sm:text-[10px] font-black text-brand-accent uppercase tracking-wider sm:tracking-widest">
                       <ShieldCheck className="w-4 h-4 shrink-0" />
                       <span>Compliance Ley 32/2006 Garantizado</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tight leading-tight">
                       ¿Listo para digitalizar tu obra?
                    </h2>
                    <p className="text-base sm:text-xl text-brand-muted font-medium leading-relaxed">
                       Únete a más de 500 constructoras que ya optimizan sus procesos operativos y legales con ObraService.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                       <button 
                        onClick={() => onOpenRegister()}
                        className="h-12 sm:h-16 px-6 sm:px-12 bg-brand-accent text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider sm:tracking-widest hover:bg-brand-accent/80 transition-all shadow-2xl active:scale-95 flex items-center justify-center min-h-[48px]"
                       >
                          Solicitar Acceso Gratuito
                       </button>
                       <button 
                        onClick={onDemoAccess}
                        className="h-12 sm:h-16 px-6 sm:px-12 bg-white/5 border border-white/10 text-white rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider sm:tracking-widest hover:bg-white/10 transition-all flex items-center justify-center min-h-[48px]"
                       >
                          Ver Demo Interactiva
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <LandingPricing 
          onSelect={(plan) => onOpenRegister(plan)}
        />
      </main>

      {/* Modern Footer */}
      <footer className="bg-brand-surface border-t border-brand-border py-12 sm:py-20">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-12 sm:mb-16">
               <div className="col-span-2 md:col-span-1 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2">
                     <div className="w-9 h-9 rounded-xl bg-brand-accent flex items-center justify-center text-white shrink-0">
                        <Building2 className="w-5 h-5" />
                     </div>
                     <span className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-widest">ObraService</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-muted font-medium leading-relaxed">
                     La plataforma líder en digitalización operativa y legal para el sector de la construcción en España.
                  </p>
               </div>
               
               {[
                 { title: 'Producto', links: ['Características', 'Seguridad', 'ERP Connect', 'Precios'] },
                 { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies', 'Compliance'] },
                 { title: 'Soporte', links: ['Ayuda', 'Contacto', 'API', 'Estatus'] }
               ].map(col => (
                 <div key={col.title} className="space-y-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{col.title}</h4>
                    <ul className="space-y-2.5">
                       {col.links.map(link => (
                         <li key={link}>
                            <a href="#" className="text-xs text-brand-muted font-bold hover:text-brand-accent transition-colors uppercase tracking-tight">{link}</a>
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-brand-border/50 gap-4">
               <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest text-center sm:text-left">© 2026 ObraService S.L. • Conforme Ley 32/2006</p>
               <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistemas 100% Operativos</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
