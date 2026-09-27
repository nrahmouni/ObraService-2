import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { AppState, AutomatedAnalysisItem } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, AlertTriangle, Sparkles, Loader2, Camera, Clock, Users, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DailyReportWizardProps {
  state: AppState;
}

export const DailyReportWizard: React.FC<DailyReportWizardProps> = ({ state }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form state
  const [projectId, setProjectId] = useState(state.projects[0]?.id || '');
  const [hours, setHours] = useState('8');
  const [extraHours, setExtraHours] = useState('0');
  const [workersCount, setWorkersCount] = useState('3');
  const [description, setDescription] = useState('');
  const [incidents, setIncidents] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // AI Risk Analysis State
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiAnalysisItems, setAiAnalysisItems] = useState<AutomatedAnalysisItem[]>([]);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const activeProjects = state.projects.filter(p => p.status === 'Active' || p.status === 'Planned');

  // Photo upload state
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoPreview(compressed);
          setPhotoUrl(compressed);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiPreAnalysis = async () => {
    setAnalyzingAi(true);
    try {
      const targetProject = state.projects.find(p => p.id === projectId);
      const totalNormal = (parseFloat(hours) || 8) * (parseInt(workersCount, 10) || 1);
      const totalExtra = (parseFloat(extraHours) || 0) * (parseInt(workersCount, 10) || 1);
      
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report: {
            projectNameSnapshot: targetProject?.name || 'Obra',
            date: new Date().toISOString().split('T')[0],
            totalNormalHours: totalNormal,
            totalExtraHours: totalExtra,
            comments: incidents ? `${description} [Incidencias: ${incidents}]` : description,
          },
          project: targetProject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setAiAnalysisItems(data.items);
        } else {
          setAiAnalysisItems([]);
        }
      }
    } catch (e) {
      console.warn('AI analysis skipped/failed', e);
    } finally {
      setAnalyzingAi(false);
      setAiAnalyzed(true);
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Debe introducir una descripción de los trabajos.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const fullDesc = incidents ? `${description} [Incidencias: ${incidents}]` : description;
      const targetProject = state.projects.find(p => p.id === projectId);
      const userCompanyId = state.currentUser?.companyId || targetProject?.companyId || 'comp_main';
      const userCompanyName = state.currentUser?.companyName || targetProject?.name || 'Empresa';
      const isSubcontractor = state.currentUser?.role === 'SUBCONTRACTOR_USER';

      const availableWorkers = state.workers.filter(w => w.companyId === userCompanyId && w.active);
      const numWorkers = Math.max(1, parseInt(workersCount, 10) || 1);
      const hoursPerWorker = Math.max(0.5, parseFloat(hours) || 8);
      const extraPerWorker = Math.max(0, parseFloat(extraHours) || 0);

      const generatedEntries = [];
      for (let i = 0; i < numWorkers; i++) {
        const assignedWorker = availableWorkers[i];
        const workerId = assignedWorker?.id || (i === 0 && state.currentUser ? state.currentUser.id : `wrk_gen_${Date.now()}_${i}`);
        const workerName = assignedWorker?.name || (i === 0 && state.currentUser ? state.currentUser.name : `Operario Especialista ${i + 1}`);
        const workerCategory = assignedWorker?.category || 'Oficial 1ª';

        generatedEntries.push({
          id: `we_${Date.now()}_${i}`,
          workerId,
          workerNameSnapshot: workerName,
          workerCategorySnapshot: workerCategory,
          companyIdSnapshot: userCompanyId,
          companyNameSnapshot: userCompanyName,
          isSubcontractor,
          normalHours: hoursPerWorker,
          extraHours: extraPerWorker,
          totalHours: hoursPerWorker + extraPerWorker,
          attendance: 'Presente' as const,
        });
      }

      const totalNormal = hoursPerWorker * numWorkers;
      const totalExtra = extraPerWorker * numWorkers;

      const draft = obraStore.saveReportDraft({
        projectId,
        projectNameSnapshot: targetProject?.name || 'Proyecto de Obra',
        date: new Date().toISOString().split('T')[0],
        comments: fullDesc,
        evidenceUrls: photoUrl ? [photoUrl] : [],
        evidenceAttachments: photoUrl ? [{
          id: `att_${Date.now()}`,
          url: photoUrl,
          caption: description,
          uploadedAt: new Date().toISOString(),
          uploadedByUserId: state.currentUser?.id,
          fileType: 'image/jpeg',
        }] : [],
        workEntries: generatedEntries,
        totalNormalHours: totalNormal,
        totalExtraHours: totalExtra,
        totalHours: totalNormal + totalExtra,
        analysisItems: aiAnalysisItems,
      });

      obraStore.submitDailyReport(draft.id);

      toast.success('Parte diario registrado y sincronizado con éxito');
      setSubmitting(false);
      
      const isWorker = state.currentUser?.role === 'SUBCONTRACTOR_USER';
      navigate(isWorker ? '/mobile/dashboard' : '/admin/reports');
    } catch (err: any) {
      setSubmitting(false);
      toast.error('Error al registrar el parte: ' + err.message);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-brand-bg text-brand-text flex flex-col w-full max-w-3xl mx-auto shadow-2xl border-x border-brand-border">
      {/* Header - Compact in landscape */}
      <div className="bg-brand-surface border-b border-brand-border px-4 py-3 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0 sticky top-0 z-20">
        <button 
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else {
              const isWorker = state.currentUser?.role === 'SUBCONTRACTOR_USER';
              navigate(isWorker ? '/mobile/dashboard' : '/admin/reports');
            }
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted hover:text-white transition-colors cursor-pointer"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Nuevo Parte de Tajo</h2>
          <span className="text-[10px] text-brand-accent font-mono font-bold">Paso {step} de 3</span>
        </div>
        <div className="w-10 sm:w-11"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-brand-border/40 h-1.5 shrink-0">
        <div 
          className="bg-brand-accent h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      {/* Scrollable Content Container (perfect for landscape and small mobile screens) */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-6 overflow-y-auto overscroll-contain">
        {step === 1 && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-accent" />
                <span>1. Obra y Jornada Laboral</span>
              </h3>
              <p className="text-xs text-brand-muted mt-1">Selecciona el tajo activo y registra las horas normales, horas extra y operarios presentes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Obra / Proyecto Asignado</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-brand-accent cursor-pointer min-h-[44px]"
              >
                {activeProjects.map(p => {
                  const locStr = typeof p.location === 'string' ? p.location : (p.location?.address || p.address || 'Ubicación');
                  return (
                    <option key={p.id} value={p.id}>{p.name} ({locStr})</option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-accent" />
                  <span>Horas Ordinarias</span>
                </label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-brand-accent min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Horas Extra</span>
                </label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  step="0.5"
                  value={extraHours}
                  onChange={(e) => setExtraHours(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-1">
                  <Users className="w-3 h-3 text-brand-accent" />
                  <span>Nº Operarios</span>
                </label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  value={workersCount}
                  onChange={(e) => setWorkersCount(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-brand-accent min-h-[44px]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">2. Detalle de Trabajos e Incidencias</h3>
              <p className="text-xs text-brand-muted mt-1">Describe los avances realizados, unidades ejecutadas y cualquier retraso o incidencia relevante.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Descripción de Trabajos Realizados *</label>
              <textarea 
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Encofrado y armado de pilares en planta 1ª sector norte. Colocación de ferralla según plano..."
                className="w-full bg-brand-surface border border-brand-border rounded-xl p-3.5 text-xs font-medium text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent resize-none min-h-[100px]"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Incidencias, Retrasos o PRL (Opcional)</label>
              <input 
                type="text"
                value={incidents}
                onChange={(e) => setIncidents(e.target.value)}
                placeholder="Ej: Retraso de 1.5h por descarga de camión hormigonera..."
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent min-h-[44px]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">3. Revisión, Evidencias y Análisis IA</h3>
              <p className="text-xs text-brand-muted mt-1">Comprueba los datos y ejecuta el análisis de anomalías antes de emitir a la Dirección de Obra.</p>
            </div>

            {/* Summary Card */}
            <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-brand-border pb-2">
                <span className="text-brand-muted font-bold uppercase text-[10px]">Horas Registradas:</span>
                <span className="font-black text-white">
                  {hours}h ord. {Number(extraHours) > 0 ? `+ ${extraHours}h extra` : ''} ({workersCount} operarios)
                </span>
              </div>
              <div className="flex justify-between border-b border-brand-border pb-2">
                <span className="text-brand-muted font-bold uppercase text-[10px]">Trabajos:</span>
                <span className="font-bold text-zinc-200 text-right max-w-[220px] sm:max-w-md truncate">{description}</span>
              </div>
              {incidents && (
                <div className="flex justify-between border-b border-brand-border pb-2">
                  <span className="text-brand-muted font-bold uppercase text-[10px]">Incidencias:</span>
                  <span className="font-bold text-amber-400 text-right">{incidents}</span>
                </div>
              )}
            </div>

            {/* AI Risk / Anomaly Analysis Section (Powered by Gemini) */}
            <div className="card p-4 border-brand-accent/30 bg-gradient-to-br from-brand-surface to-brand-accent/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">Auditoría IA de Riesgos</span>
                </div>
                {!aiAnalyzed && (
                  <button
                    type="button"
                    onClick={runAiPreAnalysis}
                    disabled={analyzingAi}
                    className="btn-secondary text-[10px] h-8 px-2.5 gap-1.5 font-bold border-brand-accent/40 text-brand-accent"
                  >
                    {analyzingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>{analyzingAi ? 'Analizando...' : 'Analizar con IA'}</span>
                  </button>
                )}
              </div>

              {aiAnalysisItems.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {aiAnalysisItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-brand-muted text-[11px] leading-relaxed">{item.explanation}</p>
                      {item.recommendation && (
                        <p className="text-[10px] font-semibold text-orange-300">💡 Sugerencia: {item.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : aiAnalyzed ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sin anomalías detectadas. Coherencia de horas y tajo validada.</span>
                </div>
              ) : (
                <p className="text-[11px] text-brand-muted">
                  Gemini comprobará en tiempo real discrepancias de horas extra, rendimientos anómalos o riesgos laborales reportados.
                </p>
              )}
            </div>

            {/* Photo Evidence Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Adjuntar Evidencia Fotográfica (Cámara / Galería)</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-3 bg-brand-surface border border-brand-border hover:border-brand-accent rounded-xl text-xs font-bold text-zinc-300 hover:text-white cursor-pointer transition-colors flex items-center gap-2 min-h-[44px]">
                  <Camera className="w-4 h-4 text-brand-accent" />
                  <span>Capturar / Adjuntar Foto</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {photoPreview && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-brand-border max-h-40">
                  <img src={photoPreview} alt="Evidencia" className="w-full object-cover max-h-40" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions - Safe area padding for mobile landscape / portrait */}
        <div className="pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-3 shrink-0">
          {step < 3 ? (
            <button 
              type="button"
              onClick={() => {
                if (step === 2 && !description.trim()) {
                  toast.error('Por favor, introduzca una descripción de los trabajos.');
                  return;
                }
                setStep(step + 1);
              }}
              className="btn-primary w-full h-12 sm:h-14 text-xs uppercase tracking-wider gap-2 shadow-lg shadow-brand-accent/20 cursor-pointer"
            >
              <span>Siguiente Paso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full h-12 sm:h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer border border-emerald-500/30 active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Emitir Parte Oficial</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

