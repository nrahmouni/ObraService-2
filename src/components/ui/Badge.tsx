import React from 'react';
import { Check, Clock, AlertTriangle, ShieldAlert, Lock, Info, Sparkles } from 'lucide-react';

export interface BadgeProps {
  children?: React.ReactNode;
  status?: string;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple' | 'locked';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  status,
  variant: manualVariant, 
  size = 'sm',
  icon,
  className = '' 
}) => {
  let resolvedVariant: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple' | 'locked' = manualVariant || 'neutral';
  let resolvedLabel = children;

  if (status) {
    switch (status) {
      case 'Pending':
        resolvedVariant = 'warning';
        resolvedLabel = resolvedLabel ?? 'Pendiente';
        break;
      case 'Confirmed':
        resolvedVariant = 'success';
        resolvedLabel = resolvedLabel ?? 'Confirmado';
        break;
      case 'Disputed':
        resolvedVariant = 'danger';
        resolvedLabel = resolvedLabel ?? 'Disputado';
        break;
      case 'Submitted':
        resolvedVariant = 'success';
        resolvedLabel = resolvedLabel ?? 'Enviado';
        break;
      case 'Corrected':
        resolvedVariant = 'warning';
        resolvedLabel = resolvedLabel ?? 'Corregido';
        break;
      case 'Draft':
        resolvedVariant = 'neutral';
        resolvedLabel = resolvedLabel ?? 'Borrador';
        break;
      case 'Active':
        resolvedVariant = 'success';
        resolvedLabel = resolvedLabel ?? 'En Ejecución';
        break;
      case 'Paused':
        resolvedVariant = 'warning';
        resolvedLabel = resolvedLabel ?? 'Pausada';
        break;
      case 'Completed':
        resolvedVariant = 'neutral';
        resolvedLabel = resolvedLabel ?? 'Terminada';
        break;
      case 'Archived':
        resolvedVariant = 'danger';
        resolvedLabel = resolvedLabel ?? 'Archivada';
        break;
      case 'Planned':
        resolvedVariant = 'info';
        resolvedLabel = resolvedLabel ?? 'Planificada';
        break;
      default:
        resolvedVariant = manualVariant || 'neutral';
        resolvedLabel = resolvedLabel ?? status;
    }
  }

  const variantStyles = {
    // Industrial Design System exact specs:
    // Pendiente: #FEF3C7 background, #D97706 border and text
    warning: 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]/40 font-bold',
    // Confirmado: #D1FAE5 background, #059669 border and text
    success: 'bg-[#D1FAE5] text-[#059669] border-[#059669]/40 font-bold',
    // Disputado: #FFE4E6 background, #E11D48 border and text
    danger: 'bg-[#FFE4E6] text-[#E11D48] border-[#E11D48]/40 font-bold',
    // Bloqueado / Corregido: #F1F5F9 background, #64748B border and text
    neutral: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] font-semibold',
    locked: 'bg-[#F1F5F9] text-[#64748B] border-[#94A3B8]/50 font-bold',
    // Engineering Cobalt / Info
    info: 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/40 font-bold',
    purple: 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/40 font-bold',
  };

  const defaultIcons = {
    warning: <Clock className="w-3 h-3 shrink-0 text-[#D97706]" />,
    success: <Check className="w-3 h-3 shrink-0 text-[#059669]" />,
    danger: <ShieldAlert className="w-3 h-3 shrink-0 text-[#E11D48]" />,
    neutral: null,
    locked: <Lock className="w-3 h-3 shrink-0 text-[#64748B]" />,
    info: <Info className="w-3 h-3 shrink-0 text-[#2563EB]" />,
    purple: <Sparkles className="w-3 h-3 shrink-0 text-[#4F46E5]" />,
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5 tracking-wider uppercase',
    md: 'px-2.5 py-1 text-xs gap-1.5 tracking-wider uppercase',
  };

  const chosenIcon = icon !== undefined ? icon : defaultIcons[resolvedVariant];

  return (
    <span 
      className={`inline-flex items-center rounded border whitespace-nowrap ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {chosenIcon}
      <span>{resolvedLabel}</span>
    </span>
  );
};
