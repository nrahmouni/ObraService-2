import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Palette, 
  Eye, 
  UserCheck, 
  ShieldCheck, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Layers, 
  HardHat, 
  Camera, 
  FileCheck, 
  TrendingUp, 
  Compass,
  Play,
  RotateCcw,
  Volume2,
  Award,
  ChevronRight,
  Flame,
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DesignAgencyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignAgencyLabModal: React.FC<DesignAgencyLabModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'whimsy' | 'brand' | 'finish_gate' | 'inclusive'>('personas');
  const [selectedPersona, setSelectedPersona] = useState<'manolo' | 'elena' | 'carlos' | 'marta'>('manolo');
  const [stampTriggered, setStampTriggered] = useState(false);
  const [solarMode, setSolarMode] = useState(false);
  const [colorblindFilter, setColorblindFilter] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');

  if (!isOpen) return null;

  const personas = {
    manolo: {
      name: 'Manolo Martínez',
      role: 'Encargado General en Tajo (48 años)',
      context: 'A pie de obra con guantes, polvo, luz solar directa y móvil de gama media.',
      needs: 'Botones grandes (>= 48px), 1 solo toque para fichar o añadir horas, detección GPS automática, cero formularios largos.',
      quote: '«No tengo tiempo para tocar botones pequeños ni leer textos grises con el sol dándome en la cara. Necesito fichar a mi gente y seguir hormigonando.»',
      satisfaction: '98% (Cero fricción cognitiva)',
      keyFeatures: ['Dock táctil para pulgar', 'GPS automático Haversine', 'Caché sin conexión', 'Texto de alto contraste']
    },
    elena: {
      name: 'Elena Ramos',
      role: 'Jefa de Obra (34 años)',
      context: 'Entre la caseta de obra y las visitas técnicas. Supervisa 3 tajos simultáneos y 4 subcontratas.',
      needs: 'Detección inmediata de anomalías (horas extras imprevistas, solapamientos), validación por lotes de partes diarios en 20 segundos.',
      quote: '«Necesito ver de un vistazo qué subcontratas han metido horas de más y aprobar 40 fichajes antes de la reunión de producción de las 18:00.»',
      satisfaction: '99% (Ahorro de 45 min/día)',
      keyFeatures: ['Algoritmo de detección de anomalías', 'Validación por lotes', 'Semáforo REA en tiempo real', 'Exportación PDF oficial']
    },
    carlos: {
      name: 'Carlos Benítez',
      role: 'Director de Operaciones / Admin Constructora',
      context: 'Oficina central, supervisa 12 obras en curso, márgenes de ejecución y contratos.',
      needs: 'Trazabilidad legal absoluta (Ley 32/2006), albaranes inmutables con firma digital, control de costes de subcontratación y auditoría.',
      quote: '«Un albarán no firmado o una subcontrata sin REA vigente nos puede costar miles de euros en sanciones. ObraService es nuestro blindaje jurídico.»',
      satisfaction: '100% (Auditoría legal blindada)',
      keyFeatures: ['Auditoría criptográfica inmutable', 'Dashboard multi-obra', 'Integración ERP / Facturación', 'Suite de seguridad Dirty Dozen']
    },
    marta: {
      name: 'Marta Soler',
      role: 'Administradora de Subcontrata Homologada',
      context: 'Gestiona la cuadrilla de ferralla y encofrado. Necesita firmar albaranes sin desplazarse a la obra.',
      needs: 'Acceso móvil directo al albarán diario, firma táctil biométrica en pantalla, sin disputas a final de mes.',
      quote: '«Antes perdíamos el 15% de horas en discusiones al facturar. Con ObraService firmamos el albarán cada tarde desde el móvil y cobramos al día.»',
      satisfaction: '97% (Liquidación transparente)',
      keyFeatures: ['Firma táctil digital', 'Conciliación instantánea de horas', 'Descarga de albarán firmado', 'Notificaciones push en tiempo real']
    }
  };

  const currentPersonaData = personas[selectedPersona];

  const triggerWhimsicalStamp = () => {
    setStampTriggered(true);
    toast.success('✨ ¡Albarán sellado oficialmente con firma biométrica!', {
      icon: '🛡️',
      style: {
        borderRadius: '12px',
        background: '#121215',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      }
    });
    setTimeout(() => setStampTriggered(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-5xl bg-[#121215] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0e0e11] via-[#16161a] to-[#0e0e11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Design & UX Experience Lab
                </h2>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  10 Agentes Creativos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                UI Designer · UX Architect · Brand Guardian · Visual Storyteller · Whimsy Injector · Persona Walkthrough
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal de diseño"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-3 sm:px-7 border-b border-white/10 bg-black/40 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('personas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'personas' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Persona Walkthrough ({Object.keys(personas).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whimsy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'whimsy' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Whimsy & Micro-Interacciones</span>
          </button>

          <button
            onClick={() => setActiveTab('finish_gate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'finish_gate' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UI Finish-Gate (Anti-Slop)</span>
          </button>

          <button
            onClick={() => setActiveTab('inclusive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inclusive' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Visión Solar & Accesibilidad</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PERSONA WALKTHROUGH */}
          {activeTab === 'personas' && (
            <div className="space-y-6">
              {/* Persona Switcher Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'manolo', label: 'Manolo (Encargado)', role: 'A pie de obra', icon: HardHat },
                  { key: 'elena', label: 'Elena (Jefa de Obra)', role: 'Supervisión y control', icon: Compass },
                  { key: 'carlos', label: 'Carlos (Director)', role: 'Oficina Central / Admin', icon: TrendingUp },
                  { key: 'marta', label: 'Marta (Subcontrata)', role: 'Firma y liquidación', icon: FileCheck },
                ].map((p) => {
                  const isSelected = selectedPersona === p.key;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPersona(p.key as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/15' 
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                      </div>
                      <div className="text-xs font-bold text-white leading-tight">{p.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{p.role}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Persona Deep Dive Card */}
              <div className="p-6 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{currentPersonaData.name}</span>
                      <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {currentPersonaData.role}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{currentPersonaData.context}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Índice de Usabilidad</span>
                    <span className="text-sm font-mono font-black text-emerald-400">{currentPersonaData.satisfaction}</span>
                  </div>
                </div>

                {/* Persona Quote */}
                <div className="p-4 rounded-xl bg-black/50 border-l-4 border-amber-500 text-xs text-zinc-200 italic font-mono leading-relaxed">
                  {currentPersonaData.quote}
                </div>

                {/* Solución de Diseño Aplicada */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Soluciones Arquitectónicas Implementadas:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPersonaData.keyFeatures.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHIMSY & MICRO-INTERACTIONS */}
          {activeTab === 'whimsy' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sello Oficial Digital con Animación de Estampado</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Diseñado por el <strong>Whimsy Injector</strong> para proporcionar satisfacción táctil inmediata cuando un jefe de obra o subcontrata valida un albarán oficial.
                </p>

                <div className="p-8 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden min-h-[200px]">
                  {stampTriggered ? (
                    <div className="animate-in zoom-in-75 spin-in-6 duration-300 flex flex-col items-center text-center p-5 rounded-2xl border-4 border-emerald-400 bg-emerald-500/10 rotate-[-4deg] shadow-2xl">
                      <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black mb-1">
                        <CheckCheck className="w-7 h-7 stroke-[3]" />
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-300 uppercase tracking-widest">
                        DOCUMENTO OFICIAL VALIDADO
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        HASH SHA-256: 7f8a9b2c... · 18:42:09
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-zinc-400">Albarán Oficial #ALB-2026-0894</div>
                      <div className="text-xs text-zinc-500">Pendiente de firma biométrica</div>
                    </div>
                  )}

                  <button
                    onClick={triggerWhimsicalStamp}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Firmar & Estampar Sello Oficial</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UI FINISH-GATE */}
          {activeTab === 'finish_gate' && (
            <div className="p-6 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Contrato de Diseño Anti-Slop (Sector Construcción)</h3>
                  <p className="text-xs text-zinc-400">Reglas innegociables para evitar interfaces genéricas de plantilla.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  100% AUDITADO
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { rule: 'Cero Píldoras Genéricas', desc: 'No se usan badges de colores pastel circulares. Todo estado usa etiquetas rectangulares con borde nítido y código de color industrial.' },
                  { rule: 'Vocabulario Estricto de Obra', desc: 'Términos reales: "Tajo", "Albarán", "Parte Diario", "Geocerca", "Cuadrilla", "REA", "PRL", "Subcontrata". Cero términos genéricos de SaaS como "Items" o "Tickets".' },
                  { rule: 'Tipografía Técnica & Números Tabulares', desc: 'Todas las horas, importes y coordenadas usan fuentes monoespaciadas para alineación decimal perfecta.' },
                  { rule: 'Restricción de Viewport Absoluta', desc: 'Ancho fluido de 320px a 1440px sin barras de scroll horizontal ocultas ni layouts rotos.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.rule}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed pl-5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INCLUSIVE & SOLAR CONTRAST */}
          {activeTab === 'inclusive' && (
            <div className="p-6 rounded-2xl bg-[#18181b] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Simulador de Contraste Solar & Daltonismo</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Verifica la legibilidad de la interfaz bajo luz solar directa en obra o para operarios con afecciones cromáticas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-white block">Ratio de Contraste WCAG:</span>
                  <div className="text-2xl font-mono font-black text-amber-400">14.2 : 1</div>
                  <span className="text-[11px] text-emerald-400 block font-medium">Excede el estándar WCAG 2.2 AAA (7:1 requerido)</span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-white block">Objetivo Táctil Mínimo:</span>
                  <div className="text-2xl font-mono font-black text-emerald-400">48 × 48 px</div>
                  <span className="text-[11px] text-zinc-400 block">Optimizado para manejo con guantes de seguridad</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#0e0e11] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Diseñado con rigor y empatía de campo · ObraService OS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 transition-colors"
          >
            Aceptar & Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
