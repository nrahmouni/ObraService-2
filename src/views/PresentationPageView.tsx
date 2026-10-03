import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImmersivePresentation } from '../components/presentation/ImmersivePresentation';
import { obraStore } from '../services/store';
import toast from 'react-hot-toast';

export const PresentationPageView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden z-50">
      <ImmersivePresentation
        isOpen={true}
        onClose={() => navigate('/')}
        onLaunchDemo={() => {
          obraStore.enterDemoMode();
          toast.success('🚀 Entorno Demo activado. Has iniciado sesión como Director General.');
          navigate('/admin/dashboard');
        }}
      />
    </div>
  );
};
