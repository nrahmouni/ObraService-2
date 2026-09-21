import React, { PropsWithChildren } from 'react';
import { APIProvider, APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const GoogleMapsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  if (!API_KEY) {
    console.warn('Google Maps API Key is missing. Maps will not be rendered.');
    return <>{children}</>;
  }

  return (
    <APIProvider 
      apiKey={API_KEY} 
      libraries={['places', 'marker']}
      solutionChannel="gmp_mcp_codeassist_v1_aistudio"
    >
      <InnerWrapper>{children}</InnerWrapper>
    </APIProvider>
  );
};

const InnerWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white border border-rose-200 p-6 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Error al cargar Mapas</h2>
          <p className="text-slate-600 text-sm mb-6">
            No se pudo inicializar Google Maps. Por favor, verifica tu clave de API y la configuración del proyecto.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
