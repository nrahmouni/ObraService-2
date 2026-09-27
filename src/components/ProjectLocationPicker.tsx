import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Search, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Navigation, 
  Check, 
  Compass,
  AlertCircle,
  Crosshair,
  Sparkles
} from 'lucide-react';

interface ProjectLocationPickerProps {
  initialLat: number;
  initialLng: number;
  radiusMeters?: number;
  initialAddress?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  onRadiusChange?: (radius: number) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'Madrid (Castellana)', address: 'Paseo de la Castellana 140, Madrid', lat: 40.4530, lng: -3.6883 },
  { name: 'Madrid (Puerta de Hierro)', address: 'Av. de Miraflores 44, Madrid', lat: 40.4632, lng: -3.7310 },
  { name: 'Barcelona (Diagonal)', address: 'Avinguda Diagonal 405, Barcelona', lat: 41.3965, lng: 2.1558 },
  { name: 'Valencia (Marina / Puerto)', address: 'Carrer de la Marina 15, Valencia', lat: 39.4628, lng: -0.3275 },
  { name: 'Sevilla (Cartuja)', address: 'Camilo José Cela s/n, Sevilla', lat: 37.4082, lng: -6.0025 },
  { name: 'Bilbao (Abandoibarra)', address: 'Abandoibarra Etorb., 2, Bilbao', lat: 43.2687, lng: -2.9340 },
];

