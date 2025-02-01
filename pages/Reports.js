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
      
      switch(reportType) {
        case 'sales': {
          const { data, error } = await supabaseClient
            .from('transactions')
            .select(`
              *,
              cashier:users (name),
              items:transaction_items (
                quantity,
                price,
                buy_price,
                subtotal,
                product:products (name)
              )
            `)
            .gte('created_at', dateRange.start)
            .lte('created_at', dateRange.end)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setReportData(data || []);
          break;
        }
        case 'stock': {
          const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');

          if (error) throw error;
          setReportData(data || []);
          break;
        }
      }
    } catch (error) {
      setError('Gagal memuat laporan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            >
              <option value="sales">Laporan Penjualan</option>
              <option value="stock">Laporan Stok</option>
            </select>
          </div>
          
          {reportType === 'sales' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
            </>
          )}
          
          <Button variant="primary" onClick={loadReport}>
            Muat Laporan
          </Button>
        </div>
      </Card>

      <Card>
        {reportType === 'sales' ? (
          <Table
            columns={[
              { key: 'invoice_number', label: 'No Invoice' },
              { 
                key: 'created_at',
                label: 'Tanggal',
                render: (value) => formatDate(value)
              },
              {
                key: 'cashier',
                label: 'Kasir',
                render: (value) => value?.name || '-'
              },
              {
                key: 'items',
                label: 'Items',
                render: (items) => items?.length || 0
              },
              {
                key: 'total',
                label: 'Total',
                render: (value) => formatCurrency(value)
              }
            ]}
            data={reportData}
          />
        ) : (
          <Table
            columns={[
              { key: 'code', label: 'Kode' },
              { key: 'name', label: 'Nama' },
              { key: 'category', label: 'Kategori' },
              {
                key: 'buy_price',
                label: 'Harga Beli',
                render: (value) => formatCurrency(value)
              },
              {
                key: 'sell_price',
                label: 'Harga Jual',
                render: (value) => formatCurrency(value)
              },
              { key: 'stock', label: 'Stok' },
              { key: 'min_stock', label: 'Stok Min' }
            ]}
            data={reportData}
          />
        )}
      </Card>
    </div>
  );
}

