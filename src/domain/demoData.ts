/**
 * ObraService - Realistic Demo Data for the Spanish Construction Industry
 * Pre-populated data for Demo Mode showing complete operational cycles.
 */

import { 
  AuditEvent, 
  Company, 
  DailyReport, 
  DeliveryNote, 
  Project, 
  User, 
  Worker,
  Machinery
} from '../types';

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'comp_main_1',
    name: 'Construcciones Norte S.L.',
    taxId: 'B84920194',
    type: 'MAIN_CONTRACTOR',
    address: 'Paseo de la Castellana 142, 28046 Madrid',
    inviteCode: 'OBRA-NORTE-2026',
    active: true,
    createdAt: '2025-11-10T08:00:00.000Z',
  },
  {
    id: 'comp_sub_1',
    name: 'Estructuras Levante S.L.',
    taxId: 'B96301824',
    type: 'SUBCONTRACTOR',
    address: 'Avenida de Francia 22, 46023 Valencia',
    inviteCode: 'LEVANTE-SUB-88',
    active: true,
    createdAt: '2025-11-15T09:30:00.000Z',
  },
  {
    id: 'comp_sub_2',
    name: 'Instalaciones Centro S.L.',
    taxId: 'B28549102',
    type: 'SUBCONTRACTOR',
    address: 'Calle Alcalá 310, 28027 Madrid',
    inviteCode: 'CENTRO-INST-44',
    active: true,
    createdAt: '2025-12-01T10:00:00.000Z',
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@construccionesnorte.es',
    role: 'MAIN_CONTRACTOR_ADMIN',
    companyId: 'comp_main_1',
    companyName: 'Construcciones Norte S.L.',
    active: true,
    assignedProjectIds: ['prj_1', 'prj_2', 'prj_3'],
    createdAt: '2025-11-10T08:00:00.000Z',
  },
  {
    id: 'usr_site_manager',
    name: 'Javier Ortiz',
    email: 'javier.ortiz@construccionesnorte.es',
    role: 'SITE_MANAGER',
    companyId: 'comp_main_1',
    companyName: 'Construcciones Norte S.L.',
    active: true,
    assignedProjectIds: ['prj_1', 'prj_2'],
    createdAt: '2025-11-12T08:30:00.000Z',
  },
  {
    id: 'usr_sub_levante',
    name: 'Elena Ramos',
    email: 'elena.ramos@estructuraslevante.es',
    role: 'SUBCONTRACTOR_USER',
    companyId: 'comp_sub_1',
    companyName: 'Estructuras Levante S.L.',
    active: true,
    assignedProjectIds: ['prj_1', 'prj_3'],
    createdAt: '2025-11-16T09:00:00.000Z',
  },
  {
    id: 'usr_sub_centro',
    name: 'Manuel Vidal',
    email: 'manuel.vidal@instalacionescentro.es',
    role: 'SUBCONTRACTOR_USER',
    companyId: 'comp_sub_2',
    companyName: 'Instalaciones Centro S.L.',
    active: true,
    assignedProjectIds: ['prj_1'],
    createdAt: '2025-12-02T11:00:00.000Z',
  }
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'prj_1',
    code: 'PRJ-0001',
    name: 'Residencial Parque Prado (Madrid)',
    status: 'Active',
    location: {
      address: 'Calle del Prado 28, 28014 Madrid',
      lat: 40.4143,
      lng: -3.6982,
    },
    validationRadiusMeters: 250,
    plannedWorkloadHours: 12000,
    companyId: 'comp_main_1',
    startDate: '2026-01-15',
    endDate: '2026-11-30',
    assignedUserIds: ['usr_admin', 'usr_site_manager', 'usr_sub_levante', 'usr_sub_centro'],
  },
  {
    id: 'prj_2',
    code: 'PRJ-0002',
    name: 'Edificio Torre Sur (Sevilla)',
    status: 'Active',
    location: {
      address: 'Av. San Francisco Javier 9, 41018 Sevilla',
      lat: 37.3826,
      lng: -5.9765,
    },
    validationRadiusMeters: 300,
    plannedWorkloadHours: 8500,
    companyId: 'comp_main_1',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    assignedUserIds: ['usr_admin', 'usr_site_manager'],
  },
  {
    id: 'prj_3',
    code: 'PRJ-0003',
    name: 'Rehabilitación Nave Portuaria (Valencia)',
    status: 'Planned',
    location: {
      address: 'Moll de Ponent s/n, 46024 Valencia',
      lat: 39.4589,
      lng: -0.3285,
    },
    validationRadiusMeters: 200,
    plannedWorkloadHours: 4200,
    companyId: 'comp_main_1',
    startDate: '2026-05-01',
    assignedUserIds: ['usr_admin', 'usr_sub_levante'],
  }
];

