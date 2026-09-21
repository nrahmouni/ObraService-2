import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  MapPin, 
  Clock, 
  Camera, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Building2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, Project, TimeLog, DeliveryNote } from '../types';
import { Badge } from './ui/Badge';
import { calculateHaversineDistanceMeters, getCurrentGeoPosition } from '../utils/geo';
import { toast } from 'react-hot-toast';

interface MobileLandingProps {
  state?: AppState;
  onNavigate?: (tab: any) => void;
  onOpenNewReport?: () => void;
}

export const MobileLanding: React.FC<MobileLandingProps> = ({
  state: propState,
  onNavigate,
  onOpenNewReport,
}) => {
  const state = propState || obraStore.getState();
  const currentUser = state.currentUser;

  // Find user's assigned projects or first active project
  const userProjects = (state.projects || []).filter(p => 
    currentUser?.assignedProjectIds?.includes(p.id) || p.status === 'Active'
  );
  const activeProject: Project | undefined = userProjects[0] || state.projects[0];

  // Determine user's current clock-in status
  const userLogs = (state.timeLogs || []).filter(tl => tl.userId === currentUser?.id);
  const lastLog: TimeLog | undefined = userLogs.length > 0 ? userLogs[userLogs.length - 1] : undefined;
  const isClockedIn = lastLog?.status === 'In';

  const [loadingGps, setLoadingGps] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);

  // Compute live distance if possible
  useEffect(() => {
    let isMounted = true;
    if (activeProject && (activeProject.location?.lat || activeProject.latitude)) {
      const pLat = activeProject.location?.lat ?? activeProject.latitude;
      const pLng = activeProject.location?.lng ?? activeProject.longitude;
      if (pLat && pLng) {
        getCurrentGeoPosition()
          .then(pos => {
            if (isMounted) {
              const d = calculateHaversineDistanceMeters(pos.latitude, pos.longitude, pLat, pLng);
              setCurrentDistance(Math.round(d));
            }
          })
          .catch(() => {
            if (isMounted) setCurrentDistance(null);
          });
      }
    }
    return () => { isMounted = false; };
  }, [activeProject]);

  const handleToggleClockIn = async () => {
    if (!currentUser) return;
    if (!activeProject) {
      toast.error('No tienes ninguna obra asignada');
      return;
    }

    setLoadingGps(true);
    try {
      const projectLat = activeProject.location?.lat ?? activeProject.latitude ?? 40.4168;
      const projectLng = activeProject.location?.lng ?? activeProject.longitude ?? -3.7038;

      let distance = 0;
      let coords = { latitude: projectLat, longitude: projectLng };

      try {
        const pos = await getCurrentGeoPosition();
        coords = pos;
        distance = calculateHaversineDistanceMeters(pos.latitude, pos.longitude, projectLat, projectLng);
      } catch (e) {
        // Fallback demo distance if GPS is denied in iframe
        distance = 35;
      }

      const nextStatus = isClockedIn ? 'Out' : 'In';
      const newLog: TimeLog = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.id,
        userNameSnapshot: currentUser.name,
        userRoleSnapshot: currentUser.role,
        companyId: currentUser.companyId,
        projectId: activeProject.id,
        projectNameSnapshot: activeProject.name,
        timestamp: new Date().toISOString(),
        lat: coords.latitude,
        lng: coords.longitude,
        distanceMeters: Math.round(distance),
        status: nextStatus,
      };

      obraStore.addTimeLog(newLog);

      if (nextStatus === 'In') {
        toast.success(`¡Jornada iniciada en ${activeProject.name}!`, { icon: '👷' });
      } else {
        toast.success('Jornada finalizada correctamente. ¡Buen descanso!', { icon: '👋' });
      }
    } catch (err: any) {
      toast.error('Error al registrar fichaje: ' + err.message);
    } finally {
      setLoadingGps(false);
    }
  };

  // Pending delivery notes for this worker's company
  const myPendingNotes = (state.deliveryNotes || []).filter(
    n => n.subcontractorCompanyId === currentUser?.companyId && n.status === 'Pending'
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Worker Header Card */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center text-[#FF6600]">
            <HardHat className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase">
                {currentUser?.name || 'Operario'}
              </span>
              <Badge variant="purple" className="text-[8px] font-black px-1.5 py-0">
                OPERARIO
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-bold truncate max-w-[190px]">
              {currentUser?.companyName || 'ObraService'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Obra Activa</div>
          <div className="text-[11px] font-black text-slate-800 truncate max-w-[120px]">
            {activeProject ? activeProject.name : 'Sin asignar'}
          </div>
        </div>
      </div>

      {/* CENTRAL STATUS BANNER (Minimalist & High Contrast) */}
      <div 
        id="worker-central-status"
        className={`rounded-3xl p-6 text-center border-2 transition-all shadow-md relative overflow-hidden ${
          isClockedIn 
            ? 'bg-emerald-950 border-emerald-500/40 text-white' 
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-500" />
        
        {/* Status Icon Indicator */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
            isClockedIn 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-pulse' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {isClockedIn ? (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            ) : (
              <MapPin className="w-8 h-8 stroke-[2]" />
            )}
          </div>
        </div>

        {/* Big Central Status Text */}
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
          {isClockedIn ? 'Jornada Iniciada' : 'No estás en la obra'}
        </h2>

        <p className="text-xs text-slate-300/90 font-medium max-w-xs mx-auto mb-6 leading-relaxed">
          {isClockedIn ? (
            <>
              Fichado a las <span className="font-bold text-emerald-300">{new Date(lastLog?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h</span> en{' '}
              <span className="font-bold text-white">{activeProject?.name || 'Obra'}</span>.
            </>
          ) : (
            <>
              {activeProject ? (
                <>Obra asignada: <strong className="text-white">{activeProject.name}</strong>. {currentDistance !== null ? `A ${currentDistance}m.` : 'Verificando ubicación...'}</>
              ) : (
                'Debes estar en el radio de la obra para fichar.'
              )}
            </>
          )}
        </p>

        {/* Central Fichar Toggle Button */}
        <button
          onClick={handleToggleClockIn}
          disabled={loadingGps}
          className={`w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
            isClockedIn
              ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700'
              : 'bg-[#FF6600] hover:bg-[#e65c00] text-white'
          }`}
        >
          {loadingGps ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando GPS...
            </>
          ) : isClockedIn ? (
            <>
              <Clock className="w-4 h-4" />
              Finalizar Jornada (Fichar Salida)
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Fichar Entrada en Obra
            </>
          )}
        </button>
      </div>

      {/* MASSIVE THUMB-SIZED BUTTONS (Thumb-friendly, > 64px tall) */}
      <div className="space-y-3">
        {/* 1. Añadir Foto / Parte */}
        <button
          id="btn-worker-add-photo-report"
          onClick={() => {
            if (onOpenNewReport) onOpenNewReport();
            else if (onNavigate) onNavigate('reports');
          }}
          className="w-full min-h-[72px] p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-[#FF6600]/40 active:scale-95 transition-all flex items-center justify-between group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-[#FF6600] transition-colors">
                Añadir Foto / Parte
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Sube fotos de tajo, incidencias o avance diario
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#FF6600] group-hover:bg-orange-50 transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </button>

        {/* 2. Escanear / Subir Albarán */}
        <button
          id="btn-worker-scan-delivery-note"
          onClick={() => {
            if (onNavigate) onNavigate('delivery_notes');
          }}
          className="w-full min-h-[72px] p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-500/40 active:scale-95 transition-all flex items-center justify-between group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                Escanear / Subir Albarán
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Recepción de hormigón, áridos y material en tajo
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </button>

        {/* 3. Chat con Jefe de Obra */}
        <button
          id="btn-worker-chat-manager"
          onClick={() => {
            if (onNavigate) onNavigate('chat');
          }}
          className="w-full min-h-[64px] p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-between group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-tight text-slate-900">
                Chat con Jefe de Obra
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Canal directo de comunicación e incidencias
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-sky-700 uppercase bg-sky-50 border border-sky-200/80 px-2 py-1 rounded-lg">
            Abrir
          </span>
        </button>
      </div>

      {/* Albaranes Pendientes de Hoy */}
      {myPendingNotes.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-amber-900 uppercase">
                Albaranes Pendientes de Firma ({myPendingNotes.length})
              </span>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('delivery_notes')}
              className="text-[10px] font-black text-amber-800 uppercase hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-2">
            {myPendingNotes.slice(0, 2).map(note => (
              <div key={note.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{note.code}</div>
                  <div className="text-[10px] text-slate-500">{note.projectNameSnapshot} • {note.date}</div>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('delivery_notes')}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-colors"
                >
                  Firmar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
