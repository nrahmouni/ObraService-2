import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  iconRight,
  className = '',
  disabled,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input_${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full bg-brand-surface border text-sm text-brand-text placeholder-slate-500 rounded-xl px-4 py-3 min-h-[44px] transition-all outline-none 
            ${icon ? 'pl-11' : ''} 
            ${iconRight ? 'pr-11' : ''} 
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20'} 
            disabled:opacity-50 disabled:bg-slate-900 disabled:pointer-events-none ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-medium mt-0.5 leading-none">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
