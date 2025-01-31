function Sidebar({ isOpen, onToggle, currentPage, onPageChange, userRole }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'transaction', label: 'Transaksi', icon: 'fa-cash-register' },
    { id: 'products', label: 'Produk', icon: 'fa-pills' },
    { id: 'suppliers', label: 'Supplier', icon: 'fa-truck' },
    ...(userRole === 'admin' ? [
      { id: 'users', label: 'Pengguna', icon: 'fa-users' },
      { id: 'reports', label: 'Laporan', icon: 'fa-file-alt' }
    ] : [])
  ];

  return (
    <aside data-name="sidebar" 
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-500 to-blue-600 text-white
        transition-all duration-300 z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        <h1 className={`font-bold text-2xl ${!isOpen && 'hidden'}`}>PIPIT</h1>
        <button onClick={onToggle} className="p-2 rounded hover:bg-blue-700 transition-colors">
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full p-4 flex items-center ${!isOpen ? 'justify-center' : 'justify-start'} 
              hover:bg-blue-700 transition-colors
              ${currentPage === item.id ? 'bg-blue-700' : ''}`}
          >
            <i className={`fas ${item.icon} ${!isOpen ? 'text-xl' : 'mr-3'}`}></i>
            <span className={!isOpen ? 'hidden' : ''}>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
