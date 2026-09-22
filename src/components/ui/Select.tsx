import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  icon,
  children,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const selectId = id || `select_${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full bg-[#18181B] border text-xs font-bold text-white rounded-xl px-4 py-3 min-h-[44px] transition-all outline-none appearance-none cursor-pointer [&>option]:bg-[#18181B] [&>option]:text-white [&>option]:py-2
            ${icon ? 'pl-11' : ''} 
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#27272A] hover:border-[#3F3F46] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20'} 
            disabled:opacity-50 disabled:bg-[#121214] disabled:pointer-events-none ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 text-slate-400 pointer-events-none flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-medium mt-0.5 leading-none">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
