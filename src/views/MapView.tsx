import React, { useState, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { obraStore } from '../services/store';
import { Project, AppState } from '../types';
import { Building2, MapPin, Navigation, Info, Search } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface MapViewProps {
  state: AppState;
}

export const MapView: React.FC<MapViewProps> = ({ state }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const map = useMap();

  const projectsWithLocation = useMemo(() => {
    return state.projects.filter(p => (p.latitude || p.location.lat) && (p.longitude || p.location.lng));
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
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative">
      {/* Sidebar / Floating Controls */}
      <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100%-2rem)] flex flex-col gap-4 pointer-events-none">
        {/* Search Box */}
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl pointer-events-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar obra..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none"
            />
          </div>
        </div>

        {/* Project Details Card */}
        {selectedProject && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl pointer-events-auto animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#FF6600]" />
              </div>
              <button 
                onClick={() => setSelectedProjectId(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedProject.code}</div>
                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                  {selectedProject.name}
                </h3>
              </div>

              <Badge status={selectedProject.status} />

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FF6600] mt-0.5" />
                  <div className="text-[11px] font-bold text-slate-600 uppercase leading-relaxed">
                    {selectedProject.address || selectedProject.location.address}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-slate-400" />
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    R: {selectedProject.validationRadiusMeters}m
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Info className="w-3 h-3" />
                Ver Panel de Control
              </button>
            </div>
          </div>
        )}

        {/* Project List Mini (Filtered) */}
        {!selectedProject && filteredProjects.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-96">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Centros Detectados ({filteredProjects.length})
              </span>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleMarkerClick(p)}
                  className="w-full p-4 text-left hover:bg-white transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                    <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600]" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[11px] font-black text-slate-800 uppercase truncate leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                      {p.address || p.location.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Viewport */}
      <div className="flex-1">
        <Map
          defaultCenter={{ lat: 40.4168, lng: -3.7038 }}
          defaultZoom={6}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
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
              <Pin 
                background={p.status === 'Active' ? '#FF6600' : '#64748b'} 
                glyphColor={'#fff'} 
                borderColor={'#fff'} 
              />
            </AdvancedMarker>
          ))}
        </Map>
      </div>

      {/* Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF6600]" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Activo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inactivo</span>
        </div>
      </div>
    </div>
  );
};
