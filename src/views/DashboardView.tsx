import React from 'react';
import { AppState } from '../types';
import { TabKey } from '../components/MainLayout';
import { MobileLanding } from '../components/MobileLanding';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenNewReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenNewReport,
}) => {
  const user = state.currentUser;

  if (!user) return null;

  const isWorker = user.role === 'SUBCONTRACTOR_USER';
  const isManager = user.role === 'SITE_MANAGER';

  // Mobile minimalist layout for field operators/workers
  if (isWorker) {
    return (
      <div className="animate-in fade-in duration-300">
        <MobileLanding
          state={state}
          onNavigate={onNavigate}
          onOpenNewReport={onOpenNewReport}
        />
      </div>
    );
  }

  // Segment dashboards for site managers and master administrators
  if (isManager) {
    return (
      <div className="animate-in fade-in duration-300">
        <ManagerDashboard 
          state={state} 
          onNavigate={onNavigate} 
          onOpenNewReport={onOpenNewReport} 
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <AdminDashboard 
        state={state} 
        onNavigate={onNavigate} 
      />
    </div>
  );
};
