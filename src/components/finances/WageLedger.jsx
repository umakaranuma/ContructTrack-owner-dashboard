import DataTable from '../ui/DataTable'

// ─── WageLedger ────────────────────────────────────────────────────────────────
// Daily wage summary per site, sourced from AttendanceSummary backend records.
// Columns: date, site, present workers, total wages.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_SUMMARIES = [
  { id: 'ws1', log_date: '2026-06-28', site_name: 'Colombo Phase 2',   total_present: 34, total_half: 2, total_absent: 4, total_wage_lkr: 162000 },
  { id: 'ws2', log_date: '2026-06-28', site_name: 'Kandy Residential', total_present: 21, total_half: 1, total_absent: 3, total_wage_lkr: 73500 },
  { id: 'ws3', log_date: '2026-06-27', site_name: 'Galle Fort Annex',  total_present: 16, total_half: 0, total_absent: 2, total_wage_lkr: 68000 },
  { id: 'ws4', log_date: '2026-06-27', site_name: 'Negombo Towers',    total_present: 28, total_half: 3, total_absent: 1, total_wage_lkr: 118500 },
  { id: 'ws5', log_date: '2026-06-26', site_name: 'Colombo Phase 2',   total_present: 33, total_half: 1, total_absent: 5, total_wage_lkr: 158000 },
  { id: 'ws6', log_date: '2026-06-26', site_name: 'Kandy Residential', total_present: 20, total_half: 2, total_absent: 4, total_wage_lkr: 72000 },
]

function formatLKR(n) { return `LKR ${Number(n).toLocaleString('en-LK')}` }

// Normalise a backend AttendanceSummary record into the shape this table uses
function normaliseRecord(r) {
  return {
    id:            r.id,
    log_date:      r.log_date ?? '',
    site_name:     r.site_name ?? r.site ?? '',
    total_present: r.total_present ?? 0,
    total_half:    r.total_half ?? 0,
    total_absent:  r.total_absent ?? 0,
    total_wage_lkr: Number(r.total_wage_lkr ?? r.total_earned ?? 0),
  }
}

const columns = [
  {
    key: 'log_date',
    label: 'Date',
    render: (v) => <span className="font-mono text-sm text-muted">{v}</span>,
  },
  {
    key: 'site_name',
    label: 'Site',
    render: (v) => <span className="text-offwhite text-sm font-medium">{v}</span>,
  },
  {
    key: 'total_present',
    label: 'Present',
    render: (v, row) => (
      <span className="font-mono text-sm text-green-400">
        {v}{row.total_half > 0 ? <span className="text-amber-400 text-xs ml-1">(+{row.total_half}½)</span> : null}
      </span>
    ),
  },
  {
    key: 'total_absent',
    label: 'Absent',
    render: (v) => (
      <span className={`font-mono text-sm ${v > 0 ? 'text-red-400' : 'text-muted'}`}>{v}</span>
    ),
  },
  {
    key: 'total_wage_lkr',
    label: 'Total Wages',
    render: (v) => <span className="font-mono font-semibold text-gold text-sm">{formatLKR(v)}</span>,
  },
]

export default function WageLedger({ workers, isLoading }) {
  const rawData = workers ?? DUMMY_SUMMARIES
  const data = rawData.map(normaliseRecord)

  const totalWages   = data.reduce((s, r) => s + r.total_wage_lkr, 0)
  const totalPresent = data.reduce((s, r) => s + r.total_present, 0)

  const handleExport = () => {
    const csv = [
      ['Date', 'Site', 'Present', 'Half Day', 'Absent', 'Total Wages (LKR)'],
      ...data.map(r => [r.log_date, r.site_name, r.total_present, r.total_half, r.total_absent, r.total_wage_lkr]),
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
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Total Worker-Days</p>
            <p className="font-mono font-bold text-offwhite">{totalPresent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Total Wages Paid</p>
            <p className="font-mono font-bold text-gold">{formatLKR(totalWages)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Log Entries</p>
            <p className="font-mono font-bold text-offwhite">{data.length}</p>
          </div>
        </div>
        <button onClick={handleExport} className="btn-ghost flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          keyField="id"
          emptyTitle="No wage records"
          emptyDescription="Wage records appear when managers submit daily attendance logs."
        />
      </div>
    </div>
  )
}
