import { jsPDF } from 'jspdf';
import { DeliveryNote } from '../types';

export const exportDeliveryNoteToPDF = (note: DeliveryNote): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    let y = 20;

    // Header Banner
    doc.setFillColor(15, 23, 42); // Navy / Slate-900
    doc.rect(margin, y, 180, 16, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ALBARÁN DE CERTIFICACIÓN DE JORNADA - OBRASERVICE', margin + 6, y + 10);

    y += 24;

    // Meta Cards (Contratista & Subcontratista)
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, 180, 32, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, 180, 32, 'S');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('REFERENCIA ALBARÁN:', margin + 6, y + 6);
    doc.setFont('Helvetica', 'normal');
    doc.text(note.code, margin + 45, y + 6);

    doc.setFont('Helvetica', 'bold');
    doc.text('SUBCONTRATA:', margin + 6, y + 12);
    doc.setFont('Helvetica', 'normal');
    doc.text(note.subcontractorCompanyName, margin + 45, y + 12);

    doc.setFont('Helvetica', 'bold');
    doc.text('PROYECTO / OBRA:', margin + 6, y + 18);
    doc.setFont('Helvetica', 'normal');
    doc.text(note.projectNameSnapshot, margin + 45, y + 18);

    doc.setFont('Helvetica', 'bold');
    doc.text('FECHA REGISTRO:', margin + 6, y + 24);
    doc.setFont('Helvetica', 'normal');
    doc.text(note.date, margin + 45, y + 24);

    y += 40;

    // Table Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('HORAS IMPUTADAS POR EL PERSONAL DE SUBCONTRATA', margin, y);
    y += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, 180, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.text('OPERARIO', margin + 4, y + 5.5);
    doc.text('CATEGORÍA', margin + 65, y + 5.5);
    doc.text('H. NORMALES', margin + 115, y + 5.5);
    doc.text('H. EXTRAS', margin + 145, y + 5.5);
    doc.text('TOTAL', margin + 172, y + 5.5);

    y += 8;

    // Rows
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const entries = note.workEntries || [];
    entries.forEach(line => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.text(line.workerNameSnapshot, margin + 4, y + 5.5);
      doc.setFont('Helvetica', 'normal');
      doc.text(line.workerCategorySnapshot, margin + 65, y + 5.5);
      doc.text(`${line.normalHours}h`, margin + 115, y + 5.5);
      doc.text(`${line.extraHours}h`, margin + 145, y + 5.5);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${line.totalHours}h`, margin + 172, y + 5.5);

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 8, margin + 180, y + 8);
      y += 8;
    });

    y += 4;

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.rect(margin + 115, y, 65, 18, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin + 115, y, 65, 18, 'S');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'bold');
    doc.text('Total Horas Norm.:', margin + 118, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${note.normalHours}h`, margin + 168, y + 5);

    doc.setFont('Helvetica', 'bold');
    doc.text('Total Horas Ext.:', margin + 118, y + 10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${note.extraHours}h`, margin + 168, y + 10);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text('SUMA TOTAL:', margin + 118, y + 15);
    doc.text(`${note.totalHours}h`, margin + 168, y + 15);

    y += 30;

    // Verification / Status stamp
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    if (note.status === 'Confirmed') {
      doc.setFillColor(240, 253, 250); // Green BG
      doc.rect(margin, y, 180, 16, 'F');
      doc.setDrawColor(187, 247, 208);
      doc.rect(margin, y, 180, 16, 'S');

      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61); // Green-700
      doc.setFont('Helvetica', 'bold');
      doc.text('ESTADO: ALBARÁN CERTIFICADO DIGITALMENTE', margin + 5, y + 6);
      
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      const signerName = note.confirmationDetails?.confirmedByUserName || 'Apoderado / Representante de Subcontrata';
      doc.text(`Confirmado electrónicamente por ${signerName} en fecha ${note.confirmationDetails?.confirmedAt ? new Date(note.confirmationDetails.confirmedAt).toLocaleDateString() : new Date().toLocaleDateString()}.`, margin + 5, y + 11);
    } else {
      doc.setFillColor(254, 243, 199); // Amber BG
      doc.rect(margin, y, 180, 16, 'F');
      doc.setDrawColor(253, 230, 138);
      doc.rect(margin, y, 180, 16, 'S');

      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // Amber-700
      doc.setFont('Helvetica', 'bold');
      doc.text('ESTADO: PENDIENTE DE CERTIFICACIÓN', margin + 5, y + 6);
      
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Este documento carece de firma electrónica vinculante de la subcontrata. Requiere acción en la plataforma.`, margin + 5, y + 11);
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Sello de auditoría de ObraService. Cadena de Custodia Inmutable para Empresas Subcontratistas.`, margin, 282);

    doc.save(`Albaran_Socio_${note.code}.pdf`);
  } catch (err) {
    console.error(err);
    alert('Error al exportar el albarán a PDF.');
  }
};
