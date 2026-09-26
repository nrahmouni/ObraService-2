import React from 'react';
import { Users, Settings, Building2, Link, X, CheckCircle2 } from 'lucide-react';
import { Project, Company } from '../../types';
import { Modal } from '../ui/Modal';

interface ProjectDetailSubcontractorsProps {
  selectedProject: Project;
  companies: Company[];
  isAdmin: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdateAssignments: (subIds: string[]) => void;
}

export const ProjectDetailSubcontractors: React.FC<ProjectDetailSubcontractorsProps> = ({
  selectedProject,
  companies,
  isAdmin,
  isOpen,
  setIsOpen,
  onUpdateAssignments,
}) => {
  const currentAssignedIds = selectedProject.assignedSubcontractorIds || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em]">
          Red Autorizada
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-[10px] font-black text-brand-accent hover:text-brand-accent/80 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gestionar</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Main Contractor */}
        <div className="card p-4 border-brand-accent/20 bg-brand-accent/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase">Empresa Principal</div>
              <div className="text-[10px] font-medium text-brand-muted mt-0.5 tracking-wider">CONTRATISTA GENERAL</div>
            </div>
          </div>
        </div>

        {/* Assigned Subcontractors */}
        {companies
          .filter(c => currentAssignedIds.includes(c.id))
          .map(sub => (
            <div key={sub.id} className="card p-4 hover:border-brand-accent/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-accent transition-colors shrink-0">
                  <Link className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white uppercase truncate">{sub.name}</div>
                  <div className="text-[10px] font-medium text-brand-muted mt-0.5 tracking-wider truncate">
                    {sub.taxId} • SUBCONTRATA
                  </div>
                </div>
              </div>
            </div>
          ))}

        {currentAssignedIds.length === 0 && (
          <div className="card p-6 border-dashed border-brand-border flex flex-col items-center text-center gap-3">
            <Users className="w-8 h-8 text-brand-muted opacity-40" />
            <p className="text-[11px] font-medium text-brand-muted">No hay subcontratas asignadas.</p>
            {isAdmin && (
              <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-black text-brand-accent uppercase hover:underline"
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
        title="Asignar Subcontratas"
      >
        <div className="space-y-6">
          <p className="text-xs text-brand-muted font-medium leading-relaxed">
            Selecciona las empresas autorizadas para realizar tajos en esta obra. Las empresas marcadas recibirán acceso para emitir albaranes y partes diarios.
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {companies
              .filter(c => c.type === 'SUBCONTRACTOR')
              .map(comp => {
                const isAssigned = currentAssignedIds.includes(comp.id);
                return (
                  <label 
                    key={comp.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                      isAssigned ? 'bg-brand-accent/5 border-brand-accent/40' : 'bg-brand-bg border-brand-border hover:border-brand-muted'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isAssigned ? 'bg-brand-accent border-brand-accent' : 'bg-brand-bg border-brand-border'
                      }`}>
                        {isAssigned && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
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
                        <span className="text-[10px] text-brand-muted font-medium mt-0.5 tracking-wider">{comp.taxId}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            {companies.filter(c => c.type === 'SUBCONTRACTOR').length === 0 && (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-brand-muted opacity-20 mx-auto mb-4" />
                <p className="text-xs text-brand-muted font-medium">No hay subcontratas registradas.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
