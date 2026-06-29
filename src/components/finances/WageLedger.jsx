import DataTable from '../ui/DataTable'

// ─── WageLedger ────────────────────────────────────────────────────────────────
// Worker wage ledger table with Excel export button.
// Shows: worker name, role, days worked, total earned, total paid, balance due.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_WORKERS = [
  { id: 'w1',  name: 'Pradeep Kumara',  role: 'Foreman',        site: 'Colombo Phase 2',   days: 24, rate: 4500, total_earned: 108000, total_paid: 108000 },
  { id: 'w2',  name: 'Niroshan Perera', role: 'Mason',          site: 'Colombo Phase 2',   days: 22, rate: 3200, total_earned: 70400,  total_paid: 60000 },
  { id: 'w3',  name: 'Sarath Bandara',  role: 'Steel Fixer',    site: 'Kandy Residential', days: 20, rate: 3500, total_earned: 70000,  total_paid: 70000 },
  { id: 'w4',  name: 'Chaminda Silva',  role: 'Helper',         site: 'Kandy Residential', days: 26, rate: 2200, total_earned: 57200,  total_paid: 50000 },
  { id: 'w5',  name: 'Roshan Fernando', role: 'Carpenter',      site: 'Galle Fort Annex',  days: 18, rate: 3800, total_earned: 68400,  total_paid: 68400 },
  { id: 'w6',  name: 'Asanka Wijesiri', role: 'Plumber',        site: 'Galle Fort Annex',  days: 15, rate: 4000, total_earned: 60000,  total_paid: 60000 },
  { id: 'w7',  name: 'Sanjaya Dias',    role: 'Helper',         site: 'Negombo Towers',    days: 25, rate: 2200, total_earned: 55000,  total_paid: 40000 },
  { id: 'w8',  name: 'Lakmal Jayasen',  role: 'Mason',          site: 'Negombo Towers',    days: 23, rate: 3200, total_earned: 73600,  total_paid: 73600 },
]

function formatLKR(n) { return `LKR ${n.toLocaleString()}` }

const columns = [
  {
    key: 'name',
    label: 'Worker',
    render: (v, row) => (
      <div>
        <p className="text-offwhite text-sm font-medium">{v}</p>
        <p className="text-muted text-xs">{row.site}</p>
      </div>
    ),
  },
  { key: 'role',         label: 'Role',         render: (v) => <span className="text-muted text-sm">{v}</span> },
  { key: 'days',         label: 'Days',         render: (v) => <span className="font-mono text-offwhite text-sm">{v}</span> },
  { key: 'rate',         label: 'Daily Rate',   render: (v) => <span className="font-mono text-muted text-sm">{formatLKR(v)}</span> },
  { key: 'total_earned', label: 'Total Earned', render: (v) => <span className="font-mono text-offwhite font-semibold text-sm">{formatLKR(v)}</span> },
  { key: 'total_paid',   label: 'Total Paid',   render: (v) => <span className="font-mono text-green-400 text-sm">{formatLKR(v)}</span> },
  {
    key: 'id',
    label: 'Balance Due',
    render: (_, row) => {
      const balance = row.total_earned - row.total_paid
      return (
        <span className={`font-mono font-semibold text-sm ${balance > 0 ? 'text-amber-400' : 'text-muted'}`}>
          {balance > 0 ? formatLKR(balance) : '—'}
        </span>
      )
    },
  },
]

export default function WageLedger({ workers, isLoading }) {
  const data = workers ?? DUMMY_WORKERS
  const totalEarned  = data.reduce((s, w) => s + w.total_earned, 0)
  const totalPaid    = data.reduce((s, w) => s + w.total_paid, 0)
  const totalBalance = totalEarned - totalPaid

  const handleExport = () => {
    // In real app: trigger Excel export API call or client-side CSV generation
    const csv = [
      ['Name', 'Role', 'Site', 'Days', 'Rate', 'Earned', 'Paid', 'Balance'],
      ...data.map(w => [w.name, w.role, w.site, w.days, w.rate, w.total_earned, w.total_paid, w.total_earned - w.total_paid]),
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `wage-ledger-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Summary + export */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex gap-6">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Total Earned</p>
            <p className="font-mono font-bold text-offwhite">{formatLKR(totalEarned)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Total Paid</p>
            <p className="font-mono font-bold text-green-400">{formatLKR(totalPaid)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Outstanding</p>
            <p className="font-mono font-bold text-amber-400">{formatLKR(totalBalance)}</p>
          </div>
        </div>
        <button onClick={handleExport} className="btn-ghost flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>
      </div>

      <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          keyField="id"
          emptyTitle="No wage records"
        />
      </div>
    </div>
  )
}
