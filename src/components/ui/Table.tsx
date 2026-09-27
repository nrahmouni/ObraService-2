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
    <div className={`w-full overflow-hidden bg-brand-surface border border-brand-border rounded-xl shadow-xs ${className}`}>
      {/* Scrollable table container with touch momentum */}
      <div className="w-full overflow-x-auto overscroll-x-contain touch-pan-x">
        <table className="w-full text-left border-collapse min-w-[580px] sm:min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg/50">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 sm:px-6 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-muted select-none whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, hIdx) => (
                    <td key={hIdx} className="px-4 sm:px-6 py-4">
                      <div className="h-4 bg-brand-border/60 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-4 sm:px-6 py-12">
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

