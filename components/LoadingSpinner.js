function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div data-name="loading-spinner" className="flex justify-center items-center">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
    </div>
  );
}
