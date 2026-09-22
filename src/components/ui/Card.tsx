import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  selected = false,
  badge,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative bg-brand-surface border rounded-xl p-5 md:p-6 transition-all duration-200
        ${selected ? 'border-brand-accent ring-1 ring-brand-accent/30' : 'border-slate-800/80'} 
        ${hoverable ? 'hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer hover:shadow-lg hover:shadow-black/25' : ''} 
        ${className}`}
      {...props}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          {badge}
        </div>
      )}
      {children}
    </div>
  );
};
