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
  Truck
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
  const [reportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [machineryEntries, setMachineryEntries] = useState<MachineryEntry[]>([]);
  const [comments, setComments] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<{ reportCode: string; notesCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeProjects = (state.projects || []).filter(p => p.status === 'Active');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjects[0]?.id || '');
  const selectedProject = (state.projects || []).find(p => p.id === selectedProjectId);

  useEffect(() => {
    if (!selectedProject) return;

    // Filter workers belonging to the projects context (Network Node)
    // Only workers from the Main Contractor OR assigned Subcontractors
    const currentUser = state.currentUser;
    if (!currentUser) return;

    const projectWorkers = (state.workers || []).filter(w => {
      if (!w.active) return false;
      
      // If user is from a subcontractor, only show their own workers
      if (currentUser.role === 'SUBCONTRACTOR_USER') {
        return w.companyId === currentUser.companyId;
      }

      // If user is Main Contractor, show workers of the company and assigned subcontractors
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

    // Initial machinery entries (all machinery of the relevant companies)
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
    
    // First save the draft
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
      siteConditions: 'Jornada estándar',
      evidenceUrls: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'],
    });

    // Dispatch the submission through central dispatcher
    const res = await dispatcher.dispatch('SUBMIT_DAILY_REPORT', { 
      reportId: draft.id,
      warningAcknowledged: true
    });

    if (res.success) {
      setSubmittedReceipt({
        reportCode: res.data?.reportCode || 'OS-PART-101',
        notesCount: res.data?.notesCreated || 0,
      });
    } else {
      setErrorMessage(res.error || 'Error al emitir el parte.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--brand-bg)] text-[var(--brand-text)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-[var(--brand-text)]">
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">Asistencia Táctica</h2>
            <div className="flex items-center gap-2">
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-500 uppercase tracking-widest outline-none border-b border-dashed border-slate-300 focus:border-[#FF6600] transition-colors"
              >
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(reportDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {!submittedReceipt && (
          <button 
            onClick={handleSubmit}
            className="bg-[#FF6600] text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#e65c00] transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Emitir Parte</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {errorMessage && (
          <div className="max-w-6xl mx-auto mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        {submittedReceipt ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <FileCheck2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Parte Consolidado</h3>
              <p className="text-slate-400 font-medium">ID: <span className="text-white font-mono">{submittedReceipt.reportCode}</span></p>
            </div>
            <div className="bg-[var(--brand-surface)] p-6 rounded-3xl border border-[var(--brand-border)] text-left space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Albaranes</span>
                <span className="font-black text-emerald-500">{submittedReceipt.notesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Horas</span>
                <span className="font-black text-[var(--brand-text)]">{workEntries.reduce((a, b) => a + b.totalHours, 0)}h</span>
              </div>
            </div>
            <button onClick={() => { onSuccess(); onClose(); }} className="w-full py-4 bg-[var(--brand-text)] text-[var(--brand-bg)] rounded-2xl font-black uppercase tracking-widest text-sm">Cerrar</button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Presentes', value: workEntries.filter(e => e.attendance === 'Presente').length, icon: UserCheck, color: 'text-emerald-500' },
                { label: 'Horas', value: `${workEntries.reduce((a, b) => a + b.totalHours, 0)}h`, icon: Clock, color: 'text-[#FF6600]' },
                { label: 'Subcontratas', value: new Set(workEntries.filter(e => e.isSubcontractor).map(e => e.companyIdSnapshot)).size, icon: Building2, color: 'text-[#5B8CFF]' },
                { label: 'Código Obra', value: selectedProject?.code || '---', icon: FileText, color: 'text-slate-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-[var(--brand-surface)] p-4 rounded-2xl border border-[var(--brand-border)] flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-black/5 ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-lg font-black">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid Operarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workEntries.map((entry) => {
                const isPresent = entry.attendance === 'Presente';
                return (
                  <div 
                    key={entry.workerId}
                    className={`relative rounded-3xl p-5 border transition-all cursor-pointer active:scale-95 ${
                      isPresent ? 'bg-[var(--brand-surface)] border-[#FF6600]/30 shadow-sm' : 'bg-[var(--brand-bg)] border-[var(--brand-border)] opacity-40 grayscale'
                    }`}
                    onClick={() => toggleAttendance(entry.workerId)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-xs font-black text-[var(--brand-text)] uppercase tracking-tight truncate max-w-[140px]">{entry.workerNameSnapshot}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{entry.workerCategorySnapshot}</div>
                        <div className="mt-2 text-[9px] font-black text-[#5B8CFF] uppercase">{entry.companyNameSnapshot}</div>
                      </div>
                      <div className={`p-2 rounded-xl ${isPresent ? 'bg-[#FF6600] text-white' : 'bg-black/5 text-slate-700'}`}>
                        {isPresent ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </div>
                    </div>

                    {isPresent && (
                      <div className="mt-6 pt-4 border-t border-[var(--brand-border)] space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Normal</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => adjustHours(entry.workerId, 'normal', -1)} className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-[var(--brand-text)]"><Minus className="w-3 h-3" /></button>
                            <span className="font-mono font-black text-xs text-[var(--brand-text)]">{entry.normalHours}</span>
                            <button onClick={() => adjustHours(entry.workerId, 'normal', 1)} className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-[var(--brand-text)]"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest">Extra</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => adjustHours(entry.workerId, 'extra', -1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="font-mono font-black text-xs text-[#FF6600]">{entry.extraHours}</span>
                            <button onClick={() => adjustHours(entry.workerId, 'extra', 1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Machinery Usage Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="w-5 h-5 text-[#5B8CFF]" />
                <h4 className="text-[11px] font-black uppercase tracking-widest">Uso de Maquinaria</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {machineryEntries.map((entry) => {
                  const company = state.companies.find(c => c.id === entry.companyIdSnapshot);
                  return (
                    <div 
                      key={entry.machineryId}
                      className={`rounded-2xl p-4 border transition-all ${
                        entry.hours > 0 ? 'bg-white border-[#5B8CFF]/30 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{entry.machineryNameSnapshot}</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{company?.name}</div>
                        </div>
                        <div className={`p-1.5 rounded-lg ${entry.hours > 0 ? 'bg-[#5B8CFF] text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Truck className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Horas Uso</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => adjustMachineryHours(entry.machineryId, -1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Minus className="w-3 h-3" /></button>
                          <span className="font-mono font-black text-xs text-slate-900">{entry.hours}</span>
                          <button onClick={() => adjustMachineryHours(entry.machineryId, 1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[var(--brand-surface)] p-6 rounded-3xl border border-[var(--brand-border)] space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-[#FF6600]" />
                <h4 className="text-[11px] font-black uppercase tracking-widest">Incidencias y Observaciones</h4>
              </div>
              <textarea 
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="w-full h-24 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-2xl p-4 text-xs focus:border-[#FF6600]/30 outline-none transition-all resize-none text-[var(--brand-text)]"
                placeholder="Ej: Retraso en hormigonado por clima, 2 operarios extra para ferrallado..."
              />
            </div>
          </div>
        )}
      </div>

      {!submittedReceipt && (
        <div className="md:hidden p-4 bg-[var(--brand-surface)] border-t border-[var(--brand-border)] flex gap-4">
          <button onClick={handleSubmit} className="flex-1 py-4 bg-[#FF6600] text-white rounded-2xl font-black uppercase tracking-widest text-[11px]">Emitir Parte Diario</button>
        </div>
      )}
    </div>
  );
};