export const ProjectLocationPicker: React.FC<ProjectLocationPickerProps> = ({
  initialLat,
  initialLng,
  radiusMeters = 300,
  initialAddress = '',
  onLocationChange,
  onRadiusChange,
  isFullScreen = false,
  onToggleFullScreen
}) => {
  const [currentLat, setCurrentLat] = useState(initialLat || 40.4168);
  const [currentLng, setCurrentLng] = useState(initialLng || -3.7038);
  const [radius, setRadius] = useState(radiusMeters);
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || 'Ubicación seleccionada');
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [isSearching, setIsSearching] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(16);

  // Sync internal state if initial props change
  useEffect(() => {
    if (initialLat && initialLng) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    if (radiusMeters) {
      setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  const handleRadiusUpdate = (newRadius: number) => {
    setRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setCurrentLat(preset.lat);
    setCurrentLng(preset.lng);
    setSearchQuery(preset.address);
    setSelectedAddress(preset.address);
    onLocationChange(preset.lat, preset.lng, preset.address);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=es,ad,pt`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        const formatted = item.display_name.split(',').slice(0, 3).join(', ');
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setSelectedAddress(formatted);
        onLocationChange(newLat, newLng, formatted);
      } else {
        const matched = PRESET_LOCATIONS.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase()));
        if (matched) {
          handleSelectPreset(matched);
        } else {
          setSelectedAddress(searchQuery);
          onLocationChange(currentLat, currentLng, searchQuery);
        }
      }
    } catch {
      setSelectedAddress(searchQuery);
      onLocationChange(currentLat, currentLng, searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  // Convert geodetic lat/lng to OpenStreetMap tile coordinates
  const latRad = (currentLat * Math.PI) / 180;
  const n = Math.pow(2, zoomLevel);
  const xTile = Math.floor(((currentLng + 180) / 360) * n);
  const yTile = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  // Map Tile URL
  const getTileUrl = (x: number, y: number, z: number) => {
    if (mapType === 'satellite') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  const metersPerPixel = (156543.03392 * Math.cos(latRad)) / Math.pow(2, zoomLevel);
  const radiusPixels = Math.max(24, Math.min(280, Math.round(radius / metersPerPixel)));

  return (
    <div className={`relative flex flex-col ${isFullScreen ? 'h-full w-full' : 'h-[400px] sm:h-[440px] rounded-2xl'} border border-slate-800 bg-slate-950 overflow-hidden shadow-inner font-sans select-none`}>
      {/* Top Floating Bar: Address Search & Quick Controls */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar dirección, polígono o localidad..."
              className="w-full h-10 pl-10 pr-22 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-accent shadow-lg"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? '...' : 'Buscar'}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Map Layer Switcher */}
          <div className="flex bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-0.5 shadow-lg">
            <button
              type="button"
              onClick={() => setMapType('streets')}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mapType === 'streets' ? 'bg-brand-accent text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calles
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mapType === 'satellite' ? 'bg-brand-accent text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satélite
            </button>
          </div>

          {/* Full Screen Toggle */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="h-9 px-2.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 rounded-xl border border-slate-700 text-slate-300 hover:text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
              title={isFullScreen ? 'Reducir tamaño' : 'Pantalla Completa'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Preset Suggestions Pill List */}
      <div className="absolute top-16 inset-x-3 z-20 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-accent bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shrink-0 flex items-center gap-1 border border-slate-700">
          <Sparkles className="w-3 h-3 text-brand-accent" />
          Rápido:
        </span>
        {PRESET_LOCATIONS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-300 hover:text-white whitespace-nowrap shadow-sm transition-all cursor-pointer shrink-0 hover:border-brand-accent"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Canvas / Tiles */}
      <div 
        className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left - rect.width / 2;
          const clickY = e.clientY - rect.top - rect.height / 2;
          const latShift = -(clickY * metersPerPixel) / 111320;
          const lngShift = (clickX * metersPerPixel) / (111320 * Math.cos(latRad));
          const newLat = Number((currentLat + latShift).toFixed(6));
          const newLng = Number((currentLng + lngShift).toFixed(6));
          setCurrentLat(newLat);
          setCurrentLng(newLng);
          onLocationChange(newLat, newLng, selectedAddress);
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-wrap w-[768px] h-[768px] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 absolute [&>img]:w-[256px] [&>img]:h-[256px]">
            {[-1, 0, 1].map((dy) =>
              [-1, 0, 1].map((dx) => (
                <img
                  key={`${dx}_${dy}`}
                  src={getTileUrl(xTile + dx, yTile + dy, zoomLevel)}
                  alt="Mapa"
                  className="w-[256px] h-[256px] object-cover pointer-events-none select-none brightness-[0.88] contrast-[1.05]"
                  loading="lazy"
                />
              ))
            )}
          </div>
        </div>

        {/* Center Crosshair & Visual Geofence Circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            style={{ width: `${radiusPixels * 2}px`, height: `${radiusPixels * 2}px` }}
            className="rounded-full border-2 border-dashed border-brand-accent/90 bg-brand-accent/15 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 shadow-2xl relative"
          >
            <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest shadow-md">
              Geocerca: {radius}m
            </div>

            <div 
              style={{ width: `${radiusPixels * 1.2}px`, height: `${radiusPixels * 1.2}px` }}
              className="rounded-full border border-brand-accent/40 transition-all duration-300"
            />
          </div>

          <div className="absolute -translate-y-6 flex flex-col items-center pointer-events-none">
            <div className="w-9 h-9 rounded-2xl bg-brand-accent text-white flex items-center justify-center shadow-2xl shadow-orange-950/60 border-2 border-white transform hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5 fill-white text-white drop-shadow" />
            </div>
            <div className="w-2.5 h-2.5 bg-brand-accent rounded-full mt-1 ring-4 ring-brand-accent/30 animate-pulse" />
          </div>
        </div>

        {/* Map Zoom Controls */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-1 shadow-lg">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 1, 18)); }}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            title="Acercar mapa"
          >
            +
          </button>
          <div className="h-px bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 1, 13)); }}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            title="Alejar mapa"
          >
            −
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Bar: Geofence Slider & Telemetry */}
      <div className="p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Radius adjustment with quick presets */}
        <div className="w-full sm:w-auto flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Compass className="w-3.5 h-3.5 text-brand-accent" />
              <span>Radio Geofence: <strong className="text-brand-accent text-sm">{radius} m</strong></span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-tight">
              Margen de Fichaje
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={radius}
              onChange={(e) => handleRadiusUpdate(parseInt(e.target.value) || 200)}
              className="flex-1 accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex gap-1">
              {[100, 250, 500].map((presetR) => (
                <button
                  key={presetR}
                  type="button"
                  onClick={() => handleRadiusUpdate(presetR)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    radius === presetR
                      ? 'bg-brand-accent text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {presetR}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GPS Coordinates Badge & Confirmed Address */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2.5 text-right">
          <div className="text-left sm:text-right">
            <span className="block text-[11px] font-bold text-white truncate max-w-[200px] sm:max-w-[240px]">
              {selectedAddress || 'Ubicación Georreferenciada'}
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-400">
              LAT: {currentLat.toFixed(4)} • LNG: {currentLng.toFixed(4)}
            </span>
          </div>
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </div>
    </div>
  );
};
