import React from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingValueProp } from '../components/landing/LandingValueProp';

interface PublicEntryViewProps {
  onOpenLogin: () => void;
  onOpenRegister: (planName?: string) => void;
  onOpenJoinCode: () => void;
  onDemoAccess: () => void;
}

export const PublicEntryView: React.FC<PublicEntryViewProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenJoinCode,
  onDemoAccess,
}) => {
  return (
    <div className="flex flex-col bg-slate-950 min-h-screen">
      <main>
        <LandingHero 
          onStart={() => onOpenRegister()} 
          onLogin={onOpenLogin} 
          onDemo={onDemoAccess}
        />
        
        <LandingValueProp />
      </main>
    </div>
  );
};
