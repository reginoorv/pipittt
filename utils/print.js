function generateReceiptHTML(transaction) {
  try {
    const receiptDate = formatDate(transaction.date);
    const items = transaction.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.price)}</td>
        <td class="text-right">${formatCurrency(item.subtotal)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk Pembayaran</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .mb-1 { margin-bottom: 8px; }
          .border-top { border-top: 1px dashed #000; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="text-center mb-1">
          <h2>APOTEK PIPIT</h2>
          <p>Panjalu, Kec. Panjalu, Kabupaten Ciamis<br/>Jawa Barat 46264<br/>Telp: 0821 1569 7191</p>
        </div>
        
        <div class="mb-1">
          <p>No: ${transaction.invoiceNumber}<br/>
          Tanggal: ${receiptDate}<br/>
          Kasir: ${transaction.cashier}</p>
        </div>
        
        <table>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th class="text-right">Harga</th>
            <th class="text-right">Total</th>
          </tr>
          ${items}
          <tr class="border-top">
            <td colspan="3"><strong>Total</strong></td>
            <td class="text-right"><strong>${formatCurrency(transaction.total)}</strong></td>
          </tr>
          <tr>
            <td colspan="3">Tunai</td>
            <td class="text-right">${formatCurrency(transaction.cash)}</td>
          </tr>
          <tr>
            <td colspan="3">Kembali</td>
            <td class="text-right">${formatCurrency(transaction.change)}</td>
          </tr>
        </table>
        
        <div class="text-center" style="margin-top: 20px;">
          <p>Terima Kasih Atas Kunjungan Anda<br/>
          Semoga Lekas Sembuh</p>
        </div>
      </body>
      </html>
    `;
  } catch (error) {
    reportError(error);
    throw new Error('Failed to generate receipt');
  }
}

function printReceipt(transaction) {
  try {
    const receiptHTML = generateReceiptHTML(transaction);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (error) {
    reportError(error);
    throw new Error('Failed to print receipt');
  }
}
