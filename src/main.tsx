import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { GoogleMapsProvider } from './components/GoogleMapsProvider.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleMapsProvider>
        <App />
      </GoogleMapsProvider>
    </BrowserRouter>
  </StrictMode>,
);
