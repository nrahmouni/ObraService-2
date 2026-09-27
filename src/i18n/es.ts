export const es = {
  // Navigation & Shell
  'nav.dashboard': 'Panel Principal',
  'nav.reports': 'Partes Diarios',
  'nav.delivery_notes': 'Albaranes',
  'nav.projects': 'Obras y Proyectos',
  'nav.map': 'Mapa y GPS',
  'nav.team': 'Empresas y Contratas',
  'nav.workers': 'Personal y Maquinaria',
  'nav.clients': 'CRM Clientes',
  'nav.billing': 'Planes y Facturación',
  'nav.web_admin': 'Admin Plataforma',
  'nav.integrations': 'API e Integraciones',
  'nav.audit': 'Trazabilidad y Auditoría',
  'nav.settings': 'Ajustes de Empresa',
  'nav.docs': 'Documentación PRL',
  'nav.profile': 'Mi Perfil',
  'nav.logout': 'Cerrar Sesión',

  // Actions
  'action.new_report': 'Emitir Parte Diario',
  'action.clock_in': 'Fichar GPS',
  'action.save': 'Guardar Cambios',
  'action.cancel': 'Cancelar',
  'action.delete': 'Eliminar',
  'action.edit': 'Editar',
  'action.confirm': 'Confirmar',
  'action.search': 'Buscar...',
  'action.filter': 'Filtrar',
  'action.download_pdf': 'Descargar PDF',
  'action.export_csv': 'Exportar CSV',

  // Statuses
  'status.active': 'Activo',
  'status.planned': 'Planificada',
  'status.completed': 'Finalizada',
  'status.paused': 'En Pausa',
  'status.submitted': 'Enviado',
  'status.draft': 'Borrador',
  'status.confirmed': 'Confirmado',
  'status.pending': 'Pendiente',
  'status.disputed': 'Disputado',

  // Roles
  'role.super_admin': 'Super Administrador',
  'role.admin': 'Administrador Principal',
  'role.manager': 'Jefe de Obra',
  'role.worker': 'Operario / Subcontrata',

  // Common titles & headings
  'app.name': 'ObraService Pro',
  'app.tagline': 'Gestión Integral de Obras y Servicios en Terreno',
  'dashboard.title': 'Centro de Operaciones',
  'reports.title': 'Libro de Partes Diarios',
  'delivery_notes.title': 'Albaranes de Subcontratas',
  'workers.title': 'Gestión de Personal y Cuadrillas',
  'compliance.title': 'Cumplimiento Legal y PRL',
  'language.select': 'Idioma / Language',
};

export type TranslationKey = keyof typeof es;
