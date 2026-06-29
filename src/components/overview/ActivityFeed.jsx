import { formatDistanceToNow } from 'date-fns'
import { StatusDot } from '../ui/Badge'
import LoadingSpinner from '../ui/LoadingSpinner'

// ─── ActivityFeed ──────────────────────────────────────────────────────────────
// Scrollable timeline of recent events across all sites.
// Each entry has a coloured dot: green=normal, amber=warning, red=alert.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_FEED = [
  { id: '1',  severity: 'green',  site: 'Colombo Phase 2',       message: 'Daily log submitted by Rajan Perera',              ts: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: '2',  severity: 'red',    site: 'Galle Fort Annex',      message: 'Cement usage exceeded 95% — material cap alert',   ts: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: '3',  severity: 'green',  site: 'Negombo Towers',        message: '28 workers checked in — attendance confirmed',     ts: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '4',  severity: 'amber',  site: 'Kandy Residential',     message: 'Bill photo missing for steel delivery #D-0421',    ts: new Date(Date.now() - 1000 * 60 * 34).toISOString() },
  { id: '5',  severity: 'green',  site: 'Colombo Phase 2',       message: 'Stage advanced: Columns → Slab approved by owner', ts: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: '6',  severity: 'amber',  site: 'Galle Fort Annex',      message: 'Manager Nimal Jayasena not seen for 2 hours',      ts: new Date(Date.now() - 1000 * 60 * 78).toISOString() },
  { id: '7',  severity: 'green',  site: 'Negombo Towers',        message: 'New bill uploaded: Holcim Cement — LKR 148,500',   ts: new Date(Date.now() - 1000 * 60 * 102).toISOString() },
  { id: '8',  severity: 'green',  site: 'Kandy Residential',     message: '5 progress photos uploaded — roofing stage',       ts: new Date(Date.now() - 1000 * 60 * 130).toISOString() },
  { id: '9',  severity: 'red',    site: 'Negombo Towers',        message: 'Steel rod consumption reached 92% of monthly cap', ts: new Date(Date.now() - 1000 * 60 * 160).toISOString() },
  { id: '10', severity: 'green',  site: 'Colombo Phase 2',       message: 'Daily wages logged: 34 workers — LKR 204,000',     ts: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
  { id: '11', severity: 'amber',  site: 'Kandy Residential',     message: 'Missing daily log for 2026-06-27',                 ts: new Date(Date.now() - 1000 * 60 * 260).toISOString() },
  { id: '12', severity: 'green',  site: 'Galle Fort Annex',      message: 'Plumbing subcontractor work verified by manager',  ts: new Date(Date.now() - 1000 * 60 * 320).toISOString() },
]

export default function ActivityFeed({ activities, isLoading }) {
  const items = activities ?? DUMMY_FEED

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
