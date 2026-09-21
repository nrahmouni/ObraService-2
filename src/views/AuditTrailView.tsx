import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  User, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle,
  Building2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { obraStore } from '../services/store';
import { Badge } from '../components/ui/Badge';
import { AppState } from '../types';

interface AuditTrailViewProps {
  state: AppState;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ state }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredEvents = state.auditEvents.filter((event) => {
    const matchesSearch = 
      event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.recordCode && event.recordCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const eventOp = event.operation || event.eventType;
    const matchesType = typeFilter === 'ALL' || eventOp === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-display">
            Libro de Registro Inmutable y Trazabilidad
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5 font-display">
            <History className="w-6 h-6 text-[#D97706]" />
            Cadena de Custodia y Auditoría
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-medium">
            Registro append-only inalterable de todas las operaciones, validaciones, firmas y correcciones en la plataforma.
          </p>
        </div>
      </div>

      {/* Filters & 1-Click Type Chips */}
      <div className="bg-white border border-[#CBD5E1] rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (DR-..., DN-...), usuario o acción..."
              className="w-full min-h-[44px] pl-9 pr-4 py-2 text-xs rounded border border-[#CBD5E1] focus:outline-hidden focus:border-[#D97706] text-[#0F172A] bg-white font-medium"
            />
          </div>

          {/* 1-Click Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                typeFilter === 'ALL' 
                  ? 'bg-[#0F172A] text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({state.auditEvents.length})
            </button>
            <button
              onClick={() => setTypeFilter('REPORT_SUBMITTED')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                typeFilter === 'REPORT_SUBMITTED' 
                  ? 'bg-[#D97706] text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Partes Enviados
            </button>
            <button
              onClick={() => setTypeFilter('DELIVERY_NOTE_CONFIRMED')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                typeFilter === 'DELIVERY_NOTE_CONFIRMED' 
                  ? 'bg-[#059669] text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Albaranes Certificados
            </button>
            <button
              onClick={() => setTypeFilter('DELIVERY_NOTE_DISPUTED')}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                typeFilter === 'DELIVERY_NOTE_DISPUTED' 
                  ? 'bg-[#E11D48] text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Disputas
            </button>
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="bg-white border border-[#CBD5E1] rounded p-6 shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-700 font-medium">
            No se han encontrado registros de auditoría para los criterios seleccionados.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#CBD5E1] space-y-5">
            {filteredEvents.map((event) => {
              const currentOp = event.operation || event.eventType || 'EVENT';
              const isDispute = currentOp.includes('DISPUTED');
              const isConfirmed = currentOp.includes('CONFIRMED');
              const isSubmitted = currentOp.includes('SUBMITTED');
              const isCorrection = currentOp.includes('CORRECTED');

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot with exact color token */}
                  <span className={`absolute -left-[31px] top-2.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                    isDispute ? 'bg-[#E11D48]' : isConfirmed ? 'bg-[#059669]' : isCorrection ? 'bg-[#D97706]' : 'bg-[#2563EB]'
                  }`} />

                  <div className="p-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] hover:border-slate-400 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                          isDispute 
                            ? 'bg-[#FFE4E6] text-[#9F1239] border border-[#E11D48]/30' 
                            : isConfirmed 
                            ? 'bg-[#D1FAE5] text-[#065F46] border border-[#059669]/30' 
                            : isCorrection 
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/30' 
                            : 'bg-slate-200 text-[#0F172A]'
                        }`}>
                          {currentOp}
                        </span>
                        {event.recordCode && (
                          <span className="code-tracking-id text-xs text-[#0F172A]">
                            {event.recordCode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        <time dateTime={event.timestamp}>
                          {new Date(event.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          a las{' '}
                          {new Date(event.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </time>
                      </div>
                    </div>

                    <p className="text-xs text-[#0F172A] font-semibold leading-relaxed">
                      {event.details}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#CBD5E1] flex items-center justify-between text-[11px] text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-700" />
                        <span>
                          Actor oficial: <strong className="text-[#0F172A]">{event.actorName}</strong> ({event.actorRole})
                        </span>
                      </div>

                      <span className="font-mono text-[10px] text-slate-700 font-medium">
                        HASH: {event.id.slice(0, 14)}...
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