export const DEMO_WORKERS: Worker[] = [
  // Personal propio (Construcciones Norte)
  {
    id: 'wrk_1',
    code: 'WRK-0001',
    name: 'Tomás Garrido Sánchez',
    category: 'Encargado General',
    companyId: 'comp_main_1',
    active: true,
    createdAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'wrk_2',
    code: 'WRK-0002',
    name: 'Ángel Beltrán Ruiz',
    category: 'Oficial 1ª',
    companyId: 'comp_main_1',
    active: true,
    createdAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'wrk_3',
    code: 'WRK-0003',
    name: 'David Cano Morales',
    category: 'Peón Especialista',
    companyId: 'comp_main_1',
    active: true,
    createdAt: '2025-11-10T10:00:00.000Z',
  },

  // Subcontrata Estructuras Levante
  {
    id: 'wrk_4',
    code: 'WRK-0004',
    name: 'Vicente Blasco Gomis',
    category: 'Ferrallista',
    companyId: 'comp_sub_1',
    active: true,
    createdAt: '2025-11-16T11:00:00.000Z',
  },
  {
    id: 'wrk_5',
    code: 'WRK-0005',
    name: 'Andrés Soriano Pastor',
    category: 'Encofrador',
    companyId: 'comp_sub_1',
    active: true,
    createdAt: '2025-11-16T11:00:00.000Z',
  },
  {
    id: 'wrk_6',
    code: 'WRK-0006',
    name: 'Mohamed El Amrani',
    category: 'Peón Especialista',
    companyId: 'comp_sub_1',
    active: true,
    createdAt: '2025-11-16T11:00:00.000Z',
  },

  // Subcontrata Instalaciones Centro
  {
    id: 'wrk_7',
    code: 'WRK-0007',
    name: 'Sergio Prieto Galán',
    category: 'Electricista',
    companyId: 'comp_sub_2',
    active: true,
    createdAt: '2025-12-02T12:00:00.000Z',
  },
  {
    id: 'wrk_8',
    code: 'WRK-0008',
    name: 'Rubén Lozano Sanz',
    category: 'Oficial 2ª',
    companyId: 'comp_sub_2',
    active: true,
    createdAt: '2025-12-02T12:00:00.000Z',
  }
];

export const DEMO_MACHINERY: Machinery[] = [
  {
    id: 'mac_1',
    code: 'MAC-0001',
    name: 'Excavadora Caterpillar 320',
    type: 'Excavadora',
    companyId: 'comp_main_1',
    active: true,
    createdAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'mac_2',
    code: 'MAC-0002',
    name: 'Grúa Torre Potain MCT 88',
    type: 'Grúa',
    companyId: 'comp_main_1',
    active: true,
    createdAt: '2025-11-10T10:00:00.000Z',
  },
  {
    id: 'mac_3',
    code: 'MAC-0003',
    name: 'Camión Volquete Volvo FMX',
    type: 'Camión',
    companyId: 'comp_sub_1',
    active: true,
    createdAt: '2025-11-16T11:00:00.000Z',
  }
];

