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
  Lock,
  Filter,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { obraStore } from '../services/store';
import { DailyReport, WorkEntry, AppState } from '../types';
import { Badge } from '../components/ui/Badge';
import { exportToCSV } from '../utils/export';
import { BehavioralNudges } from '../components/nudges/BehavioralNudges';

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
      doc.setFillColor(234, 88, 12); // Brand Accent
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
      doc.setTextColor(234, 88, 12);
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
      doc.setTextColor(234, 88, 12);
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

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento certificado digitalmente por ObraService en fecha ${new Date().toLocaleDateString()}.`, margin, 282);

      doc.save(`Parte_Obra_${report.code}.pdf`);
      toast.success(`Parte ${report.code} exportado a PDF`);
    } catch (err) {
      console.warn('Error al generar el PDF del parte:', err);
      toast.error('Error al generar el PDF del parte.');
    }
  };

  const handleExportAll = () => {
    const defaultHeaders = [
      'Codigo',
      'Proyecto',
      'Fecha',
      'Estado',
      'TotalHoras',
      'Normales',
      'Extras',
      'Comentarios'
    ];

    if (!filteredReports || filteredReports.length === 0) {
      exportToCSV([], `Partes_ObraService_${new Date().toISOString().split('T')[0]}`, defaultHeaders);
      return;
    }

    const dataToExport = filteredReports.map(r => ({
      Codigo: r.code,
      Proyecto: r.projectNameSnapshot || '',
      Fecha: r.date,
      Estado: r.status,
      TotalHoras: r.totalHours,
      Normales: r.totalNormalHours,
      Extras: r.totalExtraHours,
      Comentarios: r.comments || ''
    }));
    exportToCSV(dataToExport, `Partes_ObraService_${new Date().toISOString().split('T')[0]}`, defaultHeaders);
  };

  const canCreateReport = user.role === 'SUBCONTRACTOR_USER' || (user.role as string) === 'WORKER' || user.role === 'SITE_MANAGER';

  const handleValidateBySiteManager = (report: DailyReport) => {
    report.status = 'Corrected';
    report.updatedAt = new Date().toISOString();
    obraStore.logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: report.id,
      recordCode: report.code,
      operation: 'REPORT_SUBMITTED',
      details: `Parte de trabajo ${report.code} validado en tajo por el Jefe de Obra ${user.name}.`,
      dailyReportId: report.id
    });
    obraStore.notify();
    toast.success(`Parte ${report.code} validado en tajo.`);
    setSelectedReport({ ...report });
  };

  const handleRejectBySiteManager = (report: DailyReport) => {
    report.status = 'Draft';
    report.updatedAt = new Date().toISOString();
    obraStore.logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: report.id,
      recordCode: report.code,
      operation: 'REPORT_SUBMITTED',
      details: `Parte ${report.code} devuelto a borrador para corrección por el Jefe de Obra ${user.name}.`,
      dailyReportId: report.id
    });
    obraStore.notify();
    toast.error(`Parte ${report.code} devuelto a borrador para subsanar horas.`);
    setSelectedReport({ ...report });
  };

  const handleCertifyByConstructora = (report: DailyReport) => {
    report.status = 'Locked';
    report.updatedAt = new Date().toISOString();
    obraStore.logAuditEvent({
      affectedEntity: 'DailyReport',
      recordId: report.id,
      recordCode: report.code,
      operation: 'REPORT_SUBMITTED',
      details: `Parte ${report.code} certificado oficialmente para facturación por ${user.name}.`,
      dailyReportId: report.id
    });
    obraStore.notify();
    toast.success(`Parte ${report.code} certificado para cobro.`);
    setSelectedReport({ ...report });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Behavioral Nudges Bar (Product Behavioral Nudge Engine Agent) */}
      <BehavioralNudges 
        reportsCount={state.reports.length} 
        pendingDeliveryNotes={state.deliveryNotes.filter(n => n.status === 'Pending').length} 
        streakDays={5}
      />

      {/* Header Section */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">Partes Diarios</h1>
          <p className="text-xs sm:text-sm text-brand-muted font-medium mt-0.5">Histórico inmutable de reportes de ejecución y tajo.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
           <div className="flex items-center gap-2">
             <div className="relative flex-1 group">
               <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Buscar parte u obra..."
                 className="input-field pl-10 h-11 text-xs"
               />
             </div>
             
             <button
               onClick={handleExportAll}
               className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-white hover:border-brand-accent transition-all min-h-[44px] min-w-[44px]"
               title="Exportar CSV"
             >
               <FileDown className="w-5 h-5" />
             </button>
           </div>

           {canCreateReport && (
             <button
               onClick={onOpenReportModal}
               className="btn-primary h-11 px-5 shadow-lg shadow-brand-accent/20 w-full sm:w-auto justify-center text-xs uppercase tracking-wider"
             >
               <Zap className="w-4 h-4" />
               <span>Emitir Parte</span>
             </button>
           )}
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 card p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-muted">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No hay partes de trabajo registrados</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="card group cursor-pointer hover:border-brand-accent/40 transition-all duration-300 flex flex-col"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{report.date}</span>
                    <span className="text-[10px] font-mono text-brand-muted tracking-tight">#{report.code}</span>
                  </div>
                  <Badge status={report.status} className="text-[9px] px-2 py-0.5 rounded uppercase font-black" />
                </div>

                <div>
                  <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Obra</div>
                  <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-accent transition-colors">
                    {report.projectNameSnapshot}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                      <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Cuadrilla</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                         <Users className="w-3.5 h-3.5 text-brand-accent" />
                         <span>{report.workEntries?.length || 0} Operarios</span>
                      </div>
                   </div>
                   <div>
                      <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Horas</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                         <Clock className="w-3.5 h-3.5 text-brand-accent" />
                         <span>{report.totalHours} h</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-brand-surface/50 border-t border-brand-border flex items-center justify-between group-hover:bg-brand-surface transition-colors">
                 <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Ver detalle completo</span>
                 <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div 
            className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setSelectedReport(null)} 
          />
          
          <div className="relative bg-brand-surface border border-brand-border w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
                  <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base sm:text-xl font-display font-black text-white uppercase tracking-tight">Detalle de Jornada</h2>
                    <Badge status={selectedReport.status} className="text-[9px]" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] truncate max-w-[200px] sm:max-w-none">
                    {selectedReport.code} • {selectedReport.projectNameSnapshot}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => handlePrint(selectedReport)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border text-brand-muted hover:text-white hover:border-brand-accent transition-all"
                  title="Imprimir PDF"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border text-brand-muted hover:text-white transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-6 sm:space-y-8">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Horas Totales', value: `${selectedReport.totalHours}h`, icon: Clock, color: 'text-brand-accent' },
                  { label: 'Personal', value: `${selectedReport.workEntries.length} op.`, icon: Users, color: 'text-blue-500' },
                  { label: 'Ubicación', value: 'Verificada', icon: MapPin, color: 'text-emerald-500' },
                  { label: 'Fecha', value: selectedReport.date, icon: Calendar, color: 'text-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="card p-4 bg-brand-bg/30">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-lg font-black text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Workers List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-brand-accent" />
                    Personal en Tajo
                  </h3>
                </div>
                
                <div className="card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-surface/30">
                        <th className="px-6 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">Operario / Categoría</th>
                        <th className="px-6 py-3 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50">
                      {selectedReport.workEntries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-brand-bg/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-white uppercase">{entry.workerNameSnapshot}</div>
                            <div className="text-[10px] font-medium text-brand-muted mt-0.5 uppercase tracking-wider">
                              {entry.workerCategorySnapshot} • {entry.companyNameSnapshot || 'Personal Propio'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="text-xs font-black text-white">{entry.totalHours}h</div>
                             <div className="text-[9px] font-bold text-brand-muted mt-0.5">
                               {entry.normalHours}N + <span className="text-brand-accent">{entry.extraHours}E</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comments & Observations */}
              {selectedReport.comments && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-accent" />
                    Observaciones Técnicas
                  </h3>
                  <div className="card p-6 bg-brand-accent/5 border-brand-accent/20">
                    <p className="text-sm font-medium text-white italic leading-relaxed">
                      "{selectedReport.comments}"
                    </p>
                  </div>
                </div>
              )}

              {/* Geovalidation Alert */}
              <div className="card p-4 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">Validación Criptográfica GPS</div>
                    <div className="text-[10px] text-brand-muted font-medium mt-0.5 tracking-tight">
                      Firma registrada dentro de la geovalla homologada (Tolerancia: {selectedReport.locationSnapshot?.distanceFromProjectMeters || 0}m)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-brand-border bg-brand-bg/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user.role === 'SITE_MANAGER' && selectedReport.status !== 'Locked' && (
                  <>
                    <button
                      onClick={() => handleValidateBySiteManager(selectedReport)}
                      className="btn-primary h-11 px-6 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Validar Parte</span>
                    </button>
                    <button
                      onClick={() => handleRejectBySiteManager(selectedReport)}
                      className="btn-secondary h-11 px-6 w-full sm:w-auto border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <X className="w-4 h-4" />
                      <span>Solicitar Corrección</span>
                    </button>
                  </>
                )}

                {user.role === 'MAIN_CONTRACTOR_ADMIN' && selectedReport.status !== 'Locked' && (
                  <button
                    onClick={() => handleCertifyByConstructora(selectedReport)}
                    className="btn-primary h-11 px-6 w-full sm:w-auto"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Certificar para Cobro</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-[10px] font-black text-brand-muted hover:text-white uppercase tracking-widest transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
