import { AppState, Company, User, Invitation, UserRole, Worker, Project } from '../../types';
import { validateSpanishTaxId, generateWorkerCode } from '../../domain/rules';

export const createCompany = (
  state: AppState,
  data: {
    name: string;
    taxId: string;
    type: 'MAIN_CONTRACTOR' | 'SUBCONTRACTOR';
    address: string;
  },
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string; company?: Company } => {
  if (!state.currentUser) {
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
    subscriptionStatus: 'Active',
    createdAt: new Date().toISOString(),
  };

  state.companies.push(newCompany);
  dispatchSync('company', newCompany);

  state.currentUser.companyId = newCompany.id;
  state.currentUser.companyName = newCompany.name;
  state.currentUser.role = data.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : 'MAIN_CONTRACTOR_ADMIN';

  logAudit(
    'Company',
    newCompany.id,
    'COMPANY_CREATED',
    `Empresa "${newCompany.name}" (${newCompany.taxId}) constituida con código de invitación ${inviteCode}.`
  );

  dispatchSync('user', state.currentUser);
  return { success: true, company: newCompany };
};

export const toggleCompanyActive = (
  state: AppState,
  companyId: string,
  reason: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const target = state.companies.find((c: Company) => c.id === companyId);
  if (target) {
    const previousState = target.active ? 'Activo' : 'Suspendido';
    target.active = !target.active;
    target.subscriptionStatus = target.active ? 'Active' : 'Suspended';
    const newState = target.active ? 'Activo' : 'Suspendido';
    dispatchSync('company', target);
    
    logAudit(
      'Company',
      target.id,
      'COMPANY_CREATED', // Using COMPANY_CREATED as a placeholder or generic operation for company audit
      `Cambio de estado comercial de "${target.name}" de ${previousState} a ${newState}. Motivo obligatorio registrado: ${reason}`
    );
    return true;
  }
  return false;
};

export const createSubcontractor = (
  state: AppState,
  data: {
    name: string;
    taxId: string;
    address: string;
  },
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string; company?: Company } => {
  if (!state.currentUser) {
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
    subscriptionStatus: 'Active',
    createdAt: new Date().toISOString(),
  };

  state.companies.push(newCompany);
  dispatchSync('company', newCompany);

  logAudit(
    'Company',
    newCompany.id,
    'COMPANY_CREATED',
    `Subcontratista "${newCompany.name}" (${newCompany.taxId}) de alta en sistema con código de invitación ${inviteCode}.`
  );

  return { success: true, company: newCompany };
};

export const joinCompany = (
  state: AppState,
  inviteCode: string,
  requestedRole: UserRole,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  if (!state.currentUser) {
    return { success: false, error: 'Acceso no autorizado para esta operación.' };
  }

  const cleanCode = inviteCode.trim().toUpperCase();
  const targetCompany = state.companies.find((c: Company) => c.inviteCode.toUpperCase() === cleanCode);

  if (!targetCompany) {
    return { success: false, error: 'Código de invitación no encontrado o no válido.' };
  }

  if (!targetCompany.active) {
    return { success: false, error: 'La empresa a la que intentas unirte está inactiva.' };
  }

  state.currentUser.companyId = targetCompany.id;
  state.currentUser.companyName = targetCompany.name;
  state.currentUser.role = targetCompany.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : requestedRole;

  logAudit(
    'Membership',
    state.currentUser.id,
    'MEMBER_JOINED',
    `Usuario ${state.currentUser.name} se incorporó a "${targetCompany.name}" mediante código de invitación.`
  );

  dispatchSync('user', state.currentUser);
  return { success: true };
};

export const regenerateInviteCode = (
  state: AppState,
  companyId: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void
): { success: boolean; newCode?: string } => {
  const comp = state.companies.find((c: Company) => c.id === companyId);
  if (!comp) return { success: false };

  const newCode = `OBRA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  comp.inviteCode = newCode;

  logAudit(
    'Company',
    comp.id,
    'INVITE_CODE_REGENERATED',
    `Código de invitación regenerado a ${newCode} invalidando el anterior.`
  );

  return { success: true, newCode };
};

export const createInvitation = (
  state: AppState,
  email: string,
  role: UserRole,
  companyId: string,
  invitedBy: string,
  assignedProjectIds: string[] = [],
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; invitation?: Invitation; magicLink?: string; error?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Por favor, introduce un correo electrónico válido.' };
  }

  const company = state.companies.find((c: Company) => c.id === companyId);
  const companyName = company?.name || state.currentUser?.companyName || 'Empresa Constructora';

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

  if (!state.invitations) {
    state.invitations = [];
  }

  state.invitations.unshift(invite);
  dispatchSync('invitation', invite);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://obraservice.app';
  const magicLink = `${origin}/?invite=${invite.code}`;

  logAudit(
    'Company',
    invite.id,
    'MEMBER_JOINED',
    `Invitación enviada a ${cleanEmail} para el rol de ${role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'} con código ${invite.code} y acceso a ${assignedProjectIds.length} obra(s).`,
    invite.code
  );

  return { success: true, invitation: invite, magicLink };
};