export const DEMO_REPORTS: DailyReport[] = [
  {
    id: 'dr_demo_1',
    code: 'DR-20260917-0001',
    projectId: 'prj_1',
    projectNameSnapshot: 'Residencial Parque Prado (Madrid)',
    date: '2026-09-17',
    creatorId: 'usr_site_manager',
    creatorNameSnapshot: 'Javier Ortiz',
    status: 'Submitted',
    workEntries: [
      {
        id: 'we_1',
        workerId: 'wrk_1',
        workerNameSnapshot: 'Tomás Garrido Sánchez',
        workerCategorySnapshot: 'Encargado General',
        companyIdSnapshot: 'comp_main_1',
        companyNameSnapshot: 'Construcciones Norte S.L.',
        isSubcontractor: false,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      },
      {
        id: 'we_2',
        workerId: 'wrk_4',
        workerNameSnapshot: 'Vicente Blasco Gomis',
        workerCategorySnapshot: 'Ferrallista',
        companyIdSnapshot: 'comp_sub_1',
        companyNameSnapshot: 'Estructuras Levante S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 2,
        totalHours: 10,
        attendance: 'Presente'
      },
      {
        id: 'we_3',
        workerId: 'wrk_5',
        workerNameSnapshot: 'Andrés Soriano Pastor',
        workerCategorySnapshot: 'Encofrador',
        companyIdSnapshot: 'comp_sub_1',
        companyNameSnapshot: 'Estructuras Levante S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 1,
        totalHours: 9,
        attendance: 'Presente'
      },
      {
        id: 'we_4',
        workerId: 'wrk_7',
        workerNameSnapshot: 'Sergio Prieto Galán',
        workerCategorySnapshot: 'Electricista',
        companyIdSnapshot: 'comp_sub_2',
        companyNameSnapshot: 'Instalaciones Centro S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      }
    ],
    totalNormalHours: 32,
    totalExtraHours: 3,
    totalHours: 35,
    comments: 'Hormigonado de forjado 2ª planta completado favorablemente. Instalación de acometida eléctrica provisional en sector B.',
    siteConditions: 'Despejado, 22°C. Sin incidencias de viento ni lluvia.',
    evidenceUrls: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f3?auto=format&fit=crop&w=800&q=80'
    ],
    locationSnapshot: {
      capturedAt: '2026-09-17T17:45:10.000Z',
      lat: 40.4144,
      lng: -3.6981,
      accuracyMeters: 12,
      distanceFromProjectMeters: 15,
      status: 'Valid',
      note: 'Dentro del radio permitido (15m de 250m).'
    },
    analysisItems: [
      {
        id: 'ai_1',
        type: 'EXTRA_HOURS_RISK',
        severity: 'BAJA',
        title: 'Horas extraordinarias justificadas',
        explanation: 'Se registraron 3h extra entre los trabajadores de encofrado/ferralla coincidentes con el fin del hormigonado.',
        recommendation: 'Verificar albarán conjunto de Estructuras Levante.',
        resolved: true
      }
    ],
    version: 1,
    createdAt: '2026-09-17T17:30:00.000Z',
    submittedAt: '2026-09-17T17:45:20.000Z',
    updatedAt: '2026-09-17T17:45:20.000Z'
  }
];

