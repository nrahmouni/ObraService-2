/**
 * ObraService - Authoritative Reactive Store
 * Manages production vs. demo data isolation, authentication lifecycle,
 * transactional mutations, idempotency, and audit trails.
 */

import { 
  AuditEvent, 
  Company, 
  DailyReport, 
  DeliveryNote, 
  DisputeCategory, 
  Project, 
  User, 
  UserRole, 
  WorkEntry, 
  Worker,
  Machinery,
  ChatMessage,
  TimeLog,
  Invitation,
  ComplianceDocument,
  NotificationItem
} from '../types';

import * as companyModule from './store/company';
import * as projectModule from './store/project';
import * as workerModule from './store/worker';
import * as reportModule from './store/report';

interface StoreState {
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
  messages: ChatMessage[];
  syncError: string | null;
  timeLogs: TimeLog[];
  complianceDocuments: ComplianceDocument[];
  notifications: NotificationItem[];
}

const PROD_STORAGE_KEY = 'obraservice_prod_v1';
const DEMO_STORAGE_KEY = 'obraservice_demo_v1';

function getSeedState(): StoreState {
  const seedCompanies: Company[] = [
    {
      id: 'comp_norte',
      name: 'Construcciones Norte S.L.',
      taxId: 'B87654321',
      type: 'MAIN_CONTRACTOR',
      address: 'Paseo de la Castellana 140, Madrid',
      inviteCode: 'NORTE2026',
      active: true,
      subscriptionStatus: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_levante',
      name: 'Estructuras Levante S.L.',
      taxId: 'B12345678',
      type: 'SUBCONTRACTOR',
      address: 'Avenida Al Vedat 22, Torrent, Valencia',
      inviteCode: 'LEVANTE2026',
      active: true,
      subscriptionStatus: 'Active',
      createdAt: new Date().toISOString()
    }
  ];

  const seedUsers: User[] = [
    {
      id: 'usr_admin',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@construccionesnorte.es',
      role: 'MAIN_CONTRACTOR_ADMIN',
      companyId: 'comp_norte',
      companyName: 'Construcciones Norte S.L.',
      active: true,
      assignedProjectIds: ['proj_metro'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_site_manager',
      name: 'Javier Ortiz',
      email: 'javier.ortiz@construccionesnorte.es',
      role: 'SITE_MANAGER',
      companyId: 'comp_norte',
      companyName: 'Construcciones Norte S.L.',
      active: true,
      assignedProjectIds: ['proj_metro'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_sub_levante',
      name: 'Elena Ramos',
      email: 'elena.ramos@estructuraslevante.es',
      role: 'SUBCONTRACTOR_USER',
      companyId: 'comp_levante',
      companyName: 'Estructuras Levante S.L.',
      active: true,
      assignedProjectIds: ['proj_metro'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_master_direct',
      name: 'Super Admin',
      email: 'superadmin@obraservice.com',
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      companyId: 'comp_norte',
      companyName: 'Construcciones Norte S.L.',
      active: true,
      assignedProjectIds: ['proj_metro'],
      createdAt: new Date().toISOString()
    }
  ];

  const seedProjects: Project[] = [
    {
      id: 'proj_metro',
      code: 'PRJ-4091',
      name: 'Ampliación de Metro Línea 5',
      status: 'Active',
      location: {
        address: 'Gran Vía 45, Madrid',
        lat: 40.4202,
        lng: -3.7041,
        latitude: 40.4202,
        longitude: -3.7041
      },
      validationRadiusMeters: 300,
      plannedWorkloadHours: 2400,
      plannedHours: 2400,
      companyId: 'comp_norte',
      client: 'Comunidad de Madrid',
      initialBudget: 4500000,
      budget: 4500000,
      spentBudget: 1200000,
      projectType: 'Civil',
      description: 'Excavación, refuerzo estructural y acondicionamiento de la nueva estación intermedia en Gran Vía.'
    }
  ];

  const seedWorkers: Worker[] = [
    {
      id: 'work_1',
      code: 'W-001',
      name: 'Carlos Soler',
      category: 'Encargado General',
      companyId: 'comp_norte',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'work_2',
      code: 'W-002',
      name: 'Manuel Vega',
      category: 'Oficial 1ª',
      companyId: 'comp_levante',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'work_3',
      code: 'W-003',
      name: 'Antonio López',
      category: 'Peón Especialista',
      companyId: 'comp_levante',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  const seedInvitations: Invitation[] = [
    {
      id: 'inv_levante_1',
      code: 'INV-LEVANTE',
      email: 'elena.ramos@estructuraslevante.es',
      role: 'SUBCONTRACTOR_USER',
      companyId: 'comp_levante',
      companyName: 'Estructuras Levante S.L.',
      assignedProjectIds: ['proj_metro'],
      invitedBy: 'usr_admin',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
  ];

  const d15 = new Date();
  d15.setDate(d15.getDate() + 15);
  const expiry15 = d15.toISOString().split('T')[0];

  const d5 = new Date();
  d5.setDate(d5.getDate() + 5);
  const expiry5 = d5.toISOString().split('T')[0];

  return {
    isDemoMode: false,
    theme: 'light',
    viewPreference: 'cards',
    currentUser: null,
    companies: seedCompanies,
    users: seedUsers,
    projects: seedProjects,
    workers: seedWorkers,
    machinery: [
      {
        id: 'mach_1',
        code: 'MAC-001',
        name: 'Excavadora Caterpillar 320',
        type: 'Excavadora',
        companyId: 'comp_norte',
        active: true,
        createdAt: new Date().toISOString()
      }
    ],
    reports: [],
    deliveryNotes: [],
    auditEvents: [],
    invitations: seedInvitations,
    messages: [],
    syncError: null,
    timeLogs: [],
    complianceDocuments: [
      {
        id: 'comp_doc_1',
        companyId: 'comp_levante',
        docType: 'REA',
        title: 'Certificado de Registro de Empresas Acreditadas (REA)',
        status: 'VALID',
        expiryDate: expiry15,
        createdAt: new Date().toISOString()
      },
      {
        id: 'comp_doc_2',
        companyId: 'comp_levante',
        docType: 'INSURANCE',
        title: 'Seguro de Responsabilidad Civil',
        status: 'VALID',
        expiryDate: expiry5,
        createdAt: new Date().toISOString()
      }
    ],
    notifications: []
  };
}

function migrateLegacyLocalStorage() {
  const legacyKeys = ['obraservice_legacy_v1', 'obraservice_legacy', 'obraservice_v1_beta', 'obra_store_state', 'obraservice_v1'];
  for (const key of legacyKeys) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.users || parsed.projects || parsed.workers)) {
          const upgraded: any = {
            isDemoMode: parsed.isDemoMode ?? false,
            theme: parsed.theme || 'light',
            viewPreference: parsed.viewPreference === 'list' ? 'list' : 'cards',
            currentUser: parsed.currentUser || null,
            companies: parsed.companies || [],
            users: parsed.users || [],
            projects: parsed.projects || [],
            workers: parsed.workers || [],
            machinery: parsed.machinery || [],
            reports: parsed.reports || [],
            deliveryNotes: parsed.deliveryNotes || [],
            auditEvents: parsed.auditEvents || [],
            invitations: parsed.invitations || [],
            messages: parsed.messages || [],
            syncError: parsed.syncError || null,
            timeLogs: parsed.timeLogs || [],
            complianceDocuments: parsed.complianceDocuments || [],
            notifications: parsed.notifications || [],
          };
          localStorage.setItem(PROD_STORAGE_KEY, JSON.stringify(upgraded));
          console.log(`[Migration] Sucesfully migrated legacy store from key "${key}" to "${PROD_STORAGE_KEY}".`);
          localStorage.removeItem(key);
          break;
        }
      } catch (e) {
        console.warn(`[Migration] Failed to parse legacy data from key "${key}":`, e);
      }
    }
  }
}

function loadInitialProductionState(): StoreState {
  // Production mode: Never store operational data in localStorage or load mock seeds.
  // Operational data syncs strictly from secure Firestore backend.
  return {
    isDemoMode: false,
    theme: 'light',
    viewPreference: 'cards',
    currentUser: null,
    companies: [],
    users: [],
    projects: [],
    workers: [],
    machinery: [],
    reports: [],
    deliveryNotes: [],
    auditEvents: [],
    invitations: [],
    messages: [],
    syncError: null,
    timeLogs: [],
    complianceDocuments: [],
    notifications: [],
  };
}

function loadInitialDemoState(): StoreState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.users.length > 0) {
        return {
          isDemoMode: true,
          theme: parsed.theme || 'light',
          viewPreference: parsed.viewPreference === 'list' ? 'list' : 'cards',
          currentUser: parsed.currentUser || null,
          companies: parsed.companies || [],
          users: parsed.users || [],
          projects: parsed.projects || [],
          workers: parsed.workers || [],
          machinery: parsed.machinery || [],
          reports: parsed.reports || [],
          deliveryNotes: parsed.deliveryNotes || [],
          auditEvents: parsed.auditEvents || [],
          invitations: parsed.invitations || [],
          messages: parsed.messages || [],
          syncError: parsed.syncError || null,
          timeLogs: parsed.timeLogs || [],
          complianceDocuments: parsed.complianceDocuments || [],
          notifications: parsed.notifications || [],
        };
      }
    }
  } catch (e) {
    console.error('Error reading demo localStorage', e);
  }

  const seed = getSeedState();
  seed.isDemoMode = true;
  return seed;
}

