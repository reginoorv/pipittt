// Initialize Supabase client
const supabaseUrl = 'https://xnppsezgtufonpglivxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucHBzZXpndHVmb25wZ2xpdnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzk5ODgsImV4cCI6MjA1MzkxNTk4OH0.NYfQ0z29dardYzeOKxug-bD8rlZgmg5FDCArmN9B2Ig';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function signIn(username, password) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User tidak ditemukan');

    if (password !== data.password) {
      throw new Error('Password salah');
    }

    localStorage.setItem('user_id', data.id);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_name', data.name);

    return {
      user: {
        id: data.id,
        name: data.name,
        role: data.role
      }
    };
  } catch (error) {
    reportError(error);
    throw new Error('Login gagal: ' + error.message);
  }
}

function signOut() {
  try {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    return Promise.resolve();
  } catch (error) {
    reportError(error);
    throw new Error('Logout gagal: ' + error.message);
  }
}

// Expose supabaseClient globally
window.supabaseClient = supabaseClient;
