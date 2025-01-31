function Suppliers() {
  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentSupplier, setCurrentSupplier] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [supplierToDelete, setSupplierToDelete] = React.useState(null);

  React.useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await trickleListObjects('suppliers', 100, true);
      setSuppliers(response.items.map(item => ({
        id: item.objectId,
        ...item.objectData
      })));
    } catch (error) {
      reportError(error);
      setError('Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      if (currentSupplier) {
        await trickleUpdateObject('suppliers', currentSupplier.id, data);
      } else {
        await trickleCreateObject('suppliers', data);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (error) {
      reportError(error);
      setError('Gagal menyimpan supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    
    try {
      setLoading(true);
      await trickleDeleteObject('suppliers', supplierToDelete.id);
      setShowDeleteConfirm(false);
      setSupplierToDelete(null);
      loadSuppliers();
    } catch (error) {
      reportError(error);
      setError('Gagal menghapus supplier');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'company', label: 'Perusahaan' },
    { key: 'picName', label: 'Nama PIC' },
    { key: 'phone', label: 'Telepon' },
    { key: 'email', label: 'Email' },
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
              setCurrentSupplier(row);
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
              setSupplierToDelete(row);
              setShowDeleteConfirm(true);
            }}
          >
            Hapus
          </Button>
        </div>
      )
    }
  ];

  const SupplierForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = React.useState(initialData || {
      company: '',
      picName: '',
      phone: '',
      email: '',
      address: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nama PIC</label>
          <input
            type="text"
            value={formData.picName}
            onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telepon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
    <div data-name="suppliers">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card
        title="Daftar Supplier"
        actions={
          <Button
            variant="primary"
            icon="fa-plus"
            onClick={() => {
              setCurrentSupplier(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Supplier
          </Button>
        }
      >
        <Table
          columns={columns}
          data={suppliers}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
      >
        <SupplierForm
          onSubmit={handleSubmit}
          initialData={currentSupplier}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSupplierToDelete(null);
        }}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin menghapus supplier "{supplierToDelete?.company}"?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSupplierToDelete(null);
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
