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
  ArrowRight,
  Hash,
  Activity,
  Fingerprint
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { AppState } from '../types';

interface AuditTrailViewProps {
  state: AppState;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ state }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredEvents = (state.auditEvents || []).filter((event) => {
    const detailsMatch = event.details.toLowerCase().includes(searchQuery.toLowerCase());
    const actorMatch = event.actorName.toLowerCase().includes(searchQuery.toLowerCase());
    const codeMatch = event.recordCode && event.recordCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = detailsMatch || actorMatch || codeMatch;
    const eventOp = event.operation || event.eventType;
    const matchesType = typeFilter === 'ALL' || eventOp === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getEventStyle = (op: string) => {
    if (op.includes('DISPUTED')) return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (op.includes('CONFIRMED')) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (op.includes('SUBMITTED')) return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (op.includes('CORRECTED')) return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { color: 'text-brand-muted', bg: 'bg-brand-surface', border: 'border-brand-border' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">Trazabilidad</h1>
          <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1">Registro inmutable de la cadena de custodia operativa.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3.5 sm:px-4 py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent leading-none">Blockchain Ready</span>
                 <span className="text-[10px] font-bold text-white mt-0.5">Integridad Verificada</span>
              </div>
           </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 bg-brand-surface border border-brand-border p-3 sm:p-4 rounded-2xl sm:rounded-[2rem]">
        <div className="relative flex-1 group w-full">
           <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
           <input
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Filtrar por código, actor o detalle de operación..."
             className="input-field pl-10 h-11 text-xs"
           />
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todos', count: (state.auditEvents || []).length },
            { id: 'REPORT_SUBMITTED', label: 'Partes', op: 'REPORT_SUBMITTED' },
            { id: 'DELIVERY_NOTE_CONFIRMED', label: 'Albaranes', op: 'DELIVERY_NOTE_CONFIRMED' },
            { id: 'DELIVERY_NOTE_DISPUTED', label: 'Disputas', op: 'DELIVERY_NOTE_DISPUTED' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setTypeFilter(chip.id)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-wider sm:tracking-widest whitespace-nowrap transition-all flex-1 md:flex-initial text-center ${
                typeFilter === chip.id 
                  ? 'bg-white text-brand-bg shadow-lg' 
                  : 'text-brand-muted hover:text-white hover:bg-brand-bg'
              }`}
            >
              {chip.label} {chip.count !== undefined && `(${chip.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative">
        {/* Timeline Bar */}
        <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-accent/40 via-brand-border to-transparent" />

        <div className="space-y-4 sm:space-y-6">
          {filteredEvents.map((event, idx) => {
            const op = event.operation || event.eventType || 'EVENT';
            const style = getEventStyle(op);
            
            return (
              <div key={event.id} className="relative pl-8 sm:pl-14 group">
                {/* Event Dot */}
                <div className={`absolute left-1.5 sm:left-4 top-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 sm:border-4 border-brand-bg shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300 group-hover:scale-125 ${style.color.replace('text', 'bg')}`} />

                <div className="card group hover:border-brand-accent/40 transition-all duration-300">
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.color} ${style.border}`}>
                          {op}
                        </div>
                        {event.recordCode && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase bg-brand-bg px-2 py-0.5 rounded border border-brand-border">
                             <Hash className="w-3 h-3 text-brand-accent" />
                             {event.recordCode}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-brand-muted">
                           <Clock className="w-3.5 h-3.5" />
                           {new Date(event.timestamp).toLocaleString('es-ES', {
                             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                           })}
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {event.details}
                      </p>

                      <div className="flex items-center gap-4 pt-1">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-brand-bg flex items-center justify-center text-brand-accent border border-brand-border">
                               <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-tight">
                               Actor: <span className="text-white ml-1">{event.actorName}</span>
                            </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-brand-bg flex items-center justify-center text-brand-accent border border-brand-border">
                               <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-tight">
                               Rol: <span className="text-white ml-1">{event.actorRole}</span>
                            </span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 md:border-l md:border-brand-border md:pl-6 shrink-0">
                       <div className="flex items-center gap-2 text-[9px] font-black text-brand-muted uppercase tracking-widest">
                          <Fingerprint className="w-3 h-3 text-brand-accent" />
                          Hash Operativo
                       </div>
                       <code className="text-[10px] font-mono text-brand-accent font-bold bg-brand-accent/5 px-2 py-1 rounded">
                          {event.id.slice(0, 12)}
                       </code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="ml-14 card p-16 text-center border-dashed border-brand-border">
               <Activity className="w-12 h-12 text-brand-muted opacity-20 mx-auto mb-4" />
               <p className="text-sm font-bold text-brand-muted uppercase tracking-[0.2em]">Sin registros de actividad</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
