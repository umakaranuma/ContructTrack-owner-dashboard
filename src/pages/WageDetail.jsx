import { Link, useParams } from 'react-router-dom'
import { useWageDetail } from '../hooks/useFinances'
import { PageLoader } from '../components/ui/LoadingSpinner'
import DataTable from '../components/ui/DataTable'

function formatLKR(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

export default function WageDetail() {
  const { wageId } = useParams()
  const { data, isLoading, isError } = useWageDetail(wageId)

  if (isLoading) return <PageLoader />

  if (isError || !data?.summary) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Wage record not found.</p>
        <Link to="/dashboard/finances" className="text-gold text-sm hover:underline">← Back to Finances</Link>
      </div>
    )
  }

  const { summary, workers } = data

  const workerColumns = [
    {
      key: 'worker_name',
      label: 'Worker',
      render: (_, row) => (
        <div>
          <p className="text-off-white text-sm font-medium">{row.worker_name ?? row.worker?.name ?? '—'}</p>
          <p className="text-muted text-xs">{row.worker_role ?? row.worker?.role ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`text-sm capitalize ${v === 'present' ? 'text-green-400' : v === 'half' ? 'text-amber-400' : 'text-red-400'}`}>
          {v ?? '—'}
        </span>
      ),
    },
    {
      key: 'daily_rate_lkr',
      label: 'Daily Rate',
      render: (v) => <span className="font-mono text-sm text-off-white">{formatLKR(v)}</span>,
    },
    {
      key: 'total_earned_lkr',
      label: 'Earned',
      render: (v) => <span className="font-mono text-sm text-gold font-semibold">{formatLKR(v)}</span>,
    },
  ]

  const workerRows = (workers ?? []).map(w => ({
    ...w,
    worker_name: w.worker_name,
    worker_role: w.worker?.role,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/dashboard/finances" className="text-muted hover:text-gold text-sm transition-colors">
          ← Back to Finances
        </Link>
        <h1 className="page-title mt-2">Wage Summary</h1>
        <p className="text-muted text-sm mt-1">{summary.site_name} · {summary.log_date}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: summary.total_present, color: 'text-green-400' },
          { label: 'Half Day', value: summary.total_half, color: 'text-amber-400' },
          { label: 'Absent', value: summary.total_absent, color: 'text-red-400' },
          { label: 'Total Wages', value: formatLKR(summary.total_wage_lkr), color: 'text-gold' },
        ].map(item => (
          <div key={item.label} className="card border border-white/5 p-4">
            <p className="text-muted text-xs uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`font-mono font-bold text-xl ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card border border-white/5 p-5">
        <h2 className="section-title mb-4">Worker Breakdown</h2>
        <div className="border border-navy-light rounded-xl overflow-hidden">
          <DataTable
            columns={workerColumns}
            data={workerRows}
            keyField="id"
            emptyTitle="No worker records"
            emptyDescription="Individual attendance was not recorded for this day."
          />
        </div>
      </div>
    </div>
  )
}
