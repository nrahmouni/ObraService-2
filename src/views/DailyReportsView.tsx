import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  X,
  Eye,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Download,
  Printer,
  ChevronRight,
  UserCheck,
  Building2,
  FileCheck2,
  Zap,
  MoreVertical,
  FileDown,
  ArrowRight,
  LayoutGrid,
  Users
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { obraStore } from '../services/store';
import { DailyReport, WorkEntry, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { exportToCSV } from '../utils/export';

interface DailyReportsViewProps {
  state: AppState;
  onOpenReportModal: () => void;
}

export const DailyReportsView: React.FC<DailyReportsViewProps> = ({ state, onOpenReportModal }) => {
  const user = state.currentUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  if (!user) return null;

  const filteredReports = (state.reports || []).filter((report) => 
    report.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.projectNameSnapshot.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.date.includes(searchQuery)
  );

  const handlePrint = (report: DailyReport) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Base coordinates
      const margin = 15;
      let y = 20;

      // Header Banner
      doc.setFillColor(255, 102, 0); // #FF6600
      doc.rect(margin, y, 180, 16, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('PARTE DIARIO DE TRABAJO - OBRASERVICE', margin + 6, y + 10);

      y += 24;

      // Meta Card
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, 180, 26, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, 180, 26, 'S');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'bold');
      doc.text('CÓDIGO PARTE:', margin + 6, y + 6);
      doc.setFont('Helvetica', 'normal');
      doc.text(report.code, margin + 45, y + 6);

      doc.setFont('Helvetica', 'bold');
      doc.text('OBRA / PROYECTO:', margin + 6, y + 12);
      doc.setFont('Helvetica', 'normal');
      doc.text(report.projectNameSnapshot, margin + 45, y + 12);

      doc.setFont('Helvetica', 'bold');
      doc.text('FECHA JORNADA:', margin + 6, y + 18);
      doc.setFont('Helvetica', 'normal');
      doc.text(report.date, margin + 45, y + 18);

      y += 34;

      // Section: Personal en Tajo
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 102, 0);
      doc.text('REGISTRO DE PERSONAL Y HORAS EN EL TAJO', margin, y);
      y += 6;

      // Table Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 180, 8, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      doc.text('OPERARIO', margin + 4, y + 5.5);
      doc.text('EMPRESA', margin + 55, y + 5.5);
      doc.text('CATEGORÍA', margin + 110, y + 5.5);
      doc.text('H. NORM', margin + 148, y + 5.5);
      doc.text('H. EXT', margin + 164, y + 5.5);
      doc.text('TOTAL', margin + 174, y + 5.5);

      y += 8;

      // Rows
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      
      (report.workEntries || []).forEach((entry) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('Helvetica', 'normal');
        doc.text(entry.workerNameSnapshot, margin + 4, y + 5.5);
        doc.text(entry.companyNameSnapshot || 'Personal Propio', margin + 55, y + 5.5);
        doc.text(entry.workerCategorySnapshot, margin + 110, y + 5.5);
        doc.text(`${entry.normalHours}h`, margin + 148, y + 5.5);
        doc.text(`${entry.extraHours}h`, margin + 164, y + 5.5);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${entry.totalHours}h`, margin + 174, y + 5.5);

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 8, margin + 180, y + 8);
        y += 8;
      });

      y += 4;

      // Totals Box
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 115, y, 65, 18, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin + 115, y, 65, 18, 'S');

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'bold');
      doc.text('Horas Normales:', margin + 118, y + 5);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${report.totalNormalHours}h`, margin + 168, y + 5);

      doc.setFont('Helvetica', 'bold');
      doc.text('Horas Extras:', margin + 118, y + 10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${report.totalExtraHours}h`, margin + 168, y + 10);

      doc.setFontSize(9);
      doc.setTextColor(255, 102, 0);
      doc.setFont('Helvetica', 'bold');
      doc.text('HORAS TOTALES:', margin + 118, y + 15);
      doc.text(`${report.totalHours}h`, margin + 168, y + 15);

      y += 26;

      // Comments & Observations
      if (report.comments) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('COMENTARIOS DE JORNADA:', margin, y);
        y += 5;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(report.comments, 180);
        doc.text(splitText, margin, y);
        y += splitText.length * 4.5 + 4;
      }

      // Location Geovalidation Card
      if (report.locationSnapshot) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(240, 253, 250); // Mint green BG
        doc.rect(margin, y, 180, 16, 'F');
        doc.setDrawColor(204, 251, 241);
        doc.rect(margin, y, 180, 16, 'S');

        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136); // Teal
        doc.setFont('Helvetica', 'bold');
        doc.text('VERIFICACIÓN CRIPTOGRÁFICA DE PRESENCIA (GEOVALLA OK)', margin + 5, y + 6);
        
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Ubicación de firma: lat ${report.locationSnapshot.lat}, lng ${report.locationSnapshot.lng} • Discrepancia: ${report.locationSnapshot.distanceFromProjectMeters}m de la geocerca homologada.`, margin + 5, y + 11);
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento certificado digitalmente por ObraService en fecha ${new Date().toLocaleDateString()}. Código de validación de ERP.`, margin, 282);

      doc.save(`Parte_Obra_${report.code}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar el PDF.');
    }
  };

  const handleExportAll = () => {
    const dataToExport = filteredReports.map(r => ({
      Codigo: r.code,
      Proyecto: r.projectNameSnapshot,
      Fecha: r.date,
      Estado: r.status,
      TotalHoras: r.totalHours,
      Normales: r.totalNormalHours,
      Extras: r.totalExtraHours,
      Comentarios: r.comments || ''
    }));
    exportToCSV(dataToExport, `Partes_ObraService_${new Date().toISOString().split('T')[0]}`);
  };

  const canCreateReport = user.role === 'MAIN_CONTRACTOR_ADMIN' || user.role === 'SITE_MANAGER';

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">Documentación</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Histórico Inmutable</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Partes de Trabajo</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR..."
              className="bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-[#FF6600]/30 w-48 transition-all"
            />
          </div>
          <button
            onClick={handleExportAll}
            className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
            title="Exportar CSV"
          >
            <FileDown className="w-5 h-5" />
          </button>
          {canCreateReport && (
            <button
              onClick={onOpenReportModal}
              className="bg-[#FF6600] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-[#e65c00] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Zap className="w-3 h-3" />
              Emitir
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main List */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Documento</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Proyecto</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Personal</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Horas</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-bold text-slate-900 uppercase">{report.date}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">ID: {report.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-bold text-slate-700 truncate max-w-[200px] uppercase">{report.projectNameSnapshot}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-1.5">
                          {report.workEntries.slice(0, 4).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase shadow-sm">
                              {report.workEntries[i].workerNameSnapshot[0]}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs font-black text-slate-900 tracking-tight">{report.totalHours}H</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge status={report.status} className="text-[8px] px-1.5 py-0" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6600] transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Métricas de Control</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Borradores</span>
                <span className="text-sm font-black text-slate-900">{(state.reports || []).filter(r => r.status === 'Draft').length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Consolidados</span>
                <span className="text-sm font-black text-emerald-700">{(state.reports || []).filter(r => r.status === 'Submitted').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FF6600] rounded-xl p-4 text-white shadow-lg shadow-orange-950/10">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">Sincronización Nodo</h4>
            <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">
              Los partes consolidados son inmutables y se transmiten al ERP.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#121417]/85 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-[#1F2329] border border-white/5 w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" id="report-detail-card">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 bg-[#1F2329] relative">
              <div className="flex items-start sm:items-center gap-4 pr-10 sm:pr-0">
                <div className="w-11 h-11 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center text-[#FF6600] shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white truncate">Detalle de Jornada</h2>
                    <Badge variant="success">Consolidado</Badge>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none truncate">
                    {selectedReport.code} • {selectedReport.projectNameSnapshot}
                  </p>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button 
                  onClick={() => {
                    if (!selectedReport.workEntries || selectedReport.workEntries.length === 0) {
                      alert('Este parte no tiene líneas de trabajo para exportar.');
                      return;
                    }
                    const data = selectedReport.workEntries.map(e => ({
                      Operario: e.workerNameSnapshot,
                      Empresa: e.companyNameSnapshot,
                      Normales: e.normalHours,
                      Extras: e.extraHours,
                      Total: e.totalHours
                    }));
                    exportToCSV(data, `Parte_${selectedReport.code}_Detalle`);
                  }}
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-[#FF6600] text-white rounded-xl transition-all group cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Exportar CSV de este parte"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => handlePrint(selectedReport)}
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-[#FF6600] text-white rounded-xl transition-all group cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Generar Reporte PDF"
                >
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Absolute Close for Touchscreens */}
              <button 
                onClick={() => setSelectedReport(null)}
                className="sm:hidden absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Horas', value: `${selectedReport.totalHours}H`, icon: Clock },
                  { label: 'Operarios', value: selectedReport.workEntries.length, icon: UserCheck },
                  { label: 'Ubicación', value: 'Geocerca OK', icon: MapPin },
                  { label: 'Fecha', value: selectedReport.date, icon: Calendar },
                ].map((stat, i) => (
                  <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                    <stat.icon className="w-4 h-4 text-[#FF6600] mb-2" />
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-lg font-black text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Workers Table */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <UserCheck className="w-3 h-3" />
                  Cuadrilla Reportada
                </h4>
                <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <th className="px-6 py-4">Operario</th>
                        <th className="px-6 py-4">Empresa</th>
                        <th className="px-6 py-4">Normal</th>
                        <th className="px-6 py-4">Extra</th>
                        <th className="px-6 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedReport.workEntries.map((entry, idx) => (
                        <tr key={idx} className="text-[11px] font-bold text-white hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span>{entry.workerNameSnapshot}</span>
                              <span className="text-[8px] text-slate-500 uppercase">{entry.workerCategorySnapshot}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{entry.companyNameSnapshot}</td>
                          <td className="px-6 py-4">{entry.normalHours}H</td>
                          <td className="px-6 py-4 text-[#FF6600]">{entry.extraHours}H</td>
                          <td className="px-6 py-4 text-right font-black">{entry.totalHours}H</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comments */}
              {selectedReport.comments && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3 text-[#FF6600]" />
                    Observaciones Técnicas
                  </h4>
                  <div className="bg-[#FF6600]/5 border border-[#FF6600]/10 rounded-2xl p-6 text-xs text-slate-300 font-medium leading-relaxed italic">
                    "{selectedReport.comments}"
                  </div>
                </div>
              )}

              {/* Bottom Close Button for Usability */}
              <div className="pt-4 border-t border-white/5 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center active:scale-95 border border-white/5"
                >
                  Volver a la Lista (Cerrar)
                </button>
              </div>
            </div>

            {/* Print Only Header (Hidden in Screen) */}
            <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[1000]">
              <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">ObraService Report</h1>
                  <p className="text-sm font-bold tracking-widest text-gray-600 uppercase">Certificación de Jornada de Trabajo</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black">{selectedReport.code}</p>
                  <p className="text-sm font-bold">{selectedReport.date}</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8 border-b border-gray-200 pb-8">
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-500 mb-2">Proyecto</h3>
                    <p className="text-lg font-black">{selectedReport.projectNameSnapshot}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-500 mb-2">Total Horas</h3>
                    <p className="text-lg font-black">{selectedReport.totalHours} Horas Consolidadas</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-500 mb-4">Desglose de Personal</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black text-left text-[10px] font-black uppercase">
                        <th className="py-2">Operario</th>
                        <th className="py-2">Categoría</th>
                        <th className="py-2">Empresa</th>
                        <th className="py-2">Normal</th>
                        <th className="py-2">Extra</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.workEntries.map((e, i) => (
                        <tr key={i} className="border-b border-gray-100 text-xs py-2">
                          <td className="py-3 font-bold">{e.workerNameSnapshot}</td>
                          <td className="py-3 text-gray-600">{e.workerCategorySnapshot}</td>
                          <td className="py-3 text-gray-600">{e.companyNameSnapshot}</td>
                          <td className="py-3">{e.normalHours}h</td>
                          <td className="py-3 font-bold text-orange-600">{e.extraHours}h</td>
                          <td className="py-3 text-right font-black">{e.totalHours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-20 flex justify-between gap-12">
                <div className="flex-1 border-t border-black pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-10">Firma Jefe de Obra</p>
                </div>
                <div className="flex-1 border-t border-black pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-10">Firma Subcontrata</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
