import React from 'react';
import { EmptyState } from './EmptyState';
import { HelpCircle } from 'lucide-react';

export interface TableProps {
  headers: string[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  skeletonRows?: number;
  children?: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'Sin datos',
  emptyDescription = 'No hay registros disponibles en esta sección.',
  emptyAction,
  skeletonRows = 4,
  children,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden bg-brand-surface border border-slate-800/80 rounded-xl ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-800/40 last:border-0 animate-pulse">
                  {headers.map((_, hIdx) => (
                    <td key={hIdx} className="px-6 py-4.5">
                      <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12">
                  <EmptyState
                    icon={HelpCircle}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    className="border-0 bg-transparent p-0 md:p-0"
                  />
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Table;
