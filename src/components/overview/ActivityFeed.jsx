import { formatDistanceToNow } from 'date-fns'
import { StatusDot } from '../ui/Badge'
import LoadingSpinner from '../ui/LoadingSpinner'

// ─── ActivityFeed ──────────────────────────────────────────────────────────────
// Scrollable timeline of recent events across all sites.
// Each entry has a coloured dot: green=normal, amber=warning, red=alert.
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivityFeed({ activities, isLoading }) {
  const items = Array.isArray(activities) ? activities : []

  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-navy-light">
        <h2 className="font-syne font-semibold text-offwhite">Recent Activity</h2>
        <span className="text-muted text-xs font-mono">{items.length} entries</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-sm text-center py-10">No recent activity yet.</p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-4 px-5 py-3 hover:bg-navy-light/20 transition-colors">
              {/* Timeline spine */}
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <StatusDot color={item.severity === 'green' ? 'green' : item.severity === 'red' ? 'red' : 'amber'} />
                {idx < items.length - 1 && (
                  <div className="w-px flex-1 bg-navy-light/50 mt-1.5 min-h-[16px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-offwhite leading-snug">{item.message}</p>
                  <span className="text-muted text-[10px] font-mono flex-shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(item.ts), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-muted text-xs mt-0.5">{item.site}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
