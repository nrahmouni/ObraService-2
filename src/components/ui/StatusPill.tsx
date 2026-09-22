import React from 'react';
import { Check, Clock, AlertTriangle, ShieldAlert, Ban, Info } from 'lucide-react';

export type ProjectStatus = 'Planned' | 'Active' | 'Paused' | 'Completed' | 'Archived';
export type DeliveryNoteStatus = 'Pending' | 'Confirmed' | 'Disputed';
export type SubcontractorStatus = 'Active' | 'Pending' | 'Terminated';

export interface StatusPillProps {
  status: ProjectStatus | DeliveryNoteStatus | SubcontractorStatus | string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  let label = status;
  let variant: 'info' | 'success' | 'warning' | 'neutral' | 'danger' = 'neutral';
  let Icon: React.ComponentType<{ className?: string }> | null = null;

  switch (status) {
    // Projects
    case 'Planned':
      label = 'Planificado';
      variant = 'info';
      Icon = Info;
      break;
    case 'Active':
      label = 'Activo';
      variant = 'success';
      Icon = Check;
      break;
    case 'Paused':
      label = 'Pausado';
      variant = 'warning';
      Icon = Clock;
      break;
    case 'Completed':
      label = 'Terminado';
      variant = 'neutral';
      Icon = Check;
      break;
    case 'Archived':
      label = 'Archivado';
      variant = 'danger';
      Icon = Ban;
      break;

    // Delivery Notes & Relationship Pending
    case 'Pending':
      label = 'Pendiente';
      variant = 'warning';
      Icon = Clock;
      break;
    case 'Confirmed':
      label = 'Confirmado';
      variant = 'success';
      Icon = Check;
      break;
    case 'Disputed':
      label = 'Disputado';
      variant = 'danger';
      Icon = ShieldAlert;
      break;

    // Relationship Terminated
    case 'Terminated':
      label = 'Finalizado';
      variant = 'danger';
      Icon = Ban;
      break;

    default:
      label = status;
      variant = 'neutral';
  }

  const variantStyles = {
    info: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
    warning: 'bg-amber-950/40 text-amber-400 border-amber-900/50',
    danger: 'bg-rose-950/40 text-rose-400 border-rose-900/50',
    neutral: 'bg-slate-900/60 text-slate-400 border-slate-800/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
