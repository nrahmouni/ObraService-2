import React from 'react';
import { Sparkles, Flame, ShieldCheck, Clock, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface BehavioralNudgesProps {
  reportsCount: number;
  pendingDeliveryNotes: number;
  streakDays?: number;
  onQuickAction?: (action: string) => void;
}

export const BehavioralNudges: React.FC<BehavioralNudgesProps> = ({
  reportsCount,
  pendingDeliveryNotes,
  streakDays = 5,
  onQuickAction
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
      {/* Nudge 1: PRL Safety Streak */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between group hover:border-amber-500/40 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Racha de Prevención PRL</span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                {streakDays} días
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              5 días consecutivos sin incidencias de seguridad en tajo.
            </p>
          </div>
        </div>
      </div>

      {/* Nudge 2: Peer Benchmark */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Rendimiento de Cierre</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Top 8%</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              El 94% de jefes de obra valida sus partes antes de las 18:00h.
            </p>
          </div>
        </div>
      </div>

      {/* Nudge 3: Subcontractor Pending Signature Action */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 flex items-center justify-between group hover:border-blue-500/40 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Albaranes de Subcontrata</span>
              {pendingDeliveryNotes > 0 ? (
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  {pendingDeliveryNotes} pendiente{pendingDeliveryNotes > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Al día</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {pendingDeliveryNotes > 0 
                ? 'Certifica hoy para evitar demoras en la facturación mensual.' 
                : 'Todos los albaranes están autorizados y firmados.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
