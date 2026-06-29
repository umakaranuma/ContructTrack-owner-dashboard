import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import { formatDistanceToNow } from 'date-fns'

// ─── ManagerTable ──────────────────────────────────────────────────────────────
// Table listing all managers under the owner's account.
// Includes ref code, assigned sites, last active, status, and action buttons.
// ─────────────────────────────────────────────────────────────────────────────

export const DUMMY_MANAGERS = [
  { id: 'm1', name: 'Rajan Perera',    email: 'rajan.perera@ct.lk',    ref_code: 'MGR-A4F2', sites: ['Colombo Phase 2'],        last_active: new Date(Date.now() - 1000*60*12).toISOString(),  status: 'active' },
  { id: 'm2', name: 'Sunil Bandara',   email: 'sunil.bandara@ct.lk',   ref_code: 'MGR-B7K1', sites: ['Kandy Residential'],      last_active: new Date(Date.now() - 1000*60*5).toISOString(),   status: 'active' },
  { id: 'm3', name: 'Nimal Jayasena',  email: 'nimal.j@ct.lk',         ref_code: 'MGR-C3P9', sites: ['Galle Fort Annex'],       last_active: new Date(Date.now() - 1000*60*60*2).toISOString(), status: 'active' },
  { id: 'm4', name: 'Chamara Silva',   email: 'chamara.s@ct.lk',       ref_code: 'MGR-D1R5', sites: ['Negombo Towers'],         last_active: new Date(Date.now() - 1000*60*30).toISOString(),  status: 'active' },
  { id: 'm5', name: 'Kasun Fernando',  email: 'kasun.f@ct.lk',         ref_code: 'MGR-E8T2', sites: [],                         last_active: new Date(Date.now() - 1000*60*60*48).toISOString(), status: 'inactive' },
]

export default function ManagerTable({ managers, isLoading, onViewDetail }) {
  const data = managers ?? DUMMY_MANAGERS

  const columns = [
    {
      key: 'name',
      label: 'Manager',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-bold text-gold text-xs">{val.charAt(0)}</span>
          </div>
          <div>
            <p className="text-offwhite font-medium text-sm">{val}</p>
            <p className="text-muted text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'ref_code',
      label: 'Ref Code',
      render: (val) => <span className="font-mono text-gold text-sm">{val}</span>,
    },
    {
      key: 'sites',
      label: 'Assigned Sites',
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {val.length ? val.map((s) => (
            <span key={s} className="text-xs bg-navy-light/50 text-muted px-2 py-0.5 rounded">{s}</span>
          )) : <span className="text-muted text-xs">None assigned</span>}
        </div>
      ),
    },
    {
      key: 'last_active',
      label: 'Last Active',
      render: (val) => (
        <span className="font-mono text-muted text-xs">
          {formatDistanceToNow(new Date(val), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'muted'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail?.(row) }}
            className="text-xs px-2.5 py-1 rounded bg-navy-light/40 hover:bg-gold/10 text-muted hover:text-gold border border-navy-light hover:border-gold/30 transition-colors"
          >
            View
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
      emptyTitle="No managers yet"
      emptyDescription="Add managers by reference code, email, or send an invite."
    />
  )
}
