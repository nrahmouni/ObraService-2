import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  disabled,
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea_${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        rows={rows}
        className={`w-full bg-brand-surface border text-sm text-brand-text placeholder-slate-500 rounded-xl px-4 py-3 transition-all outline-none resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20'} 
          disabled:opacity-50 disabled:bg-slate-900 disabled:pointer-events-none ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-red-500 font-medium mt-0.5 leading-none">
          {error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
