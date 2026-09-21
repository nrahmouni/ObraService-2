import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageTemplate } from '../../components/marketing/PageTemplate';
import { LandingValueProp } from '../../components/landing/LandingValueProp';
import { LandingAppFlows } from '../../components/landing/LandingAppFlows';
import { LandingPricing } from '../../components/landing/LandingPricing';
import { Shield, Lock, Eye, CheckCircle, MapPin } from 'lucide-react';

export const ProductAgilizeView = () => (
  <PageTemplate 
    title="Qué Agilizamos" 
    subtitle="Eliminamos la fricción burocrática entre contratista y subcontrata mediante una red de datos única y verificada en tiempo real."
  >
    <div className="space-y-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Adiós al papel, hola a la certeza</h2>
          <div className="space-y-6">
            {[
              { title: 'Liquidaciones sin Disputas', desc: 'Los albaranes se generan con datos de geocerca, eliminando discusiones sobre horas de entrada y salida.' },
              { title: 'Cumplimiento Legal Automatizado', desc: 'Generación de documentos PDF con firma electrónica avanzada que cumplen con la normativa española de registro de jornada.' },
              { title: 'Control de Costes en Vivo', desc: 'Saber exactamente cuánto te está costando cada unidad de obra al finalizar el día, no al finalizar el mes.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#FF6600]/20 flex items-center justify-center text-[#FF6600] shrink-0 font-black text-xs">0{i+1}</div>
                <div>
                  <h4 className="font-black text-white uppercase text-sm tracking-widest mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2 bg-[#1F2329] p-12 rounded-[3rem] border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="w-64 h-64 text-[#FF6600]" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.3em] mb-4">Certificación de Datos</div>
            <div className="text-6xl font-black text-white tracking-tighter mb-4">99.8%</div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Precisión en el registro de presencia mediante geocerca dinámica.</p>
          </div>
        </div>
      </div>
      <LandingValueProp />
    </div>
  </PageTemplate>
);

export const ProductHowItWorksView = () => (
  <PageTemplate 
    title="Cómo Funciona" 
    subtitle="Una arquitectura diseñada para la realidad de la obra: movilidad total, geolocalización pasiva y validación automática."
  >
    <div className="space-y-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: '1. Despliegue', desc: 'El Jefe de Obra define el perímetro digital (geocerca) en el mapa del proyecto.', icon: MapPin },
          { title: '2. Registro', desc: 'Los operarios entran en la obra; su App detecta la presencia y habilita la firma del parte.', icon: Eye },
          { title: '3. Validación IA', desc: 'Gemini analiza el parte buscando desviaciones de costes o riesgos de seguridad.', icon: Shield }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
            <item.icon className="w-12 h-12 text-[#FF6600] mb-6" />
            <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-white">{item.title}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
      <LandingAppFlows />
    </div>
  </PageTemplate>
);

export const ProductSecurityView = () => (
  <PageTemplate 
    title="Seguridad de Datos" 
    subtitle="Tus datos son el activo más valioso. ObraService utiliza estándares bancarios para proteger la integridad de cada albarán."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { icon: Shield, title: 'Encriptación de Extremo a Extremo', desc: 'Todos los datos en tránsito y en reposo están protegidos con AES-256.' },
        { icon: Lock, title: 'Autenticación Biométrica', desc: 'Acceso seguro mediante FaceID y TouchID para operarios en campo.' },
        { icon: Eye, title: 'Auditoría Inmutable', desc: 'Cada cambio en un albarán queda registrado en un log de auditoría inalterable.' },
        { icon: CheckCircle, title: 'Cumplimiento RGPD', desc: 'Total soberanía sobre tus datos y los de tus trabajadores.' }
      ].map((item, i) => (
        <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:border-[#FF6600]/30 transition-all">
          <item.icon className="w-12 h-12 text-[#FF6600] mb-6" />
          <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
          <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </PageTemplate>
);

export const PricingPage = () => {
  const context = useOutletContext<{ onOpenRegister?: (planName?: string) => void }>();
  return (
    <PageTemplate 
      title="Planes y Precios" 
      subtitle="Escalabilidad total para autónomos, PYMES y grandes constructoras nacionales."
    >
      <LandingPricing onOpenRegister={context?.onOpenRegister} />
    </PageTemplate>
  );
};
