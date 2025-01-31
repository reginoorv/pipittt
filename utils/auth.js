function login(username, password) {
  try {
    return trickleCreateObject('auth_session', {
      username,
      role: username === 'admin' ? 'admin' : 'kasir',
      loginTime: new Date().toISOString()
    });
  } catch (error) {
    reportError(error);
    throw new Error('Login failed');
  }
}

function logout() {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  } catch (error) {
    reportError(error);
    throw new Error('Logout failed');
  }
}

function checkAuth() {
  try {
    const token = localStorage.getItem('auth_token');
    return !!token;
  } catch (error) {
    reportError(error);
    return false;
  }
}

function getUserRole() {
  try {
    return localStorage.getItem('user_role') || 'kasir';
  } catch (error) {
    reportError(error);
    return 'kasir';
  }
}
