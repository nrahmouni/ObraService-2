/**
 * ObraService - Authoritative Business Logic & Invariants
 * Pure business rules enforcing Spanish construction workflows and data integrity.
 */

import { 
  Company, 
  DailyReport, 
  DeliveryNote, 
  DisputeCategory, 
  LocationSnapshot, 
  Project, 
  User, 
  WorkEntry, 
  Worker 
} from '../types';

/**
 * Validates Spanish CIF / NIF format
 */
export function validateSpanishTaxId(taxId: string): { valid: boolean; message?: string } {
  const cleaned = taxId.trim().toUpperCase();
  if (!cleaned) {
    return { valid: false, message: 'El NIF/CIF no puede estar vacío.' };
  }
  
  // Basic structural check for NIF (8 digits + letter) or CIF (letter + 7 digits + control) or NIE (X/Y/Z + 7 digits + letter)
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

  if (nifRegex.test(cleaned) || nieRegex.test(cleaned) || cifRegex.test(cleaned)) {
    return { valid: true };
  }

  // Format error with helpful explanation
  return { 
    valid: false, 
    message: 'Formato de NIF/CIF no válido (ejemplos válidos: B12345678, 12345678Z, X1234567A).' 
  };
}

/**
 * Calculates geodetic distance in meters using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaPhi = (lat2 - lat1) * rad;
  const deltaLambda = (lon2 - lon1) * rad;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Validates location against project geofence
 */
export function validateProjectLocation(
  project: Project,
  userCoords?: { lat: number; lng: number; accuracy?: number }
): LocationSnapshot {
  const now = new Date().toISOString();

  if (!project.location || !project.location.lat || !project.location.lng) {
    return {
      capturedAt: now,
      status: 'Not Required',
      note: 'El proyecto no requiere validación geográfica específica.'
    };
  }

  if (!userCoords || userCoords.lat === undefined || userCoords.lng === undefined) {
    return {
      capturedAt: now,
      status: 'Unavailable',
      note: 'No se pudo acceder a la geolocalización en este dispositivo.'
    };
  }

  const distance = calculateHaversineDistanceMeters(
    userCoords.lat,
    userCoords.lng,
    project.location.lat,
    project.location.lng
  );

  const radius = project.validationRadiusMeters || 250;
  const isValid = distance <= radius;

  return {
    capturedAt: now,
    lat: userCoords.lat,
    lng: userCoords.lng,
    accuracyMeters: userCoords.accuracy || 15,
    distanceFromProjectMeters: distance,
    status: isValid ? 'Valid' : 'Warning',
    note: isValid 
      ? `Dentro del radio permitido (${distance}m de ${radius}m).`
      : `Fuera del radio configurado (${distance}m de ${radius}m). Requiere confirmación de salida de radio.`
  };
}

/**
 * Invariant checks on Work Entries for Daily Reports
 */
