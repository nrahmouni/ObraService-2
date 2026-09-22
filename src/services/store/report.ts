import { 
  AppState, 
  DailyReport, 
  WorkEntry, 
  DeliveryNote, 
  DisputeCategory,
  Project,
  Company
} from '../../types';
import { 
  generateDailyReportCode, 
  validateWorkEntries, 
  validateProjectLocation, 
  generateDeliveryNotesFromReport 
} from '../../domain/rules';

export const saveReportDraft = (
  state: AppState,
  data: Partial<DailyReport>,
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): DailyReport => {
  const now = new Date().toISOString();
  let report: DailyReport;

  if (data.id) {
    const idx = state.reports.findIndex((r: DailyReport) => r.id === data.id);
    const targetProject = state.projects.find((p: Project) => p.id === (data.projectId || state.reports[idx]?.projectId));
    const companyId = data.companyId || state.reports[idx]?.companyId || targetProject?.companyId || state.currentUser?.companyId || 'comp_main';
    if (idx !== -1) {
      state.reports[idx] = {
        ...state.reports[idx],
        ...data,
        companyId,
        updatedAt: now,
      } as DailyReport;
      report = state.reports[idx];
    } else {
      report = { ...data, companyId } as DailyReport;
      state.reports.push(report);
    }
  } else {
    const code = generateDailyReportCode(data.date || now.split('T')[0], state.reports.length);
    const targetProject = state.projects.find((p: Project) => p.id === data.projectId);
    const companyId = data.companyId || targetProject?.companyId || state.currentUser?.companyId || 'comp_main';
    const normalHrs = data.totalNormalHours !== undefined 
      ? data.totalNormalHours 
      : (data.workEntries ? data.workEntries.reduce((a, b) => a + (b.normalHours || 0), 0) : 0);
    const extraHrs = data.totalExtraHours !== undefined 
      ? data.totalExtraHours 
      : (data.workEntries ? data.workEntries.reduce((a, b) => a + (b.extraHours || 0), 0) : 0);
    const totalHrs = data.totalHours !== undefined ? data.totalHours : (normalHrs + extraHrs);

    report = {
      id: `dr_${Date.now()}`,
      code,
      companyId,
      projectId: data.projectId || '',
      projectNameSnapshot: data.projectNameSnapshot || targetProject?.name || '',
      date: data.date || now.split('T')[0],
      creatorId: state.currentUser?.id || 'usr_unknown',
      creatorNameSnapshot: state.currentUser?.name || 'Jefe de Obra',
      status: 'Draft',
      workEntries: data.workEntries || [],
      machineryEntries: data.machineryEntries || [],
      materialEntries: data.materialEntries || [],
      totalNormalHours: normalHrs,
      totalExtraHours: extraHrs,
      totalHours: totalHrs,
      comments: data.comments || '',
      siteConditions: data.siteConditions || '',
      evidenceUrls: data.evidenceUrls || [],
      evidenceAttachments: data.evidenceAttachments || [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    state.reports.push(report);

    logAudit(
      'DailyReport',
      report.id,
      'REPORT_CREATED',
      `Borrador de parte diario iniciado para la fecha ${report.date}.`,
      report.code,
      report.id
    );
  }

  dispatchSync('dailyReport', report);
  return report;
};

export const submitDailyReport = (
  state: AppState,
  reportId: string,
  userCoords: { lat: number; lng: number; accuracy?: number } | undefined,
  warningAcknowledged: boolean | undefined,
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string; deliveryNotesCreated?: number } => {
  const report = state.reports.find((r: DailyReport) => r.id === reportId);
  if (!report) {
    return { success: false, error: 'No se encontró el parte diario solicitado.' };
  }

  if (report.status === 'Submitted') {
    return { success: true, error: 'Este parte ya ha sido enviado. Se ha recuperado el resultado existente.' };
  }

  const validation = validateWorkEntries(report.workEntries);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  const project = state.projects.find((p: Project) => p.id === report.projectId);
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

  report.status = 'Submitted';
  report.submittedAt = new Date().toISOString();
  report.updatedAt = new Date().toISOString();

  const { createdNotes } = generateDeliveryNotesFromReport(
    report, 
    state.deliveryNotes, 
    state.companies
  );

  for (const note of createdNotes) {
    state.deliveryNotes.push(note);
    dispatchSync('deliveryNote', note);
    logAudit(
      'DeliveryNote',
      note.id,
      'DELIVERY_NOTE_GENERATED',
      `Albarán ${note.code} generado automáticamente para "${note.subcontractorCompanyName}" con ${note.totalHours} horas.`,
      note.code,
      report.id,
      note.id
    );
  }

  logAudit(
    'DailyReport',
    report.id,
    'REPORT_SUBMITTED',
    `Parte diario enviado con ${report.workEntries.length} trabajadores y ${report.totalHours}h totales.`,
    report.code,
    report.id
  );

  dispatchSync('dailyReport', report);
  return { success: true, deliveryNotesCreated: createdNotes.length };
};

export const correctDailyReport = (
  state: AppState,
  reportId: string,
  updatedEntries: WorkEntry[],
  reason: string,
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    previousValue?: string,
    newValue?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  if (!state.currentUser || state.currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') {
    return { success: false, error: 'Solo el administrador puede realizar correcciones oficiales sobre partes enviados.' };
  }

  const cleanReason = reason.trim();
  if (!cleanReason) {
    return { success: false, error: 'Es obligatorio indicar el motivo de la corrección del parte.' };
  }

  const report = state.reports.find((r: DailyReport) => r.id === reportId);
  if (!report) {
    return { success: false, error: 'Parte diario no encontrado.' };
  }

  const previousHours = report.totalHours;

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

  const affectedNotes = state.deliveryNotes.filter((dn: DeliveryNote) => dn.sourceDailyReportId === report.id);
  for (const note of affectedNotes) {
    note.correctionNotice = `Parte corregido el ${new Date().toLocaleDateString('es-ES')}: ${cleanReason}`;
    note.updatedAt = new Date().toISOString();
  }

  logAudit(
    'DailyReport',
    report.id,
    'REPORT_CORRECTED',
    `Corrección oficial aplicada (v${report.version}). Motivo: ${cleanReason}.`,
    report.code,
    report.id,
    `${previousHours} horas`,
    `${report.totalHours} horas`
  );

  dispatchSync('dailyReport', report);
  affectedNotes.forEach((n: DeliveryNote) => dispatchSync('deliveryNote', n));
  return { success: true };
};

export const confirmDeliveryNote = (
  state: AppState,
  noteId: string,
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  if (!state.currentUser) {
    return { success: false, error: 'Acceso no autorizado para esta operación.' };
  }

  const note = state.deliveryNotes.find((n: DeliveryNote) => n.id === noteId);
  if (!note) {
    return { success: false, error: 'Albarán no encontrado.' };
  }

  const isSub = state.currentUser.role === 'SUBCONTRACTOR_USER';
  if (isSub && note.subcontractorCompanyId !== state.currentUser.companyId) {
    return { success: false, error: 'Un subcontratista solo puede firmar albaranes pertenecientes a su propia empresa.' };
  }

  note.status = 'Confirmed';
  note.confirmationDetails = {
    confirmedByUserId: state.currentUser.id,
    confirmedByUserName: state.currentUser.name,
    confirmedAt: new Date().toISOString(),
    subcontractorCompanyName: note.subcontractorCompanyName,
  };
  note.confirmedBy = note.confirmationDetails;
  note.updatedAt = new Date().toISOString();

  logAudit(
    'DeliveryNote',
    note.id,
    'DELIVERY_NOTE_CONFIRMED',
    `Albarán ${note.code} confirmado formalmente por ${state.currentUser.name} (${note.subcontractorCompanyName}).`,
    note.code,
    note.sourceDailyReportId,
    note.id
  );

  dispatchSync('deliveryNote', note);
  return { success: true };
};

export const confirmAllPendingDeliveryNotes = (
  state: AppState,
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; count: number; error?: string } => {
  if (!state.currentUser) {
    return { success: false, count: 0, error: 'Acceso no autorizado para esta operación.' };
  }

  const isSub = state.currentUser.role === 'SUBCONTRACTOR_USER';
  const pending = state.deliveryNotes.filter((n: DeliveryNote) => {
    if (n.status !== 'Pending') return false;
    if (isSub) return n.subcontractorCompanyId === state.currentUser?.companyId;
    return true;
  });

  if (pending.length === 0) {
    return { success: false, count: 0, error: 'No hay albaranes pendientes de confirmación.' };
  }

  let count = 0;
  for (const note of pending) {
    note.status = 'Confirmed';
    note.confirmationDetails = {
      confirmedByUserId: state.currentUser.id,
      confirmedByUserName: state.currentUser.name,
      confirmedAt: new Date().toISOString(),
      subcontractorCompanyName: note.subcontractorCompanyName,
    };
    note.confirmedBy = note.confirmationDetails;
    note.updatedAt = new Date().toISOString();

    logAudit(
      'DeliveryNote',
      note.id,
      'DELIVERY_NOTE_CONFIRMED',
      `Albarán ${note.code} confirmado en lote por ${state.currentUser.name} (${note.subcontractorCompanyName}).`,
      note.code,
      note.sourceDailyReportId,
      note.id
    );
    dispatchSync('deliveryNote', note);
    count++;
  }

  return { success: true, count };
};

export const disputeDeliveryNote = (
  state: AppState,
  noteId: string,
  data: {
    category: DisputeCategory;
    reason: string;
    proposedNormalHours?: number;
    proposedExtraHours?: number;
    evidenceUrls?: string[];
  },
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  if (!state.currentUser) {
    return { success: false, error: 'Acceso no autorizado para esta operación.' };
  }

  const note = state.deliveryNotes.find((n: DeliveryNote) => n.id === noteId);
  if (!note) {
    return { success: false, error: 'Albarán no encontrado.' };
  }

  const isSub = state.currentUser.role === 'SUBCONTRACTOR_USER';
  if (isSub && note.subcontractorCompanyId !== state.currentUser.companyId) {
    return { success: false, error: 'Un subcontratista solo puede disputar albaranes pertenecientes a su propia empresa.' };
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
    actorId: state.currentUser.id,
    actorName: state.currentUser.name,
    actorCompany: state.currentUser.companyName || note.subcontractorCompanyName,
    createdAt: new Date().toISOString(),
  };
  note.dispute = note.disputeRecord;
  note.updatedAt = new Date().toISOString();

  logAudit(
    'DeliveryNote',
    note.id,
    'DELIVERY_NOTE_DISPUTED',
    `Albarán ${note.code} disputado. Categoría: ${data.category}. Motivo: "${data.reason.trim()}".`,
    note.code,
    note.sourceDailyReportId,
    note.id
  );

  dispatchSync('deliveryNote', note);
  return { success: true };
};

export const resolveDispute = (
  state: AppState,
  noteId: string,
  data: {
    action: 'ACEPTADA_CON_AJUSTE' | 'DESESTIMADA_JUSTIFICADA';
    resolutionNote: string;
    adjustedNormalHours?: number;
    adjustedExtraHours?: number;
  },
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    dailyReportId?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  if (!state.currentUser || state.currentUser.role !== 'MAIN_CONTRACTOR_ADMIN') {
    return { success: false, error: 'Solo el administrador de la empresa principal puede resolver disputas.' };
  }

  const note = state.deliveryNotes.find((n: DeliveryNote) => n.id === noteId);
  if (!note || !note.disputeRecord) {
    return { success: false, error: 'No se encontró una disputa activa para este albarán.' };
  }

  if (!data.resolutionNote.trim()) {
    return { success: false, error: 'Es obligatorio incluir una nota o justificación de resolución.' };
  }

  note.disputeRecord.resolution = {
    action: data.action,
    resolvedByUserId: state.currentUser.id,
    resolvedByUserName: state.currentUser.name,
    resolutionNote: data.resolutionNote.trim(),
    resolvedAt: new Date().toISOString(),
  };

  if (data.action === 'ACEPTADA_CON_AJUSTE') {
    if (data.adjustedNormalHours !== undefined) note.normalHours = data.adjustedNormalHours;
    if (data.adjustedExtraHours !== undefined) note.extraHours = data.adjustedExtraHours;
    note.totalHours = note.normalHours + note.extraHours;
  }

  note.status = 'Confirmed';
  note.dispute = note.disputeRecord;
  note.updatedAt = new Date().toISOString();

  logAudit(
    'DeliveryNote',
    note.id,
    'DISPUTE_RESOLVED',
    `Disputa resuelta (${data.action}): ${data.resolutionNote.trim()}.`,
    note.code,
    note.sourceDailyReportId,
    note.id
  );

  dispatchSync('deliveryNote', note);
  return { success: true };
};

export const uploadDeliveryNote = (
  state: AppState,
  data: {
    projectId: string;
    projectNameSnapshot: string;
    normalHours: number;
    extraHours: number;
    correctionNotice?: string;
    evidenceUrls?: string[];
  },
  logAudit: (
    affectedEntity: string,
    recordId: string,
    operation: string,
    details: string,
    recordCode?: string,
    deliveryNoteId?: string
  ) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; note?: DeliveryNote; error?: string } => {
  if (!state.currentUser) {
    return { success: false, error: 'Acceso no autorizado.' };
  }

  const now = new Date().toISOString();
  const code = `DN-${now.split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const targetProject = state.projects.find((p: Project) => p.id === data.projectId);
  const mainContractorId = targetProject?.companyId || 'comp_main';

  const note: DeliveryNote = {
    id: `dn_${Date.now()}`,
    code,
    companyId: mainContractorId,
    mainContractorCompanyId: mainContractorId,
    sourceDailyReportId: 'dr_direct_upload',
    sourceDailyReportCode: 'CARGA_DIRECTA',
    dailyReportCodeSnapshot: 'CARGA_DIRECTA',
    projectId: data.projectId,
    projectNameSnapshot: data.projectNameSnapshot,
    date: now.split('T')[0],
    subcontractorCompanyId: state.currentUser.companyId || 'comp_sub_default',
    subcontractorCompanyName: state.currentUser.companyName || 'Empresa Subcontratada',
    workEntries: [],
    normalHours: data.normalHours,
    extraHours: data.extraHours,
    totalHours: data.normalHours + data.extraHours,
    status: 'Pending',
    correctionNotice: data.correctionNotice || '',
    createdAt: now,
    updatedAt: now,
  };

  state.deliveryNotes.push(note);
  logAudit(
    'DeliveryNote',
    note.id,
    'REPORT_CREATED',
    `Albarán ${note.code} subido y registrado directamente desde dispositivo móvil.`,
    note.code,
    note.id
  );

  dispatchSync('deliveryNote', note);
  return { success: true, note };
};
