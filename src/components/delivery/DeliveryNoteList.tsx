import React from 'react';
import { Search, Filter, CheckCircle2, ChevronRight, Zap, FileText, Clock, Building2 } from 'lucide-react';
import { DeliveryNote, AppState } from '../../types';
import { Badge } from '../ui/Badge';

interface DeliveryNoteListProps {
  state: AppState;
  notes: DeliveryNote[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onSelect: (note: DeliveryNote) => void;
  onBatchConfirm: () => void;
}

export const DeliveryNoteList: React.FC<DeliveryNoteListProps> = ({
  state,
  notes,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onSelect,
  onBatchConfirm,
}) => {
  const user = state.currentUser;
  const isSubcontractor = user?.role === 'SUBCONTRACTOR_USER';

  // Count pending
  const pendingCount = notes.filter(n => n.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex overflow-x-auto no-scrollbar bg-brand-surface border border-brand-border p-1 rounded-xl gap-1">
          {(['ALL', 'Pending', 'Confirmed', 'Disputed'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap min-h-[38px] transition-all text-center ${
                statusFilter === filter 
                  ? 'bg-brand-accent text-white shadow-lg' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'Todos' : filter === 'Pending' ? 'Pendientes' : filter === 'Confirmed' ? 'Confirmados' : 'Disputados'}
            </button>
          ))}
        </div>

        {/* Action button for subcontractors to confirm in batch */}
        {isSubcontractor && pendingCount > 0 && (
          <button
            onClick={onBatchConfirm}
            className="btn-primary h-11 sm:h-10 px-5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 w-full sm:w-auto justify-center"
          >
            <Zap className="w-4 h-4" />
            <span>Firmar Lote ({pendingCount})</span>
          </button>
        )}
      </div>

      {/* Main Albaranes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div 
            key={note.id} 
            onClick={() => onSelect(note)}
            className="card group cursor-pointer hover:border-brand-accent/40 transition-all duration-300 flex flex-col"
          >
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-accent font-mono text-[10px] font-black">
                    {note.code}
                  </span>
                  <span className="text-[10px] text-brand-muted font-bold uppercase">{note.date}</span>
                </div>
                <Badge status={note.status} className="text-[9px] px-2 py-0.5 rounded uppercase font-black" />
              </div>

              <div>
                <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Subcontratista</div>
                <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors truncate">
                  {note.subcontractorCompanyName}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Obra / Proyecto</div>
                <div className="text-xs font-medium text-brand-muted uppercase truncate">
                  {note.projectNameSnapshot}
                </div>
              </div>

              <div className="pt-2">
                 <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Certificado</div>
                 <div className="flex items-center gap-1.5 text-sm font-black text-white font-mono">
                    <Clock className="w-4 h-4 text-brand-accent" />
                    <span>{note.totalHours} Horas</span>
                 </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-brand-surface/50 border-t border-brand-border flex items-center justify-between group-hover:bg-brand-surface transition-colors">
               <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Abrir Albarán</span>
               <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-12 text-center flex flex-col items-center gap-4 border-dashed border-brand-border">
            <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No hay albaranes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};
