import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Power, 
  ShieldCheck, 
  Sliders, 
  Copy, 
  Check, 
  Search, 
  Compass, 
  Code,
  Flame,
  Radio,
  Layers
} from 'lucide-react';
import { NeuCard } from './NeuCard';
import { NeuButton } from './NeuButton';
import { NeuInput } from './NeuInput';
import { NeuSwitch } from './NeuSwitch';
import toast from 'react-hot-toast';

export const NeuInteractiveDemo: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [powerActive, setPowerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [gpsActive, setGpsActive] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<'A' | 'B' | 'C'>('B');
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchText, setSearchText] = useState('Obra Residencial Mirador');

  const cssCodeSnippet = isLightMode
    ? `.neu-light-raised {
  background: #e2e8f0;
  box-shadow: 8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff;
}
.neu-light-pressed {
  background: #e2e8f0;
  box-shadow: inset 5px 5px 10px #cbd5e1, inset -5px -5px 10px #ffffff;
}`
    : `.neu-dark-raised {
  background: #18181b;
  box-shadow: 8px 8px 18px #09090b, -8px -8px 18px rgba(255, 255, 255, 0.04);
}
.neu-dark-pressed {
  background: #18181b;
  box-shadow: inset 5px 5px 12px #09090b, inset -5px -5px 12px rgba(255, 255, 255, 0.04);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cssCodeSnippet);
    setCopiedCode(true);
    toast.success('Reglas CSS copiadas al portapapeles');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl transition-colors duration-500 border ${
      isLightMode 
        ? 'bg-[#e2e8f0] border-slate-300 text-slate-800' 
        : 'bg-[#18181b] border-white/[0.04] text-white'
    }`}>
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-accent/15 text-brand-accent mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Neumorphism Soft UI Playground
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight">
            Consola Táctil Neumórfica
          </h3>
          <p className="text-xs opacity-70">
            Controles extruidos y bajo relieve moldeados directamente sobre el mismo material de fondo.
          </p>
        </div>

        {/* Theme mode toggle */}
        <div className="flex items-center gap-2">
          <NeuButton
            lightMode={isLightMode}
            active={!isLightMode}
            onClick={() => setIsLightMode(false)}
            className="text-[10px]"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </NeuButton>
          <NeuButton
            lightMode={isLightMode}
            active={isLightMode}
            onClick={() => setIsLightMode(true)}
            className="text-[10px]"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </NeuButton>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        
        {/* Column 1: Buttons & Toggles */}
        <div className="space-y-5">
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">
            1. Botones Extruidos e Interactivos
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NeuButton
              lightMode={isLightMode}
              active={powerActive}
              onClick={() => {
                setPowerActive(!powerActive);
                toast(powerActive ? 'Dispositivo en reposo' : 'Dispositivo en línea', { icon: '⚡' });
              }}
            >
              <Power className={`w-4 h-4 ${powerActive ? 'text-emerald-400' : ''}`} />
              <span>{powerActive ? 'Encendido' : 'Apagado'}</span>
            </NeuButton>

            <NeuButton
              lightMode={isLightMode}
              active={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-accent" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Audio Activo' : 'Mute'}</span>
            </NeuButton>

            <NeuButton
              lightMode={isLightMode}
              onClick={() => toast.success('Comando háptico enviado')}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Pulsar</span>
            </NeuButton>
          </div>

          <div className="pt-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider opacity-60">
              2. Interruptores Táctiles (*Switches*)
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <NeuSwitch
                lightMode={isLightMode}
                checked={gpsActive}
                onChange={setGpsActive}
                label="Geolocalización GPS"
              />
              <NeuSwitch
                lightMode={isLightMode}
                checked={soundEnabled}
                onChange={setSoundEnabled}
                label="Alertas Sonoras"
              />
            </div>
          </div>

          {/* Segmented Channel Selector */}
          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider opacity-60">
              3. Selector de Canal Segmentado
            </div>
            <div className="flex items-center gap-2">
              {(['A', 'B', 'C'] as const).map((ch) => (
                <NeuButton
                  key={ch}
                  lightMode={isLightMode}
                  active={selectedChannel === ch}
                  onClick={() => setSelectedChannel(ch)}
                  className="w-12 h-10"
                >
                  {ch}
                </NeuButton>
              ))}
              <span className="text-xs font-mono opacity-60 pl-2">
                Canal Seleccionado: <strong>{selectedChannel}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Sunken inputs & Code snippet */}
        <div className="space-y-5">
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">
            4. Campo de Entrada Hundido (*Sunken Input*)
          </div>

          <NeuInput
            lightMode={isLightMode}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar en el catálogo..."
            icon={<Search className="w-4 h-4" />}
          />

          {/* Live Box-Shadow Inspector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-60">
              <span>CSS Box-Shadow en Tiempo Real</span>
              <button
                onClick={handleCopyCode}
                className="hover:text-brand-accent flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto border ${
              isLightMode
                ? 'bg-slate-300/60 border-slate-300 text-slate-800'
                : 'bg-black/50 border-white/[0.05] text-emerald-400'
            }`}>
              {cssCodeSnippet}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};
