import React from 'react';
import { AppState } from '../types';
import { TabKey } from '../components/layout/AuthenticatedLayout';
import { MobileLanding } from '../components/MobileLanding';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { AdminMobileDashboard } from '../components/dashboard/AdminMobileDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile(768);

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

  // Segment dashboards for site managers
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

  // Dedicated Mobile Dashboard for Admins under 768px viewport width
  if (isMobile) {
    return (
      <div className="animate-in fade-in duration-300">
        <AdminMobileDashboard
          state={state}
          onNavigate={onNavigate}
          onOpenNewReport={onOpenNewReport}
        />
      </div>
    );
  }

  // High-density Desktop Admin Dashboard (>= 768px)
  return (
    <div className="animate-in fade-in duration-300">
      <AdminDashboard 
        state={state} 
        onNavigate={onNavigate} 
      />
    </div>
  );
};
