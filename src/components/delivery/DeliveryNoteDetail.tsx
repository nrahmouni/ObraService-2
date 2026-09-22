import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Printer, FileCheck2, ShieldAlert } from 'lucide-react';
import { DeliveryNote, DisputeCategory } from '../../types';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { toast } from 'react-hot-toast';
import { exportDeliveryNoteToPDF } from '../../utils/deliveryPdf';
import { obraStore } from '../../services/store';

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
      toast.success('Albarán confirmado y certificado digitalmente.');
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
      toast.success('Disputa registrada y enviada a revisión.');
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
      toast.success(`Disputa resuelta como "${resolutionAction}".`);
      setResolveOpen(false);
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === note.id);
      if (updated) onRefreshNote(updated);
    } else {
      toast.error(res.error || 'No se pudo resolver la disputa.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-accent transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Albaranes</span>
      </button>

      {/* Ticket Container */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
          <div>
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">Código Albarán</span>
            <h1 className="text-xl font-black text-slate-200 mt-1">{note.code}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportDeliveryNoteToPDF(note)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer flex items-center gap-2"
              title="Exportar a PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Info Linear Stack */}
        <div className="flex flex-col space-y-2 bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Subcontrata</span>
            <span className="text-xs font-black text-slate-200 uppercase block mt-1">{note.subcontractorCompanyName}</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Obra de Trabajo</span>
            <span className="text-xs font-black text-slate-200 uppercase block mt-1">{note.projectNameSnapshot}</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Fecha Jornada</span>
            <span className="text-xs font-black text-slate-200 uppercase block mt-1">{note.date}</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Suma Horas</span>
            <span className="text-xs font-black text-brand-accent uppercase block mt-1">{note.totalHours} H</span>
          </div>
        </div>

        {/* Worker Hours Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Detalle de Cuadrilla Imputada</h3>
          <div className="flex flex-col space-y-2">
            {note.workEntries?.map((entry, idx) => (
              <div key={idx} className="border border-slate-800 bg-slate-950/60 rounded-xl p-3 flex flex-col space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <span className="font-black text-slate-100 uppercase">{entry.workerNameSnapshot}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{entry.workerCategorySnapshot}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="text-slate-400 font-medium">
                    Horas: <span className="font-bold text-slate-200">{entry.normalHours}h norm</span> + <span className="font-bold text-slate-200">{entry.extraHours}h ext</span>
                  </div>
                  <div className="font-black text-brand-accent font-mono text-xs">
                    Total: {entry.totalHours} H
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Certification Stamps */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            {note.status === 'Confirmed' ? (
              <span className="text-emerald-400">✓ CERTIFICADO DIGITALMENTE</span>
            ) : note.status === 'Disputed' ? (
              <span className="text-rose-400">⚠️ ALBARÁN DISPUTADO</span>
            ) : (
              <span className="text-amber-400">⌛ PENDIENTE DE FIRMA DIGITAL</span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {note.status === 'Confirmed'
              ? `Certificado formalmente por el representante subcontrata ${note.confirmationDetails?.confirmedByUserName} el ${new Date(note.confirmationDetails?.confirmedAt || '').toLocaleDateString()}.`
              : note.status === 'Disputed'
              ? `El contratista principal ha levantado una disputa por: ${note.disputeRecord?.reason || note.dispute?.reason || ''}. Horas propuestas: ${note.disputeRecord?.proposedNormalHours || note.dispute?.proposedNormalHours || ''} H.`
              : `Este documento representa el pre-albarán diario y requiere firma inmutable del representante para certificar el tajo.`}
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            {note.status === 'Pending' && isSubcontractor && (
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-lg cursor-pointer"
              >
                Firma Digital Certificada
              </button>
            )}

            {note.status === 'Pending' && (isAdmin || isSiteManager) && (
              <button 
                onClick={() => setDisputeOpen(true)}
                className="px-4 py-2 bg-rose-950/60 border border-rose-900 text-rose-400 hover:bg-rose-900 text-xs font-black uppercase tracking-widest rounded-lg cursor-pointer"
              >
                Disputar Horas
              </button>
            )}

            {note.status === 'Disputed' && isAdmin && (
              <button 
                onClick={() => setResolveOpen(true)}
                className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-black uppercase tracking-widest rounded-lg cursor-pointer"
              >
                Resolver Disputa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disputing Modal */}
      <Modal isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} title="Levantar Disputa de Horas">
        <form onSubmit={handleDisputeSubmit} className="space-y-4 text-slate-300">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Motivo de Discrepancia</label>
            <select
              value={disputeCategory}
              onChange={(e) => setDisputeCategory(e.target.value as DisputeCategory)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
            >
              <option value="HORAS_INCORRECTAS">Exceso en cómputo de horas</option>
              <option value="AUSENCIA_FALTA">Ausencia de personal listado</option>
              <option value="TRABAJO_NO_REALIZADO">Tajo incompleto o deficiente</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Horas Propuestas de Auditoría</label>
            <input
              type="number"
              value={proposedHours}
              onChange={(e) => setProposedHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Explicación Detallada</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 h-20"
              required
            />
          </div>

          <button type="submit" className="w-full py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-lg">
            Registrar Incidencia
          </button>
        </form>
      </Modal>

      {/* Resolution Modal */}
      <Modal isOpen={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolución de Disputa">
        <form onSubmit={handleResolveSubmit} className="space-y-4 text-slate-300">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Acción Final</label>
            <select
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200"
            >
              <option value="Aceptada">Aceptar albarán con corrección de horas</option>
              <option value="Rechazada">Rechazar albarán por completo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nota de Resolución</label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 h-20"
              required
            />
          </div>

          <button type="submit" className="w-full py-2 bg-brand-accent text-white text-xs font-black uppercase tracking-widest rounded-lg">
            Aplicar Resolución
          </button>
        </form>
      </Modal>
    </div>
  );
};
