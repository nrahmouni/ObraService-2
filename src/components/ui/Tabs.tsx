import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 border-b border-slate-800/80 w-full overflow-x-auto scrollbar-none pb-px ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-all outline-none whitespace-nowrap cursor-pointer min-h-[44px]
              ${isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none shrink-0
                ${isActive ? 'bg-brand-accent/20 text-brand-accent' : 'bg-slate-800 text-slate-300'}`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
