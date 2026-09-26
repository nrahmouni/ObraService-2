import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Users, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { AppState, DeliveryNote, WorkEntry } from '../../types';
import { obraStore } from '../../services/store';
import { toast } from 'react-hot-toast';

interface NewDeliveryNoteModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
}

export const NewDeliveryNoteModal: React.FC<NewDeliveryNoteModalProps> = ({ state, isOpen, onClose }) => {
  const currentUser = state.currentUser;
  const projects = state.projects || [];
  const companies = state.companies || [];

  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [subcontractorId, setSubcontractorId] = useState(
    currentUser?.role === 'SUBCONTRACTOR_USER' ? currentUser.companyId : (companies.find(c => c.type === 'SUBCONTRACTOR')?.id || '')
  );
  const [noteCode, setNoteCode] = useState(`ALB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [normalHours, setNormalHours] = useState(8);
  const [extraHours, setExtraHours] = useState(0);
  const [description, setDescription] = useState('Suministro de materiales y personal de ferralla en zapata Z-04.');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isScanningOCR, setIsScanningOCR] = useState(false);

  if (!isOpen) return null;

  const handleSimulateOCR = () => {
    setIsScanningOCR(true);
    setTimeout(() => {
      setIsScanningOCR(false);
      setNoteCode(`ALB-OCR-${Math.floor(1000 + Math.random() * 9000)}`);
      setNormalHours(8.5);
      setExtraHours(1.5);
      setDescription('Hormigón preparado HA-25/B/20/IIa - 12m³ suministrado en camión hormigonera M-4521-ZG.');
      setPhotoUrl('https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=400&q=80');
      toast.success('OCR completado: Datos del albarán extraídos automáticamente.');
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !subcontractorId) {
      toast.error('Selecciona la obra y la empresa emisora.');
      return;
    }

    const selectedProj = projects.find(p => p.id === projectId);
    const selectedSub = companies.find(c => c.id === subcontractorId);

    const newNote: DeliveryNote = {
      id: `dn_${Date.now()}`,
      code: noteCode,
      companyId: selectedProj?.companyId || 'comp_norte',
      sourceDailyReportId: `dr_manual_${Date.now()}`,
      sourceDailyReportCode: `DR-MANUAL`,
      projectId: projectId,
      projectNameSnapshot: selectedProj?.name || 'Obra',
      date: date,
      subcontractorCompanyId: subcontractorId,
      subcontractorCompanyName: selectedSub?.name || 'Subcontrata S.L.',
      subcontractorCompanyTaxId: selectedSub?.taxId || 'B00000000',
      mainContractorCompanyId: selectedProj?.companyId || 'comp_norte',
      workEntries: [
        {
          id: `we_${Date.now()}`,
          workerId: 'w_manual',
          workerNameSnapshot: currentUser?.name || 'Operario de Tajo',
          workerCategorySnapshot: 'Oficial 1ª',
          companyIdSnapshot: subcontractorId,
          companyNameSnapshot: selectedSub?.name || 'Subcontrata S.L.',
          isSubcontractor: true,
          attendance: 'Presente',
          normalHours: Number(normalHours),
          extraHours: Number(extraHours),
          totalHours: Number(normalHours) + Number(extraHours)
        }
      ],
      normalHours: Number(normalHours),
      extraHours: Number(extraHours),
      totalHours: Number(normalHours) + Number(extraHours),
      status: 'Pending',
      correctionNotice: description,
      evidenceAttachments: photoUrl ? [
        {
          id: `evi_${Date.now()}`,
          url: photoUrl,
          caption: 'Foto del albarán físico sellado en obra',
          uploadedAt: new Date().toISOString(),
          uploadedByUserId: currentUser?.id,
          fileType: 'image/jpeg'
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!state.deliveryNotes) {
      state.deliveryNotes = [];
    }
    state.deliveryNotes.unshift(newNote);

    obraStore.logAuditEvent({
      affectedEntity: 'DeliveryNote',
      recordId: newNote.id,
      recordCode: newNote.code,
      operation: 'DELIVERY_NOTE_GENERATED',
      details: `Albarán ${newNote.code} registrado manualmente por ${currentUser?.name} para la empresa ${selectedSub?.name}.`,
      deliveryNoteId: newNote.id
    });

    obraStore.notify();
    toast.success(`Albarán ${newNote.code} registrado con éxito.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-surface to-brand-bg shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                Registrar Nuevo Albarán
              </h2>
              <p className="text-xs text-brand-muted font-medium">
                Sube una foto de entrega física o rellena los datos de tajo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR Auto-Fill Banner */}
        <div className="px-4 sm:px-6 py-3 bg-brand-bg/80 border-b border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-muted font-medium">
            <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
            <span>¿Tienes el albarán en papel? Escanéalo con OCR automático.</span>
          </div>
          <button
            type="button"
            onClick={handleSimulateOCR}
            disabled={isScanningOCR}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isScanningOCR ? 'Analizando Documento...' : 'Escanear OCR con Cámara'}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Obra Destino
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="input h-11 w-full text-xs font-medium"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Empresa Proveedora / Subcontrata
              </label>
              <select
                value={subcontractorId}
                onChange={(e) => setSubcontractorId(e.target.value)}
                className="input h-11 w-full text-xs font-medium"
                required
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Nº de Albarán / Código
              </label>
              <input
                type="text"
                value={noteCode}
                onChange={(e) => setNoteCode(e.target.value)}
                className="input h-11 w-full text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Fecha de Emisión
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input h-11 w-full text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Horas Ordinarias
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={normalHours}
                onChange={(e) => setNormalHours(Number(e.target.value))}
                className="input h-11 w-full text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                Horas Extraordinarias
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={extraHours}
                onChange={(e) => setExtraHours(Number(e.target.value))}
                className="input h-11 w-full text-xs font-bold text-brand-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
              Descripción de Trabajos / Materiales
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full text-xs font-medium p-3"
              placeholder="Indica partidas ejecutadas, número de camiones o materiales recibidos..."
            />
          </div>

          {photoUrl && (
            <div className="p-3 bg-brand-bg rounded-xl border border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={photoUrl} alt="Foto Albarán" className="w-12 h-12 object-cover rounded-lg border border-brand-border" />
                <span className="text-xs font-bold text-white">Comprobante gráfico adjuntado</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="text-xs text-rose-400 hover:underline"
              >
                Eliminar
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary h-11 px-5 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary h-11 px-6 text-xs font-bold gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Emitir Albarán</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
