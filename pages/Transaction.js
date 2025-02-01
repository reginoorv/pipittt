function Transaction() {
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [payment, setPayment] = React.useState({ amount: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
      setError('Gagal memuat produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
  };

  const handlePayment = async () => {
    try {
      if (cart.length === 0) {
        setError('Keranjang kosong');
        return;
      }

      const total = calculateTotal();
      if (payment.amount < total) {
        setError('Pembayaran kurang');
        return;
      }

      const transaction = {
        invoice_number: generateInvoiceNumber(),
        cashier_id: localStorage.getItem('user_id'),
        total: total,
        cash: payment.amount,
        change: payment.amount - total
      };

      const items = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.sell_price,
        buyPrice: item.buy_price,
        stock: item.stock
      }));

      await createTransaction(transaction, items);
      setSuccess('Transaksi berhasil');
      setCart([]);
      setPayment({ amount: 0 });
      loadProducts();
    } catch (error) {
      setError('Gagal membuat transaksi: ' + error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Daftar Produk">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="p-4 border rounded cursor-pointer hover:bg-gray-50"
              onClick={() => addToCart(product)}
            >
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.code}</p>
              <p className="text-blue-600">{formatCurrency(product.sell_price)}</p>
              <p className="text-sm text-gray-500">Stok: {product.stock}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Keranjang">
        {success && <Alert type="success" message={success} />}
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(item.sell_price)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-20 p-1 border rounded"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Tunai</label>
              <input
                type="number"
                value={payment.amount}
                onChange={(e) => setPayment({ amount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Kembali:</span>
              <span>{formatCurrency(Math.max(0, payment.amount - calculateTotal()))}</span>
            </div>
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={handlePayment}
            >
              Bayar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
