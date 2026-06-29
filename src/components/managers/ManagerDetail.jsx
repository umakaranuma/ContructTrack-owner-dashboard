import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { formatDistanceToNow, format } from 'date-fns'

// ─── ManagerDetail ─────────────────────────────────────────────────────────────
// Modal showing full manager profile: bio, assigned sites, activity log,
// and deactivate/remove actions.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_ACTIVITY = [
  { id: '1', action: 'Submitted daily log — Colombo Phase 2',      ts: new Date(Date.now() - 1000*60*12).toISOString() },
  { id: '2', action: 'Uploaded 3 bill photos — steel delivery',    ts: new Date(Date.now() - 1000*60*60*2).toISOString() },
  { id: '3', action: 'Marked 34 workers as present',               ts: new Date(Date.now() - 1000*60*60*4).toISOString() },
  { id: '4', action: 'Submitted daily log — Colombo Phase 2',      ts: new Date(Date.now() - 1000*60*60*26).toISOString() },
  { id: '5', action: 'Added material: Cement 50 bags from Holcim', ts: new Date(Date.now() - 1000*60*60*28).toISOString() },
]

export default function ManagerDetail({ manager, isOpen, onClose, onDeactivate, onRemove }) {
  if (!manager) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manager Profile" size="lg">
      <div className="p-6 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-bold text-gold text-2xl">{manager.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-syne font-bold text-offwhite text-xl">{manager.name}</h2>
              <Badge variant={manager.status === 'active' ? 'success' : 'muted'}>{manager.status}</Badge>
            </div>
            <p className="text-muted text-sm mt-0.5">{manager.email}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="font-mono text-gold text-sm">{manager.ref_code}</span>
            </div>
          </div>
        </div>

        {/* Assigned sites */}
        <div>
          <h3 className="label mb-2">Assigned Sites</h3>
          {manager.sites.length > 0 ? (
            <div className="space-y-2">
              {manager.sites.map((site) => (
                <div key={site} className="flex items-center justify-between px-3 py-2 bg-navy-primary/50 rounded-lg border border-navy-light">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                    </svg>
                    <span className="text-offwhite text-sm">{site}</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No sites assigned</p>
          )}
        </div>

        {/* Activity log */}
        <div>
          <h3 className="label mb-2">Recent Activity</h3>
          <div className="space-y-1">
            {DUMMY_ACTIVITY.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-3 py-2 hover:bg-navy-light/20 rounded-lg transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-offwhite">{entry.action}</p>
                </div>
                <span className="text-muted text-[10px] font-mono flex-shrink-0">
                  {formatDistanceToNow(new Date(entry.ts), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last active */}
        <div className="bg-navy-primary/50 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-muted text-sm">Last active</span>
          <span className="font-mono text-offwhite text-sm">
            {formatDistanceToNow(new Date(manager.last_active), { addSuffix: true })}
          </span>
        </div>

        {/* Danger actions */}
        <div className="flex gap-3 pt-2 border-t border-navy-light">
          <button
            onClick={() => { onDeactivate?.(manager); onClose() }}
            className="flex-1 btn-ghost text-amber-400 hover:text-amber-300 hover:border-amber-500/30"
          >
            Deactivate
          </button>
          <button
            onClick={() => { onRemove?.(manager); onClose() }}
            className="flex-1 btn-danger"
          >
            Remove from Account
          </button>
        </div>
      </div>
    </Modal>
  )
}