export const DEMO_DELIVERY_NOTES: DeliveryNote[] = [
  {
    id: 'dn_demo_1',
    code: 'DN-20260917-0001',
    sourceDailyReportId: 'dr_demo_1',
    sourceDailyReportCode: 'DR-20260917-0001',
    projectId: 'prj_1',
    projectNameSnapshot: 'Residencial Parque Prado (Madrid)',
    date: '2026-09-17',
    subcontractorCompanyId: 'comp_sub_1',
    subcontractorCompanyName: 'Estructuras Levante S.L.',
    workEntries: [
      {
        id: 'we_2',
        workerId: 'wrk_4',
        workerNameSnapshot: 'Vicente Blasco Gomis',
        workerCategorySnapshot: 'Ferrallista',
        companyIdSnapshot: 'comp_sub_1',
        companyNameSnapshot: 'Estructuras Levante S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 2,
        totalHours: 10,
        attendance: 'Presente'
      },
      {
        id: 'we_3',
        workerId: 'wrk_5',
        workerNameSnapshot: 'Andrés Soriano Pastor',
        workerCategorySnapshot: 'Encofrador',
        companyIdSnapshot: 'comp_sub_1',
        companyNameSnapshot: 'Estructuras Levante S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 1,
        totalHours: 9,
        attendance: 'Presente'
      }
    ],
    normalHours: 16,
    extraHours: 3,
    totalHours: 19,
    status: 'Pending',
    createdAt: '2026-09-17T17:45:21.000Z',
    updatedAt: '2026-09-17T17:45:21.000Z'
  },
  {
    id: 'dn_demo_2',
    code: 'DN-20260917-0002',
    sourceDailyReportId: 'dr_demo_1',
    sourceDailyReportCode: 'DR-20260917-0001',
    projectId: 'prj_1',
    projectNameSnapshot: 'Residencial Parque Prado (Madrid)',
    date: '2026-09-17',
    subcontractorCompanyId: 'comp_sub_2',
    subcontractorCompanyName: 'Instalaciones Centro S.L.',
    workEntries: [
      {
        id: 'we_4',
        workerId: 'wrk_7',
        workerNameSnapshot: 'Sergio Prieto Galán',
        workerCategorySnapshot: 'Electricista',
        companyIdSnapshot: 'comp_sub_2',
        companyNameSnapshot: 'Instalaciones Centro S.L.',
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      }
    ],
    normalHours: 8,
    extraHours: 0,
    totalHours: 8,
    status: 'Confirmed',
    confirmationDetails: {
      confirmedByUserId: 'usr_sub_centro',
      confirmedByUserName: 'Manuel Vidal',
      confirmedAt: '2026-09-17T18:10:00.000Z',
      subcontractorCompanyName: 'Instalaciones Centro S.L.'
    },
    createdAt: '2026-09-17T17:45:22.000Z',
    updatedAt: '2026-09-17T18:10:00.000Z'
  }
];

export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud_1',
    timestamp: '2026-09-17T17:30:00.000Z',
    actorId: 'usr_site_manager',
    actorName: 'Javier Ortiz',
    actorRole: 'SITE_MANAGER',
    actorCompanyName: 'Construcciones Norte S.L.',
    affectedEntity: 'DailyReport',
    recordId: 'dr_demo_1',
    recordCode: 'DR-20260917-0001',
    operation: 'REPORT_CREATED',
    details: 'Borrador del parte diario creado para la obra "Residencial Parque Prado (Madrid)".'
  },
  {
    id: 'aud_2',
    timestamp: '2026-09-17T17:45:20.000Z',
    actorId: 'usr_site_manager',
    actorName: 'Javier Ortiz',
    actorRole: 'SITE_MANAGER',
    actorCompanyName: 'Construcciones Norte S.L.',
    affectedEntity: 'DailyReport',
    recordId: 'dr_demo_1',
    recordCode: 'DR-20260917-0001',
    operation: 'REPORT_SUBMITTED',
    details: 'Parte diario enviado con 4 operarios y 35 horas totales. Geovalidación OK (15m).'
  },
  {
    id: 'aud_3',
    timestamp: '2026-09-17T17:45:21.000Z',
    actorId: 'usr_site_manager',
    actorName: 'Javier Ortiz',
    actorRole: 'SITE_MANAGER',
    actorCompanyName: 'Construcciones Norte S.L.',
    affectedEntity: 'DeliveryNote',
    recordId: 'dn_demo_1',
    recordCode: 'DN-20260917-0001',
    operation: 'DELIVERY_NOTE_GENERATED',
    details: 'Albarán generado automáticamente para "Estructuras Levante S.L." (19h totales).'
  },
  {
    id: 'aud_4',
    timestamp: '2026-09-17T17:45:22.000Z',
    actorId: 'usr_site_manager',
    actorName: 'Javier Ortiz',
    actorRole: 'SITE_MANAGER',
    actorCompanyName: 'Construcciones Norte S.L.',
    affectedEntity: 'DeliveryNote',
    recordId: 'dn_demo_2',
    recordCode: 'DN-20260917-0002',
    operation: 'DELIVERY_NOTE_GENERATED',
    details: 'Albarán generado automáticamente para "Instalaciones Centro S.L." (8h totales).'
  },
  {
    id: 'aud_5',
    timestamp: '2026-09-17T18:10:00.000Z',
    actorId: 'usr_sub_centro',
    actorName: 'Manuel Vidal',
    actorRole: 'SUBCONTRACTOR_USER',
    actorCompanyName: 'Instalaciones Centro S.L.',
    affectedEntity: 'DeliveryNote',
    recordId: 'dn_demo_2',
    recordCode: 'DN-20260917-0002',
    operation: 'DELIVERY_NOTE_CONFIRMED',
    details: 'Albarán confirmado formalmente por el representante de la subcontrata.'
  }
];

