# DOSSIER TÉCNICO, ARQUITECTURA Y ESTUDIO DE MERCADO: OBRASERVICE PRO

**Documento Oficial de Análisis Integral del Producto**  
**Versión:** 1.0.0 Enterprise  
**Fecha:** Septiembre 2026  
**Sector:** AEC (Architecture, Engineering & Construction) / ConTech SaaS  
**Mercado Objetivo:** España y Unión Europea  

---

## 1. RESUMEN EJECUTIVO & PROPUESTA DE VALOR

### 1.1 ¿Qué es ObraService Pro?
**ObraService Pro** es una plataforma B2B SaaS especializada en la gestión operativa, control de subcontratas, certificación de partes diarios y trazabilidad documental para el sector de la construcción. Diseñada bajo una filosofía **Mobile-First y Offline-First**, digitaliza la cadena de valor entre la **Constructora Principal (Contratista General)**, las **Empresas Subcontratadas**, los **Jefes de Obra (Site Managers)** y los **Operarios de Campo**.

### 1.2 La Misión del Producto
Eliminar el caos de las hojas de papel, las libretas de tajo, las notas manuscritas en albaranes manchados de yeso y las eternas discusiones a final de mes entre contrata y subcontrata respecto a las horas reales trabajadas, personal presente y acopios de material en obra.

### 1.3 Propuesta de Valor Única (USP - Unique Selling Proposition)
1. **Generación Automática de Albaranes a partir del Parte Diario**: El Jefe de Obra registra el trabajo del día una sola vez; el motor de dominio segrega automáticamente las horas por subcontrata y genera de inmediato los albaranes correspondientes listos para firma digital.
2. **Geolocalización GPS y Geocercas (Geofencing)**: Comprobación matemática en tiempo real (mediante algoritmo Haversine) de que el operario o encargado se encuentra físicamente en el radio autorizado de la obra al emitir partes o registrar fichajes.
3. **Aislamiento Multi-Tenant Estricto y Seguro**: Cada subcontrata tiene acceso exclusivo a su cuadrilla, sus obras asignadas y sus albaranes, sin visibilidad sobre proyectos o costes ajenos.
4. **Cumplimiento Normativo Español Nativo**: Integración directa de requisitos de la Ley 32/2006 de Subcontratación, REA, Prevención de Riesgos Laborales (CAE) y Registro Horario Obligatorio (RDL 8/2019).
5. **Ergonomía Táctil Adaptativa (`MobileShell`)**: Forzado reactivo a layout móvil para pantallas inferiores a 768px, permitiendo que tanto directores de obra como peones manejen la app sin pantallas de escritorio comprimidas ni fricciones.

---

## 2. ANÁLISIS DE MERCADO & SECTOR CONSTRUCCIÓN EN ESPAÑA

### 2.1 Contexto Macroeconómico del Sector
* **Peso en el PIB**: El sector de la construcción en España representa entre el 5% y el 6% del PIB nacional directo (más del 10% considerando actividades auxiliares y promotoras).
* **Nivel de Atomización Extremo**: Más del 85% del tejido empresarial de la construcción está compuesto por PYMEs y microempresas (de 1 a 20 trabajadores), lo que históricamente ha generado una alta resistencia al software corporativo tradicional por su complejidad y elevado coste.
* **Modelo Basado en Subcontratación en Cadena**: En una obra media (residencial, terciaria o civil), el contratista principal subcontrata entre el 60% y el 90% de los capítulos de obra (encofrado, ferralla, albañilería, fontanería, electricidad, climatización, yesos, cerrajería).

### 2.2 Los 5 Grandes Puntos de Dolor del Mercado (Pain Points)

