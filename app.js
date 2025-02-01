function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(checkAuth());
  const [userRole, setUserRole] = React.useState(getUserRole());

  // Tambahkan effect untuk mempertahankan sesi login
  React.useEffect(() => {
    const storedAuth = checkAuth();
    const storedRole = getUserRole();
    if (storedAuth && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div data-name="auth-container">
        <Login onLogin={(role) => {
          setIsAuthenticated(true);
          setUserRole(role);
        }} />
      </div>
    );
  }

  return (
    <div data-name="app-container">
      <MainLayout userRole={userRole} onLogout={() => {
        setIsAuthenticated(false);
        setUserRole(null);
      }} />
    </div>
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
