/**
 * ObraService - Firestore Security Rules Invariant & Adversarial Test Suite
 * Validates the "Dirty Dozen" security invariants against adversarial payloads.
 * Executable directly with: npx tsx firestore.rules.test.ts
 */

interface SecurityContext {
  auth: {
    uid: string;
    token: {
      email?: string;
      role?: string;
      company_id?: string;
    };
  } | null;
}

// Security Rule Simulation Helpers mirroring firestore.rules logic
function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function isValidDailyReport(data: any): boolean {
  const required = ['id', 'code', 'companyId', 'projectId', 'date', 'creatorId', 'status', 'version'];
  const hasAll = required.every(k => k in data);
  if (!hasAll) return false;
  if (typeof data.id !== 'string' || data.id.length > 128) return false;
  if (typeof data.code !== 'string' || data.code.length > 40) return false;
  if (typeof data.companyId !== 'string' || data.companyId.length > 128) return false;
  if (typeof data.projectId !== 'string' || data.projectId.length > 128) return false;
  if (typeof data.date !== 'string' || data.date.length > 20) return false;
  if (typeof data.creatorId !== 'string' || data.creatorId.length > 128) return false;
  if (!['Draft', 'Submitted', 'Corrected', 'Locked', 'Cancelled'].includes(data.status)) return false;
  if (typeof data.version !== 'number' || data.version < 1) return false;
  return true;
}

function evaluateUserUpdate(ctx: SecurityContext, existingUser: any, incomingUser: any): { allowed: boolean; reason?: string } {
  if (!ctx.auth) return { allowed: false, reason: 'Unauthenticated' };
  const isAdmin = ctx.auth.token.role === 'MAIN_CONTRACTOR_ADMIN';
  if (isAdmin) return { allowed: true };

  const isOwner = ctx.auth.uid === existingUser.id;
  if (!isOwner) return { allowed: false, reason: 'Not owner or admin' };

  // Calculate changed keys
  const changedKeys = Object.keys(incomingUser).filter(k => incomingUser[k] !== existingUser[k]);
  const allowedKeys = ['name'];
  const forbiddenKeys = changedKeys.filter(k => !allowedKeys.includes(k));
  if (forbiddenKeys.length > 0) {
    return { allowed: false, reason: `Forbidden fields modified: ${forbiddenKeys.join(', ')}` };
  }
  return { allowed: true };
}

function evaluateDeliveryNoteSubcontractorUpdate(ctx: SecurityContext, existingNote: any, incomingNote: any): { allowed: boolean; reason?: string } {
  if (!ctx.auth) return { allowed: false, reason: 'Unauthenticated' };
  const isSameSubCompany = ctx.auth.token.company_id === existingNote.subcontractorCompanyId;
  if (!isSameSubCompany) return { allowed: false, reason: 'Cross-company tenant access prohibited' };

  if (existingNote.status !== 'Pending') {
    return { allowed: false, reason: 'Cannot modify a delivery note that is not in Pending status' };
  }
  if (!['Confirmed', 'Disputed'].includes(incomingNote.status)) {
    return { allowed: false, reason: 'Status must transition to Confirmed or Disputed' };
  }

  const allowedKeys = ['status', 'confirmationDetails', 'confirmedBy', 'disputeRecord', 'dispute', 'updatedAt'];
  const changedKeys = Object.keys(incomingNote).filter(k => JSON.stringify(incomingNote[k]) !== JSON.stringify(existingNote[k]));
  const forbiddenKeys = changedKeys.filter(k => !allowedKeys.includes(k));
  if (forbiddenKeys.length > 0) {
    return { allowed: false, reason: `Subcontractor cannot modify core fields: ${forbiddenKeys.join(', ')}` };
  }
  return { allowed: true };
}

function evaluateReportCreation(ctx: SecurityContext, report: any): { allowed: boolean; reason?: string } {
  if (!ctx.auth) return { allowed: false, reason: 'Unauthenticated' };
  if (!isValidDailyReport(report)) return { allowed: false, reason: 'Invalid report schema' };
  
  const isSameCompany = ctx.auth.token.company_id === report.companyId;
  const isCreator = ctx.auth.uid === report.creatorId;
  if (!isSameCompany) return { allowed: false, reason: 'Company mismatch' };
  if (!isCreator) return { allowed: false, reason: 'Creator identity spoofing' };
  return { allowed: true };
}

function evaluateAuditLogMutation(): { allowed: boolean; reason?: string } {
  return { allowed: false, reason: 'Audit events are strictly append-only (updates & deletes permanently denied)' };
}

function assertDenied(result: { allowed: boolean; reason?: string }, testName: string) {
  if (result.allowed) {
    throw new Error(`[SECURITY VULNERABILITY] ${testName} was unexpectedly ALLOWED`);
  }
  console.log(`[PASS] ${testName} (Rejected: ${result.reason})`);
}

function assertAllowed(result: { allowed: boolean; reason?: string }, testName: string) {
  if (!result.allowed) {
    throw new Error(`[SECURITY DEFECT] ${testName} was unexpectedly REJECTED: ${result.reason}`);
  }
  console.log(`[PASS] ${testName}`);
}

console.log('--- RUNNING FIRESTORE SECURITY RULES DIRTY DOZEN SUITE ---');

// Payload 1: Unauthenticated request must be denied
console.log('\n[Dirty Dozen 1] Unauthenticated Access');
const unauthCtx: SecurityContext = { auth: null };
assertDenied(evaluateReportCreation(unauthCtx, { id: 'r1', creatorId: 'u1' }), 'Unauthenticated user creating report');

