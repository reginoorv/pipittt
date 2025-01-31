function MainLayout({ userRole, onLogout, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderContent = () => {
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
        return userRole === 'admin' ? <Users /> : null;
      case 'reports':
        return userRole === 'admin' ? <Reports /> : null;
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
