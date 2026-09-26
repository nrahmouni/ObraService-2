import React, { useState, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Project, AppState } from '../types';
import { Building2, MapPin, Navigation, Info, Search, X, Activity, Globe, Compass, Layers, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface MapViewProps {
  state: AppState;
}

export const MapView: React.FC<MapViewProps> = ({ state }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const map = useMap();

  const projectsWithLocation = useMemo(() => {
    return (state.projects || []).filter(p => (p.latitude || p.location?.lat) && (p.longitude || p.location?.lng));
  }, [state.projects]);

  const filteredProjects = useMemo(() => {
    return projectsWithLocation.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projectsWithLocation, searchQuery]);

  const selectedProject = useMemo(() => {
    return state.projects.find(p => p.id === selectedProjectId);
  }, [state.projects, selectedProjectId]);

  const handleMarkerClick = (project: Project) => {
    setSelectedProjectId(project.id);
    if (map) {
      map.panTo({ 
        lat: project.latitude || project.location.lat, 
        lng: project.longitude || project.location.lng 
      });
      map.setZoom(15);
    }
  };

  return (
    <div className="relative h-[calc(100dvh-12rem)] sm:h-[calc(100vh-14rem)] min-h-[450px] bg-brand-bg rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-brand-border shadow-2xl animate-in fade-in duration-700">
      {/* Map Viewport */}
      <div className="absolute inset-0 z-0">
        <Map
          defaultCenter={{ lat: 40.4168, lng: -3.7038 }}
          defaultZoom={6}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          disableDefaultUI={true}
        >
          {projectsWithLocation.map(p => (
            <AdvancedMarker
              key={p.id}
              position={{ 
                lat: p.latitude || p.location.lat, 
                lng: p.longitude || p.location.lng 
              }}
              onClick={() => handleMarkerClick(p)}
            >
              <div className="group relative">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 border-white shadow-lg transition-transform group-hover:scale-125 ${
                  p.status === 'Active' ? 'bg-brand-accent' : 'bg-brand-muted'
                }`}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                {/* Tooltip on marker hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-50">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">{p.name}</span>
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>

      {/* Floating Controls Layer */}
      <div className="absolute inset-0 pointer-events-none p-3 sm:p-6 flex flex-col items-start gap-3 sm:gap-4 overflow-hidden">
        {/* Search Bar */}
        <div className="w-[calc(100%-3.5rem)] sm:w-80 bg-brand-bg/85 backdrop-blur-xl p-2 sm:p-3 rounded-xl sm:rounded-[1.5rem] border border-brand-border shadow-2xl pointer-events-auto">
          <div className="relative group">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Localizar proyecto..."
              className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 rounded-lg sm:rounded-xl border border-brand-border bg-brand-surface text-xs font-bold text-white focus:border-brand-accent outline-none transition-all"
            />
          </div>
        </div>

        {/* Selected Project Card */}
        {selectedProject && (
          <div className="w-full max-w-sm sm:w-80 bg-brand-bg/95 backdrop-blur-xl border border-brand-border rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl pointer-events-auto animate-in slide-in-from-left-8 duration-500 overflow-hidden relative">
            {/* Visual background hint */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-start justify-between relative z-10 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <button 
                onClick={() => setSelectedProjectId(null)}
                className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-[8px] font-black text-brand-accent uppercase tracking-widest">
                      {selectedProject.code}
                   </div>
                   <div className={`w-1.5 h-1.5 rounded-full ${selectedProject.status === 'Active' ? 'bg-emerald-500' : 'bg-brand-muted'}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-tight leading-none">
                  {selectedProject.name}
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-brand-border">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-brand-muted leading-relaxed">
                    {selectedProject.address || selectedProject.location?.address}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-brand-muted" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    Radio: <span className="text-brand-accent ml-1">{selectedProject.validationRadiusMeters}m</span>
                  </span>
                </div>
              </div>

              <button className="btn-primary w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl mt-2 group justify-center text-xs uppercase tracking-wider">
                Gestionar Proyecto
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* Quick List (only when no project selected) */}
        {!selectedProject && filteredProjects.length > 0 && (
          <div className="w-[calc(100%-3.5rem)] sm:w-80 bg-brand-bg/90 backdrop-blur-xl border border-brand-border rounded-xl sm:rounded-[2rem] shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[16rem] sm:max-h-[24rem]">
            <div className="p-3 sm:p-4 border-b border-brand-border bg-brand-surface/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Resultados ({filteredProjects.length})
              </span>
              <Compass className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="overflow-y-auto no-scrollbar">
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleMarkerClick(p)}
                  className="w-full p-3 sm:p-4 text-left hover:bg-brand-surface transition-all flex items-center gap-3 sm:gap-4 group border-b border-brand-border/50 last:border-0"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center group-hover:border-brand-accent/50 transition-all shrink-0">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-muted group-hover:text-brand-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-white uppercase tracking-tight truncate leading-none mb-1">
                      {p.name}
                    </div>
                    <div className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter truncate">
                      {p.address || p.location?.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Actions (Top Right) */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
         {[
           { icon: Layers, label: 'Capas' },
           { icon: Globe, label: 'Satélite' },
           { icon: Activity, label: 'Tráfico' }
         ].map(item => (
           <button 
             key={item.label}
             className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-bg/85 backdrop-blur-xl border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-accent hover:border-brand-accent/30 transition-all shadow-xl"
             title={item.label}
           >
             <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>
         ))}
      </div>

      {/* Map Legend (Bottom Right - desktop only or compact on mobile) */}
      <div className="hidden sm:flex absolute bottom-6 right-6 bg-brand-bg/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-brand-border shadow-2xl items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Activo</span>
        </div>
        <div className="flex items-center gap-2.5 text-brand-muted opacity-50">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inactivo</span>
        </div>
      </div>
    </div>
  );
};
