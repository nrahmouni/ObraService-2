/**
 * ObraService - Business Logic & Invariant Test Suite
 * Validates domain rules, math, idempotency, and access controls.
 */

import { 
  validateSpanishTaxId,
  calculateHaversineDistanceMeters,
  validateProjectLocation,
  validateWorkEntries,
  generateDeliveryNotesFromReport,
  canUserConfirmDeliveryNote,
  canUserDisputeDeliveryNote
} from './rules';
import { Company, DailyReport, DeliveryNote, Project, User, WorkEntry } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

console.log('--- RUNNING OBRA SERVICE DOMAIN TESTS ---');

// 1. Spanish Tax ID Validation
console.log('\n[Suite 1] Spanish Tax ID Validation');
assert(validateSpanishTaxId('B87654321').valid, 'Valid CIF accepted (B87654321)');
assert(validateSpanishTaxId('12345678Z').valid, 'Valid NIF accepted (12345678Z)');
assert(validateSpanishTaxId('X1234567A').valid, 'Valid NIE accepted (X1234567A)');
assert(!validateSpanishTaxId('').valid, 'Empty Tax ID rejected');
assert(!validateSpanishTaxId('INVALID123').valid, 'Invalid format rejected');

// 2. Geodetic Distance (Haversine)
console.log('\n[Suite 2] Haversine Distance');
// Madrid Plaza Mayor (40.4154, -3.7074) to Puerta del Sol (40.4168, -3.7038) ~ 340m
const dist = calculateHaversineDistanceMeters(40.4154, -3.7074, 40.4168, -3.7038);
assert(dist > 300 && dist < 400, `Madrid Plaza Mayor to Sol is ~340m (calculated: ${dist}m)`);
assert(calculateHaversineDistanceMeters(40.4, -3.7, 40.4, -3.7) === 0, 'Identical coordinates yield 0m');

// 3. Work Entries Invariants
console.log('\n[Suite 3] Work Entries Invariants');
const validEntries: WorkEntry[] = [
  {
    id: 'we_1',
    workerId: 'w_1',
    workerNameSnapshot: 'Antonio García',
    workerCategorySnapshot: 'Oficial 1ª',
    companyIdSnapshot: 'comp_sub_1',
    companyNameSnapshot: 'Estructuras Levante',
    isSubcontractor: true,
    normalHours: 8,
    extraHours: 1,
    totalHours: 9,
    attendance: 'Presente',
  },
  {
    id: 'we_2',
    workerId: 'w_2',
    workerNameSnapshot: 'Manuel López',
    workerCategorySnapshot: 'Peón Ordinario',
    companyIdSnapshot: 'comp_sub_1',
    companyNameSnapshot: 'Estructuras Levante',
    isSubcontractor: true,
    normalHours: 8,
    extraHours: 0,
    totalHours: 8,
    attendance: 'Presente',
  },
];
assert(validateWorkEntries(validEntries).valid, 'Valid entries pass validation');

const invalidMathEntries: WorkEntry[] = [{
  ...validEntries[0],
  normalHours: 8,
  extraHours: 1,
  totalHours: 12, // Math mismatch
}];
assert(!validateWorkEntries(invalidMathEntries).valid, 'Mismatched hours rejected');

const absentWorkingEntries: WorkEntry[] = [{
  ...validEntries[0],
  attendance: 'Ausente',
  totalHours: 8,
  normalHours: 8,
}];
assert(!validateWorkEntries(absentWorkingEntries).valid, 'Absent worker with logged hours rejected');

const duplicateEntries: WorkEntry[] = [validEntries[0], validEntries[0]];
assert(!validateWorkEntries(duplicateEntries).valid, 'Duplicate worker in same report rejected');

// 4. Delivery Note Generation & Idempotency
console.log('\n[Suite 4] Delivery Note Generation & Idempotency');
const mockCompanies: Company[] = [
  {
    id: 'comp_main',
    name: 'Constructora Mayor S.A.',
    taxId: 'A11223344',
    type: 'MAIN_CONTRACTOR',
    address: 'Madrid',
    inviteCode: 'MAIN123',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp_sub_1',
    name: 'Estructuras Levante S.L.',
    taxId: 'B99887766',
    type: 'SUBCONTRACTOR',
    address: 'Valencia',
    inviteCode: 'SUB123',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const mockReport: DailyReport = {
  id: 'dr_test_1',
  code: 'DR-20260320-0001',
  companyId: 'comp_main',
  projectId: 'prj_1',
  projectNameSnapshot: 'Residencial Los Olivos',
  date: '2026-03-20',
  creatorId: 'usr_manager',
  creatorNameSnapshot: 'Jefe de Obra',
  status: 'Submitted',
  workEntries: [
    ...validEntries,
    // Internal worker: Should NEVER generate a delivery note
    {
      id: 'we_internal',
      workerId: 'w_int',
      workerNameSnapshot: 'Encargado Propio',
      workerCategorySnapshot: 'Encargado General',
      companyIdSnapshot: 'comp_main',
      companyNameSnapshot: 'Constructora Mayor S.A.',
      isSubcontractor: false,
      normalHours: 8,
      extraHours: 0,
      totalHours: 8,
      attendance: 'Presente',
    },
  ],
  totalNormalHours: 24,
  totalExtraHours: 1,
  totalHours: 25,
  comments: 'Encofrado planta baja',
  evidenceUrls: [],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const result1 = generateDeliveryNotesFromReport(mockReport, [], mockCompanies);
assert(result1.createdNotes.length === 1, 'Exactly 1 Delivery Note generated for external subcontractor');
assert(result1.createdNotes[0].subcontractorCompanyId === 'comp_sub_1', 'Assigned to correct subcontractor');
assert(result1.createdNotes[0].totalHours === 17, 'Total subcontractor hours correctly aggregated (9 + 8 = 17)');
assert(result1.createdNotes[0].lines?.length === 2, 'Lines preserved on Delivery Note');

// Idempotency test: Passing existing notes should skip creation
const result2 = generateDeliveryNotesFromReport(mockReport, result1.createdNotes, mockCompanies);
assert(result2.createdNotes.length === 0, 'Idempotency guaranteed: No duplicates generated');
assert(result2.skippedSubcontractorIds.includes('comp_sub_1'), 'Subcontractor ID flagged as skipped');

// 5. Authorization & Confirmation
console.log('\n[Suite 5] Authorization & Confirmation');
const subUser: User = {
  id: 'usr_sub',
  name: 'Representante Subcontrata',
  email: 'sub@levante.es',
  role: 'SUBCONTRACTOR_USER',
  companyId: 'comp_sub_1',
  companyName: 'Estructuras Levante S.L.',
  active: true,
  assignedProjectIds: ['prj_1'],
  createdAt: new Date().toISOString(),
};

const otherSubUser: User = {
  ...subUser,
  id: 'usr_other',
  companyId: 'comp_other_sub',
};

const generatedNote = result1.createdNotes[0];
assert(canUserConfirmDeliveryNote(subUser, generatedNote).allowed, 'Subcontractor can confirm their own note');
assert(!canUserConfirmDeliveryNote(otherSubUser, generatedNote).allowed, 'Different subcontractor cannot confirm note');

const confirmedNote: DeliveryNote = {
  ...generatedNote,
  status: 'Confirmed',
};
assert(!canUserConfirmDeliveryNote(subUser, confirmedNote).allowed, 'Cannot confirm already confirmed note');

console.log('\n--- ALL DOMAIN INVARIANT TESTS PASSED SUCCESSFULLY ---');
