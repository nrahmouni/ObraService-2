/**
 * ObraService - Authoritative Domain Types
 * Strict domain model matching the product specification for the Spanish construction industry.
 */

export type UserRole = 
  | 'SUPER_ADMIN'           // Super Administrador del Sistema (Multi-tenant Master)
  | 'MAIN_CONTRACTOR_ADMIN' // Administrador de Contratista Principal
  | 'SITE_MANAGER'          // Jefe de Obra
  | 'SUBCONTRACTOR_USER';   // Usuario Subcontrata

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'MAIN_CONTRACTOR_ADMIN',
  MANAGER = 'SITE_MANAGER',
  WORKER = 'SUBCONTRACTOR_USER',
}

export type AccountStatus = 
  | 'unauthenticated'
  | 'no_company'
  | 'active'
  | 'suspended';

export type CompanyType = 
  | 'MAIN_CONTRACTOR' 
  | 'SUBCONTRACTOR';

export interface Company {
  id: string;
  name: string;
  taxId: string; // CIF / NIF
  type: CompanyType;
  address: string;
  inviteCode: string;
  active: boolean;
  subscriptionStatus?: 'Active' | 'Trial' | 'Expired' | 'Suspended';
  createdAt: string;
}

export interface CompanyRelationship {
  id: string;
  mainContractorCompanyId: string;
  subcontractorCompanyId: string;
  status: 'Active' | 'Pending' | 'Terminated';
  assignedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  active: boolean;
  assignedProjectIds: string[];
  createdAt: string;
  isSuperAdmin?: boolean;
  customClaims?: Record<string, any>;
}


export type ProjectStatus = 
  | 'Planned' 
  | 'Active' 
  | 'Paused' 
  | 'Completed' 
  | 'Archived';

export interface ProjectLocation {
  address: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
}

export interface Project {
  id: string;
  code: string; // PRJ-XXXX
  name: string;
  status: ProjectStatus;
  location: ProjectLocation;
  address?: string;
  latitude?: number;
  longitude?: number;
  validationRadiusMeters: number; // e.g. 250m
  plannedWorkloadHours?: number;
  plannedHours?: number;
  companyId: string;
  startDate?: string;
  endDate?: string;
  assignedUserIds?: string[];
  assignedSubcontractorIds?: string[];
  client?: string;
  initialBudget?: number;
  budget?: number;
  spentBudget?: number;
  coverImage?: string;
  projectType?: string;
  description?: string;
}

export type WorkerCategory = 
  | 'Encargado General'
  | 'Jefe de Equipo'
  | 'Oficial 1ª'
  | 'Oficial 2ª'
  | 'Oficial de 1ª'
  | 'Oficial de 2ª'
  | 'Peón Especialista'
  | 'Peón Ordinario'
  | 'Encofrador'
  | 'Ferrallista'
  | 'Maquinista'
  | 'Operador de Maquinaria'
  | 'Gruista'
  | 'Electricista'
  | 'Fontanero';

export interface Worker {
  id: string;
  code: string; // WRK-XXXX
  name: string;
  category: WorkerCategory;
  companyId: string; // Puede ser la empresa principal o una subcontrata
  nationalId?: string;
  taxId?: string;
  phone?: string;
  assignedProjectIds?: string[];
  companyNameSnapshot?: string;
  isSubcontractor?: boolean;
  active: boolean;
  createdAt: string;
}

export interface Machinery {
  id: string;
  code: string; // MAC-XXXX
  name: string;
  type: string;
  companyId: string;
  active: boolean;
  createdAt: string;
}

export type AttendanceStatus = 
  | 'Presente' 
  | 'Ausente' 
  | 'Baja' 
  | 'Vacaciones';

export interface WorkEntry {
  id: string;
  workerId: string;
  workerNameSnapshot: string;
  workerCategorySnapshot: WorkerCategory;
  companyIdSnapshot: string;
  companyNameSnapshot: string;
  isSubcontractor: boolean;
  normalHours: number;
  extraHours: number;
  totalHours: number;
  attendance: AttendanceStatus;
}

export type DailyReportStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Corrected' 
  | 'Locked' 
  | 'Cancelled';

