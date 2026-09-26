import React, { useState } from 'react';
import { FileText, Search, Navigation, AlertCircle, Clock, MapPin, ChevronRight, History, Calendar, LayoutGrid, Plus } from 'lucide-react';
import { AppState, DeliveryNote } from '../types';
import { DeliveryNoteList } from '../components/delivery/DeliveryNoteList';
import { DeliveryNoteDetail } from '../components/delivery/DeliveryNoteDetail';
import { NewDeliveryNoteModal } from '../components/delivery/NewDeliveryNoteModal';
import { ClockInButton } from '../components/ClockInButton';
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
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
      toast.success(`¡${res.count} albaranes confirmados con éxito!`);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">Control de Tajo</h1>
          <p className="text-brand-muted font-medium mt-1">Gestión de albaranes de certificación y control de presencia.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn-primary h-11 px-5 text-xs font-bold gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Albarán</span>
        </button>
      </div>

      <NewDeliveryNoteModal
        state={state}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Detail Overlay View */}
      {selectedNote ? (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <DeliveryNoteDetail 
            note={selectedNote} 
            currentUser={user} 
            onBack={() => setSelectedNote(null)} 
            onRefreshNote={(updated) => setSelectedNote(updated)} 
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Professional Tab Navigation */}
          {!isSubcontractor && (
            <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-2xl self-start w-fit">
              <button
                onClick={() => { setActiveSubTab('albaranes'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === 'albaranes' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-muted hover:text-white hover:bg-brand-bg'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Albaranes</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('fichajes'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === 'fichajes' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-muted hover:text-white hover:bg-brand-bg'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Presencia GPS</span>
              </button>
            </div>
          )}

          {activeSubTab === 'albaranes' ? (
            <div className="space-y-6">
              {/* Search Toolbar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR REFERENCIA, PROYECTO O EMPRESA..."
                  className="input pl-11 h-11"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Clock in Section */}
              <div className="lg:col-span-1 space-y-6">
                <div className="card p-6 space-y-6 border-brand-accent/20 bg-brand-accent/5">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white">
                        <Clock className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">Registro de Jornada</h3>
                        <p className="text-[10px] text-brand-muted font-medium mt-0.5">Control de presencia geovallado.</p>
                     </div>
                  </div>
                  <ClockInButton state={state} />
                </div>
              </div>

              {/* Logs History Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted">Últimos Fichajes</h3>
                   <span className="text-[10px] font-bold text-brand-muted bg-brand-surface px-2 py-0.5 rounded border border-brand-border uppercase">Historial</span>
                </div>

                <div className="space-y-3">
                  {personalLogs.map(log => (
                    <div key={log.id} className="card p-4 hover:border-brand-accent/40 transition-all group">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-border/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.status === 'In' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-bg text-brand-muted'} border border-brand-border`}>
                            <Navigation className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white uppercase block">{log.userNameSnapshot}</span>
                            <span className="text-[10px] font-medium text-brand-muted uppercase tracking-tight">
                              {log.userRoleSnapshot === 'SUBCONTRACTOR_USER' ? 'Operario' : 'Jefe de Obra'} • {log.projectNameSnapshot}
                            </span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                          log.status === 'In' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-brand-bg border-brand-border text-brand-muted'
                        }`}>
                          {log.status === 'In' ? 'ENTRADA' : 'SALIDA'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium">
                        <div className="flex items-center gap-1.5 text-brand-muted">
                           <MapPin className="w-3 h-3 text-brand-accent" />
                           <span className="font-mono">{log.lat.toFixed(5)}, {log.lng.toFixed(5)} ({log.distanceMeters.toFixed(1)}m)</span>
                        </div>
                        <div className="flex items-center gap-3 text-brand-muted">
                           <div className="flex items-center gap-1.5 border-r border-brand-border pr-3">
                              <Calendar className="w-3 h-3 text-brand-accent" />
                              <span>{new Date(log.timestamp).toLocaleDateString('es-ES')}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-brand-accent" />
                              <span className="font-bold text-white">{new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {personalLogs.length === 0 && (
                    <div className="card p-12 flex flex-col items-center text-center gap-4 border-dashed border-brand-border">
                      <History className="w-10 h-10 text-brand-muted opacity-20" />
                      <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Sin registros recientes</p>
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
