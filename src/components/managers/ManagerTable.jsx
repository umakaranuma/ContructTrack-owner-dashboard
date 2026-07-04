import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import { formatDistanceToNow } from 'date-fns'

// ─── ManagerTable ──────────────────────────────────────────────────────────────
// Table listing all managers under the owner's account.
// Includes ref code, assigned sites, last active, status, and action buttons.
// ─────────────────────────────────────────────────────────────────────────────

export default function ManagerTable({ managers, isLoading, onView, onViewDetail }) {
  const data = managers ?? []
  // Support both onView (Managers.jsx) and onViewDetail (legacy) prop names
  const handleView = onView ?? onViewDetail

  const columns = [
    {
      // Backend returns 'name' (alias) or 'full_name' — normalise to display name
      key: 'name',
      label: 'Manager',
      render: (val, row) => {
        const displayName = val ?? row.full_name ?? '—'
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="font-syne font-bold text-gold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-offwhite font-medium text-sm">{displayName}</p>
              <p className="text-muted text-xs">{row.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      // Backend returns 'ref_code' (alias) or 'reference_code'
      key: 'ref_code',
      label: 'Ref Code',
      render: (val, row) => (
        <span className="font-mono text-gold text-sm">
          {val ?? row.reference_code ?? '—'}
        </span>
      ),
    },
    {
      key: 'sites',
      label: 'Assigned Sites',
      render: (val) => {
        const list = Array.isArray(val) ? val : []
        return (
          <div className="flex flex-wrap gap-1">
            {list.length ? list.map((s) => (
              <span key={s} className="text-xs bg-navy-light/50 text-muted px-2 py-0.5 rounded">{s}</span>
            )) : <span className="text-muted text-xs">None assigned</span>}
          </div>
        )
      },
    },
    {
      key: 'last_active',
      label: 'Last Active',
      render: (val) => {
        if (!val) return <span className="text-muted text-xs font-mono">—</span>
        try {
          return (
            <span className="font-mono text-muted text-xs">
              {formatDistanceToNow(new Date(val), { addSuffix: true })}
            </span>
          )
        } catch {
          return <span className="text-muted text-xs font-mono">—</span>
        }
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => {
        const status = val ?? (row.is_active ? 'active' : 'inactive')
        return (
          <Badge variant={status === 'active' ? 'success' : 'muted'}>
            {status}
          </Badge>
        )
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleView?.(row) }}
            className="text-xs px-2.5 py-1 rounded bg-navy-light/40 hover:bg-gold/10 text-muted hover:text-gold border border-navy-light hover:border-gold/30 transition-colors"
          >
            View Details
          </button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      keyField="id"
      onRowClick={(row) => handleView?.(row)}
      emptyTitle="No managers yet"
      emptyDescription="Add managers by reference code, email, or send an invite."
    />
  )
}
