import { obraStore } from '../services/store';
import { ComplianceDocument } from '../types';

export interface OperationalStatusResult {
  isBlocked: boolean;
  reason?: string;
  expiredDocs: ComplianceDocument[];
  pendingDocs: ComplianceDocument[];
}

/**
 * Checks if a company is operationally blocked due to expired or missing PRL documents (TC2, REA, etc.).
 */
export function checkOperationalStatus(companyId: string): OperationalStatusResult {
  const state = obraStore.getState();
  const docs: ComplianceDocument[] = state.complianceDocuments || [];
  
  const companyDocs = docs.filter((d: ComplianceDocument) => d.companyId === companyId);
  
  if (companyDocs.length === 0) {
    return {
      isBlocked: false,
      expiredDocs: [],
      pendingDocs: []
    };
  }

  const expiredDocs = companyDocs.filter((d: ComplianceDocument) => d.status === 'EXPIRED' || (d.expiryDate && new Date(d.expiryDate) < new Date()));
  const pendingDocs = companyDocs.filter((d: ComplianceDocument) => d.status === 'PENDING');

  if (expiredDocs.length > 0) {
    return {
      isBlocked: true,
      reason: `Bloqueo PRL: La empresa tiene ${expiredDocs.length} documento(s) caducado(s) (${expiredDocs.map((d: ComplianceDocument) => d.docType).join(', ')}). Es obligatorio renovarlos.`,
      expiredDocs,
      pendingDocs
    };
  }

  return {
    isBlocked: false,
    expiredDocs: [],
    pendingDocs
  };
}