| Punto de Dolor | Situación Tradicional (Sin ObraService) | Solución Aportada por ObraService Pro |
| :--- | :--- | :--- |
| **1. Disputas de Cierre de Mes (Horas / Facturas)** | Las subcontratas pasan facturas que no cuadran con las anotaciones manuales del jefe de obra. Se retienen pagos y se generan conflictos. | **Albarán digital generado en el día**. El subcontratista revisa y firma digitalmente día a día. Cierre de mes con discrepancia cero. |
| **2. Fichajes Falsos o Fuera de Obra** | Firmas en hojas de papel al final de la semana, imposibles de auditar en caso de inspección o accidente laboral. | **Geocerca GPS activa**: Fichaje validado contra coordenadas exactas de la obra con advertencia de desvío en metros. |
| **3. Sanciones por Incumplimiento de Registro de Jornada** | El Real Decreto-ley 8/2019 exige registro diario accesible. Multas de hasta 7.500 € por centro de trabajo. | **Fichaje digital móvil inmutable con auditoría**: Registro segundo a segundo de entradas, salidas y descansos. |
| **4. Subcontratas no Homologadas o sin REA (Riesgo Legal Solidario)** | Una subcontrata entra a trabajar con documentación caducada (seguro RC vencido, REA caducado). En caso de accidente, la contrata principal responde solidariamente. | **Semáforo PRL Operacional**: Bloqueo visual preventivo de empresas cuya documentación está caducada o pendiente. |
| **5. Pérdida de Información de Tajo** | Fotos de obra desperdigadas en grupos caóticos de WhatsApp entre encargados y comerciales. | **Expediente digital por obra**: Fotos de evidencia vinculadas con geolocalización, partes fechados y canal de chat directo de obra. |

### 2.3 Buyer Personas y Arquetipos de Usuario

#### Arquetipo 1: El Director General / Administrador de la Constructora Principal (`MAIN_CONTRACTOR_ADMIN`)
* **Preocupaciones**: Rentabilidad de las obras, control de desvíos en mano de obra, evitar multas de inspección de trabajo, control de facturación de subcontratas.
* **Uso de ObraService**: Panel de mando ejecutivo (KPIs de obras activas, horas totales computadas, subcontratas homologadas), aprobación de liquidaciones y auditoría completa.

#### Arquetipo 2: El Jefe de Obra / Encargado de Campo (`SITE_MANAGER`)
* **Preocupaciones**: Falta de tiempo, papeleo agotador al terminar la jornada, coordinación de cuadrillas en tajos simultáneos, justificar avances al promotor.
* **Uso de ObraService**: Emisión de partes diarios en menos de 2 minutos con el asistente `DailyReportWizard` desde el móvil o tablet a pie de obra.

#### Arquetipo 3: El Empresario Subcontratista (`SUBCONTRACTOR_USER`)
* **Preocupaciones**: Que le reconozcan todas las horas trabajadas por sus peones y oficiales, cobrar a tiempo y no perder albaranes físicos.
* **Uso de ObraService**: Recepción en tiempo real de albaranes, firma digital con el dedo en pantalla, gestión formal de disputas si hay horas no reconocidas.

#### Arquetipo 4: El Operario / Cuadrilla de Obra (`WORKER`)
* **Preocupaciones**: Simplicidad máxima, interfaz en español claro, fichar rápido sin configuraciones técnicas engorrosas.
* **Uso de ObraService**: Acceso mediante botón directo para fichar entrada/salida y consulta de su estado de PRL.

### 2.4 Modelo de Negocio y Estrategia de Monetización SaaS (B2B)
ObraService Pro opera bajo un modelo de suscripción por capacidad y volumen de obras:

* **Plan Starter (Autónomos y Reformas)**: 49 € / mes (Hasta 2 obras activas, usuarios ilimitados en cuadrilla).
* **Plan Pro (Constructoras Medianas)**: 149 € / mes (Hasta 10 obras activas, GPS Geofencing, generación automática de albaranes, exportación PDF avanzada y soporte prioritario).
* **Plan Enterprise / Corporativo**: 399 € / mes (Obras ilimitadas, multi-empresa, API ERP, soporte para subcontratación en múltiples niveles y SLA garantizado).
* **Bucle de Crecimiento Viral (Network Effect)**: Cada Constructora Principal que contrata la plataforma invita obligatoriamente a entre 5 y 30 empresas subcontratistas a usar ObraService para validar sus albaranes. Esas subcontratas, al experimentar la agilidad del sistema, exigen o introducen ObraService en sus trabajos con otras constructoras principales, reduciendo el Coste de Adquisición de Clientes (CAC) a mínimos históricos del sector.

