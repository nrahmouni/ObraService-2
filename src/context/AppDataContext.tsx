import React, { createContext, useContext, ReactNode } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Project, DailyReport, DeliveryNote } from '../types';

interface AppDataContextType {
  projects: Project[];
  reports: DailyReport[];
  deliveryNotes: DeliveryNote[];
  loading: boolean;
  isOffline: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
  companyId?: string | null;
  value?: AppDataContextType;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children, companyId, value }) => {
  const data = useAppData(companyId);

  return (
    <AppDataContext.Provider value={value || data}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppDataContext must be used within an AppDataProvider');
  }
  return context;
};
