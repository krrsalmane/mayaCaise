import { jsPDF } from 'jspdf';

/**
 * Professional receipt ticket (PDF) for all purchases summary.
 * @param {Object} options
 * @param {string} options.title
 * @param {Object} [options.client]
 * @param {Array} options.purchases
 * @param {string} [options.filename]
 */
export function downloadTicketPdf({ title = 'Ticket', client, purchases, filename }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(139, 90, 43);
  doc.text('Café Maya', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Client info
  if (client) {
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Client:', margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(client.fullName, margin, y);
    y += 12;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Type: ${client.clientType}`, margin, y);
    y += 8;
    if (client.phoneNumber) {
      doc.text(`Phone: ${client.phoneNumber}`, margin, y);
      y += 8;
    }
    if (client.email) {
      doc.text(`Email: ${client.email}`, margin, y);
      y += 8;
    }
    // Line
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
  }

  // Table header
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(60);
  doc.text('Date', margin, y);
  doc.text('Product', margin + 50, y);
  doc.text('Price', margin + 110, y);
  doc.text('Discount', margin + 140, y);
  doc.text('Total', margin + 170, y);
  y += 10;

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Purchases table
  doc.setFont(undefined, 'normal');
  let grandTotal = 0;
  purchases.forEach((p) => {
    const lineTotal = Number(p.totalPrice);
    grandTotal += lineTotal;

    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(new Date(p.purchaseDate).toLocaleString(), margin, y);
    doc.text(p.productName, margin + 50, y);
    doc.text(Number(p.unitPrice).toFixed(2), margin + 110, y);
    doc.text(p.discountPercent > 0 ? `-${p.discountPercent}%` : '—', margin + 140, y);
    doc.text(Number(p.totalPrice).toFixed(2), margin + 170, y);
    y += 8;

    // Payment status
    doc.setTextColor(p.paid ? 39 : 231, p.paid ? 174 : 76, 96);
    doc.text(p.paid ? 'PAID' : 'UNPAID', margin + 50, y);
    doc.setTextColor(60);
    y += 10;
  });

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Grand total
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(139, 90, 43);
  doc.text(`Total: ${grandTotal.toFixed(2)} MAD`, margin, y);
  y += 20;

  // Footer
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont(undefined, 'normal');
  doc.text('Thank you for your purchase!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('Café Maya - Quality Coffee & Service', pageWidth / 2, y, { align: 'center' });

  const safeName = (client?.fullName || 'ticket').replace(/\s+/g, '_');
  doc.save(filename || `ticket_${safeName}_${Date.now()}.pdf`);
}

export function downloadSinglePurchaseTicket(purchase, client) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(139, 90, 43);
  doc.text('Café Maya', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Sales Receipt', pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Order details
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Order ID: #${purchase.id}`, margin, y);
  y += 8;
  doc.text(`Date: ${new Date(purchase.purchaseDate).toLocaleString()}`, margin, y);
  y += 15;

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Product info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Product:', margin, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(purchase.productName, margin, y);
  y += 12;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Unit Price: ${Number(purchase.unitPrice).toFixed(2)} MAD`, margin, y);
  y += 8;
  if (purchase.discountPercent > 0) {
    doc.text(`Discount: ${purchase.discountPercent}%`, margin, y);
    y += 8;
  }

  // Total
  y += 5;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(139, 90, 43);
  doc.text(`Total: ${Number(purchase.totalPrice).toFixed(2)} MAD`, margin, y);
  y += 15;

  // Client info
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text('Client:', margin, y);
  y += 8;
  doc.text(client?.fullName || purchase.clientName, margin, y);
  y += 8;
  doc.text(`Type: ${client?.clientType || purchase.clientType}`, margin, y);
  y += 15;

  // Payment status
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(purchase.paid ? 39 : 231, purchase.paid ? 174 : 76, 96);
  doc.text(`Payment Status: ${purchase.paid ? 'PAID' : 'UNPAID'}`, margin, y);
  y += 20;

  // Footer
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Thank you for your purchase!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('Café Maya - Quality Coffee & Service', pageWidth / 2, y, { align: 'center' });

  doc.save(`ticket-${purchase.id}.pdf`);
}
