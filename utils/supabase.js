// Initialize Supabase client
const supabaseUrl = 'https://xnppsezgtufonpglivxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucHBzZXpndHVmb25wZ2xpdnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzk5ODgsImV4cCI6MjA1MzkxNTk4OH0.NYfQ0z29dardYzeOKxug-bD8rlZgmg5FDCArmN9B2Ig';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function signIn(username, password) {
  try {
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User tidak ditemukan');

    if (password !== user.password) {
      throw new Error('Password salah');
    }

    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_name', user.name);

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    reportError(error);
    throw new Error('Login gagal: ' + error.message);
  }
}

async function getProducts() {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select(`
        *,
        supplier:suppliers (
          company,
          pic_name
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat produk: ' + error.message);
  }
}

async function createProduct(product) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menambah produk: ' + error.message);
  }
}

async function updateProduct(id, product) {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal mengupdate produk: ' + error.message);
  }
}

async function deleteProduct(id) {
  try {
    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menghapus produk: ' + error.message);
  }
}

async function getSuppliers() {
  try {
    const { data, error } = await supabaseClient
      .from('suppliers')
      .select('*')
      .order('company');

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat supplier: ' + error.message);
  }
}

async function createSupplier(supplier) {
  try {
    const { data, error } = await supabaseClient
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menambah supplier: ' + error.message);
  }
}

async function updateSupplier(id, supplier) {
  try {
    const { data, error } = await supabaseClient
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal mengupdate supplier: ' + error.message);
  }
}

async function deleteSupplier(id) {
  try {
    const { error } = await supabaseClient
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menghapus supplier: ' + error.message);
  }
}

async function getUsers() {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat users: ' + error.message);
  }
}

async function createUser(user) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menambah user: ' + error.message);
  }
}

async function updateUser(id, user) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal mengupdate user: ' + error.message);
  }
}

async function deleteUser(id) {
  try {
    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal menghapus user: ' + error.message);
  }
}

async function createTransaction(transaction, items) {
  try {
    // Buat transaksi baru
    const { data: newTransaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Tambahkan items transaksi
    const transactionItems = items.map(item => ({
      transaction_id: newTransaction.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      buy_price: item.buyPrice,
      subtotal: item.quantity * item.price
    }));

    const { error: itemsError } = await supabaseClient
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) throw itemsError;

    // Update stok produk
    for (const item of items) {
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);

      if (updateError) throw updateError;
    }

    return newTransaction;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal membuat transaksi: ' + error.message);
  }
}

async function getTransactions(startDate, endDate) {
  try {
    let query = supabaseClient
      .from('transactions')
      .select(`
        *,
        cashier:users (name),
        items:transaction_items (
          quantity,
          price,
          buy_price,
          subtotal,
          product:products (
            name,
            code
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    reportError(error);
    throw new Error('Gagal memuat transaksi: ' + error.message);
  }
}
