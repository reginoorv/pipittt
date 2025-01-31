function Header({ onToggleSidebar, onLogout, userRole }) {
  return (
    <header data-name="header" className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="mr-4 p-2 rounded hover:bg-gray-100">
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="text-lg font-semibold text-gray-700">
          Selamat Datang, {userRole === 'admin' ? 'Admin' : 'Kasir'}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