export function validateWorkEntries(entries: WorkEntry[]): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenWorkerIds = new Set<string>();

  for (const entry of entries) {
    // 1. Negative hours prohibited
    if (entry.normalHours < 0 || entry.extraHours < 0) {
      errors.push(`El trabajador "${entry.workerNameSnapshot}" tiene horas negativas.`);
    }

    // 2. Math check: total = normal + extra
    if (entry.totalHours !== entry.normalHours + entry.extraHours) {
      errors.push(`La suma de horas para "${entry.workerNameSnapshot}" no coincide.`);
    }

    // 3. Absent workers cannot log working hours
    if (entry.attendance !== 'Presente' && (entry.normalHours > 0 || entry.extraHours > 0)) {
      errors.push(`El trabajador "${entry.workerNameSnapshot}" está marcado como "${entry.attendance}" y no puede tener horas registradas.`);
    }

    // 4. Duplicate worker in same report prohibited
    if (seenWorkerIds.has(entry.workerId)) {
      errors.push(`El trabajador "${entry.workerNameSnapshot}" está duplicado en este parte.`);
    }
    seenWorkerIds.add(entry.workerId);

    // 5. Warning for excessive extra hours (> 2h or total > 10h)
    if (entry.extraHours > 2) {
      warnings.push(`"${entry.workerNameSnapshot}" supera 2h extras (${entry.extraHours}h). Verifica autorización.`);
    }
    if (entry.totalHours > 10) {
      warnings.push(`"${entry.workerNameSnapshot}" tiene una jornada prolongada de ${entry.totalHours}h.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Stable ID Generators
 */
export function generateDailyReportCode(dateStr: string, existingCount: number): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `DR-${cleanDate}-${seq}`;
}

export function generateDeliveryNoteCode(dateStr: string, existingCount: number): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `DN-${cleanDate}-${seq}`;
}

export function generateProjectCode(existingCount: number): string {
  return `PRJ-${String(existingCount + 1).padStart(4, '0')}`;
}

export function generateWorkerCode(existingCount: number): string {
  return `WRK-${String(existingCount + 1).padStart(4, '0')}`;
}

export function generateMachineryCode(existingCount: number): string {
  return `MAC-${String(existingCount + 1).padStart(4, '0')}`;
}

/**
 * Authoritative Delivery Note Generation Engine
 * Transforms submitted Daily Report work entries into structured Delivery Notes.
 * 
 * Rules:
 * - Excludes entries with 0 total hours.
 * - Internal workers (main contractor) NEVER generate external Delivery Notes.
 * - External subcontractor workers are grouped strictly by subcontractorCompanyId.
 * - Exactly one Delivery Note is created per subcontractor present.
 * - Idempotency: guarantees repeated execution does not duplicate existing delivery notes.
 */
export function generateDeliveryNotesFromReport(
  report: DailyReport,
  existingDeliveryNotes: DeliveryNote[],
  allCompanies: Company[]
): { createdNotes: DeliveryNote[]; skippedSubcontractorIds: string[] } {
  const companyMap = new Map(allCompanies.map(c => [c.id, c]));
  const createdNotes: DeliveryNote[] = [];
  const skippedSubcontractorIds: string[] = [];

  // Filter valid entries with totalHours > 0
  const activeEntries = report.workEntries.filter(e => e.totalHours > 0 && e.isSubcontractor);

  // Group by subcontractor company
  const entriesBySubcontractor = new Map<string, WorkEntry[]>();
  for (const entry of activeEntries) {
    const subId = entry.companyIdSnapshot;
    if (!subId) continue;
    const list = entriesBySubcontractor.get(subId) || [];
    list.push(entry);
    entriesBySubcontractor.set(subId, list);
  }

  let currentCount = existingDeliveryNotes.length;

  for (const [subcontractorId, entries] of entriesBySubcontractor.entries()) {
    // Idempotency check: Does a delivery note already exist for this report and subcontractor?
    const alreadyExists = existingDeliveryNotes.some(
      dn => dn.sourceDailyReportId === report.id && dn.subcontractorCompanyId === subcontractorId
    );

    if (alreadyExists) {
      skippedSubcontractorIds.push(subcontractorId);
      continue;
    }

    const subCompany = companyMap.get(subcontractorId);
    const subCompanyName = subCompany ? subCompany.name : entries[0].companyNameSnapshot || 'Subcontrata';

    const normalHours = entries.reduce((acc, curr) => acc + curr.normalHours, 0);
    const extraHours = entries.reduce((acc, curr) => acc + curr.extraHours, 0);
    const totalHours = normalHours + extraHours;

    const noteCode = generateDeliveryNoteCode(report.date, currentCount);
    currentCount++;

    const newNote: DeliveryNote = {
      id: `dn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: noteCode,
      sourceDailyReportId: report.id,
      sourceDailyReportCode: report.code,
      projectId: report.projectId,
      projectNameSnapshot: report.projectNameSnapshot,
      date: report.date,
      subcontractorCompanyId: subcontractorId,
      subcontractorCompanyName: subCompanyName,
      workEntries: entries,
      normalHours,
      extraHours,
      totalHours,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createdNotes.push(newNote);
  }

  return { createdNotes, skippedSubcontractorIds };
}

/**
 * Validates whether a user is authorized to confirm an Albarán
 */
export function canUserConfirmDeliveryNote(user: User, note: DeliveryNote): { allowed: boolean; reason?: string } {
  if (user.role !== 'SUBCONTRACTOR_USER' && user.role !== 'MAIN_CONTRACTOR_ADMIN') {
    return { allowed: false, reason: 'Solo el representante de la subcontrata o el administrador pueden gestionar la confirmación.' };
  }

  if (user.role === 'SUBCONTRACTOR_USER' && user.companyId !== note.subcontractorCompanyId) {
    return { allowed: false, reason: 'No puedes confirmar un albarán emitido para otra empresa subcontratista.' };
  }

  if (note.status !== 'Pending') {
    return { allowed: false, reason: `El albarán ya se encuentra en estado "${note.status}".` };
  }

  return { allowed: true };
}

/**
 * Validates whether a user is authorized to dispute an Albarán
 */
export function canUserDisputeDeliveryNote(user: User, note: DeliveryNote): { allowed: boolean; reason?: string } {
  if (user.role !== 'SUBCONTRACTOR_USER' && user.role !== 'MAIN_CONTRACTOR_ADMIN') {
    return { allowed: false, reason: 'Solo el usuario de la subcontrata puede emitir una disputa.' };
  }

  if (user.role === 'SUBCONTRACTOR_USER' && user.companyId !== note.subcontractorCompanyId) {
    return { allowed: false, reason: 'No tienes acceso a los albaranes de otra subcontrata.' };
  }

  if (note.status !== 'Pending') {
    return { allowed: false, reason: `Solo se pueden disputar albaranes pendientes (estado actual: ${note.status}).` };
  }

  return { allowed: true };
}
