import React from 'react';
import { Users, Settings, Building2, Link, X } from 'lucide-react';
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
    <div className="pt-6 border-t border-slate-800/60 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-accent" />
          Empresas y Subcontratas Autorizadas en Obra
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-xs font-black text-brand-accent hover:text-brand-accent/80 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gestionar Red</span>
          </button>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        {/* Main Contractor */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-200 uppercase">Empresa Principal</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CONTRATISTA GENERAL</div>
            </div>
          </div>
        </div>

        {/* Assigned Subcontractors */}
        {companies
          .filter(c => currentAssignedIds.includes(c.id))
          .map(sub => (
            <div key={sub.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-brand-accent/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-accent transition-colors">
                  <Link className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-200 uppercase truncate max-w-[150px]">{sub.name}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub.taxId} • SUBCONTRATA</div>
                </div>
              </div>
            </div>
          ))}

        {currentAssignedIds.length === 0 && (
          <div className="w-full p-3.5 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>No hay subcontratas asignadas aún a este proyecto.</span>
            {isAdmin && (
              <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-black text-brand-accent uppercase hover:underline cursor-pointer"
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
        title="Asignar Subcontratas a la Obra"
      >
        <div className="space-y-4 font-sans text-slate-300">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Selecciona las empresas autorizadas para realizar tajos en esta obra. Las empresas marcadas recibirán acceso para emitir albaranes y partes diarios.
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {companies
              .filter(c => c.type === 'SUBCONTRACTOR')
              .map(comp => {
                const isAssigned = currentAssignedIds.includes(comp.id);
                return (
                  <label 
                    key={comp.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isAssigned ? 'bg-brand-accent/5 border-brand-accent/40' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => {
                          const next = isAssigned 
                            ? currentAssignedIds.filter(id => id !== comp.id)
                            : [...currentAssignedIds, comp.id];
                          onUpdateAssignments(next);
                        }}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-accent focus:ring-brand-accent cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-200 uppercase block">{comp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{comp.address}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{comp.taxId}</span>
                  </label>
                );
              })}
            {companies.filter(c => c.type === 'SUBCONTRACTOR').length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 uppercase font-black tracking-wider">
                No hay empresas subcontratadas dadas de alta. Ve a Equipo &gt; Subcontratas para crearlas.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
