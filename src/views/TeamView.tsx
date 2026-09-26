import React, { useState } from 'react';
import { Users, Truck, Building2, Mail, Search, List, UserCheck, Wrench, ShieldCheck, UserPlus } from 'lucide-react';
import { AppState } from '../types';

// Subtab Components
import { WorkersSubTab } from '../components/team/WorkersSubTab';
import { UsersSubTab } from '../components/team/UsersSubTab';
import { CompaniesSubTab } from '../components/team/CompaniesSubTab';
import { MachinerySubTab } from '../components/team/MachinerySubTab';

interface TeamViewProps {
  state: AppState;
}

export const TeamView: React.FC<TeamViewProps> = ({ state }) => {
  const currentUser = state.currentUser;
  const [activeSubTab, setActiveSubTab] = useState<'workers' | 'machinery' | 'users' | 'companies'>('workers');
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const metrics = [
    { label: 'Operarios', value: state.workers?.length || 0, icon: UserCheck, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { label: 'Maquinaria', value: state.machinery?.length || 0, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Subcontratas', value: state.companies?.filter(c => c.type === 'SUBCONTRACTOR').length || 0, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pendientes', value: state.invitations?.filter(i => i.status === 'Pending').length || 0, icon: UserPlus, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">Equipos y Recursos</h1>
          <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1">Gestión centralizada de personal propio, subcontratas y maquinaria.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 group hover:border-brand-accent/30 transition-all">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${m.bg} ${m.color} flex items-center justify-center border border-current/10 shrink-0 group-hover:scale-110 transition-transform`}>
              <m.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display font-black text-white leading-none">{m.value}</div>
              <div className="text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-wider sm:tracking-widest mt-1">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl sm:rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
          {(['workers', 'machinery', 'users', 'companies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveSubTab(tab);
                setSearchQuery('');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-wider sm:tracking-widest min-h-[40px] transition-all whitespace-nowrap ${
                activeSubTab === tab 
                  ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                  : 'text-brand-muted hover:text-white hover:bg-brand-bg'
              }`}
            >
              {tab === 'workers' ? <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : 
               tab === 'machinery' ? <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : 
               tab === 'users' ? <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : 
               <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span>
                {tab === 'workers' ? 'Operarios' : 
                 tab === 'machinery' ? 'Maquinaria' : 
                 tab === 'users' ? 'Usuarios App' : 
                 'Subcontratas'}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en ${activeSubTab === 'workers' ? 'operarios' : activeSubTab === 'machinery' ? 'máquinas' : activeSubTab === 'users' ? 'usuarios' : 'empresas'}...`}
            className="input-field pl-10 h-11 text-xs"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeSubTab === 'workers' && <WorkersSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'users' && <UsersSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'companies' && <CompaniesSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'machinery' && <MachinerySubTab state={state} searchQuery={searchQuery} />}
      </div>
    </div>
  );
};
