import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  label?: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción...',
  icon,
  searchable = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable && searchTerm.trim() !== ''
    ? options.filter(o => 
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.description && o.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 select-none">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] focus:border-[#EA580C] text-xs font-bold text-white rounded-xl px-3.5 py-3 min-h-[44px] transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'border-[#EA580C] ring-1 ring-[#EA580C]/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate text-left ${selectedOption ? 'text-white' : 'text-zinc-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#EA580C]' : ''}`} />
      </button>

      {/* Options Popup Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-2 border-b border-[#27272A] bg-[#121214]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto p-1 divide-y divide-[#27272A]/40 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-zinc-500 text-center">No se encontraron opciones.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EA580C]/15 text-[#EA580C]'
                        : 'text-zinc-300 hover:bg-[#27272A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-zinc-500 font-normal truncate">{opt.description}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#EA580C] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
