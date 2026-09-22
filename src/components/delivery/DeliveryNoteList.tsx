import React from 'react';
import { Search, Filter, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { DeliveryNote, AppState } from '../../types';
import { Table } from '../ui/Table';
import { StatusPill } from '../ui/StatusPill';

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
    <div className="space-y-4 font-sans text-slate-300 animate-in fade-in">
      {/* Filters Card */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'Pending', 'Confirmed', 'Disputed'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === filter 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
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
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Firmar en Lote ({pendingCount})</span>
          </button>
        )}
      </div>

      {/* Main Albaranes List */}
      <div className="flex flex-col space-y-3 w-full">
        {notes.map(note => (
          <div 
            key={note.id} 
            className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer flex flex-col space-y-3 group shadow-lg"
            onClick={() => onSelect(note)}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-100 uppercase font-mono tracking-wider">{note.code}</span>
                <span className="text-[10px] text-slate-400 font-bold">• {note.date}</span>
              </div>
              <StatusPill status={note.status} />
            </div>

            <div className="flex flex-col space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Empresa Subcontratista</span>
                <span className="font-bold text-slate-200 uppercase">{note.subcontractorCompanyName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Obra / Proyecto</span>
                <span className="font-medium text-slate-300 uppercase">{note.projectNameSnapshot}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total:</span>
                <span className="font-black text-brand-accent font-mono">{note.totalHours} Horas</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-brand-accent transition-colors">
                <span>Ver Albarán</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No se han encontrado albaranes de jornada registrados
          </div>
        )}
      </div>
    </div>
  );
};
