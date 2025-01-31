function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false
}) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      data-name="button"
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        font-medium
        transition-colors
        flex items-center justify-center gap-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : icon ? (
        <i className={`fas ${icon}`}></i>
      ) : null}
      {children}
    </button>
  );
}