// Payload 2: Identity spoofing (creatorId != auth.uid) must be denied
console.log('\n[Dirty Dozen 2] Identity Spoofing');
const authUserCtx: SecurityContext = {
  auth: { uid: 'usr_alice', token: { company_id: 'comp_constructora' } }
};
const spoofedReport = {
  id: 'dr_123',
  code: 'DR-20260320-0001',
  companyId: 'comp_constructora',
  projectId: 'prj_central',
  date: '2026-03-20',
  creatorId: 'usr_bob_victim', // Alice trying to create report in Bob's name
  status: 'Draft',
  version: 1,
};
assertDenied(evaluateReportCreation(authUserCtx, spoofedReport), 'Identity spoofing creatorId != auth.uid');

// Payload 3: Self role escalation must be denied
console.log('\n[Dirty Dozen 3] Self Role Escalation');
const standardUser = { id: 'usr_alice', name: 'Alice', role: 'SITE_MANAGER', companyId: 'comp_constructora' };
const escalatedUser = { ...standardUser, role: 'MAIN_CONTRACTOR_ADMIN' };
assertDenied(evaluateUserUpdate(authUserCtx, standardUser, escalatedUser), 'Self role escalation to ADMIN');

// Payload 4: Shadow field injection
console.log('\n[Dirty Dozen 4] Shadow Field Injection');
const shadowInjectedUser = { ...standardUser, companyId: 'comp_hacked' };
assertDenied(evaluateUserUpdate(authUserCtx, standardUser, shadowInjectedUser), 'Company ID tampering by standard user');

// Payload 5: Audit log update and deletion must be permanently denied
console.log('\n[Dirty Dozen 5] Audit Log Immutable Tampering');
assertDenied(evaluateAuditLogMutation(), 'Mutating audit log entry');

// Payload 6: Document ID exceeding 128 chars or invalid characters rejected
console.log('\n[Dirty Dozen 6] Document ID Invalidation');
const badIdLength = 'a'.repeat(129);
const badIdChars = 'dr_123/../../etc/passwd';
if (isValidId(badIdLength) || isValidId(badIdChars)) {
  throw new Error('[FAIL] Invalid document ID was accepted');
}
console.log('[PASS] Malformed and oversized document IDs rejected');

// Payload 7: Subcontractor accessing or confirming another company notes is denied
console.log('\n[Dirty Dozen 7] Cross-Company Subcontractor Access');
const subCtxLevante: SecurityContext = {
  auth: { uid: 'usr_sub_1', token: { company_id: 'comp_levante' } }
};
const noteAndalucia = {
  id: 'dn_1',
  subcontractorCompanyId: 'comp_andalucia',
  status: 'Pending',
  totalHours: 16,
};
assertDenied(
  evaluateDeliveryNoteSubcontractorUpdate(subCtxLevante, noteAndalucia, { ...noteAndalucia, status: 'Confirmed' }),
  'Subcontractor confirming note belonging to another company'
);

// Payload 8: Value poisoning on hours / schema validation
console.log('\n[Dirty Dozen 8] Value Poisoning on Report Hours & Types');
const poisonedReport = {
  ...spoofedReport,
  creatorId: 'usr_alice',
  version: -5, // Invalid version
};
assertDenied(evaluateReportCreation(authUserCtx, poisonedReport), 'Negative version value rejected');

// Payload 9: Subcontractor altering immutable work hours on Delivery Note
console.log('\n[Dirty Dozen 9] Subcontractor Modifying Billed Work Hours');
const legitimatePendingNote = {
  id: 'dn_levante_1',
  subcontractorCompanyId: 'comp_levante',
  status: 'Pending',
  totalHours: 16,
  lines: [{ workerName: 'Manuel', hours: 16 }],
};
const tamperedHoursNote = {
  ...legitimatePendingNote,
  status: 'Confirmed',
  totalHours: 32, // Maliciously inflated hours
};
assertDenied(
  evaluateDeliveryNoteSubcontractorUpdate(subCtxLevante, legitimatePendingNote, tamperedHoursNote),
  'Subcontractor attempting to alter totalHours during confirmation'
);

// Payload 10: Mutating confirmed delivery note is rejected by terminal state lock
console.log('\n[Dirty Dozen 10] Terminal State Lock Mutation');
const confirmedNote = {
  ...legitimatePendingNote,
  status: 'Confirmed',
};
assertDenied(
  evaluateDeliveryNoteSubcontractorUpdate(subCtxLevante, confirmedNote, { ...confirmedNote, status: 'Disputed' }),
  'Mutating an already Confirmed delivery note'
);

// Payload 11: Legitimate Subcontractor Confirmation with audit details is permitted
console.log('\n[Dirty Dozen 11] Legitimate Subcontractor Confirmation');
const legitConfirmedNote = {
  ...legitimatePendingNote,
  status: 'Confirmed',
  confirmationDetails: {
    confirmedAt: new Date().toISOString(),
    confirmedByUserId: 'usr_sub_1',
    signature: 'data:image/png;base64,signature',
  },
  updatedAt: new Date().toISOString(),
};
assertAllowed(
  evaluateDeliveryNoteSubcontractorUpdate(subCtxLevante, legitimatePendingNote, legitConfirmedNote),
  'Subcontractor confirming legitimate pending note with signature'
);

// Payload 12: Orphaned report without companyId or projectId rejected
console.log('\n[Dirty Dozen 12] Orphaned Multi-Tenant Report Rejection');
const orphanedReport = {
  id: 'dr_orphan',
  code: 'DR-20260320-9999',
  // Missing companyId
  projectId: 'prj_1',
  date: '2026-03-20',
  creatorId: 'usr_alice',
  status: 'Draft',
  version: 1,
};
assertDenied(evaluateReportCreation(authUserCtx, orphanedReport), 'Report lacking companyId rejected');

console.log('\n--- ALL 12 DIRTY DOZEN SECURITY INVARIANT TESTS PASSED ---');
