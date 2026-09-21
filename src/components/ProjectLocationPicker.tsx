import React, { useEffect, useRef, useState } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface ProjectLocationPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  radiusMeters?: number;
}

export const ProjectLocationPicker: React.FC<ProjectLocationPickerProps> = ({
  initialLat,
  initialLng,
  onLocationChange,
  radiusMeters = 350
}) => {
  const [markerLocation, setMarkerLocation] = useState({ lat: initialLat, lng: initialLng });
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLibrary || !autocompleteInputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
      fields: ['geometry', 'formatted_address'],
      types: ['address']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        const newAddress = place.formatted_address || '';
        
        setMarkerLocation({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng, newAddress);
        
        if (map) {
          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(16);
        }
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [placesLibrary, map, onLocationChange]);

  // Update circle when radius or location changes
  useEffect(() => {
    if (!map) return;
    
    const circle = new google.maps.Circle({
      strokeColor: '#FF6600',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF6600',
      fillOpacity: 0.1,
      map,
      center: markerLocation,
      radius: radiusMeters,
    });

    return () => circle.setMap(null);
  }, [map, markerLocation, radiusMeters]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={autocompleteInputRef}
          type="text"
          placeholder="Busca la ubicación exacta de la obra..."
          className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] outline-none shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <Map
          defaultCenter={markerLocation}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onCenterChanged={(ev) => {
            // Optional: allow dragging map to reposition marker
          }}
        >
          <AdvancedMarker position={markerLocation} />
        </Map>
      </div>
      
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          GPS: {markerLocation.lat.toFixed(6)}, {markerLocation.lng.toFixed(6)}
        </span>
      </div>
    </div>
  );
};
