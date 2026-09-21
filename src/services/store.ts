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
  ComplianceDocument
} from '../types';
import { 
  canUserConfirmDeliveryNote, 
  canUserDisputeDeliveryNote, 
  generateDailyReportCode, 
  generateDeliveryNotesFromReport, 
  generateMachineryCode,
  generateProjectCode, 
  generateWorkerCode, 
  validateProjectLocation, 
  validateSpanishTaxId, 
  validateWorkEntries 
} from '../domain/rules';
interface StoreState {
  isDemoMode: boolean;
  theme: 'light' | 'dark';
  viewPreference: 'grid' | 'list';
  currentUser: User | null;
  companies: Company[];
  users: User[];
  projects: Project[];
  workers: Worker[];
  machinery: Machinery[];
  reports: DailyReport[];
  deliveryNotes: DeliveryNote[];
  auditEvents: AuditEvent[];
  invitations: any[];
  messages: ChatMessage[];
  syncError: string | null;
  timeLogs: TimeLog[];
  complianceDocuments: ComplianceDocument[];
}

const PROD_STORAGE_KEY = 'obraservice_prod_v1';
const DEMO_STORAGE_KEY = 'obraservice_demo_v1';

function loadInitialProductionState(): StoreState {
  try {
    const raw = localStorage.getItem(PROD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isDemoMode: false,
        theme: parsed.theme || 'light',
        viewPreference: parsed.viewPreference || 'grid',
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
      };
    }
  } catch (e) {
    console.error('Error reading production localStorage', e);
  }

  return {
    isDemoMode: false,
    theme: 'light',
    viewPreference: 'grid',
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
  };
}

function loadInitialDemoState(): StoreState {
  return loadInitialProductionState();
}

type Listener = (state: StoreState) => void;

class ObraStore {
  private state: StoreState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = loadInitialProductionState(); 
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
        c.id === cid || c.type === 'MAIN_CONTRACTOR' || assignedSubIds.includes(c.id)
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

  public setViewPreference(pref: 'grid' | 'list') {
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

  // --- Authentication Lifecycle ---

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

  // --- Company & Invitation Management ---

  public createCompany(data: {
    name: string;
    taxId: string;
    type: 'MAIN_CONTRACTOR' | 'SUBCONTRACTOR';
    address: string;
  }): { success: boolean; error?: string; company?: Company } {
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado para esta operación.' };
    }

    const taxCheck = validateSpanishTaxId(data.taxId);
    if (!taxCheck.valid) {
      return { success: false, error: taxCheck.message };
    }

    const inviteCode = `OBRA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: data.name.trim(),
      taxId: data.taxId.trim().toUpperCase(),
      type: data.type,
      address: data.address.trim(),
      inviteCode,
      active: true,
      createdAt: new Date().toISOString(),
    };

    this.state.companies.push(newCompany);
    this.dispatchSync('company', newCompany);

    // Promote creator to correct Administrator role
    this.state.currentUser.companyId = newCompany.id;
    this.state.currentUser.companyName = newCompany.name;
    this.state.currentUser.role = data.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : 'MAIN_CONTRACTOR_ADMIN';

    this.logAuditEvent({
      affectedEntity: 'Company',
      recordId: newCompany.id,
      operation: 'COMPANY_CREATED',
      details: `Empresa "${newCompany.name}" (${newCompany.taxId}) constituida con código de invitación ${inviteCode}.`,
    });

    this.dispatchSync('user', this.state.currentUser);
    this.notify();
    return { success: true, company: newCompany };
  }

  public createSubcontractor(data: {
    name: string;
    taxId: string;
    address: string;
  }): { success: boolean; error?: string; company?: Company } {
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado para esta operación.' };
    }

    const taxCheck = validateSpanishTaxId(data.taxId);
    if (!taxCheck.valid) {
      return { success: false, error: taxCheck.message };
    }

    const inviteCode = `OBRA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: data.name.trim(),
      taxId: data.taxId.trim().toUpperCase(),
      type: 'SUBCONTRACTOR',
      address: data.address.trim(),
      inviteCode,
      active: true,
      createdAt: new Date().toISOString(),
    };

    this.state.companies.push(newCompany);
    this.dispatchSync('company', newCompany);

