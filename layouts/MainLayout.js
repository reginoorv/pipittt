function MainLayout({ userRole, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transaction':
        return <Transaction />;
      case 'products':
        return <Products />;
      case 'suppliers':
        return <Suppliers />;
      case 'users':
        return userRole === 'admin' ? <Users /> : <div>Akses ditolak</div>;
      case 'reports':
        return userRole === 'admin' ? <Reports /> : <div>Akses ditolak</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div data-name="main-layout" className="min-h-screen flex">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userRole={userRole}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
          userRole={userRole}
        />
        
        <main className="p-6 mt-16">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