export type LocationValidationStatus = 
  | 'Valid' 
  | 'Warning' 
  | 'Unavailable' 
  | 'Not Required';

export interface LocationSnapshot {
  capturedAt: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  distanceFromProjectMeters?: number;
  status: LocationValidationStatus;
  warningAcknowledged?: boolean;
  note?: string;
}

export interface AutomatedAnalysisItem {
  id: string;
  type: 'HOURS_ANOMALY' | 'EXTRA_HOURS_RISK' | 'WEEKEND_WORK' | 'INCOHERENCE' | 'WEATHER_NOTE';
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  title: string;
  explanation: string;
  recommendation: string;
  resolved: boolean;
}

export interface MachineryEntry {
  id: string;
  machineryId: string;
  machineryNameSnapshot: string;
  companyIdSnapshot: string;
  hours: number;
  comments?: string;
}

export interface MaterialEntry {
  id: string;
  materialName: string;
  quantity: number;
  unit: string; // 'm3' | 'kg' | 't' | 'ud' | 'ml'
  supplierName?: string;
  deliveryNoteReference?: string;
  companyIdSnapshot: string;
  comments?: string;
}

export interface EvidenceAttachment {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedByUserId?: string;
  fileType?: string; // 'image/jpeg' | 'image/png' | 'application/pdf'
  sizeBytes?: number;
}

export type Evidence = EvidenceAttachment;

export interface DailyReport {
  id: string;
  code: string; // DR-YYYYMMDD-XXXX
  companyId: string; // Empresa constructora principal (Tenant ID)
  projectId: string;
  projectNameSnapshot: string;
  date: string; // YYYY-MM-DD
  creatorId: string;
  creatorNameSnapshot: string;
  status: DailyReportStatus;
  workEntries: WorkEntry[];
  machineryEntries?: MachineryEntry[];
  materialEntries?: MaterialEntry[];
  totalNormalHours: number;
  totalExtraHours: number;
  totalHours: number;
  comments: string;
  siteConditions?: string;
  evidenceUrls: string[];
  evidenceAttachments?: EvidenceAttachment[];
  locationSnapshot?: LocationSnapshot;
  analysisItems?: AutomatedAnalysisItem[];
  correctionReason?: string;
  originalReportId?: string; // If corrected, points to original DR
  version: number;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
}

export type DeliveryNoteStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Disputed';

export type DisputeCategory = 
  | 'Trabajador incorrecto'
  | 'Horas incorrectas'
  | 'HORAS_INCORRECTAS'
  | 'TRABAJADOR_INCORRECTO'
  | 'TRABAJADOR_AUSENTE'
  | 'HORAS_EXTRA_NO_AUTORIZADAS'
  | 'PROYECTO_ERRONEO'
  | 'DUPLICADO'
  | 'OTRO'
  | 'Trabajador ausente'
  | 'Horas extra no autorizadas'
  | 'Proyecto erróneo'
  | 'Duplicado'
  | 'Otro';

export interface DisputeRecord {
  id: string;
  category: DisputeCategory;
  reason: string;
  proposedNormalHours?: number;
  proposedExtraHours?: number;
  evidenceUrls?: string[];
  actorId: string;
  actorName: string;
  actorCompany: string;
  createdAt: string;
  resolution?: {
    action: 'ACEPTADA_CON_AJUSTE' | 'DESESTIMADA_JUSTIFICADA';
    resolvedByUserId: string;
    resolvedByUserName: string;
    resolutionNote: string;
    resolvedAt: string;
  };
}

export type Dispute = DisputeRecord;

export interface ConfirmationDetails {
  confirmedByUserId: string;
  confirmedByUserName: string;
  confirmedAt: string;
  subcontractorCompanyName: string;
  name?: string;
  timestamp?: string;
}

export interface DeliveryNoteLine {
  id: string;
  workerId: string;
  workerNameSnapshot: string;
  workerCategorySnapshot: string;
  companyIdSnapshot?: string;
  companyNameSnapshot?: string;
  normalHours: number;
  extraHours: number;
  totalHours: number;
  notes?: string;
}

