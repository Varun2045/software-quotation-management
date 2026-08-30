import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from './types';
import { formatCurrency, calculateItemAmounts } from './calculations';

export function generateQuotationPDF(quotation: Quotation) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette
  const primaryColor = [37, 99, 235]; // #2563eb
  const darkSlate = [15, 23, 42];    // #0f172a
  const mutedSlate = [100, 116, 139];// #64748b

  // Company Header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TRIPLE S', 20, 24);

  doc.setFontSize(9);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('SOFTWARE & FINANCIAL SOLUTIONS', 20, 29);
  doc.text('100 Tech Boulevard, Suite 400, Innovation Hub', 20, 34);
  doc.text('billing@triples.software | +1 (555) 019-2834', 20, 39);

  // Document Title & Reference
  doc.setFontSize(20);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 190, 24, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.quotation_number, 190, 30, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${quotation.quotation_date}`, 190, 36, { align: 'right' });
  if (quotation.valid_until) {
    doc.text(`Valid Until: ${quotation.valid_until}`, 190, 41, { align: 'right' });
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 46, 190, 46);

  // Customer Details Block
  doc.setFontSize(9);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION PREPARED FOR:', 20, 54);

  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.customer_name, 20, 60);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  let currentY = 65;
  if (quotation.company_name) {
    doc.text(quotation.company_name, 20, currentY);
    currentY += 5;
  }
  doc.text(quotation.email, 20, currentY);
  currentY += 5;
  if (quotation.phone) {
    doc.text(quotation.phone, 20, currentY);
    currentY += 5;
  }

  // Table of Items
  const tableRows = (quotation.quotation_items || []).map((item, idx) => {
    const computed = calculateItemAmounts(item);
    return [
      idx + 1,
      item.product_name,
      Number(item.quantity).toLocaleString(),
      formatCurrency(item.unit_price),
      item.discount > 0 ? `${item.discount}%` : '0%',
      formatCurrency(computed.netAmount),
    ];
  });

  autoTable(doc, {
    startY: Math.max(currentY + 6, 80),
    head: [['#', 'Product / Service Description', 'Qty', 'Unit Price', 'Disc', 'Net Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 31, halign: 'right' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Notes Section (Left side)
  if (quotation.notes) {
    doc.setFontSize(8);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & NOTES:', 20, finalY);

    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(quotation.notes, 90);
    doc.text(splitNotes, 20, finalY + 5);
  }

  // Summary Breakdown (Right side)
  const summaryX = 130;
  const valueX = 190;
  let summaryY = finalY;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);

  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(formatCurrency(quotation.subtotal), valueX, summaryY, { align: 'right' });
  summaryY += 6;

  doc.text(`GST (${quotation.gst_rate}%):`, summaryX, summaryY);
  doc.text(formatCurrency(quotation.gst), valueX, summaryY, { align: 'right' });
  summaryY += 8;

  // Grand Total Box
  doc.setFillColor(241, 245, 249);
  doc.rect(summaryX - 4, summaryY - 5, 64, 10, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Grand Total:', summaryX, summaryY + 2);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(quotation.total), valueX, summaryY + 2, { align: 'right' });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, pageHeight - 16, 190, pageHeight - 16);

  doc.setFontSize(8);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business. For questions regarding this quote, contact billing@triples.software', 105, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`${quotation.quotation_number}_Quotation.pdf`);
}
