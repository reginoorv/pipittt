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
          const { data: sales, error } = await supabaseClient
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
          data = sales || [];
          break;
        }
        case 'stock': {
          const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');

          if (error) throw error;
          data = products || [];
          break;
        }
        // Rest of the switch cases remain the same
      }

      setReportData(data);
    } catch (error) {
      reportError(error);
      setError('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component code remains the same
}
