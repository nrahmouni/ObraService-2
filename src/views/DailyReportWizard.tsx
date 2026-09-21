import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obraStore } from '../services/store';
import { AppState } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const [workersCount, setWorkersCount] = useState('3');
  const [description, setDescription] = useState('');
  const [incidents, setIncidents] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeProjects = state.projects.filter(p => p.status === 'Active');

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Debe introducir una descripción de los trabajos.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const fullDesc = incidents ? `${description} [Incidencia: ${incidents}]` : description;
      const draft = obraStore.saveReportDraft({
        projectId,
        date: new Date().toISOString().split('T')[0],
        comments: fullDesc,
        workEntries: [{
          id: `we_${Date.now()}`,
          workerId: state.currentUser?.id || 'w_1',
          workerNameSnapshot: state.currentUser?.name || 'Operario',
          workerCategorySnapshot: 'Oficial 1ª',
          companyIdSnapshot: state.currentUser?.companyId || 'comp_sub_1',
          companyNameSnapshot: 'Subcontrata',
          isSubcontractor: true,
          normalHours: Number(hours),
          extraHours: 0,
          totalHours: Number(hours),
          attendance: 'Presente',
        }],
      });

      obraStore.submitDailyReport(draft.id);

      toast.success('Parte diario registrado y enviado con éxito');
      setSubmitting(false);
      navigate('/mobile/dashboard');
    } catch (err: any) {
      setSubmitting(false);
      toast.error('Error al registrar el parte: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <button 
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else navigate('/mobile/dashboard');
          }}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-black uppercase tracking-wider">Nuevo Parte de Tajo</h2>
          <span className="text-[10px] text-[#FF6600] font-mono font-bold">Paso {step} de 3</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 shrink-0">
        <div 
          className="bg-[#FF6600] h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">1. Obra y Jornada Laboral</h3>
              <p className="text-xs text-slate-500 mt-1">Selecciona el tajo activo y registra las horas y operarios en obra.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Obra / Proyecto</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              >
                {activeProjects.map(p => {
                  const locStr = typeof p.location === 'string' ? p.location : (p.location?.address || p.address || 'Ubicación');
                  return (
                    <option key={p.id} value={p.id}>{p.name} ({locStr})</option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horas Totales</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nº Operarios</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  value={workersCount}
                  onChange={(e) => setWorkersCount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">2. Detalle de Trabajos e Incidencias</h3>
              <p className="text-xs text-slate-500 mt-1">Describe los avances realizados y cualquier incidencia relevante en el tajo.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción de Trabajos Realizados *</label>
              <textarea 
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Encofrado y hormigonado de pilares en planta baja sector norte..."
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incidencias o Retrasos (Opcional)</label>
              <input 
                type="text"
                value={incidents}
                onChange={(e) => setIncidents(e.target.value)}
                placeholder="Ej: Retraso de 1h por suministro de hormigón"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">3. Revisión y Evidencia Fotográfica</h3>
              <p className="text-xs text-slate-500 mt-1">Confirma los datos introducidos antes de emitir el parte a la Dirección de Obra.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Horas Registradas:</span>
                <span className="font-black text-slate-900">{hours} hrs ({workersCount} operarios)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Trabajos:</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">{description}</span>
              </div>
              {incidents && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Incidencias:</span>
                  <span className="font-bold text-amber-600">{incidents}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Foto Evidencia (Opcional)</label>
              <input 
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 flex gap-3">
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
              className="w-full bg-[#FF6600] hover:bg-[#e05a00] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6600]/25 transition-all cursor-pointer"
            >
              Siguiente Paso <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Enviar Parte de Tajo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
