import React from 'react';
import { ObraServiceLogo } from './ObraServiceLogo';

export const MobileLanding: React.FC = () => (
  <div className="min-h-screen bg-[#121417] text-white p-4 flex flex-col items-center justify-center font-sans">
    <div className="mb-12">
      <ObraServiceLogo className="w-64" />
    </div>
    
    <div className="text-center mb-12">
      <h1 className="text-4xl font-black tracking-tighter mb-4">CONSTRUCCIÓN <br /><span className="text-[#FF6600]">SIN FRICCIÓN</span></h1>
      <p className="text-slate-400 text-sm">Red inteligente para contratistas y subcontratas.</p>
    </div>

    <div className="w-full space-y-3">
      <button className="w-full bg-[#FF6600] text-white p-4 rounded-xl font-bold active:scale-95 transition-transform">
        Acceso Contratista
      </button>
      <button className="w-full bg-[#1F2329] text-white p-4 rounded-xl font-bold border border-slate-700 active:scale-95 transition-transform">
        Acceso Subcontrata
      </button>
    </div>
  </div>
);
