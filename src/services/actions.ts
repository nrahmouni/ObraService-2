import { 
  WorkEntry, 
  DisputeCategory, 
  DailyReport, 
  DeliveryNote 
} from '../types';

export type ActionType = 
  | 'SWITCH_COMPANY_CONTEXT'
  | 'SUBMIT_DAILY_REPORT'
  | 'CORRECT_DAILY_REPORT'
  | 'CONFIRM_DELIVERY_NOTE'
  | 'DISPUTE_DELIVERY_NOTE'
  | 'RESOLVE_DISPUTE'
  | 'TOGGLE_DEMO_MODE';

export interface DispatchAction {
  type: ActionType;
  payload: any;
  meta?: {
    timestamp: string;
    source: string;
  };
}

export interface SwitchCompanyPayload {
  companyId: string;
}

export interface SubmitReportPayload {
  reportId: string;
  location?: { lat: number; lng: number };
  warningAcknowledged?: boolean;
}

export interface CorrectReportPayload {
  reportId: string;
  updatedEntries: WorkEntry[];
  reason: string;
}

export interface DisputeNotePayload {
  noteId: string;
  category: DisputeCategory;
  reason: string;
  proposedHours?: { normal: number; extra: number };
}
