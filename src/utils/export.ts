import { toast } from 'react-hot-toast';

/**
 * Utility to export JSON data to CSV and trigger download.
 * If data is empty but fallbackHeaders are provided, exports a CSV with just the headers (template).
 */
export function exportToCSV(data: any[], fileName: string, fallbackHeaders?: string[]) {
  if (!data || !data.length) {
    if (fallbackHeaders && fallbackHeaders.length > 0) {
      // Export header-only CSV template
      const headerRow = fallbackHeaders.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
      const blob = new Blob([headerRow + '\r\n'], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${fileName}.csv`);
      toast.success('Plantilla CSV generada (sin registros)');
      return;
    }

    // Gracefully inform user without throwing console.error
    toast.error('No hay datos disponibles para exportar');
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Build CSV rows
  const csvRows = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','), // header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle values with commas or quotes
        const stringValue = value === null || value === undefined ? '' : String(value);
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${fileName}.csv`);
  toast.success('Archivo CSV exportado correctamente');
}

function downloadBlob(blob: Blob, fullFileName: string) {
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fullFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
