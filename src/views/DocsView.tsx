import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Users, 
  Building2, 
  Zap,
  HelpCircle,
  PlayCircle,
  MessageSquare,
  LifeBuoy,
  Activity,
  ArrowRight,
  X,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppState } from '../types';

interface ArticleData {
  title: string;
  category: string;
  readTime: string;
  content: string[];
  tips: string[];
}

const ARTICLES_DATABASE: Record<string, ArticleData> = {
  'Cómo crear tu primera organización': {
    title: 'Cómo crear tu primera organización en ObraService',
    category: 'Primeros Pasos',
    readTime: '3 min',
    content: [
      'ObraService funciona bajo una arquitectura multi-tenant estricta. La empresa contratista principal actúa como entidad matriz, manteniendo aislamiento criptográfico y bases de datos independientes.',
      '1. Dirígete a la vista de "Configuración" > "Organización".',
      '2. Introduce la Razón Social completa, CIF/NIF oficial y domicilio fiscal homologado.',
      '3. Sube el logotipo corporativo para que aparezca automáticamente en las cabeceras de todos los partes y albaranes oficiales generados.'
    ],
    tips: [
      'Recuerda verificar el Código de Inscripción en el Registro de Empresas Acreditadas (REA) para validar contratos con subcontratas.',
      'Puedes generar códigos de invitación únicos para agregar jefes de obra o administrativos con un solo clic.'
    ]
  },
  'Invitación de miembros del equipo': {
    title: 'Invitación y gestión de accesos para tu equipo',
    category: 'Primeros Pasos',
    readTime: '2 min',
    content: [
      'Los miembros del equipo pueden recibir invitaciones directas por correo electrónico o mediante enlaces de incorporación protegidos por token.',
      'Roles disponibles:',
      '• Administrador Principal (Constructora): Control total de presupuestos, bloqueo de certificaciones y auditoría completa.',
      '• Jefe de Obra (Site Manager): Registro de partes diarios, validación in situ en el tajo y control de presencia.',
      '• Subcontratista: Visualización y firma de sus propios albaranes, declaración de cuadrillas y apertura de disputas justificadas.'
    ],
    tips: [
      'Los operarios de campo no requieren correo corporativo; pueden registrarse mediante teléfono móvil o PIN asignado por su encargado.'
    ]
  },
  'Configuración de roles y permisos': {
    title: 'Matriz de Permisos y Roles (RBAC)',
    category: 'Primeros Pasos',
    readTime: '4 min',
    content: [
      'La seguridad en obra exige que ninguna subcontrata pueda visualizar datos de facturación ni mano de obra de otras empresas competidoras.',
      'El sistema impone un filtrado nativo a nivel de capa de datos: un usuario de la subcontrata "Estructuras Levante" jamás recibirá ni filtrará albaranes pertenecientes a "Instalaciones Sur".',
      'El Administrador puede revocar accesos en tiempo real con efecto inmediato en todas las sesiones activas.'
    ],
    tips: [
      'Cualquier cambio de rol queda registrado en la bitácora inmutable de auditoría con marca temporal certificada.'
    ]
  },
  'Primeros pasos en modo Demo': {
    title: 'Aprovecha al máximo el Sandbox / Modo Demo',
    category: 'Primeros Pasos',
    readTime: '2 min',
    content: [
      'El modo Demo te permite experimentar toda la plataforma con proyectos reales precargados (ej. Ampliación Metro Línea 5, Torre Residencial Skyline).',
      'Utiliza la barra flotante de Demo en la esquina inferior derecha para alternar entre roles: pasa de Jefe de Obra emitiendo un parte a Subcontratista confirmando un albarán en 1 segundo.',
      'Puedes restablecer los datos originales de la demo en cualquier momento desde la barra de herramientas.'
    ],
    tips: [
      'Las firmas y validaciones realizadas en modo Demo no se sincronizan con las bases de producción oficiales.'
    ]
  },
  'Creación y edición de proyectos': {
    title: 'Alta y Configuración Técnica de Obras',
    category: 'Gestión de Obras',
    readTime: '3 min',
    content: [
      'Cada proyecto representa una obra física con presupuesto asignado, código de proyecto normalizado y perímetro de trabajo.',
      '1. Ve a "Obras" > "Nueva Obra".',
      '2. Rellena los datos básicos: Código (ej. OB-2026-088), nombre, cliente y presupuesto de mano de obra.',
      '3. Establece las coordenadas geográficas exactas (Latitud/Longitud) del punto central del tajo.'
    ],
    tips: [
      'El presupuesto de mano de obra te permitirá ver el termómetro de desviación económica en tiempo real con cada parte aprobado.'
    ]
  },
  'Configuración de radios de validación GPS': {
    title: 'Geocercas y Tolerancia Criptográfica GPS',
    category: 'Gestión de Obras',
    readTime: '4 min',
    content: [
      'Para combatir el fraude en fichajes y partes "fantasma", ObraService calcula la distancia haversiana entre el dispositivo del emisor y el centro de la obra.',
      '• Radio Verde (< 500m): Validación automática de presencia en tajo.',
      '• Radio Amarillo (500m - 2000m): Advertencia obligatoria con justificación técnica (ej. acopio exterior o transporte de áridos).',
      '• Fuera de rango (> 2000m): Bloqueo preventivo requiriendo autorización explícita del Jefe de Obra.'
    ],
    tips: [
      'Los navegadores móviles requieren permisos de geolocalización de alta precisión para capturar la señal de satélite.'
    ]
  },
  'Emisión de partes diarios desde el móvil': {
    title: 'Flujo Móvil de Partes Diarios en Tajo',
    category: 'Partes y Albaranes',
    readTime: '3 min',
    content: [
      'El asistente paso a paso para móviles está optimizado para su uso en campo, incluso con guantes de protección (touch targets superiores a 48px).',
      'Paso 1: Selección de obra y fecha de ejecución.',
      'Paso 2: Composición de cuadrilla con horas normales y extraordinarias.',
      'Paso 3: Asignación de maquinaria y materiales descargados.',
      'Paso 4: Verificación GPS automática y captura fotográfica de evidencias antes de la firma digital.'
    ],
    tips: [
      'Si pierdes la cobertura 4G/5G en el sótano de una obra, el parte se guarda en IndexedDB local y se sincroniza al recuperar señal.'
    ]
  },
  'Generación automática de albaranes': {
    title: 'Desglose Automático de Albaranes por Subcontrata',
    category: 'Partes y Albaranes',
    readTime: '3 min',
    content: [
      'Al enviar un parte diario que involucra personal de 3 subcontratas distintas, el motor de ObraService genera instantáneamente 3 albaranes individuales homologados.',
      'Cada albarán contiene exclusivamente las horas y operarios correspondientes a cada empresa, listo para su cotejo y firma digital.',
      'Esto elimina las semanas de retraso habituales en el envío de albaranes en papel y previene disputas a fin de mes.'
    ],
    tips: [
      'Los albaranes pueden exportarse a PDF certificado con sello digital o integrarse con el software ERP contable.'
    ]
  },
  'Auditoría total (Audit Trail)': {
    title: 'Trazabilidad Inmutable y Libro de Auditoría',
    category: 'Seguridad y Red',
    readTime: '5 min',
    content: [
      'Cada acción ejecutada en ObraService queda registrada en un libro de auditoría de solo anexión (Append-Only Ledger).',
      'Los eventos de auditoría registran: Identificador único del evento, timestamp ISO UTC, usuario y rol actuante, empresa representada, entidad afectada (Parte, Albarán, Proyecto), valor previo y valor modificado.',
      'Cumple estrictamente con los requerimientos de la Ley Antifraude 11/2021 y directivas europeas de trazabilidad laboral.'
    ],
    tips: [
      'El informe de auditoría se puede descargar en formato CSV firmado para inspecciones de trabajo o auditorías externas.'
    ]
  }
};

