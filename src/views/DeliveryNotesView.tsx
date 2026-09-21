import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Printer, 
  ShieldAlert, 
  Check, 
  Eye,
  Zap,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { obraStore } from '../services/store';
import { DeliveryNote, DisputeCategory, AppState } from '../types';
import { Badge } from '../components/ui/Badge';

interface DeliveryNotesViewProps {
  state: AppState;
}

export const DeliveryNotesView: React.FC<DeliveryNotesViewProps> = ({ state }) => {
  const user = state.currentUser;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>('HORAS_INCORRECTAS');
  const [disputeReason, setDisputeReason] = useState('');
  const [proposedHours, setProposedHours] = useState<number>(0);

  // Dispute Resolution Modal State (Admin)
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'Aceptada' | 'Rechazada'>('Aceptada');
  const [resolutionNote, setResolutionNote] = useState('');

  // Printable Document Modal
  const [printDocumentOpen, setPrintDocumentOpen] = useState(false);

  // Action feedback banner
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!user) return null;

  const isSubcontractor = user.role === 'SUBCONTRACTOR_USER';
  const isAdmin = user.role === 'MAIN_CONTRACTOR_ADMIN';
  const isSiteManager = user.role === 'SITE_MANAGER';

  // Role-scoped filtering: Subcontractor sees strictly their company's notes
  const userNotes = isSubcontractor
    ? state.deliveryNotes.filter(n => n.subcontractorCompanyId === user.companyId)
    : state.deliveryNotes;

  const pendingNotes = userNotes.filter(n => n.status === 'Pending');

  const filteredNotes = userNotes.filter((note) => {
    const sourceCode = note.sourceDailyReportCode || note.dailyReportCodeSnapshot || '';
    const matchesSearch = 
      note.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subcontractorCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.projectNameSnapshot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sourceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.date.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 1-CLICK CONFIRMATION
  const handleConfirmNote = (noteId: string) => {
    const res = obraStore.confirmDeliveryNote(noteId);
    if (res.success) {
      setActionFeedback({ type: 'success', message: 'Albarán confirmado y certificado digitalmente con éxito.' });
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === noteId);
      if (updated && selectedNote?.id === noteId) setSelectedNote(updated);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'No se pudo confirmar el albarán.' });
    }
  };

  // 1-CLICK BATCH CONFIRMATION
  const handleBatchConfirmAll = () => {
    const res = obraStore.confirmAllPendingDeliveryNotes();
    if (res.success) {
      setActionFeedback({ 
        type: 'success', 
        message: `¡${res.count} albarán(es) pendientes confirmados y certificados digitalmente!` 
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'Error al confirmar en lote.' });
    }
  };

  const exportDeliveryNoteToPDF = (note: DeliveryNote) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 15;
      let y = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // Navy / Slate-900 for Delivery notes
      doc.rect(margin, y, 180, 16, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ALBARÁN DE CERTIFICACIÓN DE JORNADA - OBRASERVICE', margin + 6, y + 10);

      y += 24;

      // Meta Cards (Contratista & Subcontratista)
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, 180, 32, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, 180, 32, 'S');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      
      doc.setFont('Helvetica', 'bold');
      doc.text('REFERENCIA ALBARÁN:', margin + 6, y + 6);
      doc.setFont('Helvetica', 'normal');
      doc.text(note.code, margin + 45, y + 6);

      doc.setFont('Helvetica', 'bold');
      doc.text('SUBCONTRATA:', margin + 6, y + 12);
      doc.setFont('Helvetica', 'normal');
      doc.text(note.subcontractorCompanyName, margin + 45, y + 12);

      doc.setFont('Helvetica', 'bold');
      doc.text('PROYECTO / OBRA:', margin + 6, y + 18);
      doc.setFont('Helvetica', 'normal');
      doc.text(note.projectNameSnapshot, margin + 45, y + 18);

      doc.setFont('Helvetica', 'bold');
      doc.text('FECHA REGISTRO:', margin + 6, y + 24);
      doc.setFont('Helvetica', 'normal');
      doc.text(note.date, margin + 45, y + 24);

      y += 40;

      // Table Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('HORAS IMPUTADAS POR EL PERSONAL DE SUBCONTRATA', margin, y);
      y += 6;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 180, 8, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      doc.text('OPERARIO', margin + 4, y + 5.5);
      doc.text('CATEGORÍA', margin + 65, y + 5.5);
      doc.text('H. NORMALES', margin + 115, y + 5.5);
      doc.text('H. EXTRAS', margin + 145, y + 5.5);
      doc.text('TOTAL', margin + 172, y + 5.5);

      y += 8;

      // Rows
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const entries = note.workEntries || [];
      entries.forEach(line => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.text(line.workerNameSnapshot, margin + 4, y + 5.5);
        doc.setFont('Helvetica', 'normal');
        doc.text(line.workerCategorySnapshot, margin + 65, y + 5.5);
        doc.text(`${line.normalHours}h`, margin + 115, y + 5.5);
        doc.text(`${line.extraHours}h`, margin + 145, y + 5.5);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${line.totalHours}h`, margin + 172, y + 5.5);

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 8, margin + 180, y + 8);
        y += 8;
      });

      y += 4;

      // Totals Box
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 115, y, 65, 18, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin + 115, y, 65, 18, 'S');

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'bold');
      doc.text('Total Horas Norm.:', margin + 118, y + 5);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${note.normalHours}h`, margin + 168, y + 5);

      doc.setFont('Helvetica', 'bold');
      doc.text('Total Horas Ext.:', margin + 118, y + 10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${note.extraHours}h`, margin + 168, y + 10);

      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.text('SUMA TOTAL:', margin + 118, y + 15);
      doc.text(`${note.totalHours}h`, margin + 168, y + 15);

      y += 30;

      // Verification / Status stamp
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      if (note.status === 'Confirmed') {
        doc.setFillColor(240, 253, 250); // Green BG
        doc.rect(margin, y, 180, 16, 'F');
        doc.setDrawColor(187, 247, 208);
        doc.rect(margin, y, 180, 16, 'S');

        doc.setFontSize(8.5);
        doc.setTextColor(21, 128, 61); // Green-700
        doc.setFont('Helvetica', 'bold');
        doc.text('ESTADO: ALBARÁN CERTIFICADO DIGITALMENTE', margin + 5, y + 6);
        
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        const signerName = note.confirmationDetails?.confirmedByUserName || 'Apoderado / Representante de Subcontrata';
        doc.text(`Confirmado electrónicamente por ${signerName} en fecha ${note.confirmationDetails?.confirmedAt ? new Date(note.confirmationDetails.confirmedAt).toLocaleDateString() : new Date().toLocaleDateString()}.`, margin + 5, y + 11);
      } else {
        doc.setFillColor(254, 243, 199); // Amber BG
        doc.rect(margin, y, 180, 16, 'F');
        doc.setDrawColor(253, 230, 138);
        doc.rect(margin, y, 180, 16, 'S');

        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9); // Amber-700
        doc.setFont('Helvetica', 'bold');
        doc.text('ESTADO: PENDIENTE DE CERTIFICACIÓN', margin + 5, y + 6);
        
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Este documento carece de firma electrónica vinculante de la subcontrata. Requiere acción en la plataforma.`, margin + 5, y + 11);
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Sello de auditoría de ObraService. Cadena de Custodia Inmutable para Empresas Subcontratistas.`, margin, 282);

      doc.save(`Albaran_Socio_${note.code}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al exportar el albarán a PDF.');
    }
  };

  // MAX 3 CLICKS: PRESET DISPUTE GENERATOR
  const handleOpenDispute = (note: DeliveryNote) => {
    setSelectedNote(note);
    setDisputeReason('Discrepancia en el cómputo total de horas ordinarias del operario.');
    setDisputeCategory('HORAS_INCORRECTAS');
    setProposedHours(Math.max(0, note.totalHours - 2));
    setDisputeModalOpen(true);
  };

  const applyDisputePreset = (category: DisputeCategory, reasonText: string, hourOffset: number) => {
    setDisputeCategory(category);
    setDisputeReason(reasonText);
    if (selectedNote) {
      setProposedHours(Math.max(0, selectedNote.totalHours + hourOffset));
    }
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;

    const res = obraStore.disputeDeliveryNote(selectedNote.id, {
      category: disputeCategory,
      reason: disputeReason,
      proposedNormalHours: proposedHours,
    });

    if (res.success) {
      setDisputeModalOpen(false);
      setActionFeedback({ type: 'success', message: `Alegación formal registrada para ${selectedNote.code}. Estado cambiado a DISPUTADO.` });
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === selectedNote.id);
      if (updated) setSelectedNote(updated);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'No se pudo registrar la disputa.' });
    }
  };

  // MAX 3 CLICKS: PRESET RESOLUTION
  const handleOpenResolve = (note: DeliveryNote) => {
    setSelectedNote(note);
    setResolutionAction('Aceptada');
    setResolutionNote('Revisado con jefe de obra y verificado registro de acceso en caseta. Se aprueba la corrección de horas solicitada.');
    setResolveModalOpen(true);
  };

  const applyResolutionPreset = (action: 'Aceptada' | 'Rechazada', noteText: string) => {
    setResolutionAction(action);
    setResolutionNote(noteText);
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;

    const res = obraStore.resolveDispute(selectedNote.id, {
      action: resolutionAction === 'Aceptada' ? 'ACEPTADA_CON_AJUSTE' : 'DESESTIMADA_JUSTIFICADA',
      resolutionNote: resolutionNote,
    });
    if (res.success) {
      setResolveModalOpen(false);
      setActionFeedback({ type: 'success', message: `Disputa del albarán ${selectedNote.code} resuelta formalmente.` });
      const updated = obraStore.getState().deliveryNotes.find(n => n.id === selectedNote.id);
      if (updated) setSelectedNote(updated);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'No se pudo registrar la resolución.' });
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Feedback Banner */}
      {actionFeedback && (
        <div className={`mb-4 p-2.5 rounded border flex items-center justify-between text-[10px] font-bold transition-all shadow-sm ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">Contabilidad</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certificación de Albaranes</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Albaranes Digitales</h1>
        </div>

        <div className="flex items-center gap-2">
          {pendingNotes.length > 0 && (
            <button
              onClick={handleBatchConfirmAll}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Zap className="w-3 h-3" />
              Confirmar Lote ({pendingNotes.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-[#FF6600]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filtrar:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]/30"
          >
            <option value="ALL">TODOS ({userNotes.length})</option>
            <option value="Pending">PENDIENTES ({userNotes.filter(n => n.status === 'Pending').length})</option>
            <option value="Confirmed">CONFIRMADOS ({userNotes.filter(n => n.status === 'Confirmed').length})</option>
            <option value="Disputed">EN DISPUTA ({userNotes.filter(n => n.status === 'Disputed').length})</option>
          </select>
        </div>
      </div>

      {/* Delivery Notes Table */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin albaranes registrados</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Código</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Subcontrata</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Proyecto</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Horas</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-4 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredNotes.map((note) => {
                  const isPending = note.status === 'Pending';
                  const isDisputed = note.status === 'Disputed';

                  return (
                    <tr key={note.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedNote(note)}>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black text-[#FF6600] uppercase">{note.code}</span>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{note.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-bold text-slate-900 uppercase">{note.subcontractorCompanyName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-bold text-slate-700 truncate max-w-[150px] uppercase">{note.projectNameSnapshot}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs font-black text-slate-900 tracking-tight">{note.totalHours}H</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge status={note.status} className="text-[8px] px-1.5 py-0" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleConfirmNote(note.id); }}
                              className="bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white px-2 py-1 rounded font-black text-[8px] uppercase tracking-widest transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                          {isAdmin && isDisputed && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenResolve(note); }}
                              className="bg-indigo-100 hover:bg-indigo-600 text-indigo-800 hover:text-white px-2 py-1 rounded font-black text-[8px] uppercase tracking-widest transition-colors"
                            >
                              Resolver
                            </button>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6600]" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delivery Note Detail Drawer / Modal */}
      {selectedNote && !disputeModalOpen && !resolveModalOpen && !printDocumentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xs animate-in fade-in duration-300" onClick={() => setSelectedNote(null)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CBD5E1] max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-between gap-4 shrink-0 relative">
              <div className="min-w-0 pr-8 sm:pr-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="code-tracking-id text-xs text-[#0F172A] font-mono font-bold">
                    {selectedNote.code}
                  </span>
                  <Badge status={selectedNote.status} />
                </div>
                <h2 className="text-sm sm:text-base font-black text-[#0F172A] mt-1 font-display truncate">
                  Albarán — {selectedNote.subcontractorCompanyName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-slate-700 hover:text-[#0F172A] p-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                title="Cerrar albarán"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8FAFC] rounded border border-[#CBD5E1]">
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase font-bold">Proyecto</span>
                  <strong className="text-[#0F172A] block truncate">{selectedNote.projectNameSnapshot}</strong>
                </div>
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase font-bold">Fecha Jornada</span>
                  <strong className="text-[#0F172A]">{selectedNote.date}</strong>
                </div>
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase font-bold">Parte Diario Origen</span>
                  <strong className="text-[#D97706] font-mono">{selectedNote.sourceDailyReportCode || selectedNote.dailyReportCodeSnapshot || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase font-bold">CIF Subcontrata</span>
                  <strong className="text-[#0F172A] font-mono">{state.companies.find(c => c.id === selectedNote.subcontractorCompanyId)?.taxId || selectedNote.subcontractorCompanyTaxId || '—'}</strong>
                </div>
              </div>

              {/* Status Banner */}
              {selectedNote.status === 'Confirmed' && (selectedNote.confirmationDetails || selectedNote.confirmedBy) && (
                (() => {
                  const conf = selectedNote.confirmationDetails || selectedNote.confirmedBy;
                  return (
                    <div className="p-3.5 bg-[#D1FAE5] border border-[#059669]/40 rounded text-[#065F46] flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                      <div>
                        <div className="font-extrabold uppercase text-xs">Albarán certificado digitalmente</div>
                        <div className="text-[11px] text-[#047857] mt-0.5">
                          Confirmado por <strong>{conf?.confirmedByUserName || conf?.name}</strong> el {new Date(conf?.confirmedAt || conf?.timestamp || '').toLocaleString('es-ES')}.
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {selectedNote.status === 'Disputed' && (selectedNote.disputeRecord || selectedNote.dispute) && (
                (() => {
                  const disp = selectedNote.disputeRecord || selectedNote.dispute;
                  return (
                    <div className="p-4 bg-[#FFE4E6] border border-[#E11D48]/40 rounded text-[#9F1239] space-y-2">
                      <div className="flex items-center gap-2 font-extrabold uppercase text-xs">
                        <ShieldAlert className="w-5 h-5 text-[#E11D48] shrink-0" />
                        <span>Alegación formal registrada por la subcontrata</span>
                      </div>
                      <div className="text-xs text-[#9F1239] bg-white p-3 rounded border border-[#E11D48]/30">
                        <div><strong>Categoría:</strong> {disp?.category}</div>
                        <div><strong>Motivo:</strong> "{disp?.reason}"</div>
                        {(disp?.proposedNormalHours !== undefined || (disp as any)?.proposedHours !== undefined) && (
                          <div className="mt-1 font-extrabold text-[#D97706]">
                            Horas propuestas por la subcontrata: {disp?.proposedNormalHours ?? (disp as any)?.proposedHours}h
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-700">
                        Alegado por {disp?.actorName} el {new Date(disp?.createdAt || (disp as any)?.timestamp || '').toLocaleString('es-ES')}.
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Workers Table */}
              <div>
                <h3 className="font-extrabold text-[#0F172A] uppercase tracking-wider mb-2 text-xs font-display">
                  Líneas de Personal Asignadas ({(selectedNote.workEntries || selectedNote.lines || []).length})
                </h3>
                <div className="border border-[#CBD5E1] rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] text-slate-700 font-extrabold border-b border-[#CBD5E1] text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Operario</th>
                        <th className="p-2.5">Categoría</th>
                        <th className="p-2.5 text-right">Horas Normales</th>
                        <th className="p-2.5 text-right">Horas Extra</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1]">
                      {(selectedNote.workEntries || selectedNote.lines || []).map((line) => (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-[#0F172A]">
                            {line.workerNameSnapshot}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            {line.workerCategorySnapshot}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[#0F172A]">
                            {line.normalHours}h
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#D97706]">
                            {line.extraHours}h
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-[#0F172A]">
                            {line.totalHours}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#F8FAFC] font-extrabold border-t border-[#CBD5E1] text-[#0F172A]">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-right uppercase text-[10px]">Totales Acumulados:</td>
                        <td className="p-2.5 text-right font-mono">{selectedNote.normalHours}h</td>
                        <td className="p-2.5 text-right font-mono text-[#D97706]">{selectedNote.extraHours}h</td>
                        <td className="p-2.5 text-right font-mono text-sm">{selectedNote.totalHours}h</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Level 3: Operational Tray */}
            <div className="p-4 border-t-2 border-[#0F172A] bg-white flex items-center justify-between gap-2 shadow-[0_-4px_12px_0_rgba(15,23,42,0.12)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportDeliveryNoteToPDF(selectedNote)}
                  className="min-h-[44px] px-3.5 py-2 rounded text-xs font-bold text-white bg-[#FF6600] hover:bg-[#e65c00] transition-colors flex items-center gap-1.5 cursor-pointer uppercase"
                  title="Descargar albarán en formato PDF vectorial"
                >
                  <FileText className="w-4 h-4" />
                  <span>Exportar PDF</span>
                </button>

                <button
                  onClick={() => setPrintDocumentOpen(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded text-xs font-bold text-slate-700 bg-white border border-[#CBD5E1] hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer uppercase"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => setSelectedNote(null)}
                  className="min-h-[44px] px-3.5 py-2 rounded text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer uppercase border border-slate-200/60"
                >
                  <X className="w-4 h-4" />
                  <span>Cerrar</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* 1-Click Actions for Subcontractor User when Pending */}
                {selectedNote.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleOpenDispute(selectedNote)}
                      className="min-h-[44px] px-4 py-2 rounded text-xs font-extrabold text-[#E11D48] bg-rose-50 hover:bg-rose-100 transition-colors uppercase cursor-pointer"
                    >
                      Disputar Albarán
                    </button>
                    <button
                      onClick={() => handleConfirmNote(selectedNote.id)}
                      className="min-h-[44px] px-5 py-2 rounded text-xs font-black uppercase tracking-wider text-white bg-[#059669] hover:bg-[#047857] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:translate-y-px"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar Conformidad</span>
                    </button>
                  </>
                )}

                {/* Actions for Admin when Disputed */}
                {isAdmin && selectedNote.status === 'Disputed' && (
                  <button
                    onClick={() => handleOpenResolve(selectedNote)}
                    className="min-h-[44px] px-5 py-2 rounded text-xs font-black uppercase tracking-wider text-white bg-[#0F172A] hover:bg-[#1E293B] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-[#D97706]" />
                    <span>Resolver Disputa</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedNote(null)}
                  className="min-h-[44px] px-4 py-2 rounded text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer uppercase"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal (Subcontractor User) — OPTIMIZED FOR MAX 3 CLICKS */}
      {disputeModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden">
            <div className="p-4 border-b border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E11D48] font-display">
                  Alegación Formal de Albarán (Máx 3 Clics)
                </span>
                <h2 className="text-sm font-black text-[#0F172A] font-display">
                  Disputar {selectedNote.code}
                </h2>
              </div>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="text-slate-700 hover:text-[#0F172A] p-2 rounded hover:bg-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="p-5 space-y-4 text-xs">
              {/* 1-CLICK PRESET BUTTONS (Click 2 of the 3-click workflow) */}
              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase tracking-wide">
                  Motivos Rápidos Preconfigurados (Clic 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyDisputePreset('HORAS_INCORRECTAS', 'Discrepancia en el cómputo total de horas ordinarias del operario.', -2)}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-rose-50 text-left text-slate-700 hover:text-[#9F1239] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    ⚖️ Exceso de horas computadas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisputePreset('TRABAJADOR_AUSENTE', 'El operario asignado no asistió a este tajo el día registrado.', 0)}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-rose-50 text-left text-slate-700 hover:text-[#9F1239] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    🚫 Operario ausente
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisputePreset('HORAS_EXTRA_NO_AUTORIZADAS', 'Horas extraordinarias no autorizadas por la dirección de obra.', -selectedNote.extraHours)}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-rose-50 text-left text-slate-700 hover:text-[#9F1239] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    ⏱️ Horas extra no autorizadas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisputePreset('OTRO', 'Paralización de tajo por falta de suministro de hormigón en obra.', -4)}
                    className="p-2 rounded border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-rose-50 text-left text-slate-700 hover:text-[#9F1239] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    ⚠️ Paralización justificada
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Categoría de la discrepancia *
                </label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value as DisputeCategory)}
                  className="w-full min-h-[44px] px-3 py-2 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] font-bold focus:outline-hidden"
                >
                  <option value="HORAS_INCORRECTAS">Discrepancia en horas normales computadas</option>
                  <option value="OPERARIOS_NO_PRESENTES">Operarios listados no pertenecientes a la cuadrilla</option>
                  <option value="HORAS_EXTRA_NO_AUTORIZADAS">Horas extraordinarias no autorizadas</option>
                  <option value="TRABAJO_NO_CONFORME">Trabajo o categoría profesional no conforme</option>
                  <option value="OTRO">Otro motivo justificativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Motivo justificado *
                </label>
                <textarea
                  required
                  rows={2}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Horas totales que propones
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={proposedHours || ''}
                  onChange={(e) => setProposedHours(parseInt(e.target.value) || 0)}
                  className="w-full sm:w-36 min-h-[44px] px-3 py-1 rounded border border-[#CBD5E1] font-mono text-xs font-bold text-[#0F172A]"
                />
              </div>

              {/* Action Tray: Click 3 of the 3-click workflow */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded text-xs font-black uppercase tracking-wider text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-xs cursor-pointer active:translate-y-px"
                >
                  Registrar Disputa Oficial (Clic 3)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Dispute Resolution Modal — OPTIMIZED FOR MAX 3 CLICKS */}
      {resolveModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden">
            <div className="p-4 border-b border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] font-display">
                  Resolución de Disputa (Máx 3 Clics)
                </span>
                <h2 className="text-sm font-black text-[#0F172A] font-display">
                  Albarán {selectedNote.code}
                </h2>
              </div>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="text-slate-700 hover:text-[#0F172A] p-2 rounded hover:bg-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1]">
                <div className="text-[11px] text-slate-700 font-bold uppercase">Alegación de la subcontrata:</div>
                <div className="font-bold text-[#0F172A] mt-0.5">"{(selectedNote.disputeRecord || selectedNote.dispute)?.reason}"</div>
              </div>

              {/* 1-CLICK PRESET RESOLUTIONS (Click 2) */}
              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase tracking-wide">
                  Dictámenes Rápidos Preconfigurados (Clic 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyResolutionPreset('Aceptada', 'Revisado con el encargado de obra y contrastado con las hojas de control. Se acepta la propuesta de la subcontrata.')}
                    className="p-2.5 rounded border border-[#059669]/40 bg-[#D1FAE5]/50 hover:bg-[#D1FAE5] text-left text-[#065F46] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    ✅ Aceptar y ajustar horas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyResolutionPreset('Rechazada', 'Desestimada tras verificar firma física del capataz en el parte original de obra y geolocalización de presencia.')}
                    className="p-2.5 rounded border border-[#E11D48]/40 bg-[#FFE4E6]/50 hover:bg-[#FFE4E6] text-left text-[#9F1239] transition-colors cursor-pointer text-[11px] font-bold"
                  >
                    ❌ Desestimar con parte original
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Dictamen Formal *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`min-h-[44px] p-2.5 rounded border-2 flex items-center justify-center gap-2 cursor-pointer font-bold ${
                    resolutionAction === 'Aceptada' ? 'border-[#059669] bg-[#D1FAE5] text-[#065F46]' : 'border-[#CBD5E1]'
                  }`}>
                    <input
                      type="radio"
                      name="res"
                      checked={resolutionAction === 'Aceptada'}
                      onChange={() => setResolutionAction('Aceptada')}
                      className="text-[#059669]"
                    />
                    <span>Aceptar Disputa</span>
                  </label>

                  <label className={`min-h-[44px] p-2.5 rounded border-2 flex items-center justify-center gap-2 cursor-pointer font-bold ${
                    resolutionAction === 'Rechazada' ? 'border-[#E11D48] bg-[#FFE4E6] text-[#9F1239]' : 'border-[#CBD5E1]'
                  }`}>
                    <input
                      type="radio"
                      name="res"
                      checked={resolutionAction === 'Rechazada'}
                      onChange={() => setResolutionAction('Rechazada')}
                      className="text-[#E11D48]"
                    />
                    <span>Rechazar Disputa</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0F172A] mb-1 uppercase tracking-wide">
                  Resolución justificada obligatoria *
                </label>
                <textarea
                  required
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-hidden font-medium"
                />
              </div>

              {/* Action Tray: Click 3 */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded text-xs font-black uppercase tracking-wider text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-xs cursor-pointer active:translate-y-px"
                >
                  Emitir Dictamen Oficial (Clic 3)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      {printDocumentOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CBD5E1] max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-3 bg-[#F8FAFC] border-b border-[#CBD5E1] flex items-center justify-between">
              <span className="text-xs font-black text-[#0F172A] font-display uppercase tracking-wider">
                Certificación Oficial de Jornada de Obra
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#0F172A] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setPrintDocumentOpen(false)}
                  className="text-slate-500 hover:text-slate-900 p-1.5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-[#0F172A] font-sans">
              <div className="border-b-2 border-[#0F172A] pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black tracking-tight font-display">ALBARÁN OFICIAL DE JORNADA DE TRABAJO</h2>
                  <div className="font-mono text-xs text-slate-700 mt-1">Ref. Documental: {selectedNote.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm font-display text-[#D97706]">OBRAFLOW PRO</div>
                  <div className="text-[10px] text-slate-700 uppercase font-mono">Cadena de Custodia Digital</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-[#CBD5E1] p-4 rounded bg-[#F8FAFC]">
                <div>
                  <span className="text-[10px] text-slate-700 uppercase font-bold block">Contratista Principal</span>
                  <div className="font-bold text-sm text-[#0F172A]">{state.companies.find(c => c.type === 'MAIN_CONTRACTOR')?.name || 'Contratista'}</div>
                  <div className="text-slate-700 mt-0.5">{selectedNote.projectNameSnapshot}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-700 uppercase font-bold block">Empresa Subcontratista</span>
                  <div className="font-bold text-sm text-[#0F172A]">{selectedNote.subcontractorCompanyName}</div>
                  <div className="text-slate-700 font-mono text-[11px]">CIF: {state.companies.find(c => c.id === selectedNote.subcontractorCompanyId)?.taxId || selectedNote.subcontractorCompanyTaxId || '—'}</div>
                  <div className="text-slate-700 mt-0.5">Fecha imputada: {selectedNote.date}</div>
                </div>
              </div>

              <div>
                <table className="w-full border-collapse border border-[#CBD5E1] text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                      <th className="border border-[#CBD5E1] p-2 text-left font-bold uppercase text-[10px]">Operario</th>
                      <th className="border border-[#CBD5E1] p-2 text-left font-bold uppercase text-[10px]">Categoría</th>
                      <th className="border border-[#CBD5E1] p-2 text-right font-bold uppercase text-[10px]">Horas Norm.</th>
                      <th className="border border-[#CBD5E1] p-2 text-right font-bold uppercase text-[10px]">Horas Extra</th>
                      <th className="border border-[#CBD5E1] p-2 text-right font-bold uppercase text-[10px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedNote.workEntries || selectedNote.lines || []).map(line => (
                      <tr key={line.id} className="border-b border-[#CBD5E1]">
                        <td className="border border-[#CBD5E1] p-2 font-bold text-[#0F172A]">{line.workerNameSnapshot}</td>
                        <td className="border border-[#CBD5E1] p-2 text-slate-700">{line.workerCategorySnapshot}</td>
                        <td className="border border-[#CBD5E1] p-2 text-right font-mono">{line.normalHours}h</td>
                        <td className="border border-[#CBD5E1] p-2 text-right font-mono font-bold text-[#D97706]">{line.extraHours}h</td>
                        <td className="border border-[#CBD5E1] p-2 text-right font-mono font-black text-[#0F172A]">{line.totalHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-extrabold bg-[#F8FAFC]">
                      <td colSpan={2} className="border border-[#CBD5E1] p-2 text-right uppercase text-[10px]">TOTAL COMPUTADO:</td>
                      <td className="border border-[#CBD5E1] p-2 text-right font-mono">{selectedNote.normalHours}h</td>
                      <td className="border border-[#CBD5E1] p-2 text-right font-mono text-[#D97706]">{selectedNote.extraHours}h</td>
                      <td className="border border-[#CBD5E1] p-2 text-right font-mono text-sm text-[#0F172A]">{selectedNote.totalHours}h</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-6 border-t border-[#CBD5E1] grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
                <div className="border-t border-[#0F172A] pt-2">
                  <div className="font-extrabold text-[#0F172A]">Firma Jefatura de Obra</div>
                  <div className="text-[10px] text-slate-700 mt-0.5">Emitido desde parte diario {selectedNote.sourceDailyReportCode || selectedNote.dailyReportCodeSnapshot}</div>
                </div>
                <div className="border-t border-[#0F172A] pt-2">
                  <div className="font-extrabold text-[#0F172A]">Firma / Conformidad Subcontratista</div>
                  <div className="text-[10px] text-slate-700 mt-0.5">
                    {selectedNote.status === 'Confirmed' && (selectedNote.confirmationDetails || selectedNote.confirmedBy)
                      ? `Certificado digitalmente por ${(selectedNote.confirmationDetails || selectedNote.confirmedBy)?.confirmedByUserName || (selectedNote.confirmationDetails || selectedNote.confirmedBy)?.name}`
                      : 'Pendiente de certificación'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
