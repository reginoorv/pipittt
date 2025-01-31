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
    loadCashierName();
  }, []);

  const loadCashierName = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const user = await trickleGetObject('users', userId);
        setCashierName(user.objectData.name);
      }
    } catch (error) {
      reportError(error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await trickleListObjects('products', 100, true);
      setProducts(response.items.map(item => ({
        id: item.objectId,
        ...item.objectData,
        price: Number(item.objectData.sellPrice) || 0,
        buyPrice: Number(item.objectData.buyPrice) || 0,
        stock: Number(item.objectData.stock) || 0
      })));
    } catch (error) {
      reportError(error);
      setError('Gagal memuat produk');
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
      if (existingItem.quantity >= product.stock) {
        setError('Stok tidak mencukupi');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1,
        price: Number(product.price),
        buyPrice: Number(product.buyPrice)
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (quantity > product.stock) {
      setError('Stok tidak mencukupi');
      return;
    }

    if (quantity < 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (itemPrice * quantity);
    }, 0);
  };

  const total = calculateTotal();
  const change = payment.amount - total;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Keranjang kosong');
      return;
    }

    if (payment.amount < total) {
      setError('Pembayaran kurang');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const transaction = {
        invoiceNumber: generateInvoiceNumber(),
        date: new Date().toISOString(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
          buyPrice: Number(item.buyPrice),
          subtotal: Number(item.price) * Number(item.quantity)
        })),
        total: Number(total),
        cash: Number(payment.amount),
        change: Number(change),
        cashier: cashierName || 'Unknown'
      };

      await trickleCreateObject('transactions', transaction);

      // Update product stock
      await Promise.all(cart.map(item => {
        const updatedStock = Number(item.stock) - Number(item.quantity);
        return trickleUpdateObject('products', item.id, {
          stock: updatedStock
        });
      }));

      printReceipt(transaction);
      
      setSuccess('Transaksi berhasil');
      setCart([]);
      setPayment({ amount: 0 });
      loadProducts();

    } catch (error) {
      reportError(error);
      setError('Gagal memproses transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-name="transaction" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock < 1}
                className={`p-4 rounded-lg text-left transition-all
                  ${product.stock < 1 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'bg-white shadow-sm hover:shadow-md'}`}
              >
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.code}</p>
                <p className="text-lg font-bold mt-2">{formatCurrency(product.price)}</p>
                <p className="text-sm text-gray-500">Stok: {product.stock}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Keranjang">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <div className="space-y-4 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pembayaran
            </label>
            <input
              type="number"
              value={payment.amount || ''}
              onChange={(e) => setPayment({ amount: Number(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              min="0"
              step="1000"
            />
            {payment.amount >= total && (
              <div className="text-right font-bold">
                Kembalian: {formatCurrency(change)}
              </div>
            )}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || payment.amount < total}
            loading={loading}
            variant="primary"
            fullWidth
            className="mt-4"
          >
            Bayar
          </Button>
        </Card>
      </div>
    </div>
  );
}
