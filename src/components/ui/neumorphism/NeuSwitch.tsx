import React from 'react';

interface NeuSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  lightMode?: boolean;
}

export const NeuSwitch: React.FC<NeuSwitchProps> = ({
  checked,
  onChange,
  label,
  lightMode = false
}) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${
          lightMode ? 'neu-light-pressed' : 'neu-dark-pressed'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full transition-all duration-300 transform flex items-center justify-center ${
            checked
              ? 'translate-x-6 bg-brand-accent shadow-md shadow-brand-accent/40 text-white'
              : lightMode
                ? 'translate-x-0 neu-light-flat bg-slate-200'
                : 'translate-x-0 neu-dark-flat bg-zinc-800'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              checked ? 'bg-white' : 'bg-brand-muted/60'
            }`}
          />
        </div>
      </div>
      {label && (
        <span className={`text-xs font-bold ${lightMode ? 'text-slate-700' : 'text-zinc-300'}`}>
          {label}
        </span>
      )}
    </label>
  );
};
