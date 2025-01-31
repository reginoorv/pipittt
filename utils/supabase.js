// Initialize Supabase client
const supabaseUrl = 'https://xnppsezgtufonpglivxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucHBzZXpndHVmb25wZ2xpdnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzk5ODgsImV4cCI6MjA1MzkxNTk4OH0.NYfQ0z29dardYzeOKxug-bD8rlZgmg5FDCArmN9B2Ig';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

function signIn(username, password) {
  try {
    // Cari user berdasarkan username
    return supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
      .then(({ data: user, error: userError }) => {
        if (userError) throw userError;
        if (!user) throw new Error('User tidak ditemukan');

        // Verifikasi password (dalam produksi gunakan bcrypt)
        if (password !== user.password) {
          throw new Error('Password salah');
        }

        // Login ke Supabase
        return supabaseClient.auth.signInWithPassword({
          email: `${username}@pharmacy-pos.com`,
          password: password,
        }).then(({ data, error }) => {
          if (error) throw error;

          return {
            user: {
              id: user.id,
              name: user.name,
              role: user.role
            },
            session: data.session
          };
        });
      });
  } catch (error) {
    reportError(error);
    throw new Error('Login gagal: ' + error.message);
  }
}

function signOut() {
  try {
    return supabaseClient.auth.signOut();
  } catch (error) {
    reportError(error);
    throw new Error('Logout gagal: ' + error.message);
  }
}

function getProducts() {
  try {
    return supabaseClient
      .from('products')
      .select(`
        *,
        suppliers (
          company
        )
      `)
      .order('name');
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat produk: ' + error.message);
  }
}

function createProduct(product) {
  try {
    return supabaseClient
      .from('products')
      .insert([product])
      .select()
      .single();
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menambah produk: ' + error.message);
  }
}

function updateProduct(id, product) {
  try {
    return supabaseClient
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
  } catch (error) {
    reportError(error);
    throw new Error('Gagal mengupdate produk: ' + error.message);
  }
}

function deleteProduct(id) {
  try {
    return supabaseClient
      .from('products')
      .delete()
      .eq('id', id);
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menghapus produk: ' + error.message);
  }
}

function getSuppliers() {
  try {
    return supabaseClient
      .from('suppliers')
      .select('*')
      .order('company');
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat supplier: ' + error.message);
  }
}

function createSupplier(supplier) {
  try {
    return supabaseClient
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menambah supplier: ' + error.message);
  }
}

function updateSupplier(id, supplier) {
  try {
    return supabaseClient
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
  } catch (error) {
    reportError(error);
    throw new Error('Gagal mengupdate supplier: ' + error.message);
  }
}

function deleteSupplier(id) {
  try {
    return supabaseClient
      .from('suppliers')
      .delete()
      .eq('id', id);
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menghapus supplier: ' + error.message);
  }
}

function createTransaction(transaction, items) {
  try {
    return supabaseClient.rpc('create_transaction', {
      transaction_data: transaction,
      items_data: items
    });
  } catch (error) {
    reportError(error);
    throw new Error('Gagal membuat transaksi: ' + error.message);
  }
}

function getTransactions(startDate, endDate) {
  try {
    let query = supabaseClient
      .from('transactions')
      .select(`
        *,
        transaction_items (
          *,
          product:products (
            name
          )
        )
      `)
      .order('date', { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    }

    return query;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat transaksi: ' + error.message);
  }
}
