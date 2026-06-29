// ─── LoadingSpinner ────────────────────────────────────────────────────────────
// Reusable spinner that matches the ConstructTrack gold/navy theme.
// Size: 'sm' | 'md' | 'lg'. Optional label text shown beneath the spinner.
// ─────────────────────────────────────────────────────────────────────────────

export default function LoadingSpinner({ size = 'md', label, className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full border-[#1A3356] border-t-[#C9A84C] animate-spin`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && (
        <span className="text-xs text-[#7A8BA0] font-medium tracking-wide">{label}</span>
      )}
    </div>
  )
}

// Full-page centred loader used while a primary resource is fetching
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        {/* Outer ring + inner spinner for a more polished look */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#1A3356]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#C9A84C] animate-spin" />
          <div className="absolute inset-[5px] rounded-full border-[2px] border-transparent border-t-[#F0C96B] animate-spin"
            style={{ animationDuration: '0.6s' }} />
        </div>
        <span className="text-[#7A8BA0] text-sm font-medium tracking-wider uppercase">{label}</span>
      </div>
    </div>
  )
}

// Inline row spinner for inside cards or table rows
export function InlineSpinner({ label }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="w-4 h-4 rounded-full border-2 border-[#1A3356] border-t-[#C9A84C] animate-spin flex-shrink-0" />
      {label && <span className="text-xs text-[#7A8BA0]">{label}</span>}
    </div>
  )
}