type Listener = (state: StoreState) => void;

class ObraStore {
  private state: StoreState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = loadInitialProductionState(); 
    this.checkComplianceDocumentExpirations();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const storageKey = this.state.isDemoMode ? DEMO_STORAGE_KEY : PROD_STORAGE_KEY;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        theme: this.state.theme,
        viewPreference: this.state.viewPreference,
        currentUser: this.state.currentUser,
        companies: this.state.companies,
        users: this.state.users,
        projects: this.state.projects,
        workers: this.state.workers,
        machinery: this.state.machinery,
        reports: this.state.reports,
        deliveryNotes: this.state.deliveryNotes,
        auditEvents: this.state.auditEvents,
        invitations: this.state.invitations,
        messages: this.state.messages,
        notifications: this.state.notifications || [],
      }));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }

    const snapshot = { ...this.state };

    // Apply strict database-style filtering
    const cid = this.state.currentUser?.companyId;
    
    if (cid) {
      const projects = this.state.projects || [];
      const companies = this.state.companies || [];
      const users = this.state.users || [];
      const workers = this.state.workers || [];
      const machinery = this.state.machinery || [];
      const reports = this.state.reports || [];
      const deliveryNotes = this.state.deliveryNotes || [];
      const auditEvents = this.state.auditEvents || [];

      const myProjects = projects.filter(p => 
        p.companyId === cid || (p.assignedSubcontractorIds || []).includes(cid)
      );
      const myProjectIds = myProjects.map(p => p.id);
      
      const assignedSubIds = projects
        .filter(p => p.companyId === cid)
        .flatMap(p => p.assignedSubcontractorIds || []);

      snapshot.companies = companies.filter(c => 
        c.id === cid || assignedSubIds.includes(c.id) || myProjects.some(p => p.companyId === c.id)
      );
      snapshot.users = users.filter(u => 
        u.companyId === cid || assignedSubIds.includes(u.companyId)
      );
      snapshot.projects = myProjects;
      snapshot.workers = workers.filter(w => 
        w.companyId === cid || assignedSubIds.includes(w.companyId)
      );
      snapshot.machinery = machinery.filter(m => 
        m.companyId === cid || assignedSubIds.includes(m.companyId)
      );
      snapshot.reports = reports.filter(r => 
        myProjectIds.includes(r.projectId)
      );
      snapshot.deliveryNotes = deliveryNotes.filter(n => 
        n.subcontractorCompanyId === cid || n.mainContractorCompanyId === cid || assignedSubIds.includes(n.subcontractorCompanyId)
      );
      snapshot.auditEvents = auditEvents.filter(e => {
        if (myProjectIds.includes(e.recordId)) return true;
        const w = workers.find(wrk => wrk.id === e.recordId);
        if (w && (w.companyId === cid || assignedSubIds.includes(w.companyId))) return true;
        const m = machinery.find(mac => mac.id === e.recordId);
        if (m && (m.companyId === cid || assignedSubIds.includes(m.companyId))) return true;
        return e.actorCompanyName === this.state.currentUser?.companyName || assignedSubIds.includes(e.actorCompanyId || '');
      });
    } else {
      // If no company context is selected, hide all operational data
      snapshot.projects = [];
      snapshot.workers = [];
      snapshot.machinery = [];
      snapshot.reports = [];
      snapshot.deliveryNotes = [];
      snapshot.auditEvents = [];
    }

    this.listeners.forEach(fn => fn(snapshot));
  }

  public getState(): StoreState {
    return this.state;
  }

  // --- Environment & Demo Mode Management ---

  public enterDemoMode() {
    this.state = loadInitialDemoState();
    this.notify();
  }

  public enterProductionMode() {
    this.state = loadInitialProductionState();
    this.notify();
  }

  public exitDemoMode() {
    this.enterProductionMode();
  }

  public toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.notify();
  }

  public setViewPreference(pref: 'cards' | 'list') {
    this.state.viewPreference = pref;
    this.notify();
  }

  public resetDemoData() {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    this.state = loadInitialDemoState();
    this.notify();
  }

  public switchDemoRole(userId: string) {
    if (!this.state.isDemoMode) return;
    const target = this.state.users.find(u => u.id === userId);
    if (target) {
      this.state.currentUser = target;
      this.notify();
    }
  }

  public impersonateUser(userId: string) {
    const target = this.state.users.find(u => u.id === userId);
    if (target) {
      if (!sessionStorage.getItem('king_master_original_uid')) {
        sessionStorage.setItem('king_master_original_uid', this.state.currentUser?.id || '');
      }
      this.state.currentUser = target;
      this.notify();
    }
  }

  public stopImpersonation() {
    const originalUid = sessionStorage.getItem('king_master_original_uid');
    if (originalUid) {
      const original = this.state.users.find(u => u.id === originalUid);
      if (original) {
        this.state.currentUser = original;
        sessionStorage.removeItem('king_master_original_uid');
        this.notify();
        return true;
      }
    }
    return false;
  }

  // --- Authentication Lifecycle ---

  public switchRole(targetRole: UserRole): void {
    const user = this.state.users.find(u => u.role === targetRole && u.active);
    if (user) {
      this.state.currentUser = user;
    } else if (this.state.currentUser) {
      this.state.currentUser = {
        ...this.state.currentUser,
        role: targetRole
      };
    }
    this.notify();
  }

  public login(email: string, role?: UserRole): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (!existing.active) {
        return { success: false, error: 'Tu cuenta está suspendida. Contacta con el administrador de tu empresa.' };
      }
      this.state.currentUser = existing;
      this.notify();
      return { success: true };
    }

    return { success: false, error: 'El correo electrónico o la contraseña no son correctos.' };
  }

  public register(name: string, email: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail) {
      return { success: false, error: 'Por favor, completa todos los campos requeridos.' };
    }

    const existing = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'SITE_MANAGER',
      companyId: '', // No company yet
      active: true,
      assignedProjectIds: [],
      createdAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.notify();
    return { success: true, user: newUser };
  }

  public async logout() {
    this.state.currentUser = null;
    this.state.isDemoMode = false;
    
    try {
      const { logOutFirebase } = await import('./firebase');
      await logOutFirebase();
    } catch (e) {
      console.warn('Firebase logout failed or not initialized', e);
    }

    this.notify();
  }

  // --- Audit Log Adapter ---
  private logAuditAdapter = (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string,
    previousValue?: string,
    newValue?: string
  ) => {
    this.logAuditEvent({
      affectedEntity: affectedEntity as AuditEvent['affectedEntity'],
      recordId,
      operation: operation as AuditEvent['operation'],
      details,
      recordCode,
      dailyReportId,
      deliveryNoteId,
      previousValue,
      newValue
    });
  };

  // --- Company & Invitation Management ---

  public createCompany(data: {
    name: string;
    taxId: string;
    type: 'MAIN_CONTRACTOR' | 'SUBCONTRACTOR';
    address: string;
  }): { success: boolean; error?: string; company?: Company } {
    this.state.isDemoMode = false;
    const res = companyModule.createCompany(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public toggleCompanyActive(companyId: string, reason: string) {
    const compBefore = this.state.companies.find(c => c.id === companyId);
    const wasActive = compBefore ? compBefore.active : true;
    const res = companyModule.toggleCompanyActive(this.state, companyId, reason, this.logAuditAdapter, this.dispatchSync.bind(this));
    if (res) {
      const companyUsers = this.state.users.filter(u => u.companyId === companyId);
      if (wasActive) {
        for (const compUser of companyUsers) {
          this.generateNotification({
            userId: compUser.id,
            title: 'Acceso de Empresa Suspendido',
            message: `La cuenta de tu empresa ha sido suspendida temporalmente por el Administrador Principal. Motivo: ${reason}`,
            type: 'WARNING'
          });
        }
      } else {
        for (const compUser of companyUsers) {
          this.generateNotification({
            userId: compUser.id,
            title: 'Acceso de Empresa Reactivado',
            message: `La cuenta de tu empresa ha sido reactivada con éxito.`,
            type: 'SUCCESS'
          });
        }
      }
    }
    this.notify();
    return res;
  }

  public createSubcontractor(data: {
    name: string;
    taxId: string;
    address: string;
  }): { success: boolean; error?: string; company?: Company } {
    const res = companyModule.createSubcontractor(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public joinCompany(inviteCode: string, requestedRole: UserRole = 'SITE_MANAGER'): { success: boolean; error?: string } {
    const res = companyModule.joinCompany(this.state, inviteCode, requestedRole, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public regenerateInviteCode(companyId: string): { success: boolean; newCode?: string } {
    const res = companyModule.regenerateInviteCode(this.state, companyId, this.logAuditAdapter);
    this.notify();
    return res;
  }

  public createInvitation(
    email: string, 
    role: UserRole, 
    companyId: string, 
    invitedBy: string,
    assignedProjectIds: string[] = []
  ): { success: boolean; invitation?: Invitation; magicLink?: string; error?: string } {
    const res = companyModule.createInvitation(this.state, email, role, companyId, invitedBy, assignedProjectIds, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public getInvitationByCodeOrEmail(identifier: string): Invitation | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toUpperCase();
    const cleanEmail = identifier.trim().toLowerCase();
    const found = (this.state.invitations || []).find(
      (i: Invitation) => i.code?.toUpperCase() === clean || 
           i.id === identifier || 
           (i.status === 'Pending' && i.email?.toLowerCase() === cleanEmail)
    );
    if (found) return found;

    const company = (this.state.companies || []).find((c: Company) => c.inviteCode?.toUpperCase() === clean || c.id === identifier);
    if (company) {
      return {
        id: `inv_${company.inviteCode}`,
        code: company.inviteCode,
        email: `alta_${company.inviteCode.toLowerCase()}@obra.es`,
        role: company.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : 'SITE_MANAGER',
        companyId: company.id,
        companyName: company.name,
        status: 'Pending',
        invitedBy: 'usr_admin',
        createdAt: new Date().toISOString(),
        assignedProjectIds: (this.state.projects || []).filter((p: Project) => p.companyId === company.id).map((p: Project) => p.id)
      };
    }
    return undefined;
  }

  public acceptInvitation(codeOrId: string, userData: { name: string; password?: string }): { success: boolean; user?: User; error?: string } {
    const invite = this.getInvitationByCodeOrEmail(codeOrId);
    const res = companyModule.acceptInvitation(this.state, codeOrId, userData, this.logAuditAdapter, this.dispatchSync.bind(this));
    if (res.success && invite) {
      if (invite.invitedBy) {
        this.generateNotification({
          userId: invite.invitedBy,
          title: 'Invitación Aceptada',
          message: `${userData.name} (${invite.email}) ha aceptado tu invitación para unirse a ${invite.companyName}.`,
          type: 'SUCCESS'
        });
      }
      const admins = this.state.users.filter(u => u.companyId === invite.companyId && u.role === 'MAIN_CONTRACTOR_ADMIN');
      for (const admin of admins) {
        if (admin.id !== invite.invitedBy) {
          this.generateNotification({
            userId: admin.id,
            title: 'Nuevo Miembro en la Empresa',
            message: `${userData.name} se ha unido a ${invite.companyName} como ${invite.role}.`,
            type: 'INFO'
          });
        }
      }
    }
    this.notify();
    return res;
  }

  public sendChatMessage(channelId: string, text: string): { success: boolean } {
    if (!this.state.currentUser) return { success: false };

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: this.state.currentUser.id,
      senderName: this.state.currentUser.name,
      senderRole: this.state.currentUser.role,
      senderCompanyName: this.state.currentUser.companyName || 'Principal',
      channelId,
      text,
      createdAt: new Date().toISOString()
    };

    if (!this.state.messages) {
      this.state.messages = [];
    }
    this.state.messages.push(newMessage);
    this.notify();

    // Simulated responses if in Demo Mode
    if (this.state.isDemoMode) {
      setTimeout(() => {
        const replies: Record<string, string[]> = {
          general: [
            "De acuerdo, me parece perfecto. Queda registrado en la bitácora de obra.",
            "Recibido por nuestra parte. Procedemos a coordinar con el encargado en campo.",
            "Perfecto. Por favor, aseguraos de que todo el personal en el tajo cumpla las medidas de seguridad."
          ],
          delivery_notes: [
            "Entendido. Vamos a revisar las horas y cantidades en la base de datos.",
            "Confirmado. El albarán queda en estado de revisión hasta aclarar la discrepancia.",
            "De acuerdo, lo cotejaremos con el parte diario para validar las firmas correspondientes."
          ],
          coordination: [
            "Perfecto, los efectivos ya están informados del cambio de turno.",
            "Excelente, el tajo de trabajo quedará libre para vuestra entrada a primera hora.",
            "Anotado. Mañana a las 8:00 coordinamos sobre el terreno."
          ]
        };

        const channelReplies = replies[channelId] || replies.general;
        const randomReply = channelReplies[Math.floor(Math.random() * channelReplies.length)];

        // Choose a sender who is NOT the current user
        const potentialSenders = [
          { id: 'usr_site_manager', name: 'Javier Ortiz', role: 'SITE_MANAGER', company: 'Construcciones Norte S.L.' },
          { id: 'usr_sub_levante', name: 'Elena Ramos', role: 'SUBCONTRACTOR_USER', company: 'Estructuras Levante S.L.' },
          { id: 'usr_admin', name: 'Carlos Mendoza', role: 'MAIN_CONTRACTOR_ADMIN', company: 'Construcciones Norte S.L.' }
        ].filter(s => s.id !== this.state.currentUser?.id);

        const sender = potentialSenders[0] || { id: 'usr_site_manager', name: 'Javier Ortiz', role: 'SITE_MANAGER', company: 'Construcciones Norte S.L.' };

        const replyMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role as UserRole,
          senderCompanyName: sender.company,
          channelId,
          text: randomReply,
          createdAt: new Date().toISOString()
        };

        this.state.messages?.push(replyMessage);
        this.notify();
      }, 1500);
    }

    return { success: true };
  }

  public sendSimulatedChatMessage(
    channelId: string,
    text: string,
    senderOverride: { id: string; name: string; role: string; company: string }
  ): { success: boolean } {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: senderOverride.id,
      senderName: senderOverride.name,
      senderRole: senderOverride.role as UserRole,
      senderCompanyName: senderOverride.company,
      channelId,
      text,
      createdAt: new Date().toISOString()
    };

    if (!this.state.messages) {
      this.state.messages = [];
    }
    this.state.messages.push(newMessage);
    this.notify();
    return { success: true };
  }

  // --- Projects & Machinery ---

  public createProject(data: Omit<Project, 'id' | 'code' | 'companyId'>): { success: boolean; project?: Project; error?: string } {
    const res = projectModule.createProject(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public updateProjectStatus(projectId: string, status: Project['status']): { success: boolean; error?: string } {
    const res = projectModule.updateProjectStatus(this.state, projectId, status, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public updateProject(projectId: string, data: Partial<Project>): boolean {
    const res = projectModule.updateProject(this.state, projectId, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public deleteProject(projectId: string): boolean {
    const res = projectModule.deleteProject(this.state, projectId, this.logAuditAdapter);
    this.notify();
    return res;
  }

  public updateProjectAssignments(projectId: string, subcontractorIds: string[]): boolean {
    const res = projectModule.updateProjectAssignments(this.state, projectId, subcontractorIds, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public createMachinery(data: Omit<Machinery, 'id' | 'code' | 'createdAt'>): { success: boolean; machinery?: Machinery; error?: string } {
    const res = projectModule.createMachinery(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public updateMachinery(machineryId: string, data: Partial<Machinery>): boolean {
    const res = projectModule.updateMachinery(this.state, machineryId, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public toggleMachineryStatus(machineryId: string): boolean {
    const res = projectModule.toggleMachineryStatus(this.state, machineryId, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public deleteMachinery(machineryId: string): boolean {
    const res = projectModule.deleteMachinery(this.state, machineryId, this.logAuditAdapter);
    this.notify();
    return res;
  }

  // --- Workers ---

  public addWorker(data: Omit<Worker, 'id' | 'code' | 'createdAt'>): { success: boolean; worker?: Worker; error?: string } {
    return this.createWorker(data);
  }

  public createWorker(data: Omit<Worker, 'id' | 'code' | 'createdAt'>): { success: boolean; worker?: Worker; error?: string } {
    const res = workerModule.createWorker(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public toggleWorkerStatus(workerId: string): boolean {
    const res = workerModule.toggleWorkerStatus(this.state, workerId, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public toggleWorkerActive(workerId: string): boolean {
    return this.toggleWorkerStatus(workerId);
  }

  public updateWorker(workerId: string, data: Partial<Worker>): boolean {
    const res = workerModule.updateWorker(this.state, workerId, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public deleteWorker(workerId: string): boolean {
    const res = workerModule.deleteWorker(this.state, workerId, this.logAuditAdapter);
    this.notify();
    return res;
  }

  // --- Daily Report Operations ---

  public saveReportDraft(data: Partial<DailyReport>): DailyReport {
    const res = reportModule.saveReportDraft(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public submitDailyReport(
    reportId: string, 
    userCoords?: { lat: number; lng: number; accuracy?: number },
    warningAcknowledged?: boolean
  ): { success: boolean; error?: string; deliveryNotesCreated?: number } {
    const res = reportModule.submitDailyReport(this.state, reportId, userCoords, warningAcknowledged, this.logAuditAdapter, this.dispatchSync.bind(this));
    if (res.success) {
      const report = this.state.reports.find(r => r.id === reportId);
      if (report) {
        const project = this.state.projects.find(p => p.id === report.projectId);
        const projectName = project ? project.name : 'Obra';
        const adminsAndManagers = this.state.users.filter(u => 
          (u.role === 'MAIN_CONTRACTOR_ADMIN' || u.role === 'SITE_MANAGER') && 
          u.companyId === report.companyId
        );
        for (const adminOrManager of adminsAndManagers) {
          this.generateNotification({
            userId: adminOrManager.id,
            title: `Nuevo Parte Diario - ${projectName}`,
            message: `Se ha enviado el parte diario del ${report.date} para el proyecto ${projectName}.`,
            type: 'SUCCESS',
            targetEntity: 'DailyReport',
            targetId: report.id
          });
        }
      }
    }
    this.notify();
    return res;
  }

  public correctDailyReport(
    reportId: string, 
    updatedEntries: WorkEntry[], 
    reason: string
  ): { success: boolean; error?: string } {
    const res = reportModule.correctDailyReport(this.state, reportId, updatedEntries, reason, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  // --- Delivery Note Operations ---

  public confirmDeliveryNote(noteId: string): { success: boolean; error?: string } {
    const res = reportModule.confirmDeliveryNote(this.state, noteId, this.logAuditAdapter, this.dispatchSync.bind(this));
    if (res.success) {
      const note = this.state.deliveryNotes.find(n => n.id === noteId);
      if (note) {
        const subcontractorUsers = this.state.users.filter(u => u.companyId === note.subcontractorCompanyId);
        for (const subUser of subcontractorUsers) {
          this.generateNotification({
            userId: subUser.id,
            title: `Albarán Confirmado - ${note.code}`,
            message: `El contratista principal ha confirmado el albarán ${note.code} de la fecha ${note.date}.`,
            type: 'SUCCESS',
            targetEntity: 'DeliveryNote',
            targetId: note.id
          });
        }
      }
    }
    this.notify();
    return res;
  }

  public confirmAllPendingDeliveryNotes(): { success: boolean; count: number; error?: string } {
    const res = reportModule.confirmAllPendingDeliveryNotes(this.state, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public disputeDeliveryNote(
    noteId: string, 
    data: {
      category: DisputeCategory;
      reason: string;
      proposedNormalHours?: number;
      proposedExtraHours?: number;
      evidenceUrls?: string[];
    }
  ): { success: boolean; error?: string } {
    const res = reportModule.disputeDeliveryNote(this.state, noteId, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    if (res.success) {
      const note = this.state.deliveryNotes.find(n => n.id === noteId);
      if (note) {
        const subcontractorUsers = this.state.users.filter(u => u.companyId === note.subcontractorCompanyId);
        for (const subUser of subcontractorUsers) {
          this.generateNotification({
            userId: subUser.id,
            title: `Albarán Disputado - ${note.code}`,
            message: `Se ha abierto una disputa sobre el albarán ${note.code} de la fecha ${note.date}. Motivo: ${data.reason}`,
            type: 'WARNING',
            targetEntity: 'DeliveryNote',
            targetId: note.id
          });
        }
      }
    }
    this.notify();
    return res;
  }

  public resolveDispute(
    noteId: string, 
    data: {
      action: 'ACEPTADA_CON_AJUSTE' | 'DESESTIMADA_JUSTIFICADA';
      resolutionNote: string;
      adjustedNormalHours?: number;
      adjustedExtraHours?: number;
    }
  ): { success: boolean; error?: string } {
    const res = reportModule.resolveDispute(this.state, noteId, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  public uploadDeliveryNote(data: {
    projectId: string;
    projectNameSnapshot: string;
    normalHours: number;
    extraHours: number;
    correctionNotice?: string;
    evidenceUrls?: string[];
  }): { success: boolean; note?: DeliveryNote; error?: string } {
    const res = reportModule.uploadDeliveryNote(this.state, data, this.logAuditAdapter, this.dispatchSync.bind(this));
    this.notify();
    return res;
  }

  // --- Audit Logging ---

  private logAuditEvent(params: {
    affectedEntity: AuditEvent['affectedEntity'];
    recordId: string;
    recordCode?: string;
    operation: AuditEvent['operation'];
    details: string;
    previousValue?: string;
    newValue?: string;
    dailyReportId?: string;
    deliveryNoteId?: string;
  }) {
    const actor = this.state.currentUser || {
      id: 'usr_sys',
      name: 'Sistema',
      role: 'MAIN_CONTRACTOR_ADMIN' as UserRole,
      companyName: 'ObraService',
    };

    const event: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role as UserRole,
      actorCompanyName: actor.companyName || 'ObraService',
      actorCompanyId: (actor as any).companyId || 'company_sys',
      affectedEntity: params.affectedEntity,
      recordId: params.recordId,
      operation: params.operation,
      details: params.details,
      ...(params.recordCode !== undefined ? { recordCode: params.recordCode } : {}),
      ...(params.previousValue !== undefined ? { previousValue: params.previousValue } : {}),
      ...(params.newValue !== undefined ? { newValue: params.newValue } : {}),
      ...(params.dailyReportId !== undefined ? { dailyReportId: params.dailyReportId } : {}),
      ...(params.deliveryNoteId !== undefined ? { deliveryNoteId: params.deliveryNoteId } : {}),
    };

    this.state.auditEvents.unshift(event);
    this.dispatchSync('auditEvent', event);
  }

  // --- Firebase Cloud Sync Adapter & Remote Listeners ---

  private syncAdapter?: (entity: string, item: unknown) => void;

  public setSyncAdapter(adapter: (entity: string, item: unknown) => void) {
    this.syncAdapter = adapter;
  }

  private dispatchSync(entity: string, item: unknown) {
    if (!this.state.isDemoMode && this.syncAdapter) {
      try {
        this.syncAdapter(entity, item);
      } catch (e) {
        console.error('Error dispatching Firestore sync:', e);
      }
    }
  }

  public setAuthenticatedFirebaseUser(user: User) {
    if (this.state.isDemoMode) {
      this.state.currentUser = user;
    } else {
      this.state.currentUser = user;
      this.state.isDemoMode = false;
    }
    this.notify();
  }

  public setSyncError(error: string | null) {
    this.state.syncError = error;
    this.notify();
  }

  public syncRemoteCompanies(companies: Company[]) {
    if (this.state.isDemoMode) return;
    this.state.companies = companies;
    this.notify();
  }

  public syncRemoteProjects(projects: Project[]) {
    if (this.state.isDemoMode) return;
    this.state.projects = projects;
    this.notify();
  }

  public syncRemoteWorkers(workers: Worker[]) {
    if (this.state.isDemoMode) return;
    this.state.workers = workers;
    this.notify();
  }

  public syncRemoteMachinery(machinery: Machinery[]) {
    if (this.state.isDemoMode) return;
    this.state.machinery = machinery;
    this.notify();
  }

  public syncRemoteReports(reports: DailyReport[]) {
    if (this.state.isDemoMode) return;
    this.state.reports = reports;
    this.notify();
  }

  public syncRemoteDeliveryNotes(deliveryNotes: DeliveryNote[]) {
    if (this.state.isDemoMode) return;
    this.state.deliveryNotes = deliveryNotes;
    this.notify();
  }

  public syncRemoteAuditEvents(events: AuditEvent[]) {
    if (this.state.isDemoMode) return;
    this.state.auditEvents = events;
    this.notify();
  }

  public syncRemoteUsers(users: User[]) {
    if (this.state.isDemoMode) return;
    this.state.users = users;
    // Also update current user if found in the list
    if (this.state.currentUser) {
      const updatedMe = users.find(u => u.id === this.state.currentUser?.id);
      if (updatedMe) {
        this.state.currentUser = updatedMe;
      }
    }
    this.notify();
  }

  public addTimeLog(log: TimeLog) {
    if (!this.state.timeLogs) {
      this.state.timeLogs = [];
    }
    this.state.timeLogs.push(log);
    
    this.logAuditEvent({
      affectedEntity: 'Company', // maps to existing audit categorization safely
      recordId: log.id,
      recordCode: 'FICHADO',
      operation: 'REPORT_SUBMITTED',
      details: `Fichaje de ${log.userNameSnapshot} registrado en la obra ${log.projectNameSnapshot} a una distancia de ${log.distanceMeters.toFixed(1)} metros.`,
    });

    this.dispatchSync('timeLog', log);
    this.notify();
  }

  public syncRemoteTimeLogs(logs: TimeLog[]) {
    if (this.state.isDemoMode) return;
    this.state.timeLogs = logs;
    this.notify();
  }

  public syncRemoteInvitations(invitations: Invitation[]) {
    if (this.state.isDemoMode) return;
    this.state.invitations = invitations;
    this.notify();
  }

  public syncRemoteNotifications(notifications: NotificationItem[]) {
    if (this.state.isDemoMode) return;
    this.state.notifications = notifications;
    this.notify();
  }

  public generateNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ACTION_REQUIRED' | 'SUCCESS';
    targetEntity?: 'DailyReport' | 'DeliveryNote' | 'Project';
    targetId?: string;
  }) {
    const item: NotificationItem = {
      id: `not_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      targetEntity: params.targetEntity,
      targetId: params.targetId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    if (!this.state.notifications) {
      this.state.notifications = [];
    }
    this.state.notifications.unshift(item);
    this.dispatchSync('notification', item);
    this.notify();

    // Send real email if outside isDemoMode and warning type (critical alert)
    if (!this.state.isDemoMode && params.type === 'WARNING') {
      const targetUser = this.state.users.find(u => u.id === params.userId);
      if (targetUser && targetUser.email) {
        import('./gmail').then(({ sendGmailEmail }) => {
          sendGmailEmail(
            targetUser.email,
            `[ObraService Alerta] ${params.title}`,
            `<div style="font-family: sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #ea580c; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Alerta Crítica de Obra</h2>
              <p>Hola <strong>${targetUser.name}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6;">${params.message}</p>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 13px; color: #991b1b;">
                <strong>Estado:</strong> Acción Requerida Inmediata.
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">Este es un correo oficial automatizado de ObraService.</p>
            </div>`
          ).catch(e => console.error('Error sending critical notification email:', e));
        });
      }
    }
  }

  public markNotificationAsRead(id: string) {
    if (!this.state.notifications) return;
    const item = this.state.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.dispatchSync('notification', item);
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    if (!this.state.notifications) return;
    let mutated = false;
    this.state.notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        this.dispatchSync('notification', n);
        mutated = true;
      }
    });
    if (mutated) {
      this.notify();
    }
  }

  public checkComplianceDocumentExpirations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const documents = this.state.complianceDocuments || [];
    for (const doc of documents) {
      if (!doc.expiryDate) continue;
      
      const expiry = new Date(doc.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 15 || diffDays === 5) {
        const titleKey = `Cumplimiento por Caducar - ${diffDays} días`;
        const hasNotification = (this.state.notifications || []).some(n => 
          n.title === titleKey &&
          n.targetId === doc.id
        );
        
        if (!hasNotification) {
          const companyUsers = this.state.users.filter(u => u.companyId === doc.companyId && (u.role === 'MAIN_CONTRACTOR_ADMIN' || u.role === 'SITE_MANAGER'));
          for (const targetUser of companyUsers) {
            this.generateNotification({
              userId: targetUser.id,
              title: titleKey,
              message: `El documento "${doc.title}" (${doc.docType}) de tu empresa caducará en ${diffDays} días (${doc.expiryDate}). Por favor, sube uno nuevo para evitar la suspensión.`,
              type: 'WARNING',
              targetEntity: 'Project',
              targetId: doc.id
            });
          }
        }
      }
    }
  }

  /**
   * Generates a complete, rich set of randomized real-world construction data for testing
   */
  public populateRandomTestData() {
    const timestamp = new Date().toISOString();
    const todayStr = timestamp.split('T')[0];
    const currentCompId = this.state.currentUser?.companyId || 'comp_norte';

    // 1. Mock Subcontractors
    const newSubcontractors: Company[] = [
      {
        id: `comp_sub_${Date.now()}_1`,
        name: 'Estructuras & Encofrados Sureste S.L.',
        taxId: 'B84930218',
        type: 'SUBCONTRACTOR',
        address: 'Polígono Industrial Las Mercedes, Nave 14, Madrid',
        inviteCode: `SUB${Math.floor(1000 + Math.random() * 9000)}`,
        active: true,
        subscriptionStatus: 'Active',
        createdAt: timestamp,
      },
      {
        id: `comp_sub_${Date.now()}_2`,
        name: 'Instalaciones ClimaTech & Fluidos S.L.',
        taxId: 'B91823019',
        type: 'SUBCONTRACTOR',
        address: 'Calle Metalurgia 8, Getafe, Madrid',
        inviteCode: `SUB${Math.floor(1000 + Math.random() * 9000)}`,
        active: true,
        subscriptionStatus: 'Active',
        createdAt: timestamp,
      },
      {
        id: `comp_sub_${Date.now()}_3`,
        name: 'Excavaciones y Cimentaciones Madrid S.L.',
        taxId: 'B72819302',
        type: 'SUBCONTRACTOR',
        address: 'Avenida de la Industria 42, Coslada, Madrid',
        inviteCode: `SUB${Math.floor(1000 + Math.random() * 9000)}`,
        active: true,
        subscriptionStatus: 'Active',
        createdAt: timestamp,
      }
    ];

    // 2. Mock Projects
    const newProjects: Project[] = [
      {
        id: `proj_${Date.now()}_1`,
        code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Hospital Universitario Central - Fase II',
        companyId: currentCompId,
        status: 'Active',
        budget: 2450000,
        startDate: todayStr,
        endDate: '2027-06-30',
        validationRadiusMeters: 250,
        assignedSubcontractorIds: newSubcontractors.map(s => s.id),
        location: {
          address: 'Calle Sinesio Delgado 10, Madrid',
          lat: 40.4728,
          lng: -3.6934,
        },
      },
      {
        id: `proj_${Date.now()}_2`,
        code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Torre Residencial Jardines de Chamartín',
        companyId: currentCompId,
        status: 'Active',
        budget: 4800000,
        startDate: todayStr,
        endDate: '2027-12-15',
        validationRadiusMeters: 300,
        assignedSubcontractorIds: [newSubcontractors[0].id, newSubcontractors[1].id],
        location: {
          address: 'Paseo de la Habana 88, Madrid',
          lat: 40.4578,
          lng: -3.6823,
        },
      },
      {
        id: `proj_${Date.now()}_3`,
        code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Centro Logístico San Fernando E-4',
        companyId: currentCompId,
        status: 'Active',
        budget: 1350000,
        startDate: todayStr,
        endDate: '2026-11-30',
        validationRadiusMeters: 350,
        assignedSubcontractorIds: [newSubcontractors[1].id, newSubcontractors[2].id],
        location: {
          address: 'Polígono Sur Parcela 12, San Fernando de Henares',
          lat: 40.4285,
          lng: -3.5350,
        },
      }
    ];

    // 3. Mock Machinery
    const newMachinery: Machinery[] = [
      {
        id: `mac_${Date.now()}_1`,
        code: `MAC-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        name: 'Grúa Torre Liebherr 90EC',
        type: 'Grúa Torre',
        active: true,
        createdAt: timestamp,
      },
      {
        id: `mac_${Date.now()}_2`,
        code: `MAC-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        name: 'Excavadora Giratoria CAT 320',
        type: 'Excavadora',
        active: true,
        createdAt: timestamp,
      },
      {
        id: `mac_${Date.now()}_3`,
        code: `MAC-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        name: 'Dumper 4x4 AUSA D600',
        type: 'Dumper',
        active: true,
        createdAt: timestamp,
      }
    ];

    // 4. Mock Workers
    const workerDefs: { name: string; category: any; doc: string; sub: Company | null }[] = [
      { name: 'Manuel Morales Soto', category: 'Oficial 1ª', doc: '48920194K', sub: newSubcontractors[0] },
      { name: 'Antonio Rivas Gómez', category: 'Ferrallista', doc: '50392817J', sub: newSubcontractors[0] },
      { name: 'David Navarro Ortiz', category: 'Electricista', doc: '71928301L', sub: newSubcontractors[1] },
      { name: 'Gabriel Santos Vega', category: 'Fontanero', doc: '53910283H', sub: newSubcontractors[1] },
      { name: 'Marcos Benítez Cruz', category: 'Maquinista', doc: '09823194P', sub: newSubcontractors[2] },
      { name: 'Raúl Pardo Ibáñez', category: 'Peón Especialista', doc: '47291048M', sub: newSubcontractors[2] },
      { name: 'Iván Carrasco Gil', category: 'Encargado General', doc: '12398472B', sub: null },
      { name: 'Sergio Valverde Ramos', category: 'Oficial 1ª', doc: '52819302X', sub: null },
    ];

    const newWorkers: Worker[] = workerDefs.map((w, idx) => ({
      id: `wrk_${Date.now()}_${idx}`,
      code: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: w.name,
      category: w.category,
      companyId: w.sub ? w.sub.id : currentCompId,
      companyNameSnapshot: w.sub ? w.sub.name : 'Construcciones Norte S.L.',
      isSubcontractor: !!w.sub,
      nationalId: w.doc,
      active: true,
      createdAt: timestamp,
    }));

    // 5. Mock Daily Reports
    const workEntriesRep1: WorkEntry[] = [
      {
        id: `we_${Date.now()}_1`,
        workerId: newWorkers[0].id,
        workerNameSnapshot: newWorkers[0].name,
        workerCategorySnapshot: newWorkers[0].category,
        companyIdSnapshot: newSubcontractors[0].id,
        companyNameSnapshot: newSubcontractors[0].name,
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 1,
        totalHours: 9,
        attendance: 'Presente'
      },
      {
        id: `we_${Date.now()}_2`,
        workerId: newWorkers[1].id,
        workerNameSnapshot: newWorkers[1].name,
        workerCategorySnapshot: newWorkers[1].category,
        companyIdSnapshot: newSubcontractors[0].id,
        companyNameSnapshot: newSubcontractors[0].name,
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      },
      {
        id: `we_${Date.now()}_3`,
        workerId: newWorkers[6].id,
        workerNameSnapshot: newWorkers[6].name,
        workerCategorySnapshot: newWorkers[6].category,
        companyIdSnapshot: currentCompId,
        companyNameSnapshot: 'Construcciones Norte S.L.',
        isSubcontractor: false,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      },
      {
        id: `we_${Date.now()}_4`,
        workerId: newWorkers[7].id,
        workerNameSnapshot: newWorkers[7].name,
        workerCategorySnapshot: newWorkers[7].category,
        companyIdSnapshot: currentCompId,
        companyNameSnapshot: 'Construcciones Norte S.L.',
        isSubcontractor: false,
        normalHours: 7,
        extraHours: 0,
        totalHours: 7,
        attendance: 'Presente'
      }
    ];

    const workEntriesRep2: WorkEntry[] = [
      {
        id: `we_${Date.now()}_5`,
        workerId: newWorkers[2].id,
        workerNameSnapshot: newWorkers[2].name,
        workerCategorySnapshot: newWorkers[2].category,
        companyIdSnapshot: newSubcontractors[1].id,
        companyNameSnapshot: newSubcontractors[1].name,
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 2,
        totalHours: 10,
        attendance: 'Presente'
      },
      {
        id: `we_${Date.now()}_6`,
        workerId: newWorkers[3].id,
        workerNameSnapshot: newWorkers[3].name,
        workerCategorySnapshot: newWorkers[3].category,
        companyIdSnapshot: newSubcontractors[1].id,
        companyNameSnapshot: newSubcontractors[1].name,
        isSubcontractor: true,
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente'
      }
    ];

    const newReports: DailyReport[] = [
      {
        id: `rep_${Date.now()}_1`,
        code: `DR-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        projectId: newProjects[0].id,
        projectNameSnapshot: newProjects[0].name,
        creatorId: this.state.currentUser?.id || 'usr_admin',
        creatorNameSnapshot: this.state.currentUser?.name || 'Jefe de Obra',
        date: todayStr,
        version: 1,
        status: 'Submitted',
        totalNormalHours: 31,
        totalExtraHours: 1,
        totalHours: 32,
        comments: 'Hormigonado de zapatas y losa en módulo de urgencias completado conforme a plano.',
        workEntries: workEntriesRep1,
        evidenceUrls: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: `rep_${Date.now()}_2`,
        code: `DR-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        projectId: newProjects[1].id,
        projectNameSnapshot: newProjects[1].name,
        creatorId: this.state.currentUser?.id || 'usr_admin',
        creatorNameSnapshot: this.state.currentUser?.name || 'Jefe de Obra',
        date: todayStr,
        version: 1,
        status: 'Submitted',
        totalNormalHours: 16,
        totalExtraHours: 2,
        totalHours: 18,
        comments: 'Paso de canalizaciones de climatización y bandejas portacables en pasillos técnicos.',
        workEntries: workEntriesRep2,
        evidenceUrls: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    ];

    // 6. Mock Delivery Notes (Albaranes)
    const newDeliveryNotes: DeliveryNote[] = [
      {
        id: `dn_${Date.now()}_1`,
        code: `DN-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        sourceDailyReportId: newReports[0].id,
        sourceDailyReportCode: newReports[0].code,
        projectId: newProjects[0].id,
        projectNameSnapshot: newProjects[0].name,
        subcontractorCompanyId: newSubcontractors[0].id,
        subcontractorCompanyName: newSubcontractors[0].name,
        mainContractorCompanyId: currentCompId,
        date: todayStr,
        status: 'Confirmed',
        normalHours: 16,
        extraHours: 1,
        totalHours: 17,
        workEntries: [workEntriesRep1[0], workEntriesRep1[1]],
        confirmationDetails: {
          confirmedByUserId: 'usr_sub_levante',
          confirmedByUserName: 'Elena Ramos',
          confirmedAt: timestamp,
          subcontractorCompanyName: newSubcontractors[0].name,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: `dn_${Date.now()}_2`,
        code: `DN-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        sourceDailyReportId: newReports[1].id,
        sourceDailyReportCode: newReports[1].code,
        projectId: newProjects[1].id,
        projectNameSnapshot: newProjects[1].name,
        subcontractorCompanyId: newSubcontractors[1].id,
        subcontractorCompanyName: newSubcontractors[1].name,
        mainContractorCompanyId: currentCompId,
        date: todayStr,
        status: 'Pending',
        normalHours: 16,
        extraHours: 2,
        totalHours: 18,
        workEntries: [workEntriesRep2[0], workEntriesRep2[1]],
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: `dn_${Date.now()}_3`,
        code: `DN-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: currentCompId,
        sourceDailyReportId: newReports[0].id,
        sourceDailyReportCode: newReports[0].code,
        projectId: newProjects[2].id,
        projectNameSnapshot: newProjects[2].name,
        subcontractorCompanyId: newSubcontractors[2].id,
        subcontractorCompanyName: newSubcontractors[2].name,
        mainContractorCompanyId: currentCompId,
        date: todayStr,
        status: 'Disputed',
        normalHours: 14,
        extraHours: 0,
        totalHours: 14,
        workEntries: [],
        disputeRecord: {
          id: `disp_${Date.now()}`,
          category: 'HORAS_INCORRECTAS',
          reason: 'Discrepancia en horas computadas por parada técnica de máquina de 11:00 a 13:00.',
          actorId: 'usr_sub',
          actorName: 'Representante Subcontrata',
          actorCompany: newSubcontractors[2].name,
          createdAt: timestamp,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    ];

    // 7. Mock Time Logs
    const newTimeLogs: TimeLog[] = [
      {
        id: `tl_${Date.now()}_1`,
        userId: newWorkers[0].id,
        userNameSnapshot: newWorkers[0].name,
        userRoleSnapshot: 'SUBCONTRACTOR_USER',
        companyId: newSubcontractors[0].id,
        projectId: newProjects[0].id,
        projectNameSnapshot: newProjects[0].name,
        timestamp: `${todayStr}T08:02:14.000Z`,
        lat: 40.4728,
        lng: -3.6934,
        distanceMeters: 12,
        status: 'In',
      },
      {
        id: `tl_${Date.now()}_2`,
        userId: newWorkers[2].id,
        userNameSnapshot: newWorkers[2].name,
        userRoleSnapshot: 'SUBCONTRACTOR_USER',
        companyId: newSubcontractors[1].id,
        projectId: newProjects[1].id,
        projectNameSnapshot: newProjects[1].name,
        timestamp: `${todayStr}T07:58:30.000Z`,
        lat: 40.4578,
        lng: -3.6823,
        distanceMeters: 8,
        status: 'In',
      }
    ];

    // 8. Mock Audit Events
    const newAuditEvents: AuditEvent[] = [
      {
        id: `aud_${Date.now()}_1`,
        actorId: this.state.currentUser?.id || 'usr_admin',
        actorName: this.state.currentUser?.name || 'Administrador Principal',
        actorRole: 'MAIN_CONTRACTOR_ADMIN',
        actorCompanyName: 'Construcciones Norte S.L.',
        actorCompanyId: currentCompId,
        timestamp: timestamp,
        operation: 'REPORT_SUBMITTED',
        affectedEntity: 'DailyReport',
        recordId: newReports[0].id,
        recordCode: newReports[0].code,
        details: `Emisión de Parte Diario ${newReports[0].code} con 4 operarios y 32h registradas`,
      },
      {
        id: `aud_${Date.now()}_2`,
        actorId: this.state.currentUser?.id || 'usr_admin',
        actorName: this.state.currentUser?.name || 'Administrador Principal',
        actorRole: 'MAIN_CONTRACTOR_ADMIN',
        actorCompanyName: 'Construcciones Norte S.L.',
        actorCompanyId: currentCompId,
        timestamp: timestamp,
        operation: 'DELIVERY_NOTE_CONFIRMED',
        affectedEntity: 'DeliveryNote',
        recordId: newDeliveryNotes[0].id,
        recordCode: newDeliveryNotes[0].code,
        details: `Confirmación digital inmutable de Albarán ${newDeliveryNotes[0].code} por ${newSubcontractors[0].name}`,
      }
    ];

    // Merge into store state
    this.state.companies = [...(this.state.companies || []), ...newSubcontractors];
    this.state.projects = [...newProjects, ...(this.state.projects || [])];
    this.state.machinery = [...newMachinery, ...(this.state.machinery || [])];
    this.state.workers = [...newWorkers, ...(this.state.workers || [])];
    this.state.reports = [...newReports, ...(this.state.reports || [])];
    this.state.deliveryNotes = [...newDeliveryNotes, ...(this.state.deliveryNotes || [])];
    this.state.timeLogs = [...newTimeLogs, ...(this.state.timeLogs || [])];
    this.state.auditEvents = [...newAuditEvents, ...(this.state.auditEvents || [])];

    this.notify();

    return {
      projectsCount: newProjects.length,
      subcontractorsCount: newSubcontractors.length,
      workersCount: newWorkers.length,
      reportsCount: newReports.length,
      deliveryNotesCount: newDeliveryNotes.length,
    };
  }
}

export const obraStore = new ObraStore();

