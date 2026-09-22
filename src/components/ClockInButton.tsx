import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Compass, 
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Project, TimeLog, AppState } from '../types';
import { calculateHaversineDistanceMeters, getCurrentGeoPosition } from '../utils/geo';
import { checkOperationalStatus } from '../utils/compliance';
import toast from 'react-hot-toast';

interface ClockInButtonProps {
  project?: Project | null;
  projects?: Project[];
  state?: AppState;
  variant?: 'compact' | 'full' | 'fab';
  className?: string;
  onSuccess?: (log: TimeLog) => void;
}

export const ClockInButton: React.FC<ClockInButtonProps> = ({
  project: initialProject,
  projects: propProjects,
  variant = 'full',
  className = '',
  onSuccess,
}) => {
  const state = obraStore.getState();
  const currentUser = state.currentUser;
  const availableProjects = (propProjects || state.projects || []).filter(
    (p) => p.status === 'Active' || p.status === 'Planned'
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProject?.id || availableProjects[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [lastLog, setLastLog] = useState<TimeLog | null>(() => {
    if (!currentUser || !state.timeLogs) return null;
    const userLogs = state.timeLogs.filter((tl) => tl.userId === currentUser.id);
    return userLogs.length > 0 ? userLogs[userLogs.length - 1] : null;
  });
  const [distanceError, setDistanceError] = useState<{
    distance: number;
    maxDistance: number;
    projectName: string;
    userCoords?: { lat: number; lng: number };
    projectCoords?: { lat: number; lng: number };
  } | null>(null);

  const activeProject = 
    availableProjects.find((p) => p.id === selectedProjectId) || 
    initialProject || 
    availableProjects[0];

  // Determine if next action is 'In' or 'Out'
  const isClockedIn = lastLog?.status === 'In';
  const nextStatus = isClockedIn ? 'Out' : 'In';

  const handleClockIn = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para fichar');
      return;
    }

    // Domain rule: Contratas and subcontratas do not clock in, only Site Managers / Admins do
    if (currentUser.role === 'SUBCONTRACTOR_USER' || (currentUser.role as string) === 'WORKER') {
      toast.error('Las contratas y subcontratas no fichan. El fichaje y control de presencia en obra lo realiza el Jefe de Obra.');
      return;
    }

    if (!activeProject) {
      toast.error('No hay ninguna obra activa asignada para fichar');
      return;
    }

    // Extract project coordinates
    const projectLat = activeProject.location?.lat ?? activeProject.latitude;
    const projectLng = activeProject.location?.lng ?? activeProject.longitude;

    if (projectLat === undefined || projectLng === undefined) {
      toast.error(`La obra "${activeProject.name}" no tiene coordenadas GPS configuradas.`);
      return;
    }

    setLoading(true);
    setDistanceError(null);

    try {
      // 1. Obtain device GPS coordinates with high accuracy
      const coords = await getCurrentGeoPosition();

      // 2. Compute Haversine distance
      const distanceMeters = calculateHaversineDistanceMeters(
        coords.latitude,
        coords.longitude,
        projectLat,
        projectLng
      );

      // Maximum threshold: use project geofence radius or 200m default
      const maxAllowedMeters = activeProject.validationRadiusMeters || 200;

      // 3. Validation Check: If distance > 200m, block clock-in
      if (distanceMeters > maxAllowedMeters) {
        setDistanceError({
          distance: Math.round(distanceMeters),
          maxDistance: maxAllowedMeters,
          projectName: activeProject.name,
          userCoords: { lat: coords.latitude, lng: coords.longitude },
          projectCoords: { lat: projectLat, lng: projectLng },
        });

        toast.error(
          `Fichaje bloqueado: Estás a ${Math.round(distanceMeters)}m de la obra (máximo 200m).`,
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }

      // 4. Valid location: Register timestamped time log
      const nowIso = new Date().toISOString();
      const newLog: TimeLog = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        userId: currentUser.id,
        userNameSnapshot: currentUser.name,
        userRoleSnapshot: currentUser.role,
        companyId: currentUser.companyId,
        projectId: activeProject.id,
        projectNameSnapshot: activeProject.name,
        timestamp: nowIso,
        lat: coords.latitude,
        lng: coords.longitude,
        distanceMeters: Math.round(distanceMeters),
        status: nextStatus,
      };

      // Add to store (which dispatches to Firebase & local offline queue)
      obraStore.addTimeLog(newLog);
      setLastLog(newLog);

      // Tactile feedback on supported mobile devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      const statusLabel = nextStatus === 'In' ? 'ENTRADA' : 'SALIDA';
      toast.success(
        `Fichaje de ${statusLabel} confirmado en ${activeProject.name} (a ${Math.round(distanceMeters)}m)`,
        {
          id: 'clockin-success',
          duration: 5000,
          icon: '📍',
        }
      );

      if (onSuccess) {
        onSuccess(newLog);
      }
    } catch (err: any) {
      console.error('[ClockInButton] Error during clock-in:', err);
      toast.error(err.message || 'Error al obtener la ubicación GPS.');
    } finally {
      setLoading(false);
    }
  };

  // Compact badge variant (for headers or cards)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleClockIn}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
            isClockedIn
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#ea580c] hover:bg-[#d94e06] text-white'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          <span>{isClockedIn ? 'Fichar Salida' : 'Fichar Entrada'}</span>
        </button>
      </div>
    );
  }

  // Full-width tactical mobile card variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Project Selector if more than one project exists */}
      {availableProjects.length > 1 && !initialProject && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-[#ea580c]" />
            <span>Seleccionar Obra de Destino</span>
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setDistanceError(null);
            }}
            className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#ea580c]"
          >
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        onClick={handleClockIn}
        disabled={loading || !activeProject}
        className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-between transition-all transform active:scale-98 shadow-lg cursor-pointer ${
          isClockedIn
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
            : 'bg-gradient-to-r from-[#ea580c] to-orange-500 text-white shadow-orange-500/25'
        } ${loading ? 'opacity-80 cursor-wait' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold opacity-80">
              {isClockedIn ? 'Jornada en curso' : 'Inicio de jornada'}
            </div>
            <div className="text-base font-black tracking-tight">
              {isClockedIn ? 'Fichar Salida de Obra' : 'Fichar Entrada en Obra'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black bg-black/15 px-3 py-1.5 rounded-xl">
          <MapPin className="w-3.5 h-3.5" />
          <span>GPS</span>
        </div>
      </button>

      {/* Last registered timestamp state badge */}
      {lastLog && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                lastLog.status === 'In' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold">
              Último fichaje: {lastLog.status === 'In' ? 'Entrada' : 'Salida'} a las{' '}
              {new Date(lastLog.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {lastLog.distanceMeters}m de la obra
          </span>
        </div>
      )}

      {/* Geofence Breach Alert Modal / Banner */}
      {distanceError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/30 rounded-2xl text-rose-900 dark:text-rose-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Fichaje Bloqueado por Distancia
              </div>
              <p className="text-xs leading-relaxed font-medium">
                Estás a <strong>{distanceError.distance} metros</strong> de la obra{' '}
                <span className="underline font-bold">"{distanceError.projectName}"</span>. El sistema
                exige estar a menos de <strong>{distanceError.maxDistance} metros</strong> para
                garantizar presencia física.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] font-mono opacity-80">
                <span>Tu GPS: {distanceError.userCoords?.lat.toFixed(4)}, {distanceError.userCoords?.lng.toFixed(4)}</span>
                <span>•</span>
                <span>Obra: {distanceError.projectCoords?.lat.toFixed(4)}, {distanceError.projectCoords?.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