export const DEMO_CHAT_MESSAGES = [
  {
    id: 'msg_1',
    senderId: 'usr_sub_levante',
    senderName: 'Elena Ramos',
    senderRole: 'SUBCONTRACTOR_USER',
    senderCompanyName: 'Estructuras Levante S.L.',
    channelId: 'general',
    text: 'Hola a todos, acabamos de terminar de hormigonar el forjado de la planta 2 en Torre Sur. Dejo el albarán firmado en el sistema.',
    createdAt: '2026-09-18T10:30:00.000Z'
  },
  {
    id: 'msg_2',
    senderId: 'usr_site_manager',
    senderName: 'Javier Ortiz',
    senderRole: 'SITE_MANAGER',
    senderCompanyName: 'Construcciones Norte S.L.',
    channelId: 'general',
    text: 'Recibido Elena, excelente trabajo con el forjado. Voy a revisar las probetas mañana a primera hora para dar el visto bueno.',
    createdAt: '2026-09-18T11:00:00.000Z'
  },
  {
    id: 'msg_3',
    senderId: 'usr_admin',
    senderName: 'Carlos Mendoza',
    senderRole: 'MAIN_CONTRACTOR_ADMIN',
    senderCompanyName: 'Construcciones Norte S.L.',
    channelId: 'general',
    text: 'Perfecto equipo. Por favor recordad registrar el parte diario de vuestro personal para tener la auditoría del proyecto al día.',
    createdAt: '2026-09-18T12:15:00.000Z'
  },
  {
    id: 'msg_4',
    senderId: 'usr_sub_centro',
    senderName: 'Manuel Vidal',
    senderRole: 'SUBCONTRACTOR_USER',
    senderCompanyName: 'Instalaciones Centro S.L.',
    channelId: 'delivery_notes',
    text: 'Buenas tardes. Javier, hemos subido una discrepancia sobre el albarán DN-0002. El tonelaje de acero suministrado no coincide con lo recibido.',
    createdAt: '2026-09-19T14:20:00.000Z'
  },
  {
    id: 'msg_5',
    senderId: 'usr_site_manager',
    senderName: 'Javier Ortiz',
    senderRole: 'SITE_MANAGER',
    senderCompanyName: 'Construcciones Norte S.L.',
    channelId: 'delivery_notes',
    text: 'Entendido Manuel, revisamos la báscula y corregimos el albarán en cuanto lo verifiquemos con el proveedor.',
    createdAt: '2026-09-19T15:00:00.000Z'
  }
];
