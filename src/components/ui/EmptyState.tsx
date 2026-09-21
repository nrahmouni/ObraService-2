import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  const ActionIcon = action?.icon;

  return (
    <div className={`p-8 md:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3.5 group-hover:scale-105 transition-transform">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1.5">
        {title}
      </h4>
      <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed mb-4">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#e65c00] active:scale-95 transition-all shadow-sm"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
};
