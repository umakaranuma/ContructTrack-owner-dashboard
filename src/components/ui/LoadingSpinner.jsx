// ─── LoadingSpinner ────────────────────────────────────────────────────────────
// Reusable spinner component. Size can be 'sm' | 'md' | 'lg'.
// ─────────────────────────────────────────────────────────────────────────────

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full border-navy-light border-t-gold animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="text-muted text-sm">Loading…</span>
      </div>
    </div>
  )
}
