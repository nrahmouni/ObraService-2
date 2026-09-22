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

      {/* Main Albaranes Grid/Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <Table headers={['Código / Referencia', 'Empresa Subcontratista', 'Obra / Proyecto', 'Total Horas', 'Estado', '']}>
          {notes.map(note => (
            <tr 
              key={note.id} 
              className="border-b border-slate-800/40 last:border-0 hover:bg-slate-900/40 transition-colors cursor-pointer group"
              onClick={() => onSelect(note)}
            >
              <td className="px-6 py-4">
                <div className="text-xs font-black text-slate-200 uppercase tracking-wider font-mono">{note.code}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">{note.date}</div>
              </td>

              <td className="px-6 py-4 text-xs font-bold text-slate-300 uppercase">
                {note.subcontractorCompanyName}
              </td>

              <td className="px-6 py-4 text-xs font-bold text-slate-300 uppercase">
                {note.projectNameSnapshot}
              </td>

              <td className="px-6 py-4 text-xs font-black text-brand-accent font-mono">
                {note.totalHours} H
              </td>

              <td className="px-6 py-4">
                <StatusPill status={note.status} />
              </td>

              <td className="px-6 py-4 text-right">
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all inline" />
              </td>
            </tr>
          ))}
        </Table>

        {notes.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            No se han encontrado albaranes de jornada registrados
          </div>
        )}
      </div>
    </div>
  );
};
