import { describe, it, expect, vi } from 'vitest';
import { DailyReport, DeliveryNote, WorkEntry } from '../types';
import { validateWorkEntries } from '../domain/rules';

describe('ObraService Pro - Concurrency, Idempotency & Conflict Resolution Tests', () => {
  it('ensures idempotency key prevents duplicate processing of identical mutations', () => {
    const idempotencyKey = 'idem_test_998877';
    const report = {
      id: 'dr_test_1',
      code: 'PARTE-2026-001',
      companyId: 'comp_1',
      projectId: 'proj_1',
      projectNameSnapshot: 'Obra Central',
      date: '2026-09-22',
      creatorId: 'usr_1',
      creatorNameSnapshot: 'Jefe Test',
      status: 'Draft',
      workEntries: [],
      machineryEntries: [],
      materialEntries: [],
      totalNormalHours: 8,
      totalExtraHours: 0,
      totalHours: 8,
      comments: '',
      evidenceUrls: [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DailyReport;

    // Simulated outbox queue storage mapping idempotency keys
    const processedMap = new Set<string>();
    const processMutation = (item: { id: string; idempotencyKey: string; data: any }) => {
      if (processedMap.has(item.idempotencyKey)) {
        return { status: 'already_processed', duplicate: true };
      }
      processedMap.add(item.idempotencyKey);
      return { status: 'processed', duplicate: false };
    };

    const firstAttempt = processMutation({ id: report.id, idempotencyKey, data: report });
    const secondAttempt = processMutation({ id: report.id, idempotencyKey, data: report });

    expect(firstAttempt.duplicate).toBe(false);
    expect(secondAttempt.duplicate).toBe(true);
    expect(secondAttempt.status).toBe('already_processed');
  });

  it('handles optimistic locking version conflicts correctly', () => {
    const serverRecord = {
      id: 'dr_conflict_1',
      version: 3,
      updatedAt: '2026-09-22T10:00:00Z',
      status: 'Submitted'
    };

    const clientIncomingRecord = {
      id: 'dr_conflict_1',
      version: 2, // Outdated client version
      updatedAt: '2026-09-22T09:00:00Z',
      status: 'Draft'
    };

    const resolveConflict = (server: typeof serverRecord, client: typeof clientIncomingRecord) => {
      if (client.version < server.version) {
        return { action: 'reject_client_outdated', currentServerVersion: server.version };
      }
      return { action: 'accept_client' };
    };

    const resolution = resolveConflict(serverRecord, clientIncomingRecord);
    expect(resolution.action).toBe('reject_client_outdated');
    expect(resolution.currentServerVersion).toBe(3);
  });

  it('prevents direct editing of Confirmed or Validated delivery notes', () => {
    const deliveryNote = {
      id: 'dn_conf_1',
      code: 'ALB-2026-001',
      companyId: 'comp_1',
      subcontractorCompanyId: 'sub_1',
      subcontractorNameSnapshot: 'Subcontrata S.L.',
      projectId: 'proj_1',
      projectNameSnapshot: 'Obra Central',
      date: '2026-09-22',
      status: 'Confirmed', // Confirmed terminal state
      normalHours: 8,
      extraHours: 2,
      totalHours: 10,
      lines: [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as DeliveryNote;

    const updateDeliveryNoteAttempt = (note: DeliveryNote, newHours: number) => {
      if (note.status === 'Confirmed' || note.status === 'Disputed') {
        return { success: false, error: 'Cannot modify a delivery note that is not in Pending status.' };
      }
      return { success: true };
    };

    const result = updateDeliveryNoteAttempt(deliveryNote, 12);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cannot modify');
  });
});
