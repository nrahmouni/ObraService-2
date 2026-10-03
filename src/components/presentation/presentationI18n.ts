export type PresentationLang = 'es' | 'en' | 'nl';

export interface ChapterContent {
  num: string;
  navTitle: string;
  badge: string;
  headlineMain: string;
  headlineGradient: string;
  description: string;
}

export interface I18nPresentationData {
  nav: {
    brandSubtitle: string;
    exit: string;
    soundOn: string;
    soundOff: string;
    motionReduced: string;
    motionFull: string;
    next: string;
    prev: string;
    keyboardHint: string;
    interactiveDemoBadge: string;
  };
  liveDemo: {
    title: string;
    subtitle: string;
    tabs: {
      dailyReport: string;
      geofence: string;
      signatures: string;
      compliance: string;
      auditLedger: string;
    };
    simulateOffline: string;
    simulateOnline: string;
    offlineBufferActive: string;
    cloudSynced: string;
    signPrompt: string;
    clearSignature: string;
    certifySignature: string;
    signatureCertified: string;
    insideGeofence: string;
    outsideGeofence: string;
    clockInSuccess: string;
  };
  chapters: ChapterContent[];
  problem: {
    tag: string;
    stat1: string;
    stat1Label: string;
    stat1Sub: string;
    stat2: string;
    stat2Label: string;
    stat2Sub: string;
    stat3: string;
    stat3Label: string;
    stat3Sub: string;
    brokenTitle: string;
    brokenPill: string;
    brokenSteps: { step: string; title: string; desc: string }[];
    solutionTitle: string;
    solutionPill: string;
    solutionSteps: { step: string; title: string; desc: string }[];
  };
  solution: {
    tag: string;
    diagramSubtitle: string;
    diagramTitle: string;
    diagramDesc: string;
    node1Tag: string;
    node1Title: string;
    node1Desc: string;
    node1Pill: string;
    node2Tag: string;
    node2Title: string;
    node2Desc: string;
    node2Pill: string;
    node3Tag: string;
    node3Title: string;
    node3Desc: string;
    node3Pill: string;
  };
  services: {
    tag: string;
    headline: string;
    description: string;
    items: {
      tag: string;
      metric: string;
      metricLabel: string;
      title: string;
      desc: string;
    }[];
    radarTitle: string;
    radarDesc: string;
  };
  tech: {
    tag: string;
    headline: string;
    headlineGradient: string;
    description: string;
    details: Record<string, { category: string; title: string; desc: string }>;
  };
  benefits: {
    tag: string;
    headline: string;
    description: string;
    roles: {
      role: string;
      pill: string;
      title: string;
      desc: string;
    }[];
    rbacTitle: string;
    rbacSubtitle: string;
    rbacPill: string;
    rbacCards: {
      level: string;
      title: string;
      sub: string;
      desc: string;
    }[];
  };
  cta: {
    headline: string;
    headlineGradient: string;
    subhead: string;
    primaryButton: string;
    secondaryButton: string;
  };
}

