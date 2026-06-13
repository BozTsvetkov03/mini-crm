function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-line"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-strong border-t-transparent animate-spin"></div>
      </div>
      <span className="ml-4 text-ink-muted font-medium">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;