const categories = [
  {
    id: 'onboarding',
    title: 'Primeros Pasos',
    description: 'Configura tu empresa y conecta tu equipo en minutos.',
    icon: PlayCircle,
    color: 'text-blue-500',
    articles: [
      'Cómo crear tu primera organización',
      'Invitación de miembros del equipo',
      'Configuración de roles y permisos',
      'Primeros pasos en modo Demo'
    ]
  },
  {
    id: 'projects',
    title: 'Gestión de Obras',
    description: 'Control de proyectos, geocercas y personal asignado.',
    icon: Building2,
    color: 'text-brand-accent',
    articles: [
      'Creación y edición de proyectos',
      'Configuración de radios de validación GPS'
    ]
  },
  {
    id: 'reports',
    title: 'Partes y Albaranes',
    description: 'Flujo de trabajo desde el tajo hasta la certificación.',
    icon: FileText,
    color: 'text-emerald-500',
    articles: [
      'Emisión de partes diarios desde el móvil',
      'Generación automática de albaranes'
    ]
  },
  {
    id: 'security',
    title: 'Seguridad y Red',
    description: 'Inmutabilidad de datos y cumplimiento legal.',
    icon: ShieldCheck,
    color: 'text-purple-500',
    articles: [
      'Auditoría total (Audit Trail)'
    ]
  }
];

interface DocsViewProps {
  state?: AppState;
}

