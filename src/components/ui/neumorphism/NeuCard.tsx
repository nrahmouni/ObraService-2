import React from 'react';

interface NeuCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'flat' | 'convex' | 'concave' | 'pressed';
  lightMode?: boolean;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  className = '',
  variant = 'flat',
  lightMode = false
}) => {
  const getVariantClass = () => {
    if (lightMode) {
      return variant === 'pressed' ? 'neu-light-pressed' : 'neu-light-flat';
    }
    switch (variant) {
      case 'convex':
        return 'neu-dark-convex';
      case 'concave':
        return 'neu-dark-concave';
      case 'pressed':
        return 'neu-dark-pressed';
      default:
        return 'neu-dark-flat';
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 border border-white/[0.03] transition-all duration-300 ${getVariantClass()} ${className}`}
    >
      {children}
    </div>
  );
};
