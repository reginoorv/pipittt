function Dashboard() {
  const [stats, setStats] = React.useState({
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    todayTransactions: 0
  });
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [sales, products, transactions] = await Promise.all([
          trickleListObjects('sales', 100, true),
          trickleListObjects('products', 100, true),
          trickleListObjects('transactions', 10, true)
        ]);

        const todaySales = sales.items.filter(sale => 
          sale.objectData.date.startsWith(today)
        ).reduce((sum, sale) => sum + sale.objectData.total, 0);

        const lowStockProducts = products.items.filter(product => 
          product.objectData.stock <= product.objectData.minStock
        );

        setStats({
          todaySales,
          totalProducts: products.items.length,
          lowStock: lowStockProducts.length,
          todayTransactions: transactions.items.filter(t => 
            t.objectData.date.startsWith(today)
          ).length
        });

        setRecentActivities(transactions.items.map(t => ({
          id: t.objectId,
          type: 'transaction',
          date: t.objectData.date,
          description: `Transaksi #${t.objectData.invoiceNumber}`,
          amount: t.objectData.total,
          items: t.objectData.items.length
        })));

      } catch (error) {
        reportError(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div data-name="dashboard" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-600">
              <i className="fas fa-shopping-cart text-2xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg">Penjualan Hari Ini</h3>
              <p className="text-2xl font-bold">{formatCurrency(stats.todaySales)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-600">
              <i className="fas fa-pills text-2xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg">Total Produk</h3>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-600">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg">Stok Menipis</h3>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-600">
              <i className="fas fa-receipt text-2xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg">Transaksi Hari Ini</h3>
              <p className="text-2xl font-bold">{stats.todayTransactions}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Aktivitas Terkini">
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">{activity.description}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.date)} • {activity.items} item
                  </p>
                </div>
              </div>
              <p className="font-medium">{formatCurrency(activity.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