export const acceptInvitation = (
  state: AppState,
  codeOrId: string,
  userData: { name: string; password?: string },
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; user?: User; error?: string } => {
  if (!codeOrId) return { success: false, error: 'Identificador de invitación no válido' };
  const clean = codeOrId.trim().toUpperCase();
  const cleanEmail = codeOrId.trim().toLowerCase();
  let inv = (state.invitations || []).find(
    (i: Invitation) => i.code?.toUpperCase() === clean || 
         i.id === codeOrId || 
         (i.status === 'Pending' && i.email?.toLowerCase() === cleanEmail)
  );

  if (!inv) {
    const matchingCompany = state.companies.find((c: Company) => c.inviteCode?.toUpperCase() === clean || c.id === codeOrId);
    if (matchingCompany) {
      inv = {
        id: `inv_${Date.now()}`,
        code: matchingCompany.inviteCode,
        email: `${(userData.name || 'usuario').toLowerCase().replace(/\s+/g, '.')}@${matchingCompany.inviteCode.toLowerCase()}.es`,
        role: matchingCompany.type === 'SUBCONTRACTOR' ? 'SUBCONTRACTOR_USER' : 'SITE_MANAGER',
        companyId: matchingCompany.id,
        companyName: matchingCompany.name,
        status: 'Pending',
        invitedBy: 'usr_admin',
        createdAt: new Date().toISOString(),
        assignedProjectIds: state.projects.filter((p: Project) => p.companyId === matchingCompany.id).map((p: Project) => p.id)
      };
      state.invitations.push(inv);
    }
  }

  if (!inv) {
    return { success: false, error: 'Código de invitación no encontrado o no válido.' };
  }
  if (inv.status === 'Accepted') {
    return { success: false, error: 'Esta invitación ya ha sido utilizada.' };
  }
  if (inv.status === 'Expired') {
    return { success: false, error: 'Esta invitación ha expirado.' };
  }

  const company = state.companies.find((c: Company) => c.id === inv.companyId);
  const companyName = company?.name || inv.companyName || 'Empresa Constructora';

  const email = inv.email.toLowerCase();
  let existingUser = state.users.find((u: User) => u.email.toLowerCase() === email);
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
      name: userData.name.trim() || email.split('@')[0],
      email,
      role: inv.role,
      companyId: inv.companyId,
      companyName,
      active: true,
      assignedProjectIds: inv.assignedProjectIds || [],
      createdAt: new Date().toISOString(),
    };
    state.users.push(finalUser);
  }

  if (inv.role === 'SUBCONTRACTOR_USER') {
    const existingWorker = (state.workers || []).find((w: Worker) => w.name.toLowerCase() === finalUser.name.toLowerCase() && w.companyId === inv.companyId);
    if (!existingWorker) {
      const newWorker: Worker = {
        id: `wrk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: generateWorkerCode((state.workers || []).length + 1),
        name: finalUser.name,
        category: 'Oficial de 1ª',
        companyId: inv.companyId,
        nationalId: 'DNI-' + Math.floor(10000000 + Math.random() * 90000000) + 'X',
        active: true,
        createdAt: new Date().toISOString()
      };
      state.workers.push(newWorker);
      dispatchSync('worker', newWorker);
    }
  }

  inv.status = 'Accepted';
  inv.acceptedAt = new Date().toISOString();

  dispatchSync('invitation', inv);
  dispatchSync('user', finalUser);

  state.currentUser = finalUser;

  logAudit(
    'Company',
    finalUser.id,
    'MEMBER_JOINED',
    `${finalUser.name} (${finalUser.email}) se ha unido a ${companyName} con rol ${inv.role === 'SITE_MANAGER' ? 'Jefe de Obra' : 'Operario'}.`,
    inv.code
  );

  return { success: true, user: finalUser };
};
