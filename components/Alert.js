function Alert({ type = 'info', message, onClose }) {
  const types = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div data-name="alert" className={`${types[type]} p-4 rounded-lg border mb-4 flex justify-between items-center`}>
      <div className="flex items-center gap-2">
        <i className={`fas fa-${type === 'success' ? 'check-circle' : 
          type === 'error' ? 'exclamation-circle' : 
          type === 'warning' ? 'exclamation-triangle' : 
          'info-circle'}`}></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}