export interface DeliveryNote {
  id: string;
  code: string; // DN-YYYYMMDD-XXXX
  companyId: string; // Empresa constructora principal (Tenant ID)
  sourceDailyReportId: string;
  sourceDailyReportCode: string;
  dailyReportCodeSnapshot?: string;
  projectId: string;
  projectNameSnapshot: string;
  date: string; // YYYY-MM-DD
  subcontractorCompanyId: string;
  subcontractorCompanyTaxId?: string;
  subcontractorCompanyName: string;
  mainContractorCompanyId: string;
  workEntries: WorkEntry[];
  lines?: (DeliveryNoteLine | WorkEntry)[];
  normalHours: number;
  extraHours: number;
  totalHours: number;
  status: DeliveryNoteStatus;
  confirmationDetails?: ConfirmationDetails;
  confirmedBy?: ConfirmationDetails;
  disputeRecord?: DisputeRecord;
  dispute?: DisputeRecord;
  correctionNotice?: string;
  evidenceAttachments?: EvidenceAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorCompanyName: string;
  actorCompanyId?: string;
  affectedEntity: 'DailyReport' | 'DeliveryNote' | 'Project' | 'Worker' | 'Machinery' | 'Company' | 'Membership';
  recordId: string;
  recordCode?: string;
  operation: 
    | 'REPORT_CREATED'
    | 'REPORT_SUBMITTED'
    | 'REPORT_CORRECTED'
    | 'DELIVERY_NOTE_GENERATED'
    | 'DELIVERY_NOTE_CONFIRMED'
    | 'DELIVERY_NOTE_DISPUTED'
    | 'DISPUTE_RESOLVED'
    | 'WORKER_CREATED'
    | 'WORKER_UPDATED'
    | 'WORKER_DELETED'
    | 'WORKER_STATUS_CHANGED'
    | 'MACHINERY_CREATED'
    | 'MACHINERY_UPDATED'
    | 'MACHINERY_DELETED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_DELETED'
    | 'PROJECT_ASSIGNMENT_CHANGED'
    | 'COMPANY_CREATED'
    | 'MEMBER_JOINED'
    | 'INVITE_CODE_REGENERATED';
  eventType?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  dailyReportId?: string;
  deliveryNoteId?: string;
  action?: string;
  description?: string;
  severity?: 'Info' | 'Warning' | 'Success' | 'Danger';
  category?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ACTION_REQUIRED' | 'SUCCESS';
  targetEntity?: 'DailyReport' | 'DeliveryNote' | 'Project';
  targetId?: string;
  read: boolean;
  createdAt: string;
}

export type Notification = NotificationItem;

export interface Invitation {
  id: string;
  code: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  assignedProjectIds: string[];
  invitedBy: string;
  status: 'Pending' | 'Accepted' | 'Expired';
  createdAt: string;
  acceptedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderCompanyName: string;
  channelId: string; // 'general' | 'delivery_notes' | 'coordination'
  text: string;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userNameSnapshot: string;
  userRoleSnapshot: UserRole;
  companyId: string;
  projectId: string;
  projectNameSnapshot: string;
  timestamp: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  status: 'In' | 'Out';
}

export interface ComplianceDocument {
  id: string;
  companyId: string;
  docType: 'TC2' | 'REA' | 'PRL_CERTIFICATE' | 'INSURANCE' | 'ID_CARD';
  title: string;
  status: 'VALID' | 'EXPIRED' | 'PENDING';
  expiryDate: string;
  fileUrl?: string;
  createdAt: string;
}

export interface AppState {
  isDemoMode: boolean;
  theme: 'light' | 'dark';
  viewPreference: 'cards' | 'list';
  currentUser: User | null;
  companies: Company[];
  users: User[];
  projects: Project[];
  workers: Worker[];
  machinery: Machinery[];
  reports: DailyReport[];
  deliveryNotes: DeliveryNote[];
  auditEvents: AuditEvent[];
  invitations: Invitation[];
  messages?: ChatMessage[];
  timeLogs?: TimeLog[];
  complianceDocuments?: ComplianceDocument[];
}
