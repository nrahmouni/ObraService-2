import React, { useEffect } from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Navegación Rápida',
      shortcuts: [
        { keys: ['G', 'D'], desc: 'Ir al Panel Principal (Dashboard)' },
        { keys: ['G', 'P'], desc: 'Ver Partes Diarios de Trabajo' },
        { keys: ['G', 'A'], desc: 'Ver Albaranes Digitales' },
        { keys: ['G', 'O'], desc: 'Ver Listado de Obras y Tajos' },
        { keys: ['G', 'M'], desc: 'Ver Mapa Cartográfico y Geocercas GPS' },
        { keys: ['G', 'E'], desc: 'Ver Subcontratas y Empresas' },
      ]
    },
    {
      category: 'Operaciones en Obra',
      shortcuts: [
        { keys: ['N'], desc: 'Emitir Nuevo Parte Diario de Trabajo' },
        { keys: ['F'], desc: 'Fichar Entrada / Salida con GPS' },
        { keys: ['C'], desc: 'Abrir Canal de Chat y Coordinación de Tajo' },
        { keys: ['D'], desc: 'Generar Datos Test Aleatorios (Modo Demo)' },
      ]
    },
    {
      category: 'Atajos Globales',
      shortcuts: [
        { keys: ['?'], desc: 'Abrir este panel de ayuda de atajos de teclado' },
        { keys: ['Esc'], desc: 'Cerrar ventana emergente o modal activo' },
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div 
        className="w-full max-w-lg bg-brand-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-brand-bg/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="keyboard-shortcuts-title" className="text-sm font-bold text-white uppercase tracking-wider">
                Atajos de Teclado
              </h2>
              <p className="text-[11px] text-brand-muted font-medium">Navegación ultrarrápida para oficina y jefatura</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface-hover transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Cerrar ventana de atajos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-accent">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((sc, sIdx) => (
                  <div 
                    key={sIdx} 
                    className="p-2.5 rounded-xl bg-brand-bg/70 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-200 font-medium">{sc.desc}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {sc.keys.map((k, kIdx) => (
                        <kbd 
                          key={kIdx} 
                          className="px-2 py-1 rounded bg-brand-surface border border-white/15 text-white font-mono text-[11px] font-bold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-brand-bg/50 flex items-center justify-between text-xs text-brand-muted font-mono">
          <span>Pulsa <kbd className="px-1.5 py-0.5 rounded bg-brand-surface border border-white/10 text-white font-bold">Esc</kbd> para salir</span>
          <span className="text-emerald-400 font-semibold">ObraService Pro</span>
        </div>
      </div>
    </div>
  );
};
