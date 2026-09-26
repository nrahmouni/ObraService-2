import React from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  lightMode?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export const NeuInput: React.FC<NeuInputProps> = ({
  lightMode = false,
  label,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[11px] font-bold text-brand-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-brand-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full py-2.5 sm:py-3 rounded-2xl text-xs outline-none transition-all ${
            icon ? 'pl-10 pr-4' : 'px-4'
          } ${
            lightMode
              ? 'neu-light-pressed text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-accent'
              : 'neu-dark-pressed text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-brand-accent border border-white/[0.02]'
          } ${className}`}
        />
      </div>
    </div>
  );
};
