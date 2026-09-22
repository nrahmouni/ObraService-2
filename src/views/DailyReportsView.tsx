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
  Users,
  CheckCircle2,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
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

  const canCreateReport = user.role === 'SUBCONTRACTOR_USER' || (user.role as string) === 'WORKER' || user.role === 'SITE_MANAGER';

  const handleValidateBySiteManager = (report: DailyReport) => {
    report.status = 'Corrected';
    report.updatedAt = new Date().toISOString();
    toast.success(`Parte ${report.code} validado en tajo por el Jefe de Obra.`);
    setSelectedReport({ ...report });
  };

  const handleCertifyByConstructora = (report: DailyReport) => {
    report.status = 'Locked';
    report.updatedAt = new Date().toISOString();
    toast.success(`Parte ${report.code} aprobado y certificado oficialmente por la Constructora.`);
    setSelectedReport({ ...report });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] p-4 sm:p-5 rounded-xl">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Partes Diarios de Trabajo</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Histórico inmutable de partes y registros de tajo</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar parte u obra..."
              className="bg-[#27272A] border border-[#3F3F46] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 w-44 sm:w-56 transition-all"
            />
          </div>
          <button
            onClick={handleExportAll}
            className="p-2 text-zinc-400 hover:text-white bg-[#27272A] hover:bg-[#3F3F46] rounded-lg border border-[#3F3F46] transition-colors cursor-pointer"
            title="Exportar CSV"
          >
            <FileDown className="w-4 h-4" />
          </button>
          {canCreateReport && (
            <button
              onClick={onOpenReportModal}
              className="bg-[#EA580C] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs hover:bg-[#c2410c] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Emitir Parte</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Reports Cards List */}
      <div className="flex flex-col space-y-3 w-full">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-[#18181B] rounded-2xl border border-[#27272A] text-xs font-bold text-zinc-400">
            No se encontraron partes de trabajo.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-4 transition-all cursor-pointer flex flex-col space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{report.date}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">• {report.code}</span>
                </div>
                <Badge status={report.status} className="text-[10px] px-2 py-0.5" />
              </div>

              <div className="flex flex-col space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Obra</span>
                  <span className="font-bold text-zinc-200">{report.projectNameSnapshot}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Cuadrilla: <strong className="text-zinc-200">{report.workEntries?.length || 0} operarios</strong></span>
                  <span className="font-black text-white font-mono text-xs">{report.totalHours} Horas</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272A] flex items-center justify-end gap-1 text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                <span>Ver Detalle del Parte</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))
        )}
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
              <div className="flex flex-col space-y-2">
                {[
                  { label: 'Total Horas', value: `${selectedReport.totalHours}H`, icon: Clock },
                  { label: 'Operarios', value: `${selectedReport.workEntries.length} registrados`, icon: UserCheck },
                  { label: 'Ubicación', value: 'GPS / Geocerca Verificada', icon: MapPin },
                  { label: 'Fecha', value: selectedReport.date, icon: Calendar },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <stat.icon className="w-4 h-4 text-[#EA580C]" />
                      <span className="text-xs font-bold text-zinc-300">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Workers List in Modal */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <UserCheck className="w-3 h-3" />
                  Cuadrilla Reportada
                </h4>
                <div className="flex flex-col space-y-2">
                  {selectedReport.workEntries.map((entry, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex flex-col space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div>
                          <span className="font-bold text-white block">{entry.workerNameSnapshot}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">{entry.workerCategorySnapshot} • {entry.companyNameSnapshot}</span>
                        </div>
                        <span className="font-black text-[#FF6600] font-mono text-xs">{entry.totalHours}H</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Horas Normales: <strong className="text-slate-200">{entry.normalHours}H</strong></span>
                        <span>Horas Extras: <strong className="text-[#FF6600]">{entry.extraHours}H</strong></span>
                      </div>
                    </div>
                  ))}
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

              {/* Bottom Actions and Validation Toolbar */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Validation Action for Site Manager (Jefe de Obra) */}
                  {user.role === 'SITE_MANAGER' && selectedReport.status !== 'Locked' && (
                    <button
                      onClick={() => handleValidateBySiteManager(selectedReport)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Validar Parte (Jefe de Obra)</span>
                    </button>
                  )}

                  {/* Certification Action for Constructora Admin */}
                  {user.role === 'MAIN_CONTRACTOR_ADMIN' && selectedReport.status !== 'Locked' && (
                    <button
                      onClick={() => handleCertifyByConstructora(selectedReport)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Aprobar y Certificar (Constructora)</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center border border-white/5"
                >
                  Cerrar
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
                <div className="flex flex-col space-y-4 border-b border-gray-200 pb-8">
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
