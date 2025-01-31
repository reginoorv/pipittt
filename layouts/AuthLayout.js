function AuthLayout({ children }) {
  return (
    <div data-name="auth-layout" className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">PIPIT</h1>
          <p className="text-gray-600">Sistem POS Apotek Modern</p>
        </div>
        {children}
      </div>
    </div>
  );
}
