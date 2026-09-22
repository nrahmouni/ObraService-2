import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconRight = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-accent/50 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap min-h-[44px] px-4 cursor-pointer';

  const variants = {
    primary: 'bg-brand-accent text-white hover:bg-brand-accent/90 border border-transparent shadow-md shadow-brand-accent/10',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-transparent shadow-md shadow-red-600/10',
    ghost: 'bg-transparent hover:bg-slate-800/80 text-slate-300 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] min-h-[36px] rounded-lg',
    md: 'px-5 py-2.5 text-xs min-h-[44px]',
    lg: 'px-6 py-3.5 text-sm min-h-[50px] rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && icon && !iconRight && <span className="mr-1.5 shrink-0">{icon}</span>}
      <span>{children}</span>
      {!isLoading && icon && iconRight && <span className="ml-1.5 shrink-0">{icon}</span>}
    </button>
  );
};
