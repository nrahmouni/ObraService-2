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
    console.warn('Google Maps API failed to load. The app will continue running without interactive maps.');
  }

  return <>{children}</>;
};
