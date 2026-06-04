import { jsPDF } from 'jspdf';

const SHOP_NAME = 'CaisseMaya';
const SHOP_SUB = 'Café & Snacks';

function formatMoney(value) {
  return `${Number(value).toFixed(2)} MAD`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function drawLine(doc, y, width = 72) {
  doc.setLineWidth(0.2);
  doc.line(14, y, 14 + width, y);
  return y + 4;
}

/**
 * Coffee-shop style receipt ticket (PDF).
 * @param {Object} options
 * @param {string} options.title
 * @param {Object} [options.client]
 * @param {Array} options.purchases
 * @param {string} [options.filename]
 */
export function downloadTicketPdf({ title = 'Ticket', client, purchases, filename }) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 297] });
  const centerX = 40;
  let y = 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(SHOP_NAME, centerX, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(SHOP_SUB, centerX, y, { align: 'center' });
  y += 6;
  y = drawLine(doc, y);

  doc.setFontSize(8);
  doc.text(title, centerX, y, { align: 'center' });
  y += 5;
  doc.text(formatDate(new Date()), centerX, y, { align: 'center' });
  y += 6;

  if (client) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Client: ${client.fullName}`, 14, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const typeLabel = client.clientType === 'STAFF' ? 'Staff' : 'Externe';
    doc.text(`Type: ${typeLabel}`, 14, y);
    y += 4;
    if (client.phoneNumber) {
      doc.text(`Tel: ${client.phoneNumber}`, 14, y);
      y += 4;
    }
    y = drawLine(doc, y);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Article', 14, y);
  doc.text('Prix', 48, y);
  doc.text('Total', 62, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  y = drawLine(doc, y, 68);

  let grandTotal = 0;

  purchases.forEach((p) => {
    const lineTotal = Number(p.totalPrice);
    grandTotal += lineTotal;
    const paidLabel = p.paid ? 'PAYE' : 'NON PAYE';

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const productLines = doc.splitTextToSize(p.productName, 32);
    doc.text(productLines, 14, y);
    const nameHeight = productLines.length * 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(formatMoney(p.unitPrice), 48, y);
    doc.text(formatMoney(lineTotal), 62, y);
    y += Math.max(nameHeight, 4);

    if (p.discountPercent > 0) {
      doc.text(`Remise: -${p.discountPercent}%`, 14, y);
      y += 3.5;
    }
    doc.setFont('helvetica', 'bold');
    if (p.paid) {
      doc.setTextColor(34, 139, 34);
    } else {
      doc.setTextColor(180, 90, 0);
    }
    doc.text(`[ ${paidLabel} ]`, 14, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 4;
    y = drawLine(doc, y, 68);
  });

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', 14, y);
  doc.text(formatMoney(grandTotal), 62, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Merci de votre visite !', centerX, y, { align: 'center' });
  y += 4;
  doc.text('A bientot au café', centerX, y, { align: 'center' });

  const safeName = (client?.fullName || 'ticket').replace(/\s+/g, '_');
  doc.save(filename || `ticket_${safeName}_${Date.now()}.pdf`);
}

export function downloadSinglePurchaseTicket(purchase, client) {
  downloadTicketPdf({
    title: 'Ticket de caisse',
    client: client || {
      fullName: purchase.clientName,
      clientType: purchase.clientType,
    },
    purchases: [purchase],
    filename: `ticket_${purchase.id}.pdf`,
  });
}
