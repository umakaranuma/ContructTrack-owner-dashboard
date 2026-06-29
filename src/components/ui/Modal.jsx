import { useEffect, useCallback } from 'react'

// ─── Modal ─────────────────────────────────────────────────────────────────────
// Accessible modal overlay. Traps focus, closes on Escape or backdrop click.
// Sizes: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm:  'max-w-md',
  md:  'max-w-lg',
  lg:  'max-w-2xl',
  xl:  'max-w-4xl',
  '2xl': 'max-w-6xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', hideHeader = false }) {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEsc])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${SIZE_MAP[size] || SIZE_MAP.md} bg-navy-secondary border border-navy-light rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col`}>
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy-light flex-shrink-0">
            <h2 id="modal-title" className="font-syne font-semibold text-lg text-offwhite">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-offwhite hover:bg-navy-light transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
