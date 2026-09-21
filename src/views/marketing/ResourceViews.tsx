import React from 'react';
import { PageTemplate } from '../../components/marketing/PageTemplate';
import { DocsView } from '../DocsView';
import { IntegrationsView } from '../IntegrationsView';

export const ResourcesApiView = () => (
  <PageTemplate title="Documentación API" subtitle="Integra ObraService con tus sistemas ERP, SAP o de gestión de nóminas mediante nuestra REST API de alta disponibilidad.">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-12">
        {/* Authentication Section */}
        <section className="bg-[#1F2329] p-10 rounded-[2.5rem] border border-white/5">
          <h2 className="text-2xl font-black mb-6 text-[#FF6600]">1. Autenticación</h2>
          <p className="text-slate-400 mb-6">Utilizamos Bearer Tokens basados en Firebase Auth. Todas las peticiones deben incluir el header de autorización.</p>
          <div className="bg-black/40 p-6 rounded-2xl font-mono text-xs text-emerald-400 border border-white/5">
            <p>GET /api/v1/auth/validate</p>
            <p className="text-slate-500 mt-2">Authorization: Bearer {'<YOUR_TOKEN>'}</p>
          </div>
        </section>

        {/* Daily Reports API */}
        <section className="bg-[#1F2329] p-10 rounded-[2.5rem] border border-white/5">
          <h2 className="text-2xl font-black mb-6 text-[#FF6600]">2. Partes Diarios (Daily Reports)</h2>
          <p className="text-slate-400 mb-6">Endpoint para extraer la información consolidada de jornadas para el cálculo de costes.</p>
          <div className="bg-black/40 p-6 rounded-2xl font-mono text-xs mb-6 border border-white/5">
            <p className="text-emerald-400">GET /api/v1/reports?projectId={'{id}'}&date={'{YYYY-MM-DD}'}</p>
          </div>
          <div className="bg-black/40 p-6 rounded-2xl font-mono text-xs text-blue-400 overflow-x-auto border border-white/5">
            <pre>{`{
  "status": "success",
  "data": {
    "reportId": "REP_9921",
    "totalHours": 42.5,
    "workers": [
      { "id": "W_01", "hours": 8, "extra": 0 },
      { "id": "W_02", "hours": 8, "extra": 2.5 }
    ]
  }
}`}</pre>
          </div>
        </section>

        {/* Workers Sync */}
        <section className="bg-[#1F2329] p-10 rounded-[2.5rem] border border-white/5">
          <h2 className="text-2xl font-black mb-6 text-[#FF6600]">3. Sincronización de Operarios</h2>
          <p className="text-slate-400 mb-6">Importa masivamente tu base de datos de trabajadores desde tu software de RRHH.</p>
          <div className="bg-black/40 p-6 rounded-2xl font-mono text-xs border border-white/5">
            <p className="text-emerald-400">POST /api/v1/workers/sync</p>
            <p className="text-slate-500 mt-2">// Body: Array of Worker Objects</p>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <div className="bg-[#FF6600]/10 border border-[#FF6600]/20 p-8 rounded-[2rem]">
          <h4 className="font-black text-[#FF6600] uppercase text-xs tracking-widest mb-4">Límites de Rate</h4>
          <p className="text-sm text-slate-300">5000 peticiones/hora para el plan Enterprise. 1000/hora para Pro.</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
          <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-4">Webhooks</h4>
          <p className="text-sm text-slate-400">Configura notificaciones automáticas cuando un albarán sea firmado por el Jefe de Obra.</p>
        </div>
      </div>
    </div>
  </PageTemplate>
);

export const ResourcesGuideView = () => (
  <PageTemplate title="Guía de Usuario" subtitle="Instrucciones detalladas para desplegar ObraService en tus proyectos de construcción.">
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Fase 1: Configuración de Geocerca</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            Para garantizar que los operarios firman en el tajo, debes definir el radio de acción. 
            ObraService utiliza geolocalización satelital para validar la presencia física.
          </p>
          <ul className="space-y-4">
            {['Introduce las coordenadas exactas de la obra', 'Define el radio (recomendado 100m-500m)', 'Activa la validación por GPS'].map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300 font-bold">
                <div className="w-6 h-6 rounded-full bg-[#FF6600] text-white flex items-center justify-center text-[10px]">{i+1}</div>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 border border-white/10 aspect-video rounded-[3rem] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/20 to-transparent" />
          <div className="relative text-center">
            <div className="w-32 h-32 rounded-full border-4 border-[#FF6600] border-dashed animate-spin-slow mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Esquema de Validación GPS</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1F2329] p-12 rounded-[3rem] border border-white/5">
        <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-tighter">Flujo de Validación IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: 'Captura', desc: 'El operario registra su jornada desde la App.' },
            { step: 'Análisis', desc: 'La IA detecta anomalías en horas extra o clima.' },
            { step: 'Aviso', desc: 'Notificación al Jefe de Obra si hay descuadres.' },
            { step: 'Cierre', desc: 'Firma digital con validez jurídica.' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-[#FF6600] border border-white/10">
                {i + 1}
              </div>
              <h4 className="font-black mb-2 uppercase text-sm tracking-widest">{item.step}</h4>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </PageTemplate>
);

export const ResourcesIntegrationsView = () => (
  <PageTemplate title="Integraciones" subtitle="Conecta tu flujo de trabajo con las herramientas que ya utilizas.">
    <IntegrationsView />
  </PageTemplate>
);

export const LegalPrivacyView = () => (
  <PageTemplate title="Legal & Privacidad" subtitle="Compromiso total con la transparencia y la protección de datos.">
    <div className="prose prose-invert max-w-none bg-white/5 p-12 rounded-[3rem] border border-white/10">
      <h2 className="text-2xl font-bold mb-4">Términos de Servicio</h2>
      <p className="text-slate-400 mb-8 leading-relaxed">
        ObraService se compromete a proporcionar una plataforma segura para la gestión de partes de trabajo...
      </p>
      <h2 className="text-2xl font-bold mb-4">Política de Privacidad</h2>
      <p className="text-slate-400 leading-relaxed">
        Cumplimos estrictamente con el RGPD. No vendemos tus datos a terceros...
      </p>
    </div>
  </PageTemplate>
);
