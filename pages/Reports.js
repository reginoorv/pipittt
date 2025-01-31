function Reports() {
  const [reportType, setReportType] = React.useState('sales');
  const [dateRange, setDateRange] = React.useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    loadReport();
  }, [reportType, dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      let data = [];
      
      switch(reportType) {
        case 'sales': {
          const sales = await trickleListObjects('transactions', 1000, true);
          data = sales.items
            .filter(sale => {
              const saleDate = sale.objectData.date.split('T')[0];
              return saleDate >= dateRange.start && saleDate <= dateRange.end;
            })
            .map(sale => ({
              date: sale.objectData.date,
              invoiceNumber: sale.objectData.invoiceNumber,
              items: sale.objectData.items.length,
              total: sale.objectData.total,
              profit: sale.objectData.items.reduce((sum, item) => 
                sum + ((item.price - item.buyPrice) * item.quantity), 0
              )
            }));
          break;
        }
        case 'stock': {
          const products = await trickleListObjects('products', 1000, true);
          data = products.items.map(product => ({
            code: product.objectData.code,
            name: product.objectData.name,
            category: product.objectData.category,
            stock: product.objectData.stock,
            minStock: product.objectData.minStock,
            status: product.objectData.stock <= product.objectData.minStock ? 'Stok Menipis' : 'Normal'
          }));
          break;
        }
        case 'finance': {
          const transactions = await trickleListObjects('transactions', 1000, true);
          const filteredTransactions = transactions.items
            .filter(transaction => {
              const transactionDate = transaction.objectData.date.split('T')[0];
              return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
            });

          data = {
            totalSales: filteredTransactions.reduce((sum, t) => sum + t.objectData.total, 0),
            totalProfit: filteredTransactions.reduce((sum, t) => 
              sum + t.objectData.items.reduce((itemSum, item) => 
                itemSum + ((item.price - item.buyPrice) * item.quantity), 0
              ), 0),
            transactions: filteredTransactions.length
          };
          break;
        }
        default:
          break;
      }

      setReportData(data);
    } catch (error) {
      reportError(error);
      setError('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      let csv = '';
      
      if (reportType === 'sales') {
        csv = 'Tanggal,No Faktur,Jumlah Item,Total,Keuntungan\n';
        reportData.forEach(row => {
          csv += `${formatDate(row.date)},${row.invoiceNumber},${row.items},${row.total},${row.profit}\n`;
        });
      } else if (reportType === 'stock') {
        csv = 'Kode,Nama,Kategori,Stok,Stok Minimum,Status\n';
        reportData.forEach(row => {
          csv += `${row.code},${row.name},${row.category},${row.stock},${row.minStock},${row.status}\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${reportType}_${dateRange.start}_${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      reportError(error);
      setError('Gagal mengekspor laporan');
    }
  };

  const salesColumns = [
    { key: 'date', label: 'Tanggal', render: (value) => formatDate(value) },
    { key: 'invoiceNumber', label: 'No Faktur' },
    { key: 'items', label: 'Jumlah Item' },
    { key: 'total', label: 'Total', render: (value) => formatCurrency(value) },
    { key: 'profit', label: 'Keuntungan', render: (value) => formatCurrency(value) }
  ];

  const stockColumns = [
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Nama' },
    { key: 'category', label: 'Kategori' },
    { key: 'stock', label: 'Stok' },
    { key: 'minStock', label: 'Stok Minimum' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={value === 'Stok Menipis' ? 'text-red-600 font-bold' : 'text-green-600'}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div data-name="reports" className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="sales">Laporan Penjualan</option>
              <option value="stock">Laporan Stok</option>
              <option value="finance">Laporan Keuangan</option>
            </select>
          </div>

          {reportType !== 'stock' && (
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          )}

          <div className="ml-auto">
            <Button
              variant="primary"
              icon="fa-download"
              onClick={handleExport}
              disabled={loading || reportData.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {reportType === 'finance' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-blue-800">Total Penjualan</h3>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {formatCurrency(reportData.totalSales || 0)}
                </p>
              </div>
            </Card>
            <Card className="bg-green-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-800">Total Keuntungan</h3>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {formatCurrency(reportData.totalProfit || 0)}
                </p>
              </div>
            </Card>
            <Card className="bg-purple-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-purple-800">Jumlah Transaksi</h3>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {reportData.transactions || 0}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <Table
            columns={reportType === 'sales' ? salesColumns : stockColumns}
            data={reportData}
            loading={loading}
          />
        )}
      </Card>
    </div>
  );
}
