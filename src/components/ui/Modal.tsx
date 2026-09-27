import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true" 
      />
      
      {/* Modal Dialog Content Container */}
      <div className={`relative w-full ${maxWidth} bg-brand-surface border border-brand-border text-brand-text rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] z-10 my-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-brand-border shrink-0 bg-brand-surface/90">
          <h3 id="modal-title" className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate pr-2">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-bg/80 border border-brand-border/60 flex items-center justify-center text-brand-muted hover:text-white hover:bg-brand-surface-hover transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        
        {/* Scrollable Body - with safe scrolling in landscape */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 max-h-[calc(100dvh-7rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;

