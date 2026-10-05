import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Printer, FileCheck2, ShieldAlert, Clock, UserCheck, Calendar, MapPin, Lock, FileDown, Building2 } from 'lucide-react';
import { DeliveryNote, DisputeCategory } from '../../types';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { exportDeliveryNoteToPDF } from '../../utils/deliveryPdf';
import { obraStore } from '../../services/store';
import { Badge } from '../ui/Badge';
import { CertificationStamp } from '../ui/CertificationStamp';

interface DeliveryNoteDetailProps {
  note: DeliveryNote;
  currentUser: {
    role: string;
    name: string;
  };
  onBack: () => void;
  onRefreshNote: (updated: DeliveryNote) => void;
}

export const DeliveryNoteDetail: React.FC<DeliveryNoteDetailProps> = ({
  note,
  currentUser,
  onBack,
  onRefreshNote,
}) => {
  const isSubcontractor = currentUser.role === 'SUBCONTRACTOR_USER';
  const isAdmin = currentUser.role === 'MAIN_CONTRACTOR_ADMIN';
  const isSiteManager = currentUser.role === 'SITE_MANAGER';

  // Disputing modal states
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>('HORAS_INCORRECTAS');
  const [disputeReason, setDisputeReason] = useState('Discrepancia en el cómputo total de horas.');
  const [proposedHours, setProposedHours] = useState<number>(Math.max(0, note.totalHours - 2));

  // Resolving modal states (Admin only)
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'Aceptada' | 'Rechazada'>('Aceptada');
  const [resolutionNote, setResolutionNote] = useState('Resolución de auditoría de jornada.');

  const handleConfirm = () => {
    const res = obraStore.confirmDeliveryNote(note.id);
    if (res.success) {
      toast.success('✨ ¡Albarán certificado con Sello Digital Criptográfico!', {
        icon: '🛡️',
        duration: 4000,
        style: {
          borderRadius: '14px',
          background: '#121215',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          fontWeight: 'bold',
          fontSize: '13px'
        }
      });
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === note.id);
      if (updated) onRefreshNote(updated);
    } else {
      toast.error(res.error || 'No se pudo confirmar.');
    }
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = obraStore.disputeDeliveryNote(note.id, {
      category: disputeCategory,
      reason: disputeReason,
      proposedNormalHours: proposedHours
    });
    if (res.success) {
      toast.success('Disputa enviada a revisión.');
      setDisputeOpen(false);
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === note.id);
      if (updated) onRefreshNote(updated);
    } else {
      toast.error(res.error || 'No se pudo registrar la disputa.');
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = obraStore.resolveDispute(note.id, {
      action: resolutionAction === 'Aceptada' ? 'ACEPTADA_CON_AJUSTE' : 'DESESTIMADA_JUSTIFICADA',
      resolutionNote: resolutionNote,
      adjustedNormalHours: note.normalHours,
      adjustedExtraHours: note.extraHours
    });
    if (res.success) {
      toast.success(`Disputa resuelta.`);
      setResolveOpen(false);
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === note.id);
      if (updated) onRefreshNote(updated);
    } else {
      toast.error(res.error || 'No se pudo resolver la disputa.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Listado</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDeliveryNoteToPDF(note)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-white hover:border-brand-accent transition-all"
            title="Exportar PDF"
          >
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Ticket Layout */}
      <div className="card overflow-hidden border-brand-accent/20 bg-brand-bg/50 backdrop-blur-sm">
        {/* Ticket Header Banner */}
        <div className="p-4 sm:p-8 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
           {/* Background Accent */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
                    <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
                 </div>
                 <div>
                    <h1 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">{note.code}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                       <Badge status={note.status} className="text-[9px] uppercase" />
                       <span className="text-[10px] font-bold text-brand-muted uppercase">{note.date}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="relative z-10 flex flex-col items-start md:items-end gap-0.5 sm:gap-1">
              <div className="text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] sm:tracking-[0.2em]">Suma Total Certificada</div>
              <div className="text-3xl sm:text-4xl font-display font-black text-white font-mono tracking-tighter">
                {note.totalHours}<span className="text-brand-accent text-xl ml-1">H</span>
              </div>
           </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
           {/* Context Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                       <Building2 className="w-3.5 h-3.5 text-brand-accent" />
                       Subcontratista
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white uppercase">{note.subcontractorCompanyName}</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 text-brand-accent" />
                       Obra / Proyecto
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white uppercase">{note.projectNameSnapshot}</div>
                 </div>
              </div>

              <div className="space-y-3 sm:space-y-4 md:text-right">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2 md:justify-end">
                       <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                       Fecha del Tajo
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">{note.date}</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2 md:justify-end">
                       <Clock className="w-3.5 h-3.5 text-brand-accent" />
                       Desglose
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {note.normalHours}N + <span className="text-brand-accent">{note.extraHours}E</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Workers List */}
           <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-accent" />
                Cuadrilla Imputada
              </h3>
              <div className="card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-surface/30">
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest">Operario / Categoría</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest text-right">Horas Certificadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/50">
                    {note.workEntries?.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-brand-bg/20 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs font-bold text-white uppercase">{entry.workerNameSnapshot}</div>
                          <div className="text-[10px] font-medium text-brand-muted mt-0.5 uppercase tracking-wider">
                            {entry.workerCategorySnapshot}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                           <div className="text-sm font-black text-white font-mono">{entry.totalHours}h</div>
                           <div className="text-[9px] font-bold text-brand-muted mt-0.5">
                             {entry.normalHours}N + <span className="text-brand-accent">{entry.extraHours}E</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>

           {/* Status & Certification Alert */}
           <div className={`card p-4 sm:p-6 border-l-4 ${
              note.status === 'Confirmed' ? 'border-emerald-500 bg-emerald-500/5' : 
              note.status === 'Disputed' ? 'border-rose-500 bg-rose-500/5' : 
              'border-amber-500 bg-amber-500/5'
           }`}>
              <div className="flex items-start gap-3 sm:gap-4">
                 <div className="mt-1 shrink-0">
                    {note.status === 'Confirmed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                     note.status === 'Disputed' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> :
                     <ShieldAlert className="w-5 h-5 text-amber-500" />}
                 </div>
                 <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">
                       {note.status === 'Confirmed' ? 'Certificación Digital Completada' :
                        note.status === 'Disputed' ? 'Albarán bajo Disputa' :
                        'Pendiente de Validación por el Proveedor'}
                    </h4>
                    <p className="text-xs text-brand-muted font-medium leading-relaxed">
                      {note.status === 'Confirmed'
                        ? `Albarán firmado electrónicamente por ${note.confirmationDetails?.confirmedByUserName} el ${new Date(note.confirmationDetails?.confirmedAt || '').toLocaleDateString()}. Este registro es ahora inmutable para facturación.`
                        : note.status === 'Disputed'
                        ? `Disputa levantada por la dirección de obra. Motivo: ${note.disputeRecord?.reason || note.dispute?.reason || ''}. Auditoría propuesta: ${note.disputeRecord?.proposedNormalHours || note.dispute?.proposedNormalHours || ''}H.`
                        : `Este pre-albarán requiere la firma digital del representante de la subcontrata para formalizar la producción del día.`}
                    </p>

                    {note.status === 'Confirmed' && (
                      <div className="pt-4 flex justify-end">
                        <CertificationStamp 
                          code={note.code}
                          date={new Date(note.confirmationDetails?.confirmedAt || note.date).toLocaleDateString()}
                          signatory={note.confirmationDetails?.confirmedByUserName || 'Responsable de Subcontrata'}
                          companyName={note.subcontractorCompanyName}
                          variant="emerald"
                        />
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {note.status === 'Pending' && isSubcontractor && (
                  <button 
                    onClick={handleConfirm}
                    className="btn-primary h-11 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 w-full sm:w-auto justify-center"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Firmar Digitalmente</span>
                  </button>
                )}

                {note.status === 'Pending' && (isAdmin || isSiteManager) && (
                  <button 
                    onClick={() => setDisputeOpen(true)}
                    className="btn-primary h-11 px-8 bg-rose-600 hover:bg-rose-700 shadow-rose-900/20 w-full sm:w-auto justify-center"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Levantar Disputa</span>
                  </button>
                )}

                {note.status === 'Disputed' && isAdmin && (
                  <button 
                    onClick={() => setResolveOpen(true)}
                    className="btn-primary h-11 px-8 w-full sm:w-auto justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolver Auditoría</span>
                  </button>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Modals for Dispute and Resolution */}
      <Modal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} title="Disputar Horas de Albarán">
        <form onSubmit={handleDisputeSubmit} className="space-y-5 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Motivo Técnico</label>
            <select
              value={disputeCategory}
              onChange={(e) => setDisputeCategory(e.target.value as DisputeCategory)}
              className="select"
            >
              <option value="HORAS_INCORRECTAS">Exceso de jornada reportada</option>
              <option value="AUSENCIA_FALTA">Operario no presente en tajo</option>
              <option value="TRABAJO_NO_REALIZADO">Ejecución incompleta o rechazada</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Horas Propuestas (Auditoría)</label>
            <input
              type="number"
              value={proposedHours}
              onChange={(e) => setProposedHours(parseFloat(e.target.value) || 0)}
              className="input font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Justificación Detallada</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="input min-h-[100px] py-3"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full h-12 bg-rose-600 hover:bg-rose-700">
            Confirmar Disputa
          </button>
        </form>
      </Modal>

      <Modal isOpen={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolución de Auditoría">
        <form onSubmit={handleResolveSubmit} className="space-y-5 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Acción Final</label>
            <select
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value as any)}
              className="select"
            >
              <option value="Aceptada">Aceptar albarán con corrección de horas</option>
              <option value="Rechazada">Desestimar albarán por completo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Resolución de Facturación</label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="input min-h-[100px] py-3"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full h-12">
            Aplicar Resolución Final
          </button>
        </form>
      </Modal>
    </div>
  );
};
