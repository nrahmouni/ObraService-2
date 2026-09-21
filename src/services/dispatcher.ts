import { obraStore } from './store';
import { 
  ActionType, 
  SwitchCompanyPayload, 
  SubmitReportPayload, 
  CorrectReportPayload, 
  DisputeNotePayload 
} from './actions';

/**
 * ActionDispatcher - Centralized Command Bus for ObraService
 * Orchestrates complex state transitions across the multi-tenant architecture.
 */
class ActionDispatcher {
  
  /**
   * Dispatches an action to the store with pre/post processing.
   */
  public async dispatch(type: ActionType, payload: any): Promise<{ success: boolean; error?: string; data?: any }> {
    console.log(`[Dispatcher] ⚡ Dispatching: ${type}`, payload);
    
    switch (type) {
      case 'SWITCH_COMPANY_CONTEXT':
        return this.handleSwitchCompany(payload);
      
      case 'SUBMIT_DAILY_REPORT':
        return this.handleSubmitReport(payload);
      
      case 'CORRECT_DAILY_REPORT':
        return this.handleCorrectReport(payload);
      
      case 'CONFIRM_DELIVERY_NOTE':
        return this.handleConfirmDeliveryNote(payload);
      
      case 'DISPUTE_DELIVERY_NOTE':
        return this.handleDisputeNote(payload);
        
      case 'TOGGLE_DEMO_MODE':
        return this.handleToggleDemo();

      default:
        return { success: false, error: `Acción no soportada: ${type}` };
    }
  }

  private handleSwitchCompany(payload: SwitchCompanyPayload): { success: boolean; error?: string } {
    const { companyId } = payload;
    const state = obraStore.getState();
    const targetCompany = state.companies.find(c => c.id === companyId);
    
    if (!targetCompany) {
      return { success: false, error: 'Empresa no encontrada en la red.' };
    }

    // Atomic update of user context
    if (state.currentUser) {
      state.currentUser.companyId = targetCompany.id;
      state.currentUser.companyName = targetCompany.name;
      
      // If switching to a main contractor, usually Site Manager
      // If switching to subcontractor, Subcontractor User
      state.currentUser.role = targetCompany.type === 'MAIN_CONTRACTOR' 
        ? 'SITE_MANAGER' 
        : 'SUBCONTRACTOR_USER';
        
      // Force store refresh
      obraStore.login(state.currentUser.email); 
      return { success: true };
    }
    
    return { success: false, error: 'No hay sesión activa.' };
  }

  private handleSubmitReport(payload: SubmitReportPayload): { success: boolean; error?: string; data?: any } {
    const result = obraStore.submitDailyReport(
      payload.reportId, 
      payload.location, 
      payload.warningAcknowledged
    );
    
    if (result.success) {
      const report = obraStore.getState().reports.find(r => r.id === payload.reportId);
      return { success: true, data: { reportCode: report?.code, notesCreated: result.deliveryNotesCreated } };
    }
    
    return { success: false, error: result.error };
  }

  private handleCorrectReport(payload: CorrectReportPayload): { success: boolean; error?: string } {
    return obraStore.correctDailyReport(
      payload.reportId,
      payload.updatedEntries,
      payload.reason
    );
  }

  private handleConfirmDeliveryNote(noteId: string): { success: boolean; error?: string } {
    return obraStore.confirmDeliveryNote(noteId);
  }

  private handleDisputeNote(payload: DisputeNotePayload): { success: boolean; error?: string } {
    return obraStore.disputeDeliveryNote(payload.noteId, {
      category: payload.category,
      reason: payload.reason,
      proposedNormalHours: payload.proposedHours?.normal,
      proposedExtraHours: payload.proposedHours?.extra
    });
  }

  private handleToggleDemo(): { success: boolean } {
    const isDemo = obraStore.getState().isDemoMode;
    if (isDemo) {
      obraStore.exitDemoMode();
    } else {
      obraStore.enterDemoMode();
    }
    return { success: true };
  }
}

export const dispatcher = new ActionDispatcher();