export const DocsView: React.FC<DocsViewProps> = ({ state }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('technical');
  const [ticketDescription, setTicketDescription] = useState('');

  const handleDocClick = (articleTitle: string) => {
    const article = ARTICLES_DATABASE[articleTitle];
    if (article) {
      setSelectedArticle(article);
    } else {
      setSelectedArticle({
        title: articleTitle,
        category: 'Guía Técnica',
        readTime: '3 min',
        content: [
          `Esta guía detalla los procedimientos operativos estándar para "${articleTitle}" en la plataforma ObraService.`,
          'El sistema cuenta con flujos automatizados de validación técnica, asignación de permisos por rol y registro criptográfico de firmas.',
          'Para consultas adicionales, utiliza el canal directo de soporte Enterprise.'
        ],
        tips: [
          'Mantén actualizadas las credenciales de tu equipo para asegurar la validez jurídica de todas las certificaciones.'
        ]
      });
    }
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) {
      toast.error('Por favor, indica asunto y descripción de la consulta.');
      return;
    }

    const ticketCode = `TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    toast.success(`Ticket ${ticketCode} abierto. Respuesta estimada: < 2 horas.`);
    setIsTicketModalOpen(false);
    setTicketSubject('');
    setTicketDescription('');
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(art => 
      !searchQuery || 
      art.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.articles.length > 0 || !searchQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">Ayuda y Documentación</h1>
          <p className="text-brand-muted font-medium mt-1">Centro de conocimiento operativo y normativo de ObraService.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl flex items-center gap-2.5">
            <LifeBuoy className="w-4 h-4 text-brand-accent" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent leading-none">Soporte Activo</span>
              <span className="text-[10px] font-bold text-white mt-0.5">SLA Enterprise &lt; 2h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Hero */}
      <div className="card p-6 sm:p-12 text-center space-y-4 sm:space-y-6 bg-gradient-to-br from-brand-surface to-brand-bg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-accent/10 transition-all duration-700" />
        <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight relative z-10">
          ¿En qué podemos ayudarte hoy?
        </h2>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="relative group">
            <Search className="w-5 h-5 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por funcionalidad, rol o normativa..."
              className="input pl-12 h-12 sm:h-14 text-sm sm:text-base w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 relative z-10">
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Atajos Populares:</span>
          {['Partes Diarios', 'Invitaciones', 'Geovallas GPS', 'Auditoría'].map(tag => (
            <button 
              key={tag} 
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1 rounded-lg bg-brand-bg border border-brand-border text-[10px] font-bold text-white hover:border-brand-accent transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {filteredCategories.map((category) => (
          <div key={category.id} className="card p-6 sm:p-8 group hover:border-brand-accent/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center transition-transform group-hover:scale-110 ${category.color}`}>
                <category.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest flex items-center gap-1.5">
                {category.articles.length} Artículos
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-tight mb-1.5">
              {category.title}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted font-medium mb-6 leading-relaxed">
              {category.description}
            </p>

            <div className="space-y-2">
              {category.articles.map((article, i) => (
                <button 
                  key={i}
                  onClick={() => handleDocClick(article)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-brand-surface border border-brand-border hover:bg-brand-bg hover:border-brand-accent/30 transition-all text-xs font-bold text-brand-muted hover:text-white group/item cursor-pointer text-left"
                >
                  <span className="truncate pr-2">{article}</span>
                  <ChevronRight className="w-4 h-4 text-brand-accent shrink-0 group-hover/item:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="p-8 sm:p-12 rounded-3xl sm:rounded-[40px] bg-brand-accent border border-brand-accent relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-white/10 transition-all duration-700" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              ¿Tienes una incidencia o consulta técnica?
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
              Nuestro equipo de ingeniería y soporte de campo responde en menos de 2 horas para clientes autorizados.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsTicketModalOpen(true)}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 bg-white text-brand-bg rounded-xl sm:rounded-2xl font-black uppercase tracking-widest hover:bg-brand-bg hover:text-white transition-all shadow-xl active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              Abrir Ticket Técnico
            </button>
            <button 
              onClick={() => {
                toast.success('Descargando Guía Operativa Completa en PDF (v2026.4)...');
              }}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 bg-brand-bg/20 backdrop-blur-md border border-white/20 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest hover:bg-brand-bg/40 transition-all text-xs sm:text-sm cursor-pointer"
            >
              Descargar Manual PDF
            </button>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                    {selectedArticle.category} • {selectedArticle.readTime} de lectura
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                    {selectedArticle.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-brand-muted leading-relaxed">
              {selectedArticle.content.map((paragraph, idx) => (
                <p key={idx} className="text-white/90">
                  {paragraph}
                </p>
              ))}

              {selectedArticle.tips.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/30 space-y-2">
                  <div className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Consejo de ObraService</span>
                  </div>
                  {selectedArticle.tips.map((tip, idx) => (
                    <p key={idx} className="text-white text-xs">
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-brand-border bg-brand-bg flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedArticle(null)}
                className="btn-primary h-10 px-5 text-xs font-bold"
              >
                Cerrar Artículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                    Nuevo Ticket de Soporte
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Atención técnica preferente para cuentas activas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTicket} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Tipo de Consulta
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="input h-11 w-full text-xs font-medium"
                >
                  <option value="technical">Incidencia en Validación o GPS</option>
                  <option value="billing">Facturación y Albaranes</option>
                  <option value="integration">Integración API / ERP</option>
                  <option value="other">Duda Normativa / Legal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Asunto
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ej: Discrepancia de geolocalización en parte DR-202609-001"
                  className="input h-11 w-full text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  rows={4}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Explica qué ha sucedido, obra involucrada o número de albarán..."
                  className="input w-full text-xs font-medium p-3"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="btn-secondary h-11 px-5 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary h-11 px-6 text-xs font-bold gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
