import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Building2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Plus, 
  Minus,
  FileCheck2,
  Zap,
  UserCheck,
  UserX,
  FileText,
  Truck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HardHat,
  Users
} from 'lucide-react';
import { obraStore } from '../services/store';
import { dispatcher } from '../services/dispatcher';
import { WorkEntry, MachineryEntry, AppState } from '../types';

interface NewReportModalProps {
  state: AppState;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({ state, onClose, onSuccess }) => {
  // Wizard Steps: 1: Obra y Fecha, 2: Personal, 3: Maquinaria, 4: Cierre y Envío
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [machineryEntries, setMachineryEntries] = useState<MachineryEntry[]>([]);
  const [comments, setComments] = useState('');
  const [siteConditions, setSiteConditions] = useState('Jornada estándar');
  const [submittedReceipt, setSubmittedReceipt] = useState<{ reportCode: string; notesCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProjects = (state.projects || []).filter(p => p.status === 'Active' || p.status === 'Planned');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjects[0]?.id || '');
  const selectedProject = (state.projects || []).find(p => p.id === selectedProjectId) || activeProjects[0];

  useEffect(() => {
    if (!selectedProject) return;

    const currentUser = state.currentUser;
    if (!currentUser) return;

    const projectWorkers = (state.workers || []).filter(w => {
      if (!w.active) return false;
      if (currentUser.role === 'SUBCONTRACTOR_USER') {
        return w.companyId === currentUser.companyId;
      }
      const authorizedCompanyIds = [
        selectedProject.companyId,
        ...(selectedProject.assignedSubcontractorIds || [])
      ];
      return authorizedCompanyIds.includes(w.companyId);
    });

    const companyMap = new Map((state.companies || []).map(c => [c.id, c]));

    const entries: WorkEntry[] = projectWorkers.map(w => {
      const comp = companyMap.get(w.companyId);
      return {
        id: `we_${w.id}_${Date.now()}`,
        workerId: w.id,
        workerNameSnapshot: w.name,
        workerCategorySnapshot: w.category,
        companyIdSnapshot: w.companyId,
        companyNameSnapshot: comp?.name || 'Constructora',
        isSubcontractor: comp?.type === 'SUBCONTRACTOR',
        normalHours: 8,
        extraHours: 0,
        totalHours: 8,
        attendance: 'Presente',
      };
    });
    setWorkEntries(entries);

    // Initial machinery entries
    const relevantCompanyIds = projectWorkers.map(pw => pw.companyId);
    const uniqueCompanyIds = Array.from(new Set(relevantCompanyIds));
    const projectMachinery = (state.machinery || []).filter(m => m.active && uniqueCompanyIds.includes(m.companyId));
    
    const macEntries: MachineryEntry[] = projectMachinery.map(m => ({
      id: `me_${m.id}_${Date.now()}`,
      machineryId: m.id,
      machineryNameSnapshot: m.name,
      companyIdSnapshot: m.companyId,
      hours: 0,
    }));
    setMachineryEntries(macEntries);
  }, [selectedProjectId, state.workers, state.machinery, state.companies, selectedProject]);

  const toggleAttendance = (workerId: string) => {
    setWorkEntries(prev => prev.map(e => {
      if (e.workerId !== workerId) return e;
      const isPresent = e.attendance === 'Presente';
      return {
        ...e,
        attendance: isPresent ? 'Ausente' : 'Presente',
        normalHours: isPresent ? 0 : 8,
        totalHours: isPresent ? 0 : 8,
        extraHours: 0
      };
    }));
  };

  const adjustHours = (workerId: string, type: 'normal' | 'extra', delta: number) => {
    setWorkEntries(prev => prev.map(e => {
      if (e.workerId !== workerId || e.attendance !== 'Presente') return e;
      const newVal = Math.max(0, Math.min(24, (type === 'normal' ? e.normalHours : e.extraHours) + delta));
      const next = { ...e, [type === 'normal' ? 'normalHours' : 'extraHours']: newVal };
      return { ...next, totalHours: next.normalHours + next.extraHours };
    }));
  };

  const adjustMachineryHours = (machineryId: string, delta: number) => {
    setMachineryEntries(prev => prev.map(e => {
      if (e.machineryId !== machineryId) return e;
      return { ...e, hours: Math.max(0, Math.min(24, e.hours + delta)) };
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const draft = obraStore.saveReportDraft({
        projectId: selectedProject.id,
        projectNameSnapshot: selectedProject.name,
        date: reportDate,
        workEntries,
        machineryEntries: machineryEntries.filter(e => e.hours > 0),
        totalNormalHours: workEntries.reduce((a, b) => a + b.normalHours, 0),
        totalExtraHours: workEntries.reduce((a, b) => a + b.extraHours, 0),
        totalHours: workEntries.reduce((a, b) => a + b.totalHours, 0),
        comments,
        siteConditions,
        evidenceUrls: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'],
      });

      const res = await dispatcher.dispatch('SUBMIT_DAILY_REPORT', { 
        reportId: draft.id,
        warningAcknowledged: true
      });

      if (res.success) {
        setSubmittedReceipt({
          reportCode: res.data?.reportCode || draft.code || 'OS-PARTE-ACTUAL',
          notesCount: res.data?.notesCreated || 0,
        });
      } else {
        setErrorMessage(res.error || 'Error al emitir el parte de obra.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error inesperado al emitir el parte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { number: 1, label: 'Obra & Fecha' },
    { number: 2, label: 'Personal' },
    { number: 3, label: 'Maquinaria' },
    { number: 4, label: 'Emisión' },
  ];

  const presentCount = workEntries.filter(w => w.attendance === 'Presente').length;
  const totalHoursWorked = workEntries.reduce((sum, w) => sum + w.totalHours, 0);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top Bar with Step Indicators */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            aria-label="Cerrar Wizard"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">
              Asistente de Parte Diario
            </span>
            <h2 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>Paso {currentStep} de 4:</span>
              <span className="text-slate-400 font-bold">{stepsList[currentStep - 1].label}</span>
            </h2>
          </div>
        </div>

        {/* Tactical Step Dots */}
        <div className="flex items-center gap-1.5">
          {stepsList.map(s => (
            <div
              key={s.number}
              className={`h-2 rounded-full transition-all ${
                s.number === currentStep 
                  ? 'w-6 bg-[#FF6600]' 
                  : s.number < currentStep 
                    ? 'w-2 bg-emerald-500' 
                    : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Wizard Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl w-full mx-auto pb-28">
        {errorMessage && (
          <div className="mb-4 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submittedReceipt ? (
          /* Confirmation Receipt View */
          <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10">
              <FileCheck2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                ¡Parte Diario Emitido con Éxito!
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
                {submittedReceipt.reportCode}
              </h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                El parte diario ha sido guardado e indexado. Se generaron{' '}
                <strong className="text-white">{submittedReceipt.notesCount} albaranes automáticos</strong>{' '}
                para las subcontratas implicadas.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-left max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Obra:</span>
                <span className="font-bold text-white">{selectedProject?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Personal Presente:</span>
                <span className="font-bold text-white">{presentCount} operarios</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Horas Totales:</span>
                <span className="font-bold text-white">{totalHoursWorked} horas</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full max-w-sm py-4 bg-[#FF6600] hover:bg-[#e05a00] text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-[#FF6600]/30 transition-all cursor-pointer"
            >
              Volver a la Lista de Partes
            </button>
          </div>
        ) : (
          <>
            {/* STEP 1: OBRA Y FECHA */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <label className="block text-xs font-black text-[#FF6600] uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Selección de Obra</span>
                  </label>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeProjects.map((p) => {
                      const isSelected = p.id === selectedProjectId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProjectId(p.id)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#FF6600]/15 border-[#FF6600] text-white shadow-md'
                              : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-black text-sm uppercase">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.code} • {p.location?.address || 'Madrid, España'}</div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#FF6600] text-white flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <label className="block text-xs font-black text-[#FF6600] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Fecha del Parte Diario</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReportDate(new Date().toISOString().split('T')[0])}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        reportDate === new Date().toISOString().split('T')[0]
                          ? 'bg-white text-slate-900 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        setReportDate(d.toISOString().split('T')[0]);
                      }}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        reportDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                          ? 'bg-white text-slate-900 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Ayer
                    </button>
                  </div>

                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-[#FF6600] outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MANO DE OBRA Y ASISTENCIA */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF6600]" />
                      <span>Cuadrilla Asignada ({workEntries.length})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {presentCount} presentes • {totalHoursWorked} horas registradas
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {workEntries.map((worker) => {
                    const isPresent = worker.attendance === 'Presente';
                    return (
                      <div
                        key={worker.workerId}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPresent
                            ? 'bg-slate-800/80 border-slate-700 text-white'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight">{worker.workerNameSnapshot}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {worker.workerCategorySnapshot} • {worker.companyNameSnapshot}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleAttendance(worker.workerId)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isPresent ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            <span>{isPresent ? 'Presente' : 'Ausente'}</span>
                          </button>
                        </div>

                        {isPresent && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              Horas Jornada
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => adjustHours(worker.workerId, 'normal', -1)}
                                className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-mono font-black text-lg text-white">
                                {worker.normalHours}h
                              </span>
                              <button
                                type="button"
                                onClick={() => adjustHours(worker.workerId, 'normal', 1)}
                                className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: MAQUINARIA Y EQUIPOS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#FF6600]" />
                      <span>Uso de Maquinaria en Obra</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Registra las horas reales de trabajo de la maquinaria en tajo
                    </p>
                  </div>
                </div>

                {machineryEntries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    No hay maquinaria asignada a esta obra. Puedes continuar al paso siguiente.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {machineryEntries.map((m) => (
                      <div
                        key={m.machineryId}
                        className={`p-4 rounded-2xl border transition-all ${
                          m.hours > 0
                            ? 'bg-slate-800/80 border-[#FF6600]/40'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black uppercase text-white">{m.machineryNameSnapshot}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                              Horímetro / Horas de Uso
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => adjustMachineryHours(m.machineryId, -1)}
                              className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-mono font-black text-lg text-white">
                              {m.hours}h
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustMachineryHours(m.machineryId, 1)}
                              className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: EMISIÓN Y FIRMA */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                {/* Tactical Summary Card */}
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3">
                  <div className="text-xs font-black uppercase text-[#FF6600] tracking-wider">
                    Resumen del Parte
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Obra</div>
                      <div className="text-white font-black uppercase truncate mt-0.5">{selectedProject?.name}</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Fecha</div>
                      <div className="text-white font-black font-mono mt-0.5">{reportDate}</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Operarios Presentes</div>
                      <div className="text-white font-black font-mono mt-0.5">{presentCount} operarios</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Horas Totales</div>
                      <div className="text-white font-black font-mono mt-0.5">{totalHoursWorked} horas</div>
                    </div>
                  </div>
                </div>

                {/* Site conditions selector */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                    Condiciones Climatológicas / Tajo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Jornada estándar', 'Lluvia / Viento', 'Incidencia en Tajo'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setSiteConditions(cond)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          siteConditions === cond
                            ? 'bg-[#FF6600] text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observations & Comments */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                    Observaciones y Tareas Realizadas
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Ej: Finalizado encofrado del forjado 2. Vertido de hormigón programado para mañana a primera hora..."
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      {!submittedReceipt && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 z-50 max-w-3xl mx-auto">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FF6600] hover:bg-[#e05a00] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6600]/25 transition-all cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6600] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Emitiendo...' : 'Emitir Parte Diario'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
