import React from 'react';
import { Users, Settings, Building2, Link, CheckCircle2, HardHat, FileText, ChevronRight } from 'lucide-react';
import { Project, Company, Worker, DeliveryNote } from '../../types';
import { Modal } from '../ui/Modal';

interface ProjectDetailSubcontractorsProps {
  selectedProject: Project;
  companies: Company[];
  workers?: Worker[];
  deliveryNotes?: DeliveryNote[];
  isAdmin: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdateAssignments: (subIds: string[]) => void;
}

export const ProjectDetailSubcontractors: React.FC<ProjectDetailSubcontractorsProps> = ({
  selectedProject,
  companies,
  workers = [],
  deliveryNotes = [],
  isAdmin,
  isOpen,
  setIsOpen,
  onUpdateAssignments,
}) => {
  const currentAssignedIds = selectedProject.assignedSubcontractorIds || [];
  const mainComp = companies.find(c => c.id === selectedProject.companyId || c.type === 'MAIN_CONTRACTOR');
  const mainWorkers = workers.filter(w => w.companyId === (mainComp?.id || 'comp_main') && (!w.assignedProjectIds || w.assignedProjectIds.length === 0 || w.assignedProjectIds.includes(selectedProject.id)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
          Empresas Autorizadas ({currentAssignedIds.length + 1})
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-xs font-bold text-brand-accent hover:text-orange-400 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gestionar</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {/* Main Contractor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white uppercase truncate">
                {mainComp?.name || 'Empresa Principal'}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                CONTRATISTA GENERAL • {mainWorkers.length} operarios directos
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
            Titular
          </span>
        </div>

        {/* Assigned Subcontractors */}
        {companies
          .filter(c => currentAssignedIds.includes(c.id))
          .map(sub => {
            const subWorkers = workers.filter(w => w.companyId === sub.id && (!w.assignedProjectIds || w.assignedProjectIds.length === 0 || w.assignedProjectIds.includes(selectedProject.id)));
            const subNotes = deliveryNotes.filter(n => n.subcontractorCompanyId === sub.id && n.projectId === selectedProject.id);

            return (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Link className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white uppercase truncate">{sub.name}</div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                      <span>{sub.taxId}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{subWorkers.length} operarios</span>
                      {subNotes.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{subNotes.length} albaranes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Subcontrata
                </span>
              </div>
            );
          })}

        {currentAssignedIds.length === 0 && (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
            <Users className="w-6 h-6 text-slate-500" />
            <p className="text-xs font-medium text-slate-400">No hay subcontratas asignadas a esta obra.</p>
            {isAdmin && (
              <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
              >
                + Asignar ahora
              </button>
            )}
          </div>
        )}
      </div>

      {/* Subcontractor Assignment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Asignar Subcontratas a esta Obra"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Selecciona las empresas autorizadas para realizar tajos en <strong className="text-brand-accent">{selectedProject.name}</strong>. Las empresas marcadas recibirán acceso inmediato para sus operarios y emisión de albaranes.
          </p>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {companies
              .filter(c => c.type === 'SUBCONTRACTOR')
              .map(comp => {
                const isAssigned = currentAssignedIds.includes(comp.id);
                const compWorkersCount = workers.filter(w => w.companyId === comp.id).length;

                return (
                  <label 
                    key={comp.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isAssigned ? 'bg-orange-500/10 border-brand-accent' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isAssigned ? 'bg-brand-accent border-brand-accent text-white' : 'bg-slate-900 border-slate-700'
                      }`}>
                        {isAssigned && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <input 
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {
                            const next = isAssigned 
                              ? currentAssignedIds.filter(id => id !== comp.id)
                              : [...currentAssignedIds, comp.id];
                            onUpdateAssignments(next);
                          }}
                          className="sr-only"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white uppercase block">{comp.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                          CIF: {comp.taxId} • {compWorkersCount} operarios en plantilla
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isAssigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isAssigned ? 'Autorizada' : 'Sin acceso'}
                    </span>
                  </label>
                );
              })}
            {companies.filter(c => c.type === 'SUBCONTRACTOR').length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No hay subcontratistas dadas de alta en el sistema.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
