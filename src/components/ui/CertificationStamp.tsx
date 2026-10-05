import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificationStampProps {
  code?: string;
  date?: string;
  signatory?: string;
  companyName?: string;
  variant?: 'emerald' | 'amber' | 'blue';
  compact?: boolean;
}

export const CertificationStamp: React.FC<CertificationStampProps> = ({
  code = 'VAL-2026-OK',
  date = new Date().toISOString().split('T')[0],
  signatory = 'Jefe de Obra Colegiado',
  companyName = 'Dirección Facultativa',
  variant = 'emerald',
  compact = false
}) => {
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/80',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/20',
      accent: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/10'
    },
    amber: {
      border: 'border-amber-500/80',
      text: 'text-amber-400',
      bg: 'bg-amber-950/20',
      accent: 'border-amber-500/40',
      glow: 'shadow-amber-500/10'
    },
    blue: {
      border: 'border-blue-500/80',
      text: 'text-blue-400',
      bg: 'bg-blue-950/20',
      accent: 'border-blue-500/40',
      glow: 'shadow-blue-500/10'
    }
  };

  const c = colorMap[variant];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-dashed ${c.border} ${c.bg} ${c.text} font-mono text-[10px] font-black uppercase tracking-wider transform -rotate-2 select-none shadow-sm`}>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>CERTIFICADO · LEY 32/2006</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-block p-3.5 rounded-xl border-2 border-dashed ${c.border} ${c.bg} ${c.text} font-mono select-none transform -rotate-3 transition-transform hover:rotate-0 duration-300 shadow-xl ${c.glow}`}
      style={{
        maskImage: 'radial-gradient(ellipse at center, black 85%, rgba(0,0,0,0.8) 100%)',
      }}
    >
      {/* Corner Stamp Accents */}
      <div className="absolute top-1 left-1 text-[8px] font-black opacity-60">ES</div>
      <div className="absolute top-1 right-1 text-[8px] font-black opacity-60">PRL</div>
      <div className="absolute bottom-1 left-1 text-[8px] font-black opacity-60">32/06</div>
      <div className="absolute bottom-1 right-1 text-[8px] font-black opacity-60">OK</div>

      <div className="flex items-center gap-3 border-b pb-2 mb-2 border-current/30">
        <div className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-black tracking-widest uppercase">
            CERTIFICACIÓN DIGITAL EN TAJO
          </div>
          <div className="text-[9px] font-semibold opacity-80 uppercase tracking-wide">
            Validez Jurídica Inmutable · RD 1109/2007
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[10px] uppercase">
        <div className="flex justify-between gap-4 font-bold">
          <span>Ref / Código:</span>
          <span className="font-mono">{code}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="opacity-80">Fecha Registro:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="opacity-80">Firmante:</span>
          <span className="font-bold truncate max-w-[130px]">{signatory}</span>
        </div>
        <div className="flex justify-between gap-4 text-[9px] pt-1 border-t border-current/20 opacity-75">
          <span>Entidad:</span>
          <span className="truncate max-w-[130px]">{companyName}</span>
        </div>
      </div>
    </div>
  );
};
