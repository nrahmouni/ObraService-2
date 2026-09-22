import React, { useState } from 'react';
import { FileText, Search, Navigation, AlertCircle } from 'lucide-react';
import { AppState, DeliveryNote } from '../types';
import { DeliveryNoteList } from '../components/delivery/DeliveryNoteList';
import { DeliveryNoteDetail } from '../components/delivery/DeliveryNoteDetail';
import { ClockInButton } from '../components/ClockInButton';
import { Table } from '../components/ui/Table';
import { StatusPill } from '../components/ui/StatusPill';
import { obraStore } from '../services/store';
import { toast } from 'react-hot-toast';

interface DeliveryNotesViewProps {
  state: AppState;
}

export const DeliveryNotesView: React.FC<DeliveryNotesViewProps> = ({ state }) => {
  const user = state.currentUser;
  const [activeSubTab, setActiveSubTab] = useState<'albaranes' | 'fichajes'>('albaranes');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  if (!user) return null;

  const isSubcontractor = user.role === 'SUBCONTRACTOR_USER';

  // Filters by company context if subcontractor role
  const userNotes = isSubcontractor
    ? state.deliveryNotes.filter(n => n.subcontractorCompanyId === user.companyId)
    : state.deliveryNotes;

  const filteredNotes = userNotes.filter(note => {
    const matchesSearch = 
      note.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subcontractorCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.projectNameSnapshot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.date.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBatchConfirm = () => {
    const res = obraStore.confirmAllPendingDeliveryNotes();
    if (res.success) {
      toast.success(`¡${res.count} albaranes confirmados en lote con éxito!`);
    } else {
      toast.error(res.error || 'Error al certificar lote.');
    }
  };

  const personalLogs = (state.timeLogs || []).filter(log => 
    user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER' 
      ? log.companyId === user.companyId 
      : log.userId === user.id
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">
            Auditoría de Jornadas y Certificación
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100 font-display mt-0.5">
            Albaranes y Fichajes
          </h1>
        </div>
      </div>

      {/* Detail Overlay View */}
      {selectedNote ? (
        <DeliveryNoteDetail 
          note={selectedNote} 
          currentUser={user} 
          onBack={() => setSelectedNote(null)} 
          onRefreshNote={(updated) => setSelectedNote(updated)} 
        />
      ) : (
        <div className="space-y-6">
          {/* Subtabs Navigation (Fichajes only visible for Site Managers and Admins) */}
          {!isSubcontractor && (
            <div className="flex gap-6 border-b border-slate-800">
              <button
                onClick={() => { setActiveSubTab('albaranes'); setSearchQuery(''); }}
                className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                  activeSubTab === 'albaranes' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Albaranes de Certificación
              </button>
              <button
                onClick={() => { setActiveSubTab('fichajes'); setSearchQuery(''); }}
                className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
                  activeSubTab === 'fichajes' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Presencia y Fichajes de Dirección
              </button>
            </div>
          )}

          {activeSubTab === 'albaranes' ? (
            <div className="space-y-4">
              {/* Search Toolbar */}
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR REFERENCIA, PROYECTO..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 focus:outline-none focus:border-brand-accent"
                />
              </div>

              {/* Delivery list */}
              <DeliveryNoteList 
                state={state} 
                notes={filteredNotes} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                statusFilter={statusFilter} 
                setStatusFilter={setStatusFilter} 
                onSelect={(note) => setSelectedNote(note)} 
                onBatchConfirm={handleBatchConfirm} 
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Clock in Button Component */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-xl">
                <ClockInButton state={state} />
              </div>

              {/* Logs Historial */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-brand-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                    Historial Reciente de Presencia Geovallada
                  </h3>
                </div>

                <div className="flex flex-col space-y-2.5">
                  {personalLogs.map(log => (
                    <div key={log.id} className="border border-slate-800 bg-slate-950/60 rounded-xl p-3 flex flex-col space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                        <div>
                          <span className="text-xs font-black text-slate-100 uppercase block">{log.userNameSnapshot}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{log.userRoleSnapshot === 'SUBCONTRACTOR_USER' ? 'Operario' : 'Jefe de Obra'} • {log.projectNameSnapshot}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                          log.status === 'In' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          {log.status === 'In' ? 'ENTRADA' : 'SALIDA'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-slate-300">{log.lat.toFixed(5)}, {log.lng.toFixed(5)} ({log.distanceMeters.toFixed(1)}m)</span>
                        <span className="font-mono font-bold text-slate-200">
                          {new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ({new Date(log.timestamp).toLocaleDateString('es-ES')})
                        </span>
                      </div>
                    </div>
                  ))}

                  {personalLogs.length === 0 && (
                    <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                      No hay registros de presencia recientes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
