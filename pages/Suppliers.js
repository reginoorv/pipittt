function Suppliers() {
  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentSupplier, setCurrentSupplier] = React.useState(null);

  React.useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('suppliers')
        .select('*')
        .order('company');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      setError('Gagal memuat data supplier: ' + error.message);
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
          <h2 className="text-xl font-bold">Daftar Supplier</h2>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentSupplier(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Supplier
          </Button>
        </div>

        <Table
          columns={[
            { key: 'company', label: 'Perusahaan' },
            { key: 'pic_name', label: 'PIC' },
            { key: 'phone', label: 'Telepon' },
            { key: 'email', label: 'Email' },
            { key: 'address', label: 'Alamat' },
            {
              key: 'actions',
              label: 'Aksi',
              render: (_, supplier) => (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCurrentSupplier(supplier);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus supplier ini?')) {
                        handleDelete(supplier.id);
                      }
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              )
            }
          ]}
          data={suppliers}
        />
      </Card>

      {isModalOpen && (
        <Modal
          title={currentSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
          onClose={() => setIsModalOpen(false)}
        >
          <SupplierForm
            supplier={currentSupplier}
            onSubmit={async (formData) => {
              try {
                if (currentSupplier) {
                  await supabaseClient
                    .from('suppliers')
                    .update(formData)
                    .eq('id', currentSupplier.id);
                } else {
                  await supabaseClient
                    .from('suppliers')
                    .insert([formData]);
                }
                loadSuppliers();
                setIsModalOpen(false);
              } catch (error) {
                alert('Gagal menyimpan supplier: ' + error.message);
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function SupplierForm({ supplier, onSubmit }) {
  const [formData, setFormData] = React.useState(
    supplier || {
      company: '',
      pic_name: '',
      phone: '',
      email: '',
      address: ''
    }
  );

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
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nama PIC</label>
        <input
          type="text"
          value={formData.pic_name}
          onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Telepon</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Alamat</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          rows="3"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary">
          {supplier ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