    this.logAuditEvent({
      affectedEntity: 'Company',
      recordId: newCompany.id,
      operation: 'COMPANY_CREATED',
      details: `Subcontratista "${newCompany.name}" (${newCompany.taxId}) de alta en sistema con código de invitación ${inviteCode}.`,
    });

    this.notify();
    return { success: true, company: newCompany };
  }

  public joinCompany(inviteCode: string, requestedRole: UserRole = 'SITE_MANAGER'): { success: boolean; error?: string } {
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado para esta operación.' };
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const targetCompany = this.state.companies.find(c => c.inviteCode.toUpperCase() === cleanCode);

    if (!targetCompany) {
      return { success: false, error: 'Código de invitación no encontrado o no válido.' };
    }

    if (!targetCompany.active) {
      return { success: false, error: 'La empresa a la que intentas unirte está inactiva.' };
    }

    this.state.currentUser.companyId = targetCompany.id;
    this.state.currentUser.companyName = targetCompany.name;
    // Role is assigned based on company type or manager workflow
    this.state.currentUser.role = targetCompany.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : requestedRole;

    this.logAuditEvent({
      affectedEntity: 'Membership',
      recordId: this.state.currentUser.id,
      operation: 'MEMBER_JOINED',
      details: `Usuario ${this.state.currentUser.name} se incorporó a "${targetCompany.name}" mediante código de invitación.`,
    });

    this.dispatchSync('user', this.state.currentUser);
    this.notify();
    return { success: true };
  }

  public regenerateInviteCode(companyId: string): { success: boolean; newCode?: string } {
    const comp = this.state.companies.find(c => c.id === companyId);
    if (!comp) return { success: false };

    const newCode = `OBRA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    comp.inviteCode = newCode;

    this.logAuditEvent({
      affectedEntity: 'Company',
      recordId: comp.id,
      operation: 'INVITE_CODE_REGENERATED',
      details: `Código de invitación regenerado a ${newCode} invalidando el anterior.`,
    });

    this.notify();
    return { success: true, newCode };
  }

  public createInvitation(
    email: string, 
    role: UserRole, 
    companyId: string, 
    invitedBy: string,
    assignedProjectIds: string[] = []
  ): { success: boolean; invitation?: Invitation; magicLink?: string; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Por favor, introduce un correo electrónico válido.' };
    }

    const company = this.state.companies.find(c => c.id === companyId);
    const companyName = company?.name || this.state.currentUser?.companyName || 'Empresa Constructora';

    const inviteCode = `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const invite: Invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: inviteCode,
      email: cleanEmail,
      role,
      companyId,
      companyName,
      assignedProjectIds,
      invitedBy,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (!this.state.invitations) {
      this.state.invitations = [];
    }

    this.state.invitations.unshift(invite);
    this.dispatchSync('invitation', invite);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://obraservice.app';
    const magicLink = `${origin}/?invite=${invite.code}`;

    this.logAuditEvent({
      affectedEntity: 'Company',
      recordId: invite.id,
      recordCode: invite.code,
      operation: 'MEMBER_JOINED',
      details: `Invitación enviada a ${cleanEmail} para el rol de ${role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'} con código ${invite.code} y acceso a ${assignedProjectIds.length} obra(s).`,
    });

    this.notify();
    return { success: true, invitation: invite, magicLink };
  }

  public getInvitationByCodeOrEmail(identifier: string): Invitation | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toUpperCase();
    const cleanEmail = identifier.trim().toLowerCase();
    return (this.state.invitations || []).find(
      i => i.code?.toUpperCase() === clean || 
           i.id === identifier || 
           (i.status === 'Pending' && i.email?.toLowerCase() === cleanEmail)
    );
  }

  public acceptInvitation(codeOrId: string, userData: { name: string; password?: string }): { success: boolean; user?: User; error?: string } {
    const inv = this.getInvitationByCodeOrEmail(codeOrId);
    if (!inv) {
      return { success: false, error: 'Código de invitación no encontrado o no válido.' };
    }
    if (inv.status === 'Accepted') {
      return { success: false, error: 'Esta invitación ya ha sido utilizada.' };
    }
    if (inv.status === 'Expired') {
      return { success: false, error: 'Esta invitación ha expirado.' };
    }

    const company = this.state.companies.find(c => c.id === inv.companyId);
    const companyName = company?.name || inv.companyName || 'Empresa Constructora';

    const cleanEmail = inv.email.toLowerCase();
    let existingUser = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    let finalUser: User;

    if (existingUser) {
      existingUser.name = userData.name.trim() || existingUser.name;
      existingUser.companyId = inv.companyId;
      existingUser.companyName = companyName;
      existingUser.role = inv.role;
      existingUser.active = true;
      existingUser.assignedProjectIds = Array.from(new Set([...(existingUser.assignedProjectIds || []), ...(inv.assignedProjectIds || [])]));
      finalUser = existingUser;
    } else {
      finalUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: userData.name.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: inv.role,
        companyId: inv.companyId,
        companyName: companyName,
        active: true,
        assignedProjectIds: inv.assignedProjectIds || [],
        createdAt: new Date().toISOString(),
      };
      this.state.users.push(finalUser);
    }

    if (inv.role === 'SUBCONTRACTOR_USER') {
      const existingWorker = (this.state.workers || []).find(w => w.name.toLowerCase() === finalUser.name.toLowerCase() && w.companyId === inv.companyId);
      if (!existingWorker) {
        const newWorker: Worker = {
          id: `wrk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          code: generateWorkerCode((this.state.workers || []).length + 1),
          name: finalUser.name,
          category: 'Oficial de 1ª',
          companyId: inv.companyId,
          nationalId: 'DNI-' + Math.floor(10000000 + Math.random() * 90000000) + 'X',
          active: true,
          createdAt: new Date().toISOString()
        };
        this.state.workers.push(newWorker);
        this.dispatchSync('worker', newWorker);
      }
    }

    inv.status = 'Accepted';
    inv.acceptedAt = new Date().toISOString();

    this.dispatchSync('invitation', inv);
    this.dispatchSync('user', finalUser);

    this.state.currentUser = finalUser;

    this.logAuditEvent({
      affectedEntity: 'Company',
      recordId: finalUser.id,
      recordCode: inv.code,
      operation: 'MEMBER_JOINED',
      details: `${finalUser.name} (${finalUser.email}) se ha unido a ${companyName} con rol ${inv.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'}.`,
    });

    this.notify();
    return { success: true, user: finalUser };
  }

  public sendChatMessage(channelId: string, text: string): { success: boolean } {
    if (!this.state.currentUser) return { success: false };

    const newMessage = {
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

        const replyMessage = {
          id: `msg_${Date.now() + 1}`,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role as any,
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
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: senderOverride.id,
      senderName: senderOverride.name,
      senderRole: senderOverride.role as any,
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

  // --- Projects & Workers ---

  public createProject(data: Omit<Project, 'id' | 'code' | 'companyId'>): { success: boolean; project?: Project; error?: string } {
    if (!this.state.currentUser || (this.state.currentUser.role !== 'MAIN_CONTRACTOR_ADMIN' && this.state.currentUser.role !== 'SITE_MANAGER')) {
      return { success: false, error: 'Solo el contratista principal o el jefe de obra pueden crear proyectos.' };
    }

    const code = generateProjectCode(this.state.projects.length);
    const newProject: Project = {
      ...data,
      id: `prj_${Date.now()}`,
      code,
      companyId: this.state.currentUser.companyId,
    };

    this.state.projects.push(newProject);
    this.dispatchSync('project', newProject);

    this.logAuditEvent({
      affectedEntity: 'Project',
      recordId: newProject.id,
      recordCode: code,
      operation: 'PROJECT_CREATED',
      details: `Proyecto "${newProject.name}" creado con radio de validación de ${newProject.validationRadiusMeters}m.`,
    });

    this.notify();
    return { success: true, project: newProject };
  }

  public updateProjectStatus(projectId: string, status: Project['status']): { success: boolean; error?: string } {
    const project = this.state.projects.find(p => p.id === projectId);
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    project.status = status;
    this.dispatchSync('project', project);
    this.notify();
    return { success: true };
  }

  public updateProject(projectId: string, data: Partial<Project>): boolean {
    const idx = this.state.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return false;
    this.state.projects[idx] = { ...this.state.projects[idx], ...data };
    this.dispatchSync('project', this.state.projects[idx]);
    this.logAuditEvent({
      affectedEntity: 'Project',
      recordId: projectId,
      operation: 'PROJECT_UPDATED',
      details: `Datos del proyecto "${this.state.projects[idx].name}" actualizados de forma autorizada.`,
    });
    this.notify();
    return true;
  }

  public deleteProject(projectId: string): boolean {
    const idx = this.state.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return false;
    const project = this.state.projects[idx];
    this.state.projects.splice(idx, 1);
    this.logAuditEvent({
      affectedEntity: 'Project',
      recordId: projectId,
      operation: 'PROJECT_DELETED',
      details: `Proyecto "${project.name}" eliminado del sistema de manera definitiva.`,
    });
    this.notify();
    return true;
  }

  public updateProjectAssignments(projectId: string, subcontractorIds: string[]): boolean {
    const project = this.state.projects.find(p => p.id === projectId);
    if (!project) return false;
    project.assignedSubcontractorIds = subcontractorIds;
    this.dispatchSync('project', project);
    this.logAuditEvent({
      affectedEntity: 'Project',
      recordId: projectId,
      operation: 'PROJECT_ASSIGNMENT_CHANGED',
      details: `Asignación de subcontratas actualizada para el proyecto "${project.name}".`,
    });
    this.notify();
    return true;
  }

  public createWorker(data: Omit<Worker, 'id' | 'code' | 'createdAt'>): { success: boolean; worker?: Worker; error?: string } {
    const code = generateWorkerCode(this.state.workers.length);
    const newWorker: Worker = {
      ...data,
      id: `wrk_${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
    };

    this.state.workers.push(newWorker);
    this.dispatchSync('worker', newWorker);

    this.logAuditEvent({
      affectedEntity: 'Worker',
      recordId: newWorker.id,
      recordCode: code,
      operation: 'WORKER_CREATED',
      details: `Trabajador "${newWorker.name}" (${newWorker.category}) registrado para la empresa.`,
    });

    this.notify();
    return { success: true, worker: newWorker };
  }

  public toggleWorkerStatus(workerId: string): boolean {
    const worker = this.state.workers.find(w => w.id === workerId);
    if (!worker) return false;

    worker.active = !worker.active;
    this.dispatchSync('worker', worker);

    this.logAuditEvent({
      affectedEntity: 'Worker',
      recordId: worker.id,
      recordCode: worker.code,
      operation: 'WORKER_STATUS_CHANGED',
      details: `Estado del trabajador cambiado a ${worker.active ? 'Activo' : 'Inactivo'}. Historial de partes preservado.`,
    });

    this.notify();
    return true;
  }

  public toggleWorkerActive(workerId: string): boolean {
    return this.toggleWorkerStatus(workerId);
  }

  public updateWorker(workerId: string, data: Partial<Worker>): boolean {
    const idx = this.state.workers.findIndex(w => w.id === workerId);
    if (idx === -1) return false;
    this.state.workers[idx] = { ...this.state.workers[idx], ...data };
    this.dispatchSync('worker', this.state.workers[idx]);
    this.logAuditEvent({
      affectedEntity: 'Worker',
      recordId: workerId,
      operation: 'WORKER_UPDATED',
      details: `Datos del trabajador "${this.state.workers[idx].name}" actualizados.`,
    });
    this.notify();
    return true;
  }

  public deleteWorker(workerId: string): boolean {
    const idx = this.state.workers.findIndex(w => w.id === workerId);
    if (idx === -1) return false;
    const worker = this.state.workers[idx];
    this.state.workers.splice(idx, 1);
    this.logAuditEvent({
      affectedEntity: 'Worker',
      recordId: workerId,
      operation: 'WORKER_DELETED',
      details: `Trabajador "${worker.name}" eliminado del sistema.`,
    });
    this.notify();
    return true;
  }

  public createMachinery(data: Omit<Machinery, 'id' | 'code' | 'createdAt'>): { success: boolean; machinery?: Machinery; error?: string } {
    const code = generateMachineryCode(this.state.machinery.length);
    const newMachinery: Machinery = {
      ...data,
      id: `mac_${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
    };
    this.state.machinery.push(newMachinery);
    this.dispatchSync('machinery', newMachinery);
    this.logAuditEvent({
      affectedEntity: 'Machinery',
      recordId: newMachinery.id,
      recordCode: code,
      operation: 'MACHINERY_CREATED',
      details: `Maquinaria "${newMachinery.name}" (${newMachinery.type}) registrada para la empresa.`,
    });
    this.notify();
    return { success: true, machinery: newMachinery };
  }

  public updateMachinery(machineryId: string, data: Partial<Machinery>): boolean {
    const idx = this.state.machinery.findIndex(m => m.id === machineryId);
    if (idx === -1) return false;
    this.state.machinery[idx] = { ...this.state.machinery[idx], ...data };
    this.dispatchSync('machinery', this.state.machinery[idx]);
    this.logAuditEvent({
      affectedEntity: 'Machinery',
      recordId: machineryId,
      operation: 'MACHINERY_UPDATED',
      details: `Datos de maquinaria "${this.state.machinery[idx].name}" actualizados.`,
    });
    this.notify();
    return true;
  }

  public toggleMachineryStatus(machineryId: string): boolean {
    const mac = this.state.machinery.find(m => m.id === machineryId);
    if (!mac) return false;
    mac.active = !mac.active;
    this.dispatchSync('machinery', mac);
    this.notify();
    return true;
  }

  public deleteMachinery(machineryId: string): boolean {
    const idx = this.state.machinery.findIndex(m => m.id === machineryId);
    if (idx === -1) return false;
    const mac = this.state.machinery[idx];
    this.state.machinery.splice(idx, 1);
    this.logAuditEvent({
      affectedEntity: 'Machinery',
      recordId: machineryId,
      operation: 'MACHINERY_DELETED',
      details: `Maquinaria "${mac.name}" eliminada del sistema.`,
    });
    this.notify();
    return true;
  }

  // --- Daily Report Operations ---

  public saveReportDraft(data: Partial<DailyReport>): DailyReport {
    const now = new Date().toISOString();
    let report: DailyReport;

    if (data.id) {
      const idx = this.state.reports.findIndex(r => r.id === data.id);
      if (idx !== -1) {
        this.state.reports[idx] = {
          ...this.state.reports[idx],
          ...data,
          updatedAt: now,
        } as DailyReport;
        report = this.state.reports[idx];
      } else {
        report = data as DailyReport;
        this.state.reports.push(report);
      }
    } else {
      const code = generateDailyReportCode(data.date || now.split('T')[0], this.state.reports.length);
      report = {
        id: `dr_${Date.now()}`,
        code,
        projectId: data.projectId || '',
        projectNameSnapshot: data.projectNameSnapshot || '',
        date: data.date || now.split('T')[0],
        creatorId: this.state.currentUser?.id || 'usr_unknown',
        creatorNameSnapshot: this.state.currentUser?.name || 'Jefe de Obra',
        status: 'Draft',
        workEntries: data.workEntries || [],
        totalNormalHours: data.totalNormalHours || 0,
        totalExtraHours: data.totalExtraHours || 0,
        totalHours: data.totalHours || 0,
        comments: data.comments || '',
        siteConditions: data.siteConditions || '',
        evidenceUrls: data.evidenceUrls || [],
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      this.state.reports.push(report);

      this.logAuditEvent({
        affectedEntity: 'DailyReport',
        recordId: report.id,
        recordCode: report.code,
        dailyReportId: report.id,
        operation: 'REPORT_CREATED',
        details: `Borrador de parte diario iniciado para la fecha ${report.date}.`,
      });
    }

    this.dispatchSync('dailyReport', report);
    this.notify();
    return report;
  }

  public submitDailyReport(
    reportId: string, 
    userCoords?: { lat: number; lng: number; accuracy?: number },
    warningAcknowledged?: boolean
  ): { success: boolean; error?: string; deliveryNotesCreated?: number } {
    const report = this.state.reports.find(r => r.id === reportId);
    if (!report) {
      return { success: false, error: 'No se encontró el parte diario solicitado.' };
    }

    if (report.status === 'Submitted') {
      return { success: true, error: 'Este parte ya ha sido enviado. Se ha recuperado el resultado existente.' };
    }

    // 1. Invariant validation
    const validation = validateWorkEntries(report.workEntries);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    // 2. Project location validation
    const project = this.state.projects.find(p => p.id === report.projectId);
    if (project) {
      const locSnapshot = validateProjectLocation(project, userCoords);
      if (locSnapshot.status === 'Warning' && !warningAcknowledged) {
        return { 
          success: false, 
          error: `Ubicación fuera del radio configurado (${locSnapshot.distanceFromProjectMeters}m). Debes confirmar el motivo para enviar el parte.` 
        };
      }
      locSnapshot.warningAcknowledged = warningAcknowledged;
      report.locationSnapshot = locSnapshot;
    }

    // 3. Update report status
    report.status = 'Submitted';
    report.submittedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();

    // 4. Generate Delivery Notes (idempotent, excludes internal workers, groups by subcontractor)
    const { createdNotes } = generateDeliveryNotesFromReport(
      report, 
      this.state.deliveryNotes, 
      this.state.companies
    );

    for (const note of createdNotes) {
      this.state.deliveryNotes.push(note);
      this.dispatchSync('deliveryNote', note);
      this.logAuditEvent({
        affectedEntity: 'DeliveryNote',
        recordId: note.id,
        recordCode: note.code,
        dailyReportId: report.id,
        deliveryNoteId: note.id,
        operation: 'DELIVERY_NOTE_GENERATED',
        details: `Albarán ${note.code} generado automáticamente para "${note.subcontractorCompanyName}" con ${note.totalHours} horas.`,
      });
    }

    this.logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: report.id,
      recordCode: report.code,
      dailyReportId: report.id,
      operation: 'REPORT_SUBMITTED',
      details: `Parte diario enviado con ${report.workEntries.length} trabajadores y ${report.totalHours}h totales.`,
    });

    this.dispatchSync('dailyReport', report);
    this.notify();
    return { success: true, deliveryNotesCreated: createdNotes.length };
  }

  public correctDailyReport(
    reportId: string, 
    updatedEntries: WorkEntry[], 
    reason: string
  ): { success: boolean; error?: string } {
    if (!this.state.currentUser || this.state.currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') {
      return { success: false, error: 'Solo el administrador puede realizar correcciones oficiales sobre partes enviados.' };
    }

    const cleanReason = reason.trim();
    if (!cleanReason) {
      return { success: false, error: 'Es obligatorio indicar el motivo de la corrección del parte.' };
    }

    const report = this.state.reports.find(r => r.id === reportId);
    if (!report) {
      return { success: false, error: 'Parte diario no encontrado.' };
    }

    const previousHours = report.totalHours;

    // Calculate new totals
    const totalNormal = updatedEntries.reduce((acc, e) => acc + e.normalHours, 0);
    const totalExtra = updatedEntries.reduce((acc, e) => acc + e.extraHours, 0);

    report.workEntries = updatedEntries;
    report.totalNormalHours = totalNormal;
    report.totalExtraHours = totalExtra;
    report.totalHours = totalNormal + totalExtra;
    report.status = 'Corrected';
    report.correctionReason = cleanReason;
    report.version += 1;
    report.updatedAt = new Date().toISOString();

    // Flag dependent delivery notes with a visible correction notice
    const affectedNotes = this.state.deliveryNotes.filter(dn => dn.sourceDailyReportId === report.id);
    for (const note of affectedNotes) {
      note.correctionNotice = `Parte corregido el ${new Date().toLocaleDateString('es-ES')}: ${cleanReason}`;
      note.updatedAt = new Date().toISOString();
    }

    this.logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: report.id,
      recordCode: report.code,
      dailyReportId: report.id,
      operation: 'REPORT_CORRECTED',
      previousValue: `${previousHours} horas`,
      newValue: `${report.totalHours} horas`,
      details: `Corrección oficial aplicada (v${report.version}). Motivo: ${cleanReason}.`,
    });

    this.dispatchSync('dailyReport', report);
    affectedNotes.forEach(n => this.dispatchSync('deliveryNote', n));
    this.notify();
    return { success: true };
  }

  // --- Delivery Note Operations ---

  public confirmDeliveryNote(noteId: string): { success: boolean; error?: string } {
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado para esta operación.' };
    }

    const note = this.state.deliveryNotes.find(n => n.id === noteId);
    if (!note) {
      return { success: false, error: 'Albarán no encontrado.' };
    }

    const check = canUserConfirmDeliveryNote(this.state.currentUser, note);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    note.status = 'Confirmed';
    note.confirmationDetails = {
      confirmedByUserId: this.state.currentUser.id,
      confirmedByUserName: this.state.currentUser.name,
      confirmedAt: new Date().toISOString(),
      subcontractorCompanyName: note.subcontractorCompanyName,
    };
    note.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      affectedEntity: 'DeliveryNote',
      recordId: note.id,
      recordCode: note.code,
      deliveryNoteId: note.id,
      dailyReportId: note.sourceDailyReportId,
      operation: 'DELIVERY_NOTE_CONFIRMED',
      details: `Albarán ${note.code} confirmado formalmente por ${this.state.currentUser.name} (${note.subcontractorCompanyName}).`,
    });

    this.dispatchSync('deliveryNote', note);
    this.notify();
    return { success: true };
  }

  public confirmAllPendingDeliveryNotes(): { success: boolean; count: number; error?: string } {
    if (!this.state.currentUser) {
      return { success: false, count: 0, error: 'Acceso no autorizado para esta operación.' };
    }

    const isSub = this.state.currentUser.role === 'SUBCONTRACTOR_USER';
    const pending = this.state.deliveryNotes.filter(n => {
      if (n.status !== 'Pending') return false;
      if (isSub) return n.subcontractorCompanyId === this.state.currentUser?.companyId;
      return true;
    });

    if (pending.length === 0) {
      return { success: false, count: 0, error: 'No hay albaranes pendientes de confirmación.' };
    }

    let count = 0;
    for (const note of pending) {
      note.status = 'Confirmed';
      note.confirmationDetails = {
        confirmedByUserId: this.state.currentUser.id,
        confirmedByUserName: this.state.currentUser.name,
        confirmedAt: new Date().toISOString(),
        subcontractorCompanyName: note.subcontractorCompanyName,
      };
      note.updatedAt = new Date().toISOString();

      this.logAuditEvent({
        affectedEntity: 'DeliveryNote',
        recordId: note.id,
        recordCode: note.code,
        deliveryNoteId: note.id,
        dailyReportId: note.sourceDailyReportId,
        operation: 'DELIVERY_NOTE_CONFIRMED',
        details: `Albarán ${note.code} confirmado en lote por ${this.state.currentUser.name} (${note.subcontractorCompanyName}).`,
      });
      this.dispatchSync('deliveryNote', note);
      count++;
    }

    this.notify();
    return { success: true, count };
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
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado para esta operación.' };
    }

    const note = this.state.deliveryNotes.find(n => n.id === noteId);
    if (!note) {
      return { success: false, error: 'Albarán no encontrado.' };
    }

    const check = canUserDisputeDeliveryNote(this.state.currentUser, note);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    if (!data.reason.trim()) {
      return { success: false, error: 'Es obligatorio indicar el motivo por escrito para abrir la disputa.' };
    }

    note.status = 'Disputed';
    note.disputeRecord = {
      id: `disp_${Date.now()}`,
      category: data.category,
      reason: data.reason.trim(),
      proposedNormalHours: data.proposedNormalHours,
      proposedExtraHours: data.proposedExtraHours,
      evidenceUrls: data.evidenceUrls || [],
      actorId: this.state.currentUser.id,
      actorName: this.state.currentUser.name,
      actorCompany: this.state.currentUser.companyName || note.subcontractorCompanyName,
      createdAt: new Date().toISOString(),
    };
    note.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      affectedEntity: 'DeliveryNote',
      recordId: note.id,
      recordCode: note.code,
      deliveryNoteId: note.id,
      dailyReportId: note.sourceDailyReportId,
      operation: 'DELIVERY_NOTE_DISPUTED',
      details: `Albarán ${note.code} disputado. Categoría: ${data.category}. Motivo: "${data.reason.trim()}".`,
    });

    this.dispatchSync('deliveryNote', note);
    this.notify();
    return { success: true };
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
    if (!this.state.currentUser || this.state.currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') {
      return { success: false, error: 'Solo el administrador de la empresa principal puede resolver disputas.' };
    }

    const note = this.state.deliveryNotes.find(n => n.id === noteId);
    if (!note || !note.disputeRecord) {
      return { success: false, error: 'No se encontró una disputa activa para este albarán.' };
    }

    if (!data.resolutionNote.trim()) {
      return { success: false, error: 'Es obligatorio incluir una nota o justificación de resolución.' };
    }

    note.disputeRecord.resolution = {
      action: data.action,
      resolvedByUserId: this.state.currentUser.id,
      resolvedByUserName: this.state.currentUser.name,
      resolutionNote: data.resolutionNote.trim(),
      resolvedAt: new Date().toISOString(),
    };

    if (data.action === 'ACEPTADA_CON_AJUSTE') {
      if (data.adjustedNormalHours !== undefined) note.normalHours = data.adjustedNormalHours;
      if (data.adjustedExtraHours !== undefined) note.extraHours = data.adjustedExtraHours;
      note.totalHours = note.normalHours + note.extraHours;
    }

    note.status = 'Confirmed';
    note.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      affectedEntity: 'DeliveryNote',
      recordId: note.id,
      recordCode: note.code,
      deliveryNoteId: note.id,
      dailyReportId: note.sourceDailyReportId,
      operation: 'DISPUTE_RESOLVED',
      details: `Disputa resuelta (${data.action}): ${data.resolutionNote.trim()}.`,
    });

    this.dispatchSync('deliveryNote', note);
    this.notify();
    return { success: true };
  }

  public uploadDeliveryNote(data: {
    projectId: string;
    projectNameSnapshot: string;
    normalHours: number;
    extraHours: number;
    correctionNotice?: string; // used for comments / code
    evidenceUrls?: string[];
  }): { success: boolean; note?: DeliveryNote; error?: string } {
    if (!this.state.currentUser) {
      return { success: false, error: 'Acceso no autorizado.' };
    }

    const now = new Date().toISOString();
    const code = `DN-${now.split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const note: DeliveryNote = {
      id: `dn_${Date.now()}`,
      code,
      sourceDailyReportId: 'dr_direct_upload',
      sourceDailyReportCode: 'CARGA_DIRECTA',
      dailyReportCodeSnapshot: 'CARGA_DIRECTA',
      projectId: data.projectId,
      projectNameSnapshot: data.projectNameSnapshot,
      date: now.split('T')[0],
      subcontractorCompanyId: this.state.currentUser.companyId || 'comp_sub_default',
      subcontractorCompanyName: this.state.currentUser.companyName || 'Empresa Subcontratada',
      workEntries: [],
      normalHours: data.normalHours,
      extraHours: data.extraHours,
      totalHours: data.normalHours + data.extraHours,
      status: 'Pending',
      correctionNotice: data.correctionNotice || '',
      createdAt: now,
      updatedAt: now,
    };

    this.state.deliveryNotes.push(note);
    this.logAuditEvent({
      affectedEntity: 'DeliveryNote',
      recordId: note.id,
      recordCode: note.code,
      deliveryNoteId: note.id,
      operation: 'REPORT_CREATED',
      details: `Albarán ${note.code} subido y registrado directamente desde dispositivo móvil.`,
    });

    this.dispatchSync('deliveryNote', note);
    this.notify();
    return { success: true, note };
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

  private syncAdapter?: (entity: string, item: any) => void;

  public setSyncAdapter(adapter: (entity: string, item: any) => void) {
    this.syncAdapter = adapter;
  }

  private dispatchSync(entity: string, item: any) {
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
      // If we are in demo mode, we stay in demo mode UNLESS the user explicitly exits.
      // But for Firebase sync, we need to know who the real user is.
      // We'll update the currentUser but stay in Demo Mode if that's where we are.
      // Actually, standard behavior should be: if you login with Firebase, you enter Production.
      // But we'll preserve the local state if it's production state.
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

  public addTimeLog(log: any) {
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

  public syncRemoteTimeLogs(logs: any[]) {
    if (this.state.isDemoMode) return;
    this.state.timeLogs = logs;
    this.notify();
  }

  public syncRemoteInvitations(invitations: any[]) {
    if (this.state.isDemoMode) return;
    this.state.invitations = invitations;
    this.notify();
  }
}

export const obraStore = new ObraStore();
