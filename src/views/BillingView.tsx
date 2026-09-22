import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { Table } from '../components/ui/Table';
import { Euro, ArrowUpRight, Receipt, CreditCard, Building2 } from 'lucide-react';
import { AppState } from '../types';

interface BillingViewProps {
  state: AppState;
}

export const BillingView: React.FC<BillingViewProps> = ({ state }) => {
  const activeCompany = state.companies.find(c => c.id === state.currentUser?.companyId);

  // Mock billing events
  const invoices = [
    { id: 'INV-2026-001', date: '2026-09-15', amount: '12,450.00 €', status: 'Confirmed', concept: 'Certificación de Obra - Estación Gran Vía' },
    { id: 'INV-2026-002', date: '2026-09-01', amount: '4,850.00 €', status: 'Confirmed', concept: 'Suministro de Maquinaria y Operario' },
    { id: 'INV-2026-003', date: '2026-08-15', amount: '8,900.00 €', status: 'Pending', concept: 'Servicio de Encofrado y Ferrallado' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">ADMINISTRACIÓN</span>
        <h1 className="text-2xl font-black text-slate-100 font-display">Facturación y Certificaciones</h1>
        <p className="text-xs text-slate-400 mt-1">Consulta el estado de cobros, certificaciones de obra y remisiones de albaranes de subcontratas.</p>
      </div>

      <div className="flex flex-col space-y-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certificado este mes</span>
              <div className="text-xl font-black text-slate-100 mt-1">26,200.00 €</div>
            </div>
            <div className="p-3 bg-brand-accent/10 rounded-xl text-brand-accent">
              <Euro className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendiente de Cobro</span>
              <div className="text-xl font-black text-slate-100 mt-1">8,900.00 €</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</span>
              <div className="text-xs font-bold text-slate-200 mt-1">Transferencia SEPA (ES31 *** 1234)</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">Historial de Facturas Emitidas</h2>
        <div className="flex flex-col space-y-3 w-full">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-black text-slate-100 font-mono uppercase">{inv.id}</span>
                <StatusPill status={inv.status} />
              </div>
              <div className="flex flex-col space-y-1 text-xs">
                <span className="text-slate-200 font-medium">{inv.concept}</span>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Emisión: <strong className="text-slate-300 font-mono">{inv.date}</strong></span>
                  <span className="font-black text-brand-accent font-mono text-xs">{inv.amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
