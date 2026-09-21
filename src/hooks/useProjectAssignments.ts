import { useState } from 'react';
import { obraStore } from '../services/store';
import toast from 'react-hot-toast';

export function useProjectAssignments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Assigns a subcontractor company to a project (Site Manager action).
   */
  const assignSubcontractorToProject = async (projectId: string, companyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const state = obraStore.getState();
      const project = state.projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      const assigned = project.assignedSubcontractorIds || [];
      if (assigned.includes(companyId)) {
        toast('La subcontrata ya está asignada a este proyecto.');
        setLoading(false);
        return true;
      }

      const updatedSubcontractors = [...assigned, companyId];
      
      const success = obraStore.updateProject(projectId, {
        assignedSubcontractorIds: updatedSubcontractors
      });
      
      if (!success) {
        throw new Error('No se pudo actualizar el proyecto en la base de datos');
      }
      
      toast.success('¡Subcontrata vinculada correctamente al proyecto!');
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al asignar subcontrata');
      toast.error(err.message || 'Error al asignar subcontrata');
      setLoading(false);
      return false;
    }
  };

  /**
   * Removes a subcontractor from a project.
   */
  const removeSubcontractorFromProject = async (projectId: string, companyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const state = obraStore.getState();
      const project = state.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Proyecto no encontrado');

      const updatedSubcontractors = (project.assignedSubcontractorIds || []).filter(id => id !== companyId);
      obraStore.updateProject(projectId, {
        assignedSubcontractorIds: updatedSubcontractors
      });

      toast.success('Subcontrata desvinculada del proyecto.');
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
      return false;
    }
  };

  return {
    assignSubcontractorToProject,
    removeSubcontractorFromProject,
    loading,
    error
  };
}
