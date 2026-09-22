import { AppState, Worker } from '../../types';
import { generateWorkerCode } from '../../domain/rules';

export const createWorker = (
  state: AppState,
  data: Omit<Worker, 'id' | 'code' | 'createdAt'>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): { success: boolean; worker?: Worker; error?: string } => {
  const code = generateWorkerCode(state.workers.length);
  const newWorker: Worker = {
    ...data,
    id: `wrk_${Date.now()}`,
    code,
    createdAt: new Date().toISOString(),
  };

  state.workers.push(newWorker);
  dispatchSync('worker', newWorker);

  logAudit(
    'Worker',
    newWorker.id,
    'WORKER_CREATED',
    `Trabajador "${newWorker.name}" (${newWorker.category}) registrado para la empresa.`,
    code
  );

  return { success: true, worker: newWorker };
};

export const toggleWorkerStatus = (
  state: AppState,
  workerId: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string, recordCode?: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const worker = state.workers.find((w: Worker) => w.id === workerId);
  if (!worker) return false;

  worker.active = !worker.active;
  dispatchSync('worker', worker);

  logAudit(
    'Worker',
    worker.id,
    'WORKER_STATUS_CHANGED',
    `Estado del trabajador cambiado a ${worker.active ? 'Activo' : 'Inactivo'}. Historial de partes preservado.`,
    worker.code
  );

  return true;
};

export const updateWorker = (
  state: AppState,
  workerId: string,
  data: Partial<Worker>,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void,
  dispatchSync: (entity: string, item: unknown) => void
): boolean => {
  const idx = state.workers.findIndex((w: Worker) => w.id === workerId);
  if (idx === -1) return false;
  state.workers[idx] = { ...state.workers[idx], ...data };
  dispatchSync('worker', state.workers[idx]);
  logAudit(
    'Worker',
    workerId,
    'WORKER_UPDATED',
    `Datos del trabajador "${state.workers[idx].name}" actualizados.`
  );
  return true;
};

export const deleteWorker = (
  state: AppState,
  workerId: string,
  logAudit: (affectedEntity: string, recordId: string, operation: string, details: string) => void
): boolean => {
  const idx = state.workers.findIndex((w: Worker) => w.id === workerId);
  if (idx === -1) return false;
  const worker = state.workers[idx];
  state.workers.splice(idx, 1);
  logAudit(
    'Worker',
    workerId,
    'WORKER_DELETED',
    `Trabajador "${worker.name}" eliminado del sistema.`
  );
  return true;
};
