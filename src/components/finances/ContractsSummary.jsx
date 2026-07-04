/**
 * ContractsSummary — Finance page "Contracts" tab.
 * Shows cross-site contract values, payment cert progress, and subcontract spend.
 */
import { useContractsSummary } from '../../hooks/useContracts'
import LoadingSpinner from '../ui/LoadingSpinner'

function fmt(n = 0) {
  const num = Number(n)
  if (num >= 1_000_000) return `LKR ${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000)     return `LKR ${(num / 1_000).toFixed(0)}K`
  return `LKR ${num.toLocaleString('en-LK')}`
}

function MiniBar({ pct, color = 'bg-gold' }) {
  return (
    <div className="w-full h-1.5 bg-navy-primary rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

export default function ContractsSummary({ siteId }) {
  const params = siteId ? { site_id: siteId } : {}
  const { data, isLoading } = useContractsSummary(params)

  if (isLoading) return <LoadingSpinner label="Loading contract summary…" />

  if (!data) return (
    <p className="text-muted text-sm text-center py-10">No contract data available.</p>
  )

  const totals    = data.totals    ?? {}
  const contracts = data.contracts ?? []

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-offwhite font-medium mb-2">No contracts set up yet</p>
        <p className="text-muted text-sm">Go to a site's Overview tab to add a client contract.</p>
      </div>
    )
  }

  const receivedPct = totals.contract_value_lkr > 0
    ? Math.round(totals.total_received_lkr / totals.contract_value_lkr * 100)
    : 0

  return (
    <div className="space-y-5">
      {/* ── Totals row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'Total Contract Value',    value: fmt(totals.contract_value_lkr),      color: 'text-offwhite' },
          { label: 'Total Received',           value: fmt(totals.total_received_lkr),      color: 'text-green-400' },
          { label: 'Outstanding (from client)',value: fmt(totals.total_outstanding_lkr),   color: 'text-amber-400' },
          { label: 'Subcontract Committed',    value: fmt(totals.subcontract_committed_lkr), color: 'text-offwhite' },
          { label: 'Subcontract Paid',         value: fmt(totals.subcontract_paid_lkr),    color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy-primary rounded-xl p-4 border border-navy-light">
            <p className="text-muted text-xs uppercase tracking-wider mb-1.5">{label}</p>
            <p className={`font-mono font-bold text-base ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Collection progress bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <MiniBar pct={receivedPct} color="bg-green-500" />
        <span className="text-muted text-xs font-mono whitespace-nowrap">
          {receivedPct}% of total contract value received
        </span>
      </div>

      {/* ── Per-site contract rows ───────────────────────────────────────── */}
      <div className="divide-y divide-navy-light border border-navy-light rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-navy-primary">
          {['Site', 'Client', 'Contract Value', 'Received', 'Outstanding', 'Subcontracts', 'Progress'].map(h => (
            <div key={h} className={`text-muted text-xs uppercase tracking-wider font-semibold ${h === 'Site' ? 'col-span-2' : h === 'Progress' ? 'col-span-2' : 'col-span-1'}`}>
              {h}
            </div>
          ))}
        </div>

        {contracts.map((c) => {
          const pct = c.received_pct ?? 0
          return (
            <div key={c.id} className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-navy-primary/40 transition-colors bg-navy-secondary">
              <div className="col-span-2 min-w-0">
                <p className="text-offwhite text-sm font-medium truncate">{c.site_name}</p>
                <span className={`text-xs capitalize ${
                  c.status === 'active' ? 'text-green-400' : c.status === 'closed' ? 'text-muted' : 'text-amber-400'
                }`}>{c.status}</span>
              </div>
              <div className="col-span-1 min-w-0">
                <p className="text-muted text-xs truncate">{c.client_name}</p>
              </div>
              <div className="col-span-1">
                <p className="font-mono text-offwhite text-sm font-semibold">{fmt(c.contract_value_lkr)}</p>
              </div>
              <div className="col-span-1">
                <p className="font-mono text-green-400 text-sm">{fmt(c.total_received_lkr)}</p>
              </div>
              <div className="col-span-1">
                <p className="font-mono text-amber-400 text-sm">{fmt(c.outstanding_lkr)}</p>
              </div>
              <div className="col-span-2 min-w-0">
                {c.subcontract_count > 0 ? (
                  <div>
                    <p className="text-offwhite text-xs">{c.subcontract_count} subcontract{c.subcontract_count !== 1 ? 's' : ''}</p>
                    <p className="text-muted text-xs font-mono">
                      {fmt(c.subcontract_paid_lkr)} / {fmt(c.subcontract_committed_lkr)}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted text-xs">None</p>
                )}
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <MiniBar pct={pct} color="bg-gold" />
                  <span className="text-muted text-xs font-mono whitespace-nowrap">{pct}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
