import { AppState, Project, Machinery } from '../../types';
import { generateProjectCode, generateMachineryCode } from '../../domain/rules';

export const createProject = (
  state: AppState,
  data: Omit<Project, 'id' | 'code' | 'companyId'>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; project?: Project; error?: string } => {
  const code = generateProjectCode(state.projects.length);
  const companyId = state.currentUser?.companyId || 'comp_main';

  const newProject: Project = {
    ...data,
    id: `proj_${Date.now()}`,
    code,
    companyId,
    assignedSubcontractorIds: data.assignedSubcontractorIds || [],
  };

  state.projects.push(newProject);
  dispatchSync('project', newProject);

  logAudit(
    'Project',
    newProject.id,
    'PROJECT_CREATED',
    `Obra "${newProject.name}" registrada con éxito (Presupuesto: €${newProject.budget || 0}).`,
    code
  );

  return { success: true, project: newProject };
};

export const updateProjectStatus = (
  state: AppState,
  projectId: string,
  status: Project['status'],
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; error?: string } => {
  const project = state.projects.find((p: Project) => p.id === projectId);
  if (!project) return { success: false, error: 'Proyecto no encontrado' };

  project.status = status;
  dispatchSync('project', project);
  return { success: true };
};

export const updateProject = (
  state: AppState,
  projectId: string,
  data: Partial<Project>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const idx = state.projects.findIndex((p: Project) => p.id === projectId);
  if (idx === -1) return false;
  state.projects[idx] = { ...state.projects[idx], ...data };
  dispatchSync('project', state.projects[idx]);
  logAudit(
    'Project',
    projectId,
    'PROJECT_UPDATED',
    `Datos de la obra "${state.projects[idx].name}" actualizados.`
  );
  return true;
};

export const deleteProject = (
  state: AppState,
  projectId: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void
): boolean => {
  const idx = state.projects.findIndex((p: Project) => p.id === projectId);
  if (idx === -1) return false;
  const project = state.projects[idx];
  state.projects.splice(idx, 1);
  logAudit(
    'Project',
    projectId,
    'PROJECT_DELETED',
    `Obra "${project.name}" eliminada del sistema.`
  );
  return true;
};

export const updateProjectAssignments = (
  state: AppState,
  projectId: string,
  subcontractorIds: string[],
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const idx = state.projects.findIndex((p: Project) => p.id === projectId);
  if (idx === -1) return false;
  state.projects[idx].assignedSubcontractorIds = subcontractorIds;
  dispatchSync('project', state.projects[idx]);
  logAudit(
    'Project',
    projectId,
    'PROJECT_ASSIGNMENT_CHANGED',
    `Asignaciones de subcontratas modificadas para "${state.projects[idx].name}".`
  );
  return true;
};

export const createMachinery = (
  state: AppState,
  data: Omit<Machinery, 'id' | 'code' | 'createdAt'>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; machinery?: Machinery; error?: string } => {
  const code = generateMachineryCode(state.machinery.length);
  const companyId = state.currentUser?.companyId || 'comp_main';

  const newMachinery: Machinery = {
    ...data,
    id: `mach_${Date.now()}`,
    code,
    companyId,
    createdAt: new Date().toISOString(),
  };

  state.machinery.push(newMachinery);
  dispatchSync('machinery', newMachinery);

  logAudit(
    'Machinery',
    newMachinery.id,
    'MACHINERY_CREATED',
    `Maquinaria "${newMachinery.name}" registrada con código ${code}.`,
    code
  );

  return { success: true, machinery: newMachinery };
};

export const updateMachinery = (
  state: AppState,
  machineryId: string,
  data: Partial<Machinery>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const idx = state.machinery.findIndex((m: Machinery) => m.id === machineryId);
  if (idx === -1) return false;
  state.machinery[idx] = { ...state.machinery[idx], ...data };
  dispatchSync('machinery', state.machinery[idx]);
  logAudit(
    'Machinery',
    machineryId,
    'MACHINERY_UPDATED',
    `Maquinaria "${state.machinery[idx].name}" actualizada.`
  );
  return true;
};

export const toggleMachineryStatus = (
  state: AppState,
  machineryId: string,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const target = state.machinery.find((m: Machinery) => m.id === machineryId);
  if (target) {
    target.active = !target.active;
    dispatchSync('machinery', target);
    return true;
  }
  return false;
};

export const deleteMachinery = (
  state: AppState,
  machineryId: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void
): boolean => {
  const idx = state.machinery.findIndex((m: Machinery) => m.id === machineryId);
  if (idx === -1) return false;
  const machinery = state.machinery[idx];
  state.machinery.splice(idx, 1);
  logAudit(
    'Machinery',
    machineryId,
    'MACHINERY_DELETED',
    `Maquinaria "${machinery.name}" eliminada del sistema.`
  );
  return true;
};
