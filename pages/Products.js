function Products() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState(null);
  const [suppliers, setSuppliers] = React.useState([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, suppliersRes] = await Promise.all([
        supabaseClient
          .from('products')
          .select(`
            *,
            supplier:suppliers (
              id,
              company,
              pic_name
            )
          `)
          .order('name'),
        supabaseClient
          .from('suppliers')
          .select('*')
          .order('company')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      setError('Gagal memuat data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div>
      <Card>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Daftar Produk</h2>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Produk
          </Button>
        </div>

        <Table
          columns={[
            { key: 'code', label: 'Kode' },
            { key: 'name', label: 'Nama' },
            { key: 'category', label: 'Kategori' },
            { 
              key: 'supplier',
              label: 'Supplier',
              render: (value) => value?.company || '-'
            },
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
            {
              key: 'actions',
              label: 'Aksi',
              render: (_, product) => (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCurrentProduct(product);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus produk ini?')) {
                        handleDelete(product.id);
                      }
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )
            }
          ]}
          data={products}
        />
      </Card>

      {isModalOpen && (
        <Modal
          title={currentProduct ? 'Edit Produk' : 'Tambah Produk'}
          onClose={() => setIsModalOpen(false)}
        >
          <ProductForm
            product={currentProduct}
            suppliers={suppliers}
            onSubmit={async (formData) => {
              try {
                if (currentProduct) {
                  await supabaseClient
                    .from('products')
                    .update(formData)
                    .eq('id', currentProduct.id);
                } else {
                  await supabaseClient
                    .from('products')
                    .insert([formData]);
                }
                loadData();
                setIsModalOpen(false);
              } catch (error) {
                alert('Gagal menyimpan produk: ' + error.message);
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function ProductForm({ product, suppliers, onSubmit }) {
  const [formData, setFormData] = React.useState(
    product || {
      code: '',
      name: '',
      category: '',
      supplier_id: '',
      buy_price: '',
      sell_price: '',
      stock: '',
      min_stock: '',
      description: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Kode</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nama</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        >
          <option value="">Pilih Kategori</option>
          <option value="tablet">Tablet</option>
          <option value="sirup">Sirup</option>
          <option value="kapsul">Kapsul</option>
          <option value="salep">Salep</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Supplier</label>
        <select
          value={formData.supplier_id}
          onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        >
          <option value="">Pilih Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.company}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Harga Beli</label>
        <input
          type="number"
          value={formData.buy_price}
          onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
        <input
          type="number"
          value={formData.sell_price}
          onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stok</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stok Minimum</label>
        <input
          type="number"
          value={formData.min_stock}
          onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          rows="3"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary">
          {product ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