### 2.5 Análisis Competitivo Frente a Soluciones Existentes

| Característica | WhatsApp / Excel | PlanRadar / Procore | BrickControl / Presto | **ObraService Pro** |
| :--- | :---: | :---: | :---: | :---: |
| **Curva de Aprendizaje** | Muy baja | Muy alta (meses) | Media-Alta | **Inmediata (< 5 min)** |
| **Geofencing GPS en Tajo** | No | Parcial | No | **Sí (Haversine dinámico)** |
| **Partes a Albaranes Automático** | No | No | No | **Sí (Motor Integrado)** |
| **Validación de NIF/CIF Español** | No | No | Parcial | **Nativo estricto** |
| **Aislamiento para Subcontratas** | Caótico | Complejo/Costoso | No | **Nativo y sin coste extra** |
| **Soporte Offline en Zótano/Túnel**| Inexistente | Parcial | No | **Sí (IndexedDB Queue)** |
| **Coste de Licencia** | Gratis (Oculto) | > 500 € / usuario | Muy elevado | **Por obra / Accesible PYME** |

---

## 3. ARQUITECTURA TÉCNICA DEL SOFTWARE

### 3.1 Stack Tecnológico & Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA REACT 19)                         │
│  React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + React Router v7   │
│  Motion + Lucide Icons + React Hot Toast + Google Maps Platform SDK    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     CLIENT STORAGE LAYER      │       │     ROUTER & SHELL LAYER      │
│  - Reactive Local Store       │       │  - useIsMobile Hook (< 768px) │
│  - localForage (IndexedDB)    │       │  - MobileShell (Tactile UX)   │
│  - Offline Mutation Queue     │       │  - AdminShell (Desktop UX)    │
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    │ HTTP / WebSocket / Firestore SDK
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND API & SECURITY GATEWAY                       │
│  Node.js + Express + tsx/esbuild + Helmet + Zod + Rate Limiting        │
│  Google GenAI SDK (@google/genai) Proxy Endpoint (/api/generate)       │
└───────────────────┬───────────────────────────────────┬────────────────┘
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────────────┐   ┌───────────────────────────┐
│      PERSISTENCIA RELACIONAL          │   │    REAL-TIME PERSISTENCE  │
│  PostgreSQL (Google Cloud SQL)        │   │    Google Cloud Firestore │
│  Drizzle ORM (Type-Safe Schema)       │   │    Security Rules RBAC    │
└───────────────────────────────────────┘   └───────────────────────────┘
```

* **Frontend**: React 19 con arquitectura funcional modular, hooks puros y compilación optimizada bajo Vite 8.
* **Estilos**: Tailwind CSS v4 con variables CSS nativas de alto rendimiento, aceleración de hardware para animaciones y paleta cromática diseñada para contraste bajo la luz del sol en exteriores (`#FF6600`, `#0F172A`, `#1E293B`).
* **Backend**: Servidor Express modular con TypeScript (`server.ts`) ejecutado bajo `tsx` en desarrollo y empaquetado ultrarrápido con `esbuild` en producción.
* **Capa ORM & Datos Estructurados**: Drizzle ORM sobre PostgreSQL con tipado estricto de tablas (`companies`, `projects`, `workers`, `dailyReports`, `deliveryNotes`, `auditLogs`).
* **Capa en Tiempo Real**: Firebase Firestore con sincronización de eventos de actualización instantánea (`onSnapshot`) y reglas de seguridad declarativas auditadas (`firestore.rules`).
* **Generación de Documentos**: `jspdf` para compilación en memoria y descarga de albaranes de subcontrata con diseño corporativo y firmas embebidas.

### 3.2 El Motor de Dominio Puro e Invariantes (`src/domain/rules.ts`)
ObraService separa drásticamente la lógica de negocio de los componentes visuales:
1. **Validación de Identificación Fiscal Española**: Algoritmo de verificación de sintaxis y letras de control para DNI, NIE y CIF (`validateSpanishTaxId`).
2. **Cálculo Geodésico de Proximidad Haversine**:
   $$\text{Haversine}(\phi_1, \phi_2, \Delta\lambda) = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
   Determina si el usuario se halla dentro del radio de tolerancia configurado para la obra (por defecto 250 metros), etiquetando el reporte con estatus `Valid`, `Warning` o `Unavailable`.
