function Transaction() {
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [payment, setPayment] = React.useState({ amount: 0 });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [cashierName, setCashierName] = React.useState('');

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      reportError(error);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component code remains the same
}
