import React, { useState } from 'react';
import { Users, Truck, Building2, Mail, Search, LayoutGrid, List } from 'lucide-react';
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

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">
            Recursos y Personal de Obra
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100 font-display mt-0.5">
            Gestión de Equipos
          </h1>
        </div>
      </div>

      {/* Metrics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl border border-brand-accent/10 shrink-0">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100 leading-none">
              {state.workers?.length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Operarios Registrados</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl border border-brand-accent/10 shrink-0">
            <Truck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100 leading-none">
              {state.machinery?.length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Máquinas Activas</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl border border-brand-accent/10 shrink-0">
            <Building2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100 leading-none">
              {state.companies?.filter(c => c.type === 'SUBCONTRACTOR').length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Empresas en Red</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-xl border border-brand-accent/10 shrink-0">
            <Mail className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-100 leading-none">
              {state.invitations?.filter(i => i.status === 'Pending').length || 0}
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Invitaciones Activas</div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0F172A] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 shrink-0 scrollbar-none">
          {(['workers', 'machinery', 'users', 'companies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveSubTab(tab);
                setSearchQuery('');
              }}
              className={`pb-0 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === tab 
                  ? 'text-brand-accent font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'workers' ? 'Operarios' : tab === 'machinery' ? 'Maquinaria' : tab === 'users' ? 'Usuarios' : 'Subcontratas'}
            </button>
          ))}
        </div>

        {/* Global Tab Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR EN ESTA PESTAÑA..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 focus:outline-none focus:border-brand-accent"
          />
        </div>
      </div>

      {/* Render Active Subtab Content */}
      <div className="space-y-4">
        {activeSubTab === 'workers' && <WorkersSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'users' && <UsersSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'companies' && <CompaniesSubTab state={state} searchQuery={searchQuery} />}
        {activeSubTab === 'machinery' && <MachinerySubTab state={state} searchQuery={searchQuery} />}
      </div>
    </div>
  );
};
