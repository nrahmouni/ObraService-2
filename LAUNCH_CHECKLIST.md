# ObraService Pro - Launch & Commercial Readiness Checklist

Este documento certifica la preparación operativa y comercial de **ObraService Pro** para su despliegue y venta a constructoras, contratistas principales y empresas subcontratistas en entornos reales de obra y oficina.

---

## 1. Matriz de Cobertura por Roles de Usuario (RBAC)

### 👑 MAIN_CONTRACTOR_ADMIN (Administrador de Constructora Principal)
- [x] **Gestión Integral de Proyectos**: Creación, edición, geolocalización por coordenadas GPS/geocerca y archivado con confirmación obligatoria.
- [x] **Catálogo de Personal y Subcontratas**: Alta de operarios propios, vinculación de empresas colaboradoras y control de CIF/NIF/NIE con validación de dígito de control.
- [x] **Supervisión de Partes de Trabajo**: Revisión de partes diarios con cálculo automático de horas ordinarias/extra e incidencias meteorológicas.
- [x] **Certificación de Albaranes**: Aprobación individual o en lote de albaranes de subcontrata y apertura de disputas documentadas.
- [x] **Consola de Configuración y Facturación**: Ajustes de apariencia, razón social, planes de pago, canales de notificación, auditoría y test de conexión Firestore en vivo.

### 👷 SITE_MANAGER (Jefe de Obra / Encargado de Campo)
- [x] **Asignación a Proyectos Específicos**: Vista acotada a las obras donde está asignado.
- [x] **Emisión de Partes Diarios en Movilidad**: Asistente paso a paso (`DailyReportWizard`) con verificación de geocerca (Haversine), advertencias de distancia y firma digital del encargado.
- [x] **Fichaje de Jornada Geoposicionado**: Registro de entrada/salida (`ClockInButton`) con verificación de proximidad física a la obra.
- [x] **Control de Cumplimiento**: Consulta de vigencia de certificados REA, seguros de RC y alerta temprana ante documentos vencidos.

### 🤝 SUBCONTRACTOR_USER (Representante de Subcontrata / Proveedor)
- [x] **Aislamiento Multi-Tenant Estricto**: Acceso exclusivo a los albaranes y partes vinculados a su CIF/empresa.
- [x] **Validación y Firma de Albaranes**: Certificación de horas ejecutadas en obra con firma manuscrita digitalizada.
- [x] **Gestión de Disputas Operativas**: Capacidad de reportar discrepancias en horas o personal con notificación inmediata al contratista principal.
- [x] **Carga de Documentación de Compliance**: Subida y control de vencimientos de documentación preventiva y laboral.

### ⚡ SUPER_ADMIN (Soporte Técnico / Plataforma Global)
- [x] **Master Dashboard Operativo**: Monitoreo de salud del cluster Firebase, latencia de sincronización y estado de la cola offline.
- [x] **Pista de Auditoría Global (`AuditTrailView`)**: Registro inmutable de eventos con filtros por actor, tipo de acción y fecha.
- [x] **Control de Estado de Empresas**: Activación/suspensión de tenants con justificación auditada y notificación automática.

---

## 2. Entornos y Modos de Ejecución

### 📶 Online vs. Offline-First
- [x] **Modo Offline**: Almacenamiento local mediante `IndexedDB` / buffer estructurado (`offlineQueue.ts`).
- [x] **Cola de Mutaciones**: Encolado automático de partes, albaranes, fichajes y eventos de auditoría ante desconexión.
- [x] **Reconexión Automática**: Vaciado reactivo (`flushOfflineQueue`) con resolución idempotente al recuperar conectividad.
- [x] **Aislamiento Demo / Producción**: Separación estricta del modo demo (datos sintéticos) respecto al entorno de producción conectado a Firestore `europe-west2`.

### 🌓 Apariencia y Accesibilidad (Claro / Oscuro)
- [x] **Modo Claro (Industrial de Alto Contraste)**: Paleta neutra limpia con acentos ámbar (#FF6600/#D97706) y contraste visual WCAG AA en pantallas bajo luz solar directa.
- [x] **Modo Técnico (Nocturno / Dark Mode)**: Fondo slate profundo (#0F172A), tipografía legible y descanso visual para trabajo de oficina y turnos nocturnos.

### 📱 Responsive: Escritorio vs. Dispositivos Móviles
- [x] **Escritorio (`MainLayout`)**: Menú lateral completo, atajos de teclado, tablas enriquecidas, modales centrados y exportaciones CSV/PDF.
- [x] **Móvil / Tablet (`MobileLayout`)**: Barra de navegación inferior táctil, botones de acción de mínimo 44px, asistente móvil de fichaje y partes con soporte de geolocalización nativa.

---

## 3. Casos de Prueba por Vista (`src/views/`)

| Vista | Prueba Principal | Resultado Esperado |
| :--- | :--- | :--- |
| **`DashboardView`** | Carga de métricas de horas, proyectos activos y alertas | Muestra contadores dinámicos calculados sin arrays hardcodeados |
| **`DailyReportsView`** | Filtrado por obra y generación de nuevo parte | Renderiza lista paginada (límite 100) y abre asistente de partes |
| **`DailyReportWizard`** | Creación de parte con trabajadores y geolocalización | Valida horas vs. presencia, calcula Haversine y genera albaranes automáticos |
| **`DeliveryNotesView`** | Certificación individual y en lote de albaranes | Actualiza estado a `Confirmed`, genera evento en auditoría y envía notificación |
| **`ProjectsView`** | Alta de proyecto con coordenadas y eliminación | Pide confirmación obligatoria en eliminación y persiste geocerca |
| **`WorkersManagementView`** | Alta/baja de operarios y asignación a empresa | Valida formato DNI/NIE e impide duplicidad de registros |
| **`AuditTrailView`** | Inspección de registros y exportación CSV | Carga registros paginados (límite 150) en orden cronológico descendente |
| **`SettingsView`** | Navegación por pestañas y test de Firestore | Cada pestaña guarda sus datos de forma independiente y el test verifica Firestore |
| **`ProfileView`** | Cambio de contraseña y preferencias de alertas | Guarda preferencias en localStorage y notifica éxito con toast |
| **`TeamView`** | Invitación de nuevos miembros por correo/código | Genera código único de 6 caracteres y registra invitación pendiente |
| **`InviteAcceptanceView`** | Registro con código de invitación corporativo | Vincula al usuario al tenant de la empresa y redirige al panel |
| **`BillingView`** | Selección de plan y datos fiscales de facturación | Persiste datos de cobro corporativo |
| **`MapView`** | Visualización satelital de geocercas de obra | Renderiza marcadores con radios de tolerancia en metros |

---

## 4. Auditoría de Seguridad y Pruebas Automatizadas

- [x] **Validación de Identificadores Fiscales**: CIF, NIF y NIE españoles verificados algorítmicamente (`src/domain/rules.test.ts`).
- [x] **Invariantes de Geocerca**: Fórmula de Haversine con precisión métrica comprobada.
- [x] **Dirty Dozen Firestore Rules**: 12 suites completas verificando denegación de spoofing de identidad, escalado de roles, mutaciones de auditoría y accesos cruzados entre empresas (`firestore.rules.test.ts`).
- [x] **Compilación y Tipado**: `tsc --noEmit` y `npm run build` ejecutados con 0 errores y 0 advertencias críticas.

**Estado del Proyecto**: 🟢 **LISTO PARA PRODUCCIÓN Y VENTA COMERCIAL**
