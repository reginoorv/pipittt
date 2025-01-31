function Products() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState(null);
  const [suppliers, setSuppliers] = React.useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, suppliersRes] = await Promise.all([
        trickleListObjects('products', 100, true),
        trickleListObjects('suppliers', 100, true)
      ]);

      setProducts(productsRes.items.map(item => ({
        id: item.objectId,
        ...item.objectData
      })));

      setSuppliers(suppliersRes.items.map(item => ({
        id: item.objectId,
        ...item.objectData
      })));

    } catch (error) {
      reportError(error);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      if (currentProduct) {
        await trickleUpdateObject('products', currentProduct.id, data);
      } else {
        await trickleCreateObject('products', data);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      reportError(error);
      setError('Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setLoading(true);
      await trickleDeleteObject('products', productToDelete.id);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      loadData();
    } catch (error) {
      reportError(error);
      setError('Gagal menghapus produk');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Nama Obat' },
    { key: 'category', label: 'Kategori' },
    { 
      key: 'buyPrice', 
      label: 'Harga Beli',
      render: (value) => formatCurrency(value)
    },
    { 
      key: 'sellPrice', 
      label: 'Harga Jual',
      render: (value) => formatCurrency(value)
    },
    { 
      key: 'stock', 
      label: 'Stok',
      render: (value, row) => (
        <span className={value <= row.minStock ? 'text-red-600 font-bold' : ''}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            icon="fa-edit"
            onClick={() => {
              setCurrentProduct(row);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="fa-trash"
            onClick={() => {
              setProductToDelete(row);
              setShowDeleteConfirm(true);
            }}
          >
            Hapus
          </Button>
        </div>
      )
    }
  ];

  const ProductForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = React.useState(initialData || {
      code: '',
      name: '',
      category: 'tablet',
      supplierId: '',
      buyPrice: '',
      sellPrice: '',
      stock: '',
      minStock: '',
      description: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kode Obat</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Obat</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="tablet">Tablet</option>
              <option value="sirup">Sirup</option>
              <option value="kapsul">Kapsul</option>
              <option value="salep">Salep</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
              value={formData.buyPrice}
              onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
            <input
              type="number"
              value={formData.sellPrice}
              onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stok Minimum</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows="3"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Simpan
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div data-name="products">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card
        title="Daftar Produk"
        actions={
          <Button
            variant="primary"
            icon="fa-plus"
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Produk
          </Button>
        }
      >
        <Table
          columns={columns}
          data={products}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? 'Edit Produk' : 'Tambah Produk'}
        size="lg"
      >
        <ProductForm
          onSubmit={handleSubmit}
          initialData={currentProduct}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin menghapus produk "{productToDelete?.name}"?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setProductToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
