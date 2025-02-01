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
        supabaseClient
          .from('products')
          .select(`
            *,
            supplier:suppliers (
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
      reportError(error);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component code remains the same
}
