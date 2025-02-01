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
      const { data, error } = await supabaseClient
        .from('suppliers')
        .select('*')
        .order('company');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      reportError(error);
      setError('Gagal memuat data supplier');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component code remains the same
}
