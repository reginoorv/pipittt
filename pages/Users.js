function Users() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await trickleListObjects('users', 100, true);
      setUsers(response.items.map(item => ({
        id: item.objectId,
        ...item.objectData
      })));
    } catch (error) {
      reportError(error);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      if (currentUser) {
        await trickleUpdateObject('users', currentUser.id, data);
      } else {
        await trickleCreateObject('users', data);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      reportError(error);
      setError('Gagal menyimpan pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await trickleDeleteObject('users', userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      reportError(error);
      setError('Gagal menghapus pengguna');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role' },
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
              setCurrentUser(row);
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
              setUserToDelete(row);
              setShowDeleteConfirm(true);
            }}
          >
            Hapus
          </Button>
        </div>
      )
    }
  ];

  const UserForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = React.useState(initialData || {
      name: '',
      username: '',
      password: '',
      role: 'kasir'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        {!currentUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required={!currentUser}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
          </select>
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
    <div data-name="users">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card
        title="Daftar Pengguna"
        actions={
          <Button
            variant="primary"
            icon="fa-plus"
            onClick={() => {
              setCurrentUser(null);
              setIsModalOpen(true);
            }}
          >
            Tambah Pengguna
          </Button>
        }
      >
        <Table
          columns={columns}
          data={users}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
      >
        <UserForm
          onSubmit={handleSubmit}
          initialData={currentUser}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin menghapus pengguna "{userToDelete?.name}"?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
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