export const PRESENTATION_I18N: Record<PresentationLang, I18nPresentationData> = {
  es: {
    nav: {
      brandSubtitle: 'Presentación Ejecutiva 2026',
      exit: 'Cerrar',
      soundOn: 'Audio activado',
      soundOff: 'Silenciado',
      motionReduced: 'Movimiento reducido',
      motionFull: 'Movimiento fluido',
      next: 'Siguiente',
      prev: 'Anterior',
      keyboardHint: 'Usa [←] [→] o [Espacio] para avanzar',
      interactiveDemoBadge: 'Simulador en Vivo',
    },
    liveDemo: {
      title: 'Consola Operativa en Tiempo Real',
      subtitle: 'Prueba la interacción exacta que experimenta el equipo en tajo y oficina',
      tabs: {
        dailyReport: 'Parte Diario Express',
        geofence: 'Fichaje Geocerca GPS',
        signatures: 'Albarán & Firma Táctil',
        compliance: 'Semáforo PRL & REA',
        auditLedger: 'Auditoría Forense',
      },
      simulateOffline: 'Simular Corte de Cobertura',
      simulateOnline: 'Restablecer Cobertura 5G',
      offlineBufferActive: 'Modo Offline: 3 transacciones en cola local (IndexedDB)',
      cloudSynced: 'Sincronizado: Base de datos en la nube al día (0ms lag)',
      signPrompt: 'Firma con el ratón o dedo sobre la pantalla',
      clearSignature: 'Limpiar',
      certifySignature: 'Certificar y Emitir Albarán',
      signatureCertified: 'Albarán certificado criptográficamente con éxito',
      insideGeofence: 'Dentro de perímetro de obra (Radio 250m - Desvío 38m)',
      outsideGeofence: 'Fuera de perímetro (Distancia 840m - Fichaje no válido)',
      clockInSuccess: 'Fichaje Fehaciente Registrado con GPS',
    },
    chapters: [
      {
        num: '01',
        navTitle: 'Visión General',
        badge: 'ObraService Pro // Plataforma B2B',
        headlineMain: 'Control total de obra.',
        headlineGradient: 'Sin fricción, en tiempo real.',
        description: 'El sistema operativo digital para constructoras principales y subcontratas en España. Partes diarios, fichaje con geocerca GPS, albaranes automáticos y trazabilidad legal.',
      },
      {
        num: '02',
        navTitle: 'El Problema',
        badge: '01 // El Diagnóstico',
        headlineMain: 'Las obras modernas no pueden gestionarse con',
        headlineGradient: 'papel mojado y notas perdidas.',
        description: 'Las hojas manuscritas, las horas extras a ojo y las discusiones de fin de mes cuestan hasta un 18% del margen neto y semanas de retraso en liquidaciones.',
      },
      {
        num: '03',
        navTitle: 'La Solución',
        badge: '02 // La Arquitectura',
        headlineMain: 'Tajo. Nube. Oficina.',
        headlineGradient: 'Sincronización ininterrumpida.',
        description: 'Arquitectura Offline-First con IndexedDB y sincronización reactiva en tiempo real. Trabaja en túneles o sótanos sin 4G/5G; la app sincroniza sola al volver a tener señal.',
      },
      {
        num: '04',
        navTitle: 'Capacidades',
        badge: '03 // Ingeniería Funcional',
        headlineMain: '6 Módulos Especializados.',
        headlineGradient: 'Un solo flujo conectado.',
        description: 'Diseñados específicamente para los requerimientos legales, técnicos y laborales de la construcción en España.',
      },
      {
        num: '05',
        navTitle: 'Tecnología',
        badge: '04 // Infraestructura & Stack',
        headlineMain: 'Rendimiento industrial.',
        headlineGradient: 'Respuesta en milisegundos.',
        description: 'Stack moderno con React 19, TypeScript estricto, Google Cloud Firestore, PostgreSQL Cloud SQL, Google Maps Platform y Gemini 2.5 Flash.',
      },
      {
        num: '06',
        navTitle: 'Beneficios',
        badge: '05 // Rentabilidad Comprobada',
        headlineMain: 'Impacto medible.',
        headlineGradient: 'Alineación de todos los roles.',
        description: 'Cuando la constructora principal y las subcontratas comparten la misma verdad digital certificada, el conflicto desaparece.',
      },
      {
        num: '07',
        navTitle: 'Comenzar',
        badge: '06 // El Lanzamiento',
        headlineMain: 'Construye con certeza.',
        headlineGradient: 'Digitaliza tus obras hoy.',
        description: 'Accede a la demo interactiva completa con datos reales de obras, cuadrillas y subcontratas listas para operar.',
      },
    ],
    problem: {
      tag: '01 // El Diagnóstico',
      stat1: '18%',
      stat1Label: 'Margen perdido',
      stat1Sub: 'Por horas fantasma no justificadas y albaranes perdidos.',
      stat2: '45 días',
      stat2Label: 'Demora en conciliación',
      stat2Sub: 'Tiempo medio entre emisión de horas y aprobación de factura.',
      stat3: '7.500 €',
      stat3Label: 'Sanción ITSS por centro',
      stat3Sub: 'Riesgo legal por incumplimiento de registro horario RDL 8/2019.',
      brokenTitle: 'Flujo Tradicional Manual (Papel y Excel)',
      brokenPill: '18% Pérdida de Margen',
      brokenSteps: [
        { step: '01', title: 'Albarán en Libreta Manchada', desc: 'Notas manuscritas ilegibles y hojas perdidas en la caseta de obra.' },
        { step: '02', title: 'Horas Extras Calculadas a Ojo', desc: 'Discrepancias constantes entre encargado y cuadrilla sin geolocalización.' },
        { step: '03', title: 'Transcripción Manual Tardía', desc: 'Semanas de retraso al pasar datos en sucio a hojas de Excel en oficina.' },
        { step: '04', title: 'Bloqueo y Disputa a Fin de Mes', desc: 'Facturas retenidas, tensiones entre empresas y riesgo ante Inspección de Trabajo.' },
      ],
      solutionTitle: 'Con ObraService Pro (100% Digital y Certificado)',
      solutionPill: '0 Discrepancias',
      solutionSteps: [
        { step: '01', title: 'Parte Diario en 2 Minutos', desc: 'Asistente móvil con selección de cuadrilla y desglose de horas ordinarias/extras.' },
        { step: '02', title: 'Geocerca GPS Haversine (250m)', desc: 'Validación matemática fehaciente de presencia física en el perímetro de obra.' },
        { step: '03', title: 'Albarán Automático por CIF', desc: 'Segregación en tiempo real por empresa y firma táctil manuscrita en pantalla.' },
        { step: '04', title: 'Sincronización en Nube & Pista Inmutable', desc: 'Aprobación en 1 clic desde oficina y expediente listo para cualquier auditoría.' },
      ],
    },
    solution: {
      tag: 'Topología de Red Resiliente',
      diagramSubtitle: 'Topología de Red Resiliente',
      diagramTitle: 'Flujo de Datos Tajo ↔ Nube ↔ Oficina Central',
      diagramDesc: 'Funcionamiento continuo sin interrupción incluso en sótanos de hormigón, túneles o fincas sin cobertura 4G/5G.',
      node1Tag: 'Nodo 01 • Origen',
      node1Title: 'Tajo / A Pie de Obra',
      node1Desc: 'Fichaje GPS, parte de jornada, evidencias fotográficas y firmas.',
      node1Pill: 'Buffer local IndexedDB',
      node2Tag: 'Nodo 02 • Core',
      node2Title: 'Motor Cloud & Reglas',
      node2Desc: 'Firestore Realtime Sync + Cloud SQL + Motor Invariantes de Dominio.',
      node2Pill: '1 albarán por CIF subcontrata',
      node3Tag: 'Nodo 03 • Destino',
      node3Title: 'Oficina / Dirección',
      node3Desc: 'Validación de partes en 1 clic, métricas en vivo y exportación contable.',
      node3Pill: 'Certificaciones y liquidaciones',
    },
    services: {
      tag: '03 // Ingeniería Funcional',
      headline: '6 Módulos Especializados.',
      description: 'Cada módulo ha sido forjado para resolver una necesidad operativa y legal de las obras en España.',
      items: [
        {
          tag: 'Módulo 01',
          metric: '250 m',
          metricLabel: 'Geocerca Haversine',
          title: 'Partes con Geoposicionamiento',
          desc: 'Emisión en menos de 2 minutos. Comprobación matemática de presencia en el perímetro de la obra.',
        },
        {
          tag: 'Módulo 02',
          metric: '100%',
          metricLabel: 'Legal RDL 8/2019',
          title: 'Fichaje Horario en 1 Toque',
          desc: 'Registro fehaciente de jornada laboral para personal propio y operarios de subcontrata con GPS.',
        },
        {
          tag: 'Módulo 03',
          metric: '0 s',
          metricLabel: 'Tiempo de Emisión',
          title: 'Albaranes & Disputas',
          desc: 'El sistema segrega automáticamente las horas por CIF y genera el albarán listo para firmar con el dedo.',
        },
        {
          tag: 'Módulo 04',
          metric: 'REA OK',
          metricLabel: 'Ley 32/2006',
          title: 'Semáforo de Compliance PRL',
          desc: 'Avisos tempranos antes de que venza un seguro de RC o certificado REA para evitar riesgo solidario.',
        },
        {
          tag: 'Módulo 05',
          metric: 'Inmutable',
          metricLabel: 'Pista Criptográfica',
          title: 'Auditoría Forense',
          desc: 'Cada validación, edición o disputa queda registrada con timestamp, IP, actor y entidad afectada.',
        },
        {
          tag: 'Módulo 06',
          metric: 'En Vivo',
          metricLabel: 'Google Maps Platform',
          title: 'Radar Satélite de Obras',
          desc: 'Visualización cartográfica en tiempo real de todos los tajos activos y cuadrillas desplegadas.',
        },
      ],
      radarTitle: 'Validación Geodésica Haversine',
      radarDesc: 'Radio de obra configurado a 250m • Desvío actual: 42m (Válido)',
    },
    tech: {
      tag: '04 // Infraestructura & Stack',
      headline: 'Ingeniería industrial.',
      headlineGradient: 'Rendimiento instantáneo.',
      description: 'Arquitectura web de última generación optimizada para pantallas táctiles de obra bajo cualquier condición de luz y red.',
      details: {
        react19: {
          category: 'Frontend Architecture',
          title: 'React 19 Concurrent Rendering + Vite 8 SPA',
          desc: 'Carga instantánea de la interfaz, transiciones de estado no bloqueantes y bundles optimizados con compresión gzip para smartphones en tajo.',
        },
        ts: {
          category: 'Domain Invariants',
          title: 'Pure TypeScript Domain Rules Engine',
          desc: 'Lógica de negocio completamente aislada de la UI: cálculo de horas ordinarias/extras por convenio, validación matemática de CIF/NIF y segregación de albaranes.',
        },
        firebase: {
          category: 'Realtime Synchronizer',
          title: 'Google Cloud Firestore en Madrid/Europa',
          desc: 'Suscripciones reactivas por WebSocket para actualizar partes y albaranes en cuanto el encargado pulsa firmar, sin necesidad de refrescar la página.',
        },
        cloudsql: {
          category: 'Relational Database',
          title: 'PostgreSQL & Drizzle ORM ACID Compliance',
          desc: 'Garantía total de integridad referencial para el registro de auditoría legal y liquidaciones económicas entre empresas.',
        },
        maps: {
          category: 'Geospatial Intelligence',
          title: 'Google Maps Platform API & Haversine Distance',
          desc: 'Cartografía satelital en alta definición con cálculo de distancia geodésica al milímetro para validar la presencia física de cuadrillas.',
        },
        gemini: {
          category: 'Artificial Intelligence',
          title: 'Google Gemini 2.5 Flash Engine',
          desc: 'Procesamiento inteligente de observaciones de tajo, resúmenes ejecutivos diarios y asistencia para resolución rápida de disputas.',
        },
      },
    },
    benefits: {
      tag: '05 // Rentabilidad Comprobada',
      headline: 'Beneficios medibles.',
      description: 'Cuando la constructora principal y las subcontratas comparten la misma verdad digital, el conflicto desaparece.',
      roles: [
        {
          role: 'Constructora Principal',
          pill: '+18% Margen',
          title: 'Cero pago de horas fantasma y liquidación mensual en 1 clic',
          desc: 'Aprobación diaria de albaranes por cada subcontrata. Facturación a final de mes con discrepancia cero.',
        },
        {
          role: 'Jefes de Obra',
          pill: '-90 Min / Día',
          title: 'Partes emitidos durante la ronda, sin horas extra en caseta',
          desc: 'Asistente en 3 toques con geocerca GPS automática y captura fotográfica de evidencias in situ.',
        },
        {
          role: 'Subcontratistas',
          pill: 'Cobro 30 Días Antes',
          title: 'Firma digital fehaciente de horas trabajadas cada tarde',
          desc: 'Se acabaron los recortes unilaterales a final de mes. El albarán está firmado día a día.',
        },
        {
          role: 'Prevención & Jurídico',
          pill: 'Blindaje 100%',
          title: 'Inspección de Trabajo superada con expediente digital',
          desc: 'Registro de jornada obligatorio RDL 8/2019 y Libro de Subcontratación Ley 32/2006 siempre al día.',
        },
      ],
      rbacTitle: 'Esquema Jerárquico RBAC y Aislamiento Multi-Tenant',
      rbacSubtitle: 'Arquitectura de Seguridad',
      rbacPill: 'Aislamiento por CIF',
      rbacCards: [
        {
          level: 'Nivel 01 • Master',
          title: 'Contratista Principal',
          sub: 'MAIN_CONTRACTOR_ADMIN',
          desc: 'Control de todas las obras, homologación de subcontratas, validación de albaranes y facturación.',
        },
        {
          level: 'Nivel 02 • Operativo',
          title: 'Jefe de Obra',
          sub: 'SITE_MANAGER',
          desc: 'Acceso estricto a sus obras asignadas. Emite partes diarios, revisa geocerca y supervisa tajos.',
        },
        {
          level: 'Nivel 03 • Colaborador',
          title: 'Subcontratista',
          sub: 'SUBCONTRACTOR_USER',
          desc: 'Acceso aislado a sus albaranes. Firma digital con huella en pantalla y gestión de disputas.',
        },
        {
          level: 'Nivel 04 • Campo',
          title: 'Operario / Cuadrilla',
          sub: 'WORKER',
          desc: 'Fichaje horario GPS en 1 toque. Cumplimiento legal de jornada laboral (RDL 8/2019).',
        },
      ],
    },
    cta: {
      headline: 'Construye con certeza.',
      headlineGradient: 'Digitaliza tu obra hoy.',
      subhead: 'Experimenta el entorno completo con datos reales de obras y subcontratas en España en solo un clic.',
      primaryButton: 'Entrar a la Demo Interactiva',
      secondaryButton: 'Regresar a la Web',
    },
  },
  en: {
    nav: {
      brandSubtitle: 'Executive Presentation 2026',
      exit: 'Close',
      soundOn: 'Audio enabled',
      soundOff: 'Muted',
      motionReduced: 'Reduced motion',
      motionFull: 'Smooth motion',
      next: 'Next',
      prev: 'Previous',
      keyboardHint: 'Use [←] [→] or [Space] to navigate',
      interactiveDemoBadge: 'Live Simulator',
    },
    liveDemo: {
      title: 'Real-Time Operational Console',
      subtitle: 'Experience the exact workflow used across jobsites and corporate offices',
      tabs: {
        dailyReport: 'Daily Report Wizard',
        geofence: 'GPS Geofenced Clock-In',
        signatures: 'Delivery Note & Touch Sign',
        compliance: 'H&S and REA Alerts',
        auditLedger: 'Forensic Audit Trail',
      },
      simulateOffline: 'Simulate Network Outage',
      simulateOnline: 'Restore 5G Connectivity',
      offlineBufferActive: 'Offline Mode: 3 transactions in local queue (IndexedDB)',
      cloudSynced: 'Synced: Cloud database up to date (0ms lag)',
      signPrompt: 'Draw signature with mouse or touch on the screen',
      clearSignature: 'Clear',
      certifySignature: 'Certify & Issue Slip',
      signatureCertified: 'Delivery note certified cryptographically with success',
      insideGeofence: 'Inside jobsite perimeter (Radius 250m - Offset 38m)',
      outsideGeofence: 'Outside perimeter (Distance 840m - Clock-in rejected)',
      clockInSuccess: 'Auditable Clock-In Recorded with GPS Coordinates',
    },
    chapters: [
      {
        num: '01',
        navTitle: 'Overview',
        badge: 'ObraService Pro // B2B Platform',
        headlineMain: 'Complete jobsite control.',
        headlineGradient: 'Zero friction, real time.',
        description: 'The operating system for general contractors and trade subcontractors. Daily reports, GPS geofenced clock-in, auto delivery notes, and full statutory compliance.',
      },
      {
        num: '02',
        navTitle: 'The Problem',
        badge: '01 // The Diagnosis',
        headlineMain: 'Modern construction cannot be run on',
        headlineGradient: 'stained paper notebooks and lost slips.',
        description: 'Manual field notes, estimated overtime hours, and month-end invoice disputes cost up to 18% in eroded net margins and weeks of settlement lag.',
      },
      {
        num: '03',
        navTitle: 'The Solution',
        badge: '02 // The Architecture',
        headlineMain: 'Site. Cloud. Office.',
        headlineGradient: 'Uninterrupted synchronization.',
        description: 'Engineered Offline-First with IndexedDB and real-time cloud sync. Work in basements or tunnels without 4G/5G; everything syncs automatically once back in coverage.',
      },
      {
        num: '04',
        navTitle: 'Capabilities',
        badge: '03 // Functional Engineering',
        headlineMain: '6 Specialized Modules.',
        headlineGradient: 'One unified workflow.',
        description: 'Purpose-built to solve critical statutory, operational, and financial bottlenecks in commercial construction.',
      },
      {
        num: '05',
        navTitle: 'Technology',
        badge: '04 // Infrastructure & Stack',
        headlineMain: 'Enterprise performance.',
        headlineGradient: 'Millisecond response.',
        description: 'Modern stack featuring React 19, strict TypeScript, Google Cloud Firestore, PostgreSQL Cloud SQL, Google Maps Platform, and Gemini 2.5 Flash.',
      },
      {
        num: '06',
        navTitle: 'Benefits',
        badge: '05 // Proven ROI',
        headlineMain: 'Measurable impact.',
        headlineGradient: 'Alignment across all roles.',
        description: 'When general contractors and trade subcontractors share a single source of certified digital truth, disputes vanish.',
      },
      {
        num: '07',
        navTitle: 'Get Started',
        badge: '06 // Launch',
        headlineMain: 'Build with certainty.',
        headlineGradient: 'Digitize your jobsites today.',
        description: 'Experience the full platform live with real jobsite, crew, and subcontractor data in just one click.',
      },
    ],
    problem: {
      tag: '01 // The Diagnosis',
      stat1: '18%',
      stat1Label: 'Eroded margin',
      stat1Sub: 'Due to unverified overtime and lost paper delivery notes.',
      stat2: '45 days',
      stat2Label: 'Settlement delay',
      stat2Sub: 'Average time spent reconciling manual subcontractor invoices.',
      stat3: '€7,500',
      stat3Label: 'Labor penalty per site',
      stat3Sub: 'For non-compliant or inaccurate manual worker time records.',
      brokenTitle: 'Broken Traditional Flow (Paper & Excel)',
      brokenPill: '18% Margin Lost',
      brokenSteps: [
        { step: '01', title: 'Stained Paper Slips', desc: 'Illegible handwritten scribbles lost in jobsite trailers.' },
        { step: '02', title: 'Manual Overtime Guesswork', desc: 'Crew vs. foreman discrepancies without GPS verification.' },
        { step: '03', title: 'Lagged Excel Transcription', desc: 'Weeks of delay copying field notes into accounting.' },
        { step: '04', title: 'Month-End Payment Disputes', desc: 'Withheld invoices, strained relationships, and legal exposure.' },
      ],
      solutionTitle: 'With ObraService Pro (100% Digital & Certified)',
      solutionPill: '0 Discrepancies',
      solutionSteps: [
        { step: '01', title: '2-Minute Daily Field Report', desc: 'Mobile wizard with crew selection and automated hours breakdown.' },
        { step: '02', title: 'Haversine GPS Geofence (250m)', desc: 'Instant verification of physical presence on site perimeter.' },
        { step: '03', title: 'Auto-Generated Subcontractor Notes', desc: 'Real-time hour segregation and on-screen digital signatures.' },
        { step: '04', title: 'Cloud Sync & Immutable Audit Trail', desc: 'Instant office approval and audit-ready records for compliance.' },
      ],
    },
    solution: {
      tag: 'Resilient Network Topology',
      diagramSubtitle: 'Resilient Network Topology',
      diagramTitle: 'Site ↔ Cloud ↔ Office Data Flow',
      diagramDesc: 'Continuous operation even in deep basements, subway tunnels, or remote zones without 4G/5G signal.',
      node1Tag: 'Node 01 • Origin',
      node1Title: 'Jobsite / Field Edge',
      node1Desc: 'GPS clock-in, daily reports, photo evidence, and touch signatures.',
      node1Pill: 'IndexedDB local buffer',
      node2Tag: 'Node 02 • Core',
      node2Title: 'Cloud Engine & Rules',
      node2Desc: 'Firestore Realtime Sync + Cloud SQL + Pure Domain Invariants.',
      node2Pill: '1 note per subcontractor CIF',
      node3Tag: 'Node 03 • Destination',
      node3Title: 'HQ / Executive Office',
      node3Desc: '1-click report approvals, live radar metrics, and ERP exports.',
      node3Pill: 'Settlements and certs',
    },
    services: {
      tag: '03 // Functional Engineering',
      headline: '6 Specialized Modules.',
      description: 'Engineered to streamline jobsite operations and guarantee legal compliance.',
      items: [
        {
          tag: 'Module 01',
          metric: '250 m',
          metricLabel: 'Haversine Geofence',
          title: 'Geofenced Daily Reports',
          desc: 'Submit in under 2 minutes. Mathematical verification of physical presence within site boundaries.',
        },
        {
          tag: 'Module 02',
          metric: '100%',
          metricLabel: 'Statutory Compliance',
          title: '1-Tap GPS Time-Tracking',
          desc: 'Auditable time & attendance logs for internal crews and external subcontractor trade workers.',
        },
        {
          tag: 'Module 03',
          metric: '0 s',
          metricLabel: 'Generation Time',
          title: 'Delivery Notes & Disputes',
          desc: 'Hours automatically segregated by trade contractor and signed right on the mobile screen.',
        },
        {
          tag: 'Module 04',
          metric: 'REA OK',
          metricLabel: 'Liability Shield',
          title: 'Proactive Compliance Alerts',
          desc: 'Automated warnings before trade insurance or safety registrations lapse to avoid joint liability.',
        },
        {
          tag: 'Module 05',
          metric: 'Immutable',
          metricLabel: 'Cryptographic Trail',
          title: 'Forensic Audit Log',
          desc: 'Every validation, edit, or dispute is sealed with timestamp, actor ID, and IP address.',
        },
        {
          tag: 'Module 06',
          metric: 'Live',
          metricLabel: 'Google Maps Platform',
          title: 'Panoramic Satellite Radar',
          desc: 'Real-time geospatial visualization of active jobsites and deployed construction crews.',
        },
      ],
      radarTitle: 'Haversine Geodetic Verification',
      radarDesc: 'Site boundary set to 250m • Current offset: 42m (Valid)',
    },
    tech: {
      tag: '04 // Infrastructure & Stack',
      headline: 'Industrial engineering.',
      headlineGradient: 'Instant response.',
      description: 'Cutting-edge web architecture engineered for jobsite touch screens in high-glare and variable connectivity conditions.',
      details: {
        react19: {
          category: 'Frontend Architecture',
          title: 'React 19 Concurrent Rendering + Vite 8 SPA',
          desc: 'Instant interface boot, non-blocking UI state transitions, and hyper-optimized bundles with gzip compression for smartphones on site.',
        },
        ts: {
          category: 'Domain Invariants',
          title: 'Pure TypeScript Domain Rules Engine',
          desc: 'Business logic decoupled from UI: union overtime math, strict tax ID verification, and idempotent delivery note generation.',
        },
        firebase: {
          category: 'Realtime Synchronizer',
          title: 'Google Cloud Firestore in Europe',
          desc: 'Reactive WebSocket subscriptions update field reports and delivery notes the moment a superintendent signs on screen.',
        },
        cloudsql: {
          category: 'Relational Database',
          title: 'PostgreSQL & Drizzle ORM ACID Compliance',
          desc: 'Absolute referential integrity for statutory audit records, cost codes, and inter-company settlements.',
        },
        maps: {
          category: 'Geospatial Intelligence',
          title: 'Google Maps Platform API & Haversine Distance',
          desc: 'High-definition satellite mapping with sub-meter geodetic distance calculation for crew verification.',
        },
        gemini: {
          category: 'Artificial Intelligence',
          title: 'Google Gemini 2.5 Flash Engine',
          desc: 'Intelligent field report summaries, automatic delay detection, and automated text parsing for dispute resolution.',
        },
      },
    },
    benefits: {
      tag: '05 // Proven ROI',
      headline: 'Measurable benefits.',
      description: 'When general contractors and trade subcontractors share a single source of digital truth, disputes vanish.',
      roles: [
        {
          role: 'General Contractor',
          pill: '+18% Margin',
          title: 'Zero ghost hours paid and monthly settlements in 1 click',
          desc: 'Daily approval of delivery notes per trade contractor. Clean end-of-month invoicing with zero surprises.',
        },
        {
          role: 'Site Superintendents',
          pill: '-90 Min / Day',
          title: 'Reports signed on the walk, no late nights in the trailer',
          desc: '3-tap wizard with automated GPS geofencing and on-site photo evidence capture.',
        },
        {
          role: 'Trade Subcontractors',
          pill: 'Paid 30 Days Earlier',
          title: 'Certified record of hours worked signed every evening',
          desc: 'No more unilateral billing cuts weeks later. Field slips are certified daily on site.',
        },
        {
          role: 'Safety & Legal',
          pill: '100% Audit-Ready',
          title: 'Labor inspections cleared with digital records in seconds',
          desc: 'Legally compliant time-tracking and verified subcontractor registrations always up to date.',
        },
      ],
      rbacTitle: 'RBAC Hierarchy & Multi-Tenant Data Isolation',
      rbacSubtitle: 'Security Architecture',
      rbacPill: 'Company-Level Vaults',
      rbacCards: [
        {
          level: 'Level 01 • Master',
          title: 'General Contractor Admin',
          sub: 'MAIN_CONTRACTOR_ADMIN',
          desc: 'Full site control, trade contractor approval, billing validation, and multi-project oversight.',
        },
        {
          level: 'Level 02 • Operational',
          title: 'Site Manager',
          sub: 'SITE_MANAGER',
          desc: 'Strict access to assigned jobsites. Submits daily reports, checks geofences, and manages field crews.',
        },
        {
          level: 'Level 03 • Collaborator',
          title: 'Subcontractor Lead',
          sub: 'SUBCONTRACTOR_USER',
          desc: 'Isolated access to own delivery notes. Digital touch signatures and formal dispute submission.',
        },
        {
          level: 'Level 04 • Field Crew',
          title: 'Trade Worker / Craft',
          sub: 'WORKER',
          desc: '1-tap GPS clock-in. Direct statutory attendance compliance with zero friction.',
        },
      ],
    },
    cta: {
      headline: 'Build with certainty.',
      headlineGradient: 'Digitize your jobsites today.',
      subhead: 'Experience the full platform live with real jobsite and subcontractor data in just one click.',
      primaryButton: 'Launch Interactive Demo',
      secondaryButton: 'Back to Website',
    },
  },
  nl: {
    nav: {
      brandSubtitle: 'Zakelijke Presentatie 2026',
      exit: 'Sluiten',
      soundOn: 'Audio aan',
      soundOff: 'Gedempt',
      motionReduced: 'Verminderde beweging',
      motionFull: 'Vloeiende beweging',
      next: 'Volgende',
      prev: 'Vorige',
      keyboardHint: 'Gebruik [←] [→] of [Spatie] om te navigeren',
      interactiveDemoBadge: 'Live Simulator',
    },
    liveDemo: {
      title: 'Operationele Console in Realtime',
      subtitle: 'Ervaar exact hoe de software werkt op de bouwplaats en op het hoofdkantoor',
      tabs: {
        dailyReport: 'Dagrapport Wizard',
        geofence: 'GPS Geofenced Tijdregistratie',
        signatures: 'Digitale Werkbon & Handtekening',
        compliance: 'VCA & Verzekeringswaarschuwingen',
        auditLedger: 'Forensisch Logboek',
      },
      simulateOffline: 'Simuleer Netwerkuitval',
      simulateOnline: 'Herstel 5G-Verbinding',
      offlineBufferActive: 'Offlinemodus: 3 transacties in lokale buffer (IndexedDB)',
      cloudSynced: 'Gesynchroniseerd: Clouddatabase up-to-date (0ms vertraging)',
      signPrompt: 'Zet uw handtekening met de muis of op het scherm',
      clearSignature: 'Wissen',
      certifySignature: 'Certificeren en Werkbon Genereren',
      signatureCertified: 'Werkbon cryptografisch gecertificeerd met succes',
      insideGeofence: 'Binnen de bouwperimeter (Straal 250m - Afwijking 38m)',
      outsideGeofence: 'Buiten de perimeter (Afstand 840m - Registratie afgekeurd)',
      clockInSuccess: 'Sluitende Registratie Vastgelegd met GPS-Coördinaten',
    },
    chapters: [
      {
        num: '01',
        navTitle: 'Overzicht',
        badge: 'ObraService Pro // B2B Platform',
        headlineMain: 'Volledige controle over uw bouwprojecten.',
        headlineGradient: 'Zonder wrijving, realtime.',
        description: 'Het besturingssysteem voor hoofdaannemers en onderaannemers. Dagrapporten, GPS-geofenced inklokken, automatische werkbonnen en sluitende wettelijke controle.',
      },
      {
        num: '02',
        navTitle: 'Het Probleem',
        badge: '01 // De Diagnose',
        headlineMain: 'Moderne bouwplaatsen kunnen niet draaien op',
        headlineGradient: 'bevlekte papieren schriften en kwijtgeraakte bonnen.',
        description: 'Handmatige notities, nattevingerwerk bij overuren en factuurconflicten aan het einde van de maand kosten tot 18% van de nettowinstmarge.',
      },
      {
        num: '03',
        navTitle: 'De Oplossing',
        badge: '02 // De Architectuur',
        headlineMain: 'Bouwplaats. Cloud. Kantoor.',
        headlineGradient: 'Ononderbroken synchronisatie.',
        description: 'Ontworpen volgens Offline-First met IndexedDB en realtime cloudsynchronisatie. Werk in kelders zonder 4G/5G; zodra er weer bereik is synchroniseert alles vanzelf.',
      },
      {
        num: '04',
        navTitle: 'Modules',
        badge: '03 // Functionele Kracht',
        headlineMain: '6 Gespecialiseerde Modules.',
        headlineGradient: 'In één verbonden workflow.',
        description: 'Speciaal ontwikkeld om operationele en wettelijke knelpunten in de bouw weg te nemen.',
      },
      {
        num: '05',
        navTitle: 'Technologie',
        badge: '04 // Infrastructuur & Stack',
        headlineMain: 'Industriële prestaties.',
        headlineGradient: 'Directe tactiele respons.',
        description: 'Moderne architectuur met React 19, strikte TypeScript, Google Cloud Firestore, PostgreSQL Cloud SQL, Google Maps Platform en Gemini 2.5 Flash.',
      },
      {
        num: '06',
        navTitle: 'Voordelen',
        badge: '05 // Bewezen ROI',
        headlineMain: 'Meetbare voordelen.',
        headlineGradient: 'Voor elke betrokkene.',
        description: 'Wanneer hoofdaannemer en onderaannemers dezelfde digitale waarheid delen, verdwijnen conflicten direct.',
      },
      {
        num: '07',
        navTitle: 'Aan de Slag',
        badge: '06 // Lancering',
        headlineMain: 'Bouw met zekerheid.',
        headlineGradient: 'Digitaliseer uw bouwplaats vandaag.',
        description: 'Ervaar het complete platform direct met realistische bouwdata in slechts één klik.',
      },
    ],
    problem: {
      tag: '01 // De Diagnose',
      stat1: '18%',
      stat1Label: 'Verloren marge',
      stat1Sub: 'Door niet-geverifieerde overuren en kwijtgeraakte papieren bonnen.',
      stat2: '45 dagen',
      stat2Label: 'Vertraging facturatie',
      stat2Sub: 'Gemiddelde tijd om handmatige bonnen met onderaannemers af te stemmen.',
      stat3: '€ 7.500',
      stat3Label: 'Arbo-boete per locatie',
      stat3Sub: 'Bij het ontbreken van een sluitende digitale urenregistratie.',
      brokenTitle: 'Traditionele Falende Flow (Papier en Excel)',
      brokenPill: '18% Margeroverlies',
      brokenSteps: [
        { step: '01', title: 'Bevlekte Papieren Bonnen', desc: 'Onleesbare krabbels die kwijtraken in de bouwkeet.' },
        { step: '02', title: 'Nattevingerwerk bij Overuren', desc: 'Discrepanties tussen ploeg en uitvoerder zonder GPS-controle.' },
        { step: '03', title: 'Vertraagde Excel-Invoer', desc: 'Weken vertraging voordat gegevens op kantoor aankomen.' },
        { step: '04', title: 'Factuurconflicten aan Einde Maand', desc: 'Ingehouden betalingen, verstoorde relaties en juridische risico\'s.' },
      ],
      solutionTitle: 'Met ObraService Pro (100% Digitaal & Gecertificeerd)',
      solutionPill: '0 Discrepanties',
      solutionSteps: [
        { step: '01', title: 'Dagrapport in 2 Minuten', desc: 'Mobiele wizard met ploegselectie en automatische urenuitsplitsing.' },
        { step: '02', title: 'Haversine GPS Geofence (250m)', desc: 'Directe verificatie van fysieke aanwezigheid op de bouwlocatie.' },
        { step: '03', title: 'Automatische Bon per Onderaannemer', desc: 'Realtime splitsing en digitale handtekening op het scherm.' },
        { step: '04', title: 'Cloud Sync & Onveranderlijk Logboek', desc: 'Directe goedkeuring op kantoor en direct controleerbaar voor inspectie.' },
      ],
    },
    solution: {
      tag: 'Veerkrachtige Netwerktopologie',
      diagramSubtitle: 'Veerkrachtige Netwerktopologie',
      diagramTitle: 'Dataflow: Bouwplaats ↔ Cloud ↔ Hoofdkantoor',
      diagramDesc: 'Continu operationeel, zelfs in diepe kelders of buitengebieden zonder 4G/5G-ontvangst.',
      node1Tag: 'Knoop 01 • Oorsprong',
      node1Title: 'Bouwplaats / In het Veld',
      node1Desc: 'GPS-tijdregistratie, dagrapporten, fotobewijs en handtekeningen.',
      node1Pill: 'Lokale IndexedDB-buffer',
      node2Tag: 'Knoop 02 • Kern',
      node2Title: 'Cloud Engine & Regels',
      node2Desc: 'Firestore Realtime Sync + Cloud SQL + Zuivere Domeinregels.',
      node2Pill: '1 bon per onderaannemer KVK/BTW',
      node3Tag: 'Knoop 03 • Bestemming',
      node3Title: 'Kantoor / Directie',
      node3Desc: '1-klik goedkeuring van rapporten, live radar en ERP-export.',
      node3Pill: 'Afrekeningen en certificaten',
    },
    services: {
      tag: '03 // Functionele Kracht',
      headline: '6 Gespecialiseerde Modules.',
      description: 'Speciaal ontwikkeld om operationele en wettelijke knelpunten in de bouw weg te nemen.',
      items: [
        {
          tag: 'Module 01',
          metric: '250 m',
          metricLabel: 'Haversine Geofence',
          title: 'Geofenced Dagrapporten',
          desc: 'Verzend binnen 2 minuten. Wiskundige verificatie van fysieke aanwezigheid op de bouwplaats.',
        },
        {
          tag: 'Module 02',
          metric: '100%',
          metricLabel: 'Wettelijk Sluitend',
          title: '1-Tik GPS Tijdregistratie',
          desc: 'Betrouwbare urenregistratie voor eigen personeel en onderaannemers met GPS-verificatie.',
        },
        {
          tag: 'Module 03',
          metric: '0 s',
          metricLabel: 'Aanmaaktijd',
          title: 'Digitale Werkbonnen & Geschillen',
          desc: 'Uren worden direct per onderaannemer gesplitst en op het scherm ondertekend.',
        },
        {
          tag: 'Module 04',
          metric: 'VCA OK',
          metricLabel: 'Veiligheid & Verzekering',
          title: 'Proactieve Compliance Alerts',
          desc: 'Tijdige waarschuwingen voordat VCA-certificaten of aansprakelijkheidsverzekeringen verlopen.',
        },
        {
          tag: 'Module 05',
          metric: 'Onveranderlijk',
          metricLabel: 'Cryptografisch Spoor',
          title: 'Forensische Audit Trail',
          desc: 'Elke validatie, wijziging of geschil wordt vastgelegd met tijdstempel, actor en IP.',
        },
        {
          tag: 'Module 06',
          metric: 'Live',
          metricLabel: 'Google Maps Platform',
          title: 'Panoramische Satellietradar',
          desc: 'Realtime geografisch overzicht van alle actieve bouwprojecten en ingezette ploegen.',
        },
      ],
      radarTitle: 'Haversine Geodetische Controle',
      radarDesc: 'Bouwperimeter ingesteld op 250m • Huidige afwijking: 42m (Geldig)',
    },
    tech: {
      tag: '04 // Infrastructuur & Stack',
      headline: 'Industriële engineering.',
      headlineGradient: 'Directe respons.',
      description: 'Geavanceerde webarchitectuur gebouwd voor aanraakschermen in fel zonlicht en wisselende netwerkomstandigheden.',
      details: {
        react19: {
          category: 'Frontend Architecture',
          title: 'React 19 Concurrent Rendering + Vite 8 SPA',
          desc: 'Bliksemsnelle opstart, non-blocking UI-transities en geoptimaliseerde bundles met gzip-compressie voor smartphones op de steiger.',
        },
        ts: {
          category: 'Domain Invariants',
          title: 'Pure TypeScript Domain Rules Engine',
          desc: 'Bedrijfslogica strikt gescheiden van UI: overuren-berekening volgens CAO, wiskundige BTW/KVK-verificatie en idempotente bonnengeneratie.',
        },
        firebase: {
          category: 'Realtime Synchronizer',
          title: 'Google Cloud Firestore in Europa',
          desc: 'Reactieve WebSocket-koppelingen updaten rapporten en bonnen direct zodra de uitvoerder tekent, zonder verversen.',
        },
        cloudsql: {
          category: 'Relational Database',
          title: 'PostgreSQL & Drizzle ORM ACID Compliance',
          desc: 'Sluitende referentiële integriteit voor wettelijke controles, kostenposten en verrekeningen tussen bedrijven.',
        },
        maps: {
          category: 'Geospatial Intelligence',
          title: 'Google Maps Platform API & Haversine Distance',
          desc: 'High-definition satellietkaarten met uiterst nauwkeurige geodetische afstandsberekening voor personeelscontrole.',
        },
        gemini: {
          category: 'Artificial Intelligence',
          title: 'Google Gemini 2.5 Flash Engine',
          desc: 'Slimme samenvatting van veldnotities, automatische detectie van vertragingen en assistentie bij geschilbeslechting.',
        },
      },
    },
    benefits: {
      tag: '05 // Bewezen ROI',
      headline: 'Meetbare voordelen.',
      description: 'Wanneer hoofdaannemer en onderaannemers dezelfde digitale waarheid delen, verdwijnen conflicten direct.',
      roles: [
        {
          role: 'Hoofdaannemer',
          pill: '+18% Marge',
          title: 'Geen betaling van spookuren en maandafsluiting in 1 klik',
          desc: 'Dagelijkse goedkeuring van bonnen per onderaannemer. Facturatie aan einde van de maand zonder verrassingen.',
        },
        {
          role: 'Uitvoerders',
          pill: '-90 Min / Dag',
          title: 'Rapporten gereed tijdens de ronde, geen avonden in de keet',
          desc: '3-staps wizard met automatische GPS-geofence en fotobewijs direct op locatie vastgelegd.',
        },
        {
          role: 'Onderaannemers',
          pill: '30 Dagen Eerder Betaald',
          title: 'Sluitend bewijs van gewerkte uren, elke avond getekend',
          desc: 'Geen eenzijdige kortingen meer weken later. De werkbon is dagelijks op de bouwplaats afgetekend.',
        },
        {
          role: 'Arbo & Veiligheid',
          pill: '100% Inspectie-Ready',
          title: 'Arbeidsinspectie direct voorzien van digitale dossiers',
          desc: 'Wettelijk conforme urenregistratie en geldige papieren van onderaannemers altijd up-to-date.',
        },
      ],
      rbacTitle: 'RBAC-Hiërarchie & Multi-Tenant Gegevensisolatie',
      rbacSubtitle: 'Beveiligingsarchitectuur',
      rbacPill: 'Bedrijfsniveau Kluizen',
      rbacCards: [
        {
          level: 'Niveau 01 • Master',
          title: 'Hoofdaannemer Beheerder',
          sub: 'MAIN_CONTRACTOR_ADMIN',
          desc: 'Volledige controle over alle projecten, goedkeuring onderaannemers, bonnenvalidatie en facturatie.',
        },
        {
          level: 'Niveau 02 • Operationeel',
          title: 'Projectuitvoerder',
          sub: 'SITE_MANAGER',
          desc: 'Strikte toegang tot toegewezen projecten. Verzendt dagrapporten, controleert geofences en stuurt ploegen aan.',
        },
        {
          level: 'Niveau 03 • Samenwerker',
          title: 'Voorman Onderaannemer',
          sub: 'SUBCONTRACTOR_USER',
          desc: 'Geïsoleerde toegang tot eigen bonnen. Digitale handtekening en indienen van geschillen.',
        },
        {
          level: 'Niveau 04 • Veldploeg',
          title: 'Vakman / Bouwvakker',
          sub: 'WORKER',
          desc: '1-tik GPS inklokken. Directe naleving van wettelijke arbeidstijdregistratie zonder gedoe.',
        },
      ],
    },
    cta: {
      headline: 'Bouw met zekerheid.',
      headlineGradient: 'Digitaliseer uw bouwplaats vandaag.',
      subhead: 'Ervaar het complete platform direct met realistische bouwdata in slechts één klik.',
      primaryButton: 'Start Interactieve Demo',
      secondaryButton: 'Terug naar Website',
    },
  },
};
