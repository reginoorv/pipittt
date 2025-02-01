// Initialize Supabase client
const supabaseUrl = 'https://xnppsezgtufonpglivxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucHBzZXpndHVmb25wZ2xpdnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzk5ODgsImV4cCI6MjA1MzkxNTk4OH0.NYfQ0z29dardYzeOKxug-bD8rlZgmg5FDCArmN9B2Ig';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function signIn(username, password) {
  try {
    // Cari user berdasarkan username
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User tidak ditemukan');

    // Verifikasi password (dalam produksi gunakan bcrypt)
    if (password !== user.password) {
      throw new Error('Password salah');
    }

    // Simpan data user di localStorage
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

function signOut() {
  try {
    // Hapus data user dari localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    return Promise.resolve();
  } catch (error) {
    reportError(error);
    throw new Error('Logout gagal: ' + error.message);
  }
}

// Fungsi untuk mengecek apakah user sudah login
function checkAuth() {
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('user_role');
  return !!userId && !!userRole;
}

// Fungsi untuk mendapatkan role user
function getUserRole() {
  return localStorage.getItem('user_role') || null;
}

// Fungsi lainnya tetap sama seperti sebelumnya...
