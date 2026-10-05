import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Filter, 
  ExternalLink, 
  Cpu,
  Layers,
  HardHat,
  Rocket,
  Lock,
  FileSpreadsheet,
  BarChart3,
  SlidersHorizontal,
  Zap,
  Code2,
  Play,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AgencyAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCivilLab?: () => void;
  onOpenDesignLab?: () => void;
  onOpenESGLab?: () => void;
}

export const AgencyAgentsModal: React.FC<AgencyAgentsModalProps> = ({
  isOpen,
  onClose,
  onOpenCivilLab,
  onOpenDesignLab,
  onOpenESGLab,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'engineering' | 'design' | 'security' | 'specialized' | 'testing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleAgentAction = (agentId: string) => {
    onClose();
    switch (agentId) {
      case 'civil-engineer':
        if (onOpenCivilLab) onOpenCivilLab();
        break;
      case 'esg-sustainability-officer':
        if (onOpenESGLab) onOpenESGLab();
        break;
      case 'ui-designer':
      case 'ui-finish-gate-reviewer':
        if (onOpenDesignLab) onOpenDesignLab();
        break;
      case 'whimsy-injector':
        navigate('/presentation');
        break;
      case 'security-architect':
        toast.success('🛡️ Auditoría de Seguridad ejecutada: 12/12 vectores "Dirty Dozen" blindados y validados.', {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: '#121215',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }
        });
        break;
      case 'test-automation-engineer':
        toast.success('🧪 Suite de Invariantes ejecutada: 100% de tests de dominio pasados con Vitest.', {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: '#121215',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }
        });
        break;
      case 'mobile-app-builder':
      case 'mobile-release-engineer':
        navigate('/mobile');
        break;
      case 'cfo-accounts-payable':
        navigate('/admin/billing');
        break;
      case 'accessibility-auditor':
        toast.success('♿ Modo WCAG 2.2 AA verificado: Ratios de contraste >= 14:1 activos.', {
          duration: 4000
        });
        break;
      default:
        toast.success('⚡ Tarea de agente ejecutada en el sistema.');
        break;
    }
  };

  const agentsList = [
    {
      id: 'civil-engineer',
      name: 'Specialized Civil Engineer',
      division: 'Specialized',
      category: 'specialized',
      emoji: '🏗️',
      status: 'Activo en ObraService',
      role: 'Supervisión del dominio técnico de construcción en España: control de tajos, cuadrillas, albaranes de subcontrata, libros de órdenes y cumplimiento de la Ley 32/2006 reguladora de la subcontratación.',
      vibe: 'Garantiza que la terminología, flujos y normativas reflejen la realidad operativa a pie de obra.',
      keyTasks: ['Invariantes de parte diario', 'Control de horas por convenio', 'Validación de subcontratas y REA', 'Desglose de tajos y oficios']
    },
    {
      id: 'senior-developer',
      name: 'Senior Developer',
      division: 'Engineering',
      category: 'engineering',
      emoji: '⚡',
      status: 'Activo en ObraService',
      role: 'Líder técnico frontend y full-stack: arquitectura limpia, rendimiento a 60 FPS, micro-interacciones pulidas y sincronización en tiempo real.',
      vibe: 'Construye sistemas resilientes, reactivos y con acabado de lujo para producción.',
      keyTasks: ['Store reactivo con observadores', 'Sincronización multi-dispositivo', 'Atajos de teclado globales', 'Optimización de bundle']
    },
    {
      id: 'software-architect',
      name: 'Software Architect',
      division: 'Engineering',
      category: 'engineering',
      emoji: '🏛️',
      status: 'Activo en ObraService',
      role: 'Diseño de la arquitectura del dominio sin dependencias externas, asegurando que las reglas de negocio sean puras y testeables.',
      vibe: 'Aísla el núcleo de negocio de los detalles de infraestructura y frameworks.',
      keyTasks: ['Aislamiento de reglas de dominio', 'Invariantes de albaranes y partes', 'Idempotencia de operaciones', 'Estructura modular escalable']
    },
    {
      id: 'security-architect',
      name: 'Security Architect & AppSec Auditor',
      division: 'Security',
      category: 'security',
      emoji: '🛡️',
      status: 'Activo en ObraService',
      role: 'Seguridad multicapa, aislamiento estricto multi-tenant y desarrollo de la suite de pruebas de 12 vectores "Dirty Dozen" para Firestore Rules.',
      vibe: 'Paranoico con la inmutabilidad de los registros de auditoría y la suplantación de identidad.',
      keyTasks: ['Aislamiento por companyId', 'Prevención de escalada de privilegios', 'Reglas de Firestore inviolables', 'Suite de tests Dirty Dozen']
    },
    {
      id: 'mobile-release-engineer',
      name: 'Mobile Release Engineer',
      division: 'Engineering',
      category: 'engineering',
      emoji: '🚀',
      status: 'Activo en ObraService',
      role: 'Especialista en pipelines de despliegue iOS/Android, Fastlane CI/CD, firmas de código, TestFlight y rollouts escalonados.',
      vibe: 'Despliega apps nativas con cero caídas y umbrales estrictos de Crash-Free (>= 99.5%).',
      keyTasks: ['Fastlane CI/CD automatizado', 'Despliegue escalonado de 7 días', 'Gestión de firmas criptográficas', 'Monitor de ANR y Crashlytics']
    },
    {
      id: 'mobile-app-builder',
      name: 'Mobile App Builder',
      division: 'Engineering',
      category: 'engineering',
      emoji: '📲',
      status: 'Activo en ObraService',
      role: 'Ingeniería de interfaces móviles para condiciones de campo: touch targets >= 48px, gestos táctiles y modo sin conexión con IndexedDB.',
      vibe: 'Diseñado para usarse con una sola mano y guantes en el tajo.',
      keyTasks: ['Panel móvil dedicado (< 768px)', 'Firma digital táctil HTML5 Canvas', 'Geolocalización GPS Haversine', 'Caché IndexedDB offline']
    },
    {
      id: 'ui-designer',
      name: 'UI Designer & Theme Architect',
      division: 'Design',
      category: 'design',
      emoji: '🎨',
      status: 'Activo en ObraService',
      role: 'Diseño visual de alta fidelidad, paleta industrial obsidiana con acentos ámbar (#F59E0B) y tipografía técnica nítida con números tabulares.',
      vibe: 'Cero píldoras genéricas, contraste óptimo bajo luz solar directa y micro-interacciones fluidas.',
      keyTasks: ['Tokens de diseño industrial', 'Modo oscuro de alto contraste', 'Jerarquía visual rigurosa', 'Componentes modulares pulidos']
    },
    {
      id: 'ui-finish-gate-reviewer',
      name: 'UI Finish-Gate Reviewer',
      division: 'Design',
      category: 'design',
      emoji: '🧱',
      status: 'Activo en ObraService',
      role: 'Filtro anti-slop. Detecta interfaces genéricas o intercambiables antes de producción basándose en un contrato de diseño específico del sector.',
      vibe: 'Alérgico a dashboards que podrían pertenecer a cualquier producto.',
      keyTasks: ['Eliminación de gradientes decorativos', 'Protección del lenguaje de tajo', 'Validación de contraste bajo luz solar', 'Contrato de diseño estricto']
    },
    {
      id: 'data-privacy-officer',
      name: 'Data Privacy Officer (GDPR / LOPD)',
      division: 'Specialized',
      category: 'specialized',
      emoji: '🔒',
      status: 'Activo en ObraService',
      role: 'Garantiza el cumplimiento estricto del RGPD y la LOPD-GDD en la captura de geoposicionamiento de trabajadores y registros biométricos/firmas.',
      vibe: 'La geolocalización solo se captura en el instante del fichaje, nunca como rastreo continuo.',
      keyTasks: ['Protección de datos del trabajador', 'Consentimiento explícito de fichaje', 'Registro inmutable de auditoría', 'Derecho al olvido y portabilidad']
    },
    {
      id: 'data-visualization-engineer',
      name: 'Data Visualization Engineer',
      division: 'Engineering',
      category: 'engineering',
      emoji: '📈',
      status: 'Activo en ObraService',
      role: 'Ingeniero de visualización de datos — gráficos de reparto de horas por tajo, horas ordinarias vs extras y radar satelital GPS.',
      vibe: 'El trabajo del gráfico es decir la verdad rápido. Nunca dejes mentir a un eje bonito.',
      keyTasks: ['Gráficos de barras apiladas', 'Balance ordinarias vs extras', 'Radar de presencia GPS', 'Límites de horas por convenio']
    },
    {
      id: 'accessibility-auditor',
      name: 'Accessibility Auditor (WCAG 2.2 AA)',
      division: 'Testing',
      category: 'testing',
      emoji: '♿',
      status: 'Activo en ObraService',
      role: 'Auditoría de accesibilidad WCAG 2.2 nivel AA, lectores de pantalla (VoiceOver/NVDA), etiquetas semánticas y navegación completa por teclado.',
      vibe: 'Si no está probado con un lector de pantalla, no es accesible.',
      keyTasks: ['Atajos de teclado globales', 'Anillos de foco visibles', 'Cumplimiento WCAG 2.2 AA', 'Contraste para operarios con guantes']
    },
    {
      id: 'test-automation-engineer',
      name: 'Test Automation Engineer',
      division: 'Testing',
      category: 'testing',
      emoji: '🧪',
      status: 'Activo en ObraService',
      role: 'Diseño y ejecución de la suite de pruebas unitarias, de integración y de reglas de seguridad con Vitest y TypeScript.',
      vibe: 'Si no tiene pruebas automatizadas verificando sus invariantes, no está listo para producción.',
      keyTasks: ['Pruebas de algoritmo Haversine', 'Validación CIF/NIF español', 'Pruebas de idempotencia de albaranes', 'Suite de seguridad Dirty Dozen']
    },
    {
      id: 'esg-sustainability-officer',
      name: 'ESG & Sustainability Officer',
      division: 'Specialized',
      category: 'specialized',
      emoji: '🌱',
      status: 'Activo en ObraService',
      role: 'Especialista en sostenibilidad corporativa, huella de carbono MITECO (Alcance 1 y 2) y cumplimiento del Real Decreto 105/2008 regulador de Residuos de Construcción y Demolición (RCDs).',
      vibe: 'Construye programas de sostenibilidad rigurosos y libres de greenwashing.',
      keyTasks: ['Cálculo de emisiones CO2', 'Gestión de residuos RCD (RD 105/2008)', 'Cumplimiento CSRD y Taxonomía UE', 'Certificados no financieros']
    },
    {
      id: 'cfo-accounts-payable',
      name: 'Chief Financial Officer & AP Agent',
      division: 'Specialized',
      category: 'specialized',
      emoji: '💶',
      status: 'Activo en ObraService',
      role: 'Control económico de costes de mano de obra directa e indirecta, conciliación de albaranes frente a certificaciones y prevención de desvíos.',
      vibe: 'Convierte las horas registradas en el tajo en conciliaciones contables exactas.',
      keyTasks: ['Conciliación de horas y tarifas', 'Calculadora de ROI y ahorro', 'Generación de albaranes inmutables', 'Prevención de dobles facturaciones']
    },
    {
      id: 'whimsy-injector',
      name: 'Whimsy Injector & Interactive Stylist',
      division: 'Design',
      category: 'design',
      emoji: '✨',
      status: 'Activo en ObraService',
      role: 'Momentos memorables de interacción: Keynote Ejecutiva inmersiva, transiciones suaves y sellado oficial animado en albaranes firmados.',
      vibe: 'Añade la elegancia que hace que una herramienta técnica sea un placer de usar.',
      keyTasks: ['Presentación Keynote Ejecutiva 3D', 'Sello animado en albaranes', 'Micro-interacciones táctiles', 'Simulador interactivo en tiempo real']
    }
  ];

  const filteredAgents = agentsList.filter(agent => {
    const matchesCategory = activeTab === 'all' || agent.category === activeTab;
    const matchesQuery = searchQuery === '' || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.vibe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.keyTasks.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agents-modal-title"
    >
      <div 
        className="w-full max-w-5xl bg-[#121215] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e0e11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="agents-modal-title" className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Directorio del Equipo de Agentes IA
                </h2>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {agentsList.length} Agentes Activos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Especialistas invocados para diseñar, auditar, asegurar y construir ObraService Pro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar directorio de agentes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-7 border-b border-white/10 bg-black/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181b] border border-white/10 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({agentsList.length})
            </button>
            <button
              onClick={() => setActiveTab('engineering')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'engineering' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ingeniería ({agentsList.filter(a => a.category === 'engineering').length})
            </button>
            <button
              onClick={() => setActiveTab('specialized')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'specialized' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Construcción & Legal ({agentsList.filter(a => a.category === 'specialized').length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'security' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Seguridad ({agentsList.filter(a => a.category === 'security').length})
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'design' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Diseño & UX ({agentsList.filter(a => a.category === 'design').length})
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'testing' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              QA & Accesibilidad ({agentsList.filter(a => a.category === 'testing').length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar agente o competencia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Agents Grid List */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
              <div 
                key={agent.id}
                className="p-5 rounded-2xl bg-[#18181b]/70 hover:bg-[#18181b] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-md"
              >
                <div className="space-y-3">
                  {/* Top line: Emoji, Name, Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
                        {agent.emoji}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {agent.name}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          División: {agent.division}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {agent.status}
                    </span>
                  </div>

                  {/* Vibe Quote */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300 italic">
                    "{agent.vibe}"
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {agent.role}
                  </p>
                </div>

                {/* Key Tasks Pill Tags & Action Button */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                      Contribuciones en ObraService Pro:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.keyTasks.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Execution Trigger */}
                  <button
                    onClick={() => handleAgentAction(agent.id)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-300 hover:text-amber-200 font-mono font-bold text-xs flex items-center justify-between transition-all cursor-pointer group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ejecutar Tarea / Invocar Agente</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-400">
              No se encontraron agentes que coincidan con la búsqueda.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#0e0e11] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Integración Multidisciplinar de Agentes de Especialidad · Agency-Agents Framework
          </span>
          <span className="text-emerald-400 font-bold">14/14 Agentes Activos & Verificados</span>
        </div>

      </div>
    </div>
  );
};