3. **Invariantes de Jornada Laboral**:
   * Prohibición absoluta de horas negativas.
   * Regla de presencia: Un operario marcado como "Ausente" o "Baja Médica" no puede computar horas trabajadas.
   * Cálculo automático de horas ordinarias vs extraordinarias sobre el umbral configurado (ej. 8 horas de convenio).
   * Alertas por jornadas prolongadas (> 10 horas) o exceso de horas extras (> 2 horas).
4. **Motor Idempotente de Albaranes (`generateDeliveryNotesFromReport`)**:
   * Agrupa automáticamente los trabajadores externos por CIF de su empresa empleadora.
   * Ignora a los trabajadores directos de la contrata principal (no generan albarán externo).
   * Sumariza horas normales y extras.
   * Evita duplicados mediante comprobación de unicidad por `sourceDailyReportId` + `subcontractorCompanyId`.

### 3.3 Arquitectura Offline-First y Resiliencia en Obra
En sótanos de hormigón armado, túneles o fincas rurales sin cobertura 4G/5G, la aplicación no se bloquea:
* Los partes diarios y fichajes se guardan de forma instantánea en `IndexedDB` a través del almacén local.
* La cola de mutaciones (`offlineQueue.ts`) registra la acción pendiente.
* Al recuperar señal de red, un worker en segundo plano ejecuta `flushOfflineQueue` resolviendo las escrituras en Firestore y PostgreSQL de manera transparente para el operario.

### 3.4 Responsividad Adaptativa e Híbrida (`useIsMobile` & `MobileShell`)
A diferencia de los paneles de administración convencionales que se vuelven ilegibles en teléfonos móviles al aplastar columnas:
* Un hook ultrapreciso (`useIsMobile`) detecta umbrales de viewport inferiores a 768px (`max-width: 767.98px`), escuchando tanto `matchMedia` como los eventos pasivos `resize` y `orientationchange`.
* Cuando un Administrador o Jefe de Obra abre la URL `/admin/*` desde su teléfono móvil, el enrutador conmuta transparentemente a **`MobileShell`**.
* La barra lateral se reemplaza por una barra inferior táctil (*Bottom Bar*) con botones ergonómicos de 48px y un cajón lateral deslizante (*Drawer*), con soporte nativo de áreas seguras (`safe-area-inset-bottom` para iPhone y Android).

---

## 4. DETALLE DE MÓDULOS FUNCIONALES

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUITE OBRASERVICE PRO                           │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│   OPERACIONES   │   CONTROL PRL   │  GESTIÓN SUBCON  │    CRM & SAAS   │
│  - Partes Tajo  │  - Alertas REA  │  - Homologación  │  - Pipeline CRM │
│  - Albaranes DN │  - Seguros RC   │  - Cuadrillas    │  - Facturación  │
│  - Fichaje GPS  │  - CAE Digital  │  - Asignación    │  - Multi-Tenant │
│  - Radar Obras  │  - Auditoría    │  - Disputas      │  - Super Admin  │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

