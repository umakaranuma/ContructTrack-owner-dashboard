import { useEffect } from 'react'
import { useAllAlerts } from '../../hooks/useSites'
import { StatusDot } from '../ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import LoadingSpinner from '../ui/LoadingSpinner'

// ─── AlertDrawer ───────────────────────────────────────────────────────────────
// Slide-in right drawer showing all active alerts across all sites.
// Triggered by the bell icon in Topbar.
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  material_cap:    'Material Cap',
  missing_log:     'Missing Log',
  delivery_no_bill: 'Missing Bill',
}

const SEVERITY_DOT = {
  danger:  'red',
  warning: 'amber',
  info:    'blue',
}

export default function AlertDrawer({ isOpen, onClose }) {
  const { data, isLoading } = useAllAlerts()

  // API returns an array directly (r.data.result is already the array)
  const alerts = Array.isArray(data) ? data : (data?.results ?? [])

  // Trap keyboard
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const unread = alerts.filter((a) => !a.acknowledged)
  const read   = alerts.filter((a) => a.acknowledged)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-navy-secondary border-l border-navy-light z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-light flex-shrink-0">
          <div>
            <h2 className="font-syne font-semibold text-offwhite">Alerts</h2>
            <p className="text-muted text-xs mt-0.5">{unread.length} unacknowledged</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-offwhite hover:bg-navy-light transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {unread.length > 0 && (
                <>
                  <p className="text-muted text-[10px] uppercase tracking-wider px-2 py-1 font-semibold">Active</p>
                  {unread.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </>
              )}

              {read.length > 0 && (
                <>
                  <p className="text-muted text-[10px] uppercase tracking-wider px-2 py-1 font-semibold mt-4">Acknowledged</p>
                  {read.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} dimmed />
                  ))}
                </>
              )}

              {alerts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-syne font-semibold text-offwhite">All clear</p>
                  <p className="text-muted text-sm mt-1">No active alerts across your sites</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function AlertItem({ alert, dimmed = false }) {
  const timeAgo = formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })
  const dotColor = SEVERITY_DOT[alert.severity] || 'amber'

  return (
    <div className={`flex gap-3 p-3 rounded-lg border transition-colors ${
      dimmed
        ? 'border-navy-light/30 opacity-50'
        : alert.severity === 'danger'
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
    }`}>
      <div className="mt-1 flex-shrink-0">
        <StatusDot color={dotColor} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {TYPE_LABELS[alert.type] || alert.type}
          </span>
        </div>
        <p className="text-sm text-offwhite leading-snug">{alert.message}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-muted text-xs">{alert.site_name}</span>
          <span className="text-muted text-[10px] font-mono">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}
