function formatCurrency(amount) {
  try {
    // Ensure amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return 'Rp0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  } catch (error) {
    reportError(error);
    return 'Rp0';
  }
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    reportError(error);
    return '';
  }
}

function generateInvoiceNumber() {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV${year}${month}${day}${random}`;
  } catch (error) {
    reportError(error);
    return '';
  }
}