1. **Gestión de Obras y Proyectos (`ProjectsView`)**: Catálogo interactivo en modo tarjetas o tabla con estados (Planificada, Activa, Pausada, Terminada), presupuesto, cliente, fechas y asignación directa de subcontratas colaboradoras.
2. **Asistente de Parte Diario (`DailyReportWizard`)**: Asistente en 3 pasos para registrar clima, cuadrilla presente, horas ordinarias/extras por operario, observaciones de seguridad y fotos de avance.
3. **Módulo de Albaranes Digitales (`DeliveryNotesView`)**: Lista certificada de entregas de trabajo por subcontratista, con visor de detalle, cálculo de totales, panel de resolución de disputas y generador de PDF imprimible.
4. **Radar Satelital y Mapa de Tajos (`MapView`)**: Integración con Google Maps Platform para geolocalizar todas las obras de la constructora en el mapa, visualizar radios de geocerca y comprobar la distribución geográfica de los recursos.
5. **Red de Contratas y Subcontratas (`CompaniesSubTab`)**: Gestión de empresas homologadas, CIF, código único de invitación para registro de usuarios y matriz de obras autorizadas.
6. **Gestión de Personal y Cuadrillas (`WorkersSubTab`)**: Padrón laboral de peones, oficiales, encargados y maquinistas, con distinción estricta entre plantilla propia y personal externo subcontratado.
7. **Control Horario y Fichaje GPS (`MobileClockInView`)**: Registro de entrada y salida laboral geolocalizado en cumplimiento de la normativa española de control de jornada.
8. **Canal de Comunicación Directa (`MobileChatView`)**: Chat de incidencias de obra para comunicar alertas de seguridad, cambios de tajo o retrasos en suministros.
9. **CRM de Clientes y Promotoras (`ClientsCrmView`)**: Gestión comercial de clientes, oportunidades de presupuesto por fase y seguimiento de actividades previas a la apertura de obra.
10. **Pista de Auditoría Forense (`AuditTrailView`)**: Registro inmutable de cada alta, edición, validación o borrado en el sistema, con actor, timestamp, dirección IP y entidad afectada.

---

## 5. MARCO LEGAL Y REGULATORIO EN ESPAÑA

ObraService Pro ha sido concebido para blindar jurídicamente a las empresas constructoras ante los siguientes cuerpos legales:

1. **Ley 32/2006, reguladora de la subcontratación en el Sector de la Construcción**:
   * Exige acreditar la solvencia de las empresas que intervienen en la obra.
   * Obliga a la inscripción en el **REA (Registro de Empresas Acreditadas)**.
   * Establece límites en la cadena de subcontratación (máximo 3 niveles). ObraService vincula contractualmente a cada subcontrata con la obra autorizada.
2. **Real Decreto-ley 8/2019, de medidas urgentes de protección social y lucha contra la precariedad laboral**:
   * Exige el registro diario de jornada para el 100% de los trabajadores, incluyendo hora concreta de inicio y finalización.
   * Obliga a conservar los registros durante 4 años a disposición de los trabajadores, sindicatos y la Inspección de Trabajo y Seguridad Social (ITSS).
3. **Ley 31/1995 de Prevención de Riesgos Laborales (PRL) y Real Decreto 171/2004 (CAE)**:
   * Regula la Coordinación de Actividades Empresariales cuando coinciden varias empresas en el mismo centro de trabajo (obra). ObraService bloquea operativamente la asignación de subcontratas con documentación vencida.
4. **Reglamento General de Protección de Datos (RGPD) y Ley Orgánica 3/2018 (LOPDGDD)**:
   * La captura de geolocalización se realiza de forma proporcionada y transparente: **únicamente en el instante del fichaje o de la firma del parte**, sin rastreo continuo invasivo en segundo plano.

---

## 6. CONCLUSIONES & ROADMAP DE EXPANSIÓN

### 6.1 Conclusión del Diagnóstico
**ObraService Pro** cuenta con un grado de madurez técnica y funcional de nivel enterprise. Cubre con solvencia las necesidades operativas reales del sector de la construcción en España, combinando solidez contable y legal con una experiencia de usuario extremadamente ágil en dispositivos móviles.

### 6.2 Próximos Hitos del Roadmap
1. **OCR Inteligente con Gemini Vision**: Lectura automática de fotos de albaranes de hormigón y materiales para rellenar automáticamente los albaranes digitales.
2. **Visor BIM Ligero (IFC)**: Visualización 3D en navegador de modelos arquitectónicos para asociar partes diarios a elementos específicos del edificio.
3. **Integración con Presto / BC3**: Exportación directa de horas e incidencias a las partidas presupuestarias de software de medición y presupuestos líder en España.
4. **Sellado de Tiempo Cualificado eIDAS**: Certificación criptográfica de las firmas de albaranes para dotarlas de plena validez como prueba jurídica en arbitrajes y juicios de reclamación de cantidad.

---
*Fin del Dossier de Análisis Técnico y de Mercado — ObraService Pro.*
