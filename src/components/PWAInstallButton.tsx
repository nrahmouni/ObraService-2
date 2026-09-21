import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide the installer trigger if already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge / Desktop PWA flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-md text-[11px] font-bold transition-all bg-[#FF6600] text-white hover:bg-[#e05a00] shadow-sm cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar Aplicación</span>
      </button>
    );
  }

  // iOS Safari Custom Installation Prompt Guidance
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border border-[#FF6600]/30 text-[#FF6600] hover:bg-[#FF6600]/5 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Instalar en iPhone / iPad</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                1. Pulsa el botón de <strong>Compartir</strong> (icono con flecha hacia arriba) en la barra inferior de Safari.<br /><br />
                2. Desplaza hacia abajo las opciones y selecciona <strong>Añadir a la pantalla de inicio</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
