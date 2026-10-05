import React, { useState } from 'react';
import { DailyReport, Company } from '../../types';
import { Clock, AlertTriangle, TrendingUp, Filter, Users } from 'lucide-react';

interface TajoHoursDistributionChartProps {
  reports: DailyReport[];
  companies: Company[];
}

export const TajoHoursDistributionChart: React.FC<TajoHoursDistributionChartProps> = ({
  reports,
  companies
}) => {
  const [filterType, setFilterType] = useState<'all' | 'subcontractors'>('all');

  // Aggregate hours by company
  const companyStatsMap: Record<string, {
    name: string;
    isSubcontractor: boolean;
    normalHours: number;
    extraHours: number;
    totalHours: number;
    workerCount: number;
  }> = {};

  // Initialize with known companies
  companies.forEach(c => {
    companyStatsMap[c.id] = {
      name: c.name,
      isSubcontractor: c.type === 'SUBCONTRACTOR',
      normalHours: 0,
      extraHours: 0,
      totalHours: 0,
      workerCount: 0
    };
  });

  // Accumulate from reports work entries
  reports.forEach(report => {
    (report.workEntries || []).forEach(we => {
      const cId = we.companyIdSnapshot || report.companyId;
      if (!companyStatsMap[cId]) {
        companyStatsMap[cId] = {
          name: we.companyNameSnapshot || 'Empresa Colaboradora',
          isSubcontractor: we.isSubcontractor || true,
          normalHours: 0,
          extraHours: 0,
          totalHours: 0,
          workerCount: 0
        };
      }
      companyStatsMap[cId].normalHours += (we.normalHours || 0);
      companyStatsMap[cId].extraHours += (we.extraHours || 0);
      companyStatsMap[cId].totalHours += (we.totalHours || (we.normalHours + we.extraHours) || 0);
      companyStatsMap[cId].workerCount += 1;
    });
  });

  let statsList = Object.values(companyStatsMap)
    .filter(s => s.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours);

  if (filterType === 'subcontractors') {
    statsList = statsList.filter(s => s.isSubcontractor);
  }

  // Maximum total hours for relative bar scaling
  const maxHours = Math.max(...statsList.map(s => s.totalHours), 1);
  const totalAggregatedHours = statsList.reduce((acc, s) => acc + s.totalHours, 0);
  const totalExtraHours = statsList.reduce((acc, s) => acc + s.extraHours, 0);
  const overtimeRate = totalAggregatedHours > 0 ? (totalExtraHours / totalAggregatedHours) * 100 : 0;

  return (
    <div className="card p-5 sm:p-6 bg-brand-surface border-white/10 space-y-5" role="region" aria-label="Distribución de Horas de Tajo">
      
      {/* Header & Metric Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider">
              Balance de Horas por Empresa & Subcontrata
            </h3>
            <span className="text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
              Convenio Construcción
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Desglose perceptualmente honesto de horas ordinarias vs. extraordinarias auditadas
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-brand-bg border border-white/10 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-brand-surface text-white shadow-sm'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType('subcontractors')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'subcontractors'
                ? 'bg-brand-surface text-white shadow-sm'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Solo Subcontratas
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-brand-bg/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-accent" />
            <span className="text-brand-muted">Total Horas Tajo:</span>
          </div>
          <span className="text-white font-bold text-sm tabular-nums">{totalAggregatedHours.toFixed(1)} h</span>
        </div>

        <div className="p-3 rounded-xl bg-brand-bg/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-brand-muted">Horas Extras:</span>
          </div>
          <span className="text-amber-400 font-bold text-sm tabular-nums">{totalExtraHours.toFixed(1)} h</span>
        </div>

        <div className="p-3 rounded-xl bg-brand-bg/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${overtimeRate > 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-brand-muted">Tasa de Horas Extras:</span>
          </div>
          <span className={`font-bold text-sm tabular-nums ${overtimeRate > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {overtimeRate.toFixed(1)}% {overtimeRate > 20 ? '⚠️ Alerta' : '✓ Normal'}
          </span>
        </div>
      </div>

      {/* Visual Chart Bars (Data Visualization Engineer) */}
      <div className="space-y-4 pt-2">
        {statsList.map((stat, idx) => {
          const normalPct = (stat.normalHours / maxHours) * 100;
          const extraPct = (stat.extraHours / maxHours) * 100;
          const companyOvertimeRatio = stat.totalHours > 0 ? (stat.extraHours / stat.totalHours) * 100 : 0;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
                    {stat.name}
                  </span>
                  {stat.isSubcontractor && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 shrink-0">
                      Subcontrata
                    </span>
                  )}
                  {companyOvertimeRatio > 25 && (
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded shrink-0">
                      +25% Extras
                    </span>
                  )}
                </div>

                <div className="text-right font-mono text-xs tabular-nums shrink-0">
                  <span className="text-white font-bold">{stat.totalHours.toFixed(1)}h</span>
                  <span className="text-brand-muted ml-2 text-[11px]">
                    ({stat.normalHours.toFixed(1)}h ord. + <strong className="text-amber-400">{stat.extraHours.toFixed(1)}h extra</strong>)
                  </span>
                </div>
              </div>

              {/* Stacked Proportional Bar with WCAG Contrast */}
              <div className="h-3 w-full bg-brand-bg rounded-full overflow-hidden flex border border-white/5">
                {/* Normal Hours segment */}
                <div 
                  style={{ width: `${normalPct}%` }}
                  className="bg-brand-accent transition-all duration-500"
                  title={`${stat.name}: ${stat.normalHours}h ordinarias`}
                />
                {/* Extra Hours segment */}
                <div 
                  style={{ width: `${extraPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`${stat.name}: ${stat.extraHours}h extras`}
                />
              </div>
            </div>
          );
        })}

        {statsList.length === 0 && (
          <div className="py-8 text-center text-xs text-brand-muted italic">
            No se han registrado partes con desglose de horas para las empresas seleccionadas.
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs text-brand-muted font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-accent" />
            <span>Horas Ordinarias (Convenio)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Horas Extras Recargadas</span>
          </div>
        </div>

        <span className="text-[11px] text-zinc-400">
          Límite anual convenio: 80h extras máx / trabajador
        </span>
      </div>

    </div>
  );
};
