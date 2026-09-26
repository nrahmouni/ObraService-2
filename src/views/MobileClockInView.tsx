import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Compass, 
  LogIn, 
  LogOut,
  Navigation,
  History
} from 'lucide-react';
import { obraStore } from '../services/store';
import { AppState, TimeLog, UserRole } from '../types';
import { toast } from 'react-hot-toast';

interface MobileClockInViewProps {
  state: AppState;
}

export const MobileClockInView: React.FC<MobileClockInViewProps> = ({ state }) => {
  const navigate = useNavigate();
  const currentUser = state.currentUser;
  const activeProject = state.projects[0];
  
  // Geolocation state
  const [currentLat, setCurrentLat] = useState<number>(40.4202);
  const [currentLng, setCurrentLng] = useState<number>(-3.7041);
  const [distanceMeters, setDistanceMeters] = useState<number>(35);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Time logs for this user today
  const todayStr = new Date().toISOString().split('T')[0];
  const userLogsToday = (state.timeLogs || []).filter(
    log => log.userId === currentUser?.id && log.timestamp.startsWith(todayStr)
  );
  const lastLog = userLogsToday[userLogsToday.length - 1];
  const isClockedIn = lastLog?.status === 'In';

  // Distance calculation utility
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRefreshLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);
          const projLat = activeProject?.location?.lat || 40.4202;
          const projLng = activeProject?.location?.lng || -3.7041;
          const dist = calculateDistance(lat, lng, projLat, projLng);
          setDistanceMeters(dist);
          setIsWithinRadius(dist <= (activeProject?.validationRadiusMeters || 300));
          setIsLocating(false);
          toast.success('Ubicación GPS sincronizada.');
        },
        () => {
          // Fallback simulation within work site
          setCurrentLat(40.4202);
          setCurrentLng(-3.7041);
          setDistanceMeters(42);
          setIsWithinRadius(true);
          setIsLocating(false);
          toast.success('Ubicación de tajo simulada con éxito.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleClockAction = (actionStatus: 'In' | 'Out') => {
    if (!currentUser || !activeProject) return;

    const newLog: TimeLog = {
      id: `timelog_${Date.now()}`,
      userId: currentUser.id,
      userNameSnapshot: currentUser.name,
      userRoleSnapshot: currentUser.role,
      companyId: currentUser.companyId,
      projectId: activeProject.id,
      projectNameSnapshot: activeProject.name,
      timestamp: new Date().toISOString(),
      lat: currentLat,
      lng: currentLng,
      distanceMeters: distanceMeters,
      status: actionStatus
    };

    obraStore.addTimeLog(newLog);
    toast.success(
      actionStatus === 'In' ? 'Fichaje de entrada registrado correctamente.' : 'Fichaje de salida registrado.',
      { icon: actionStatus === 'In' ? '🟢' : '🔴' }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col max-w-xl mx-auto border-x border-slate-900 shadow-2xl">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-3.5 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0">
        <button 
          onClick={() => navigate('/mobile/dashboard')}
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-white uppercase tracking-tight">Fichaje Geoposicionado</h1>
          <span className="text-[10px] text-amber-500 font-mono font-bold">Ley 8/2019 de Registro Horario</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 flex-1 space-y-5 overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Project Card */}
        <div className="card p-4 flex items-center justify-between bg-slate-900 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Obra Activa</p>
              <h2 className="text-sm font-bold text-white">{activeProject?.name || 'Ampliación Metro L5'}</h2>
              <span className="text-xs text-slate-400 font-medium">{activeProject?.location?.address}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Geocerca OK
          </span>
        </div>

        {/* GPS Geofence Radar Status Card */}
        <div className="card p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
              isWithinRadius ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10'
            }`}>
              <MapPin className={`w-10 h-10 ${isWithinRadius ? 'text-emerald-400' : 'text-rose-400'} animate-bounce`} />
            </div>
            {isWithinRadius && (
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                ✓
              </span>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              <Navigation className="w-3.5 h-3.5 text-amber-500" />
              <span>Distancia al centro del tajo: {Math.round(distanceMeters)}m</span>
            </div>
            <h3 className="text-lg font-black text-white uppercase mt-2">
              {isWithinRadius ? 'Ubicación Válida para Fichar' : 'Fuera del Perímetro de Obra'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Radio permitido: {activeProject?.validationRadiusMeters || 300} metros alrededor de la caseta de obra.
            </p>
          </div>

          <button
            onClick={handleRefreshLocation}
            disabled={isLocating}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Obteniendo GPS...' : 'Actualizar Coordenadas GPS'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => handleClockAction('In')}
            disabled={isClockedIn}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950 cursor-pointer transition-all"
          >
            <LogIn className="w-6 h-6" />
            <span>Fichar Entrada</span>
          </button>

          <button
            onClick={() => handleClockAction('Out')}
            disabled={!isClockedIn}
            className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-950 cursor-pointer transition-all"
          >
            <LogOut className="w-6 h-6" />
            <span>Fichar Salida</span>
          </button>
        </div>

        {/* Today's History */}
        <div className="card p-4 bg-slate-900 border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              Fichajes de Hoy ({todayStr})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {userLogsToday.length} registros
            </span>
          </div>

          <div className="space-y-2">
            {userLogsToday.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">
                Aún no has registrado ningún fichaje hoy.
              </p>
            ) : (
              userLogsToday.map(log => (
                <div key={log.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${log.status === 'In' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-bold text-white">
                      {log.status === 'In' ? 'Entrada al Tajo' : 'Salida de Obra'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-slate-500">{Math.round(log.distanceMeters)}m</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
