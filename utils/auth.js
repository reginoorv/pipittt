function checkAuth() {
  try {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    return !!userId && !!userRole;
  } catch (error) {
    reportError(error);
    return false;
  }
}

function getUserRole() {
  try {
    return localStorage.getItem('user_role');
  } catch (error) {
    reportError(error);
    return null;
  }
}

function signOut() {
  try {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  } catch (error) {
    reportError(error);
    throw new Error('Logout gagal');
  }
}
