import React from 'react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'default' | 'accent' | 'success';
  lightMode?: boolean;
  children: React.ReactNode;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  active = false,
  variant = 'default',
  lightMode = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getButtonClass = () => {
    if (lightMode) {
      if (active) return 'neu-light-pressed text-brand-accent font-bold';
      return 'neu-light-button text-slate-800 hover:text-brand-accent';
    }

    if (active) {
      return 'neu-dark-pressed text-brand-accent font-bold border border-brand-accent/20';
    }

    return 'neu-dark-button text-white hover:text-brand-accent border border-white/[0.04]';
  };

  const getVariantTextColor = () => {
    if (active) return '';
    if (variant === 'accent') return 'text-brand-accent';
    if (variant === 'success') return 'text-emerald-400';
    return '';
  };

  return (
    <button
      disabled={disabled}
      className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer select-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${getButtonClass()} ${getVariantTextColor()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
