/**
 * Finances page — /dashboard/finances
 * Monthly spend overview: summary cards, spend-by-site chart, bill log, wage ledger.
 * Data is scoped to the current tenant (enforced by the backend JWT check).
 */
import { useState } from 'react'
import { useFinances } from '../hooks/useFinances'
import SpendChart from '../components/finances/SpendChart'
import BillLogTable from '../components/finances/BillLogTable'
import WageLedger from '../components/finances/WageLedger'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Month options for the month selector
const MONTHS = [
  { label: 'June 2025',     value: '2025-06' },
  { label: 'May 2025',      value: '2025-05' },
  { label: 'April 2025',    value: '2025-04' },
  { label: 'March 2025',    value: '2025-03' },
  { label: 'February 2025', value: '2025-02' },
  { label: 'January 2025',  value: '2025-01' },
]

function formatLKR(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

function ChangeTag({ value }) {
  if (!value) return null
  const up = !value.startsWith('-')
  return (
    <span className={`text-xs font-mono ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'} {value}
    </span>
  )
}

function SummaryCard({ label, value, change, accent }) {
  return (
    <div className={`card border ${accent ? 'border-gold/40' : 'border-white/5'}`}>
      <p className="text-muted text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-mono text-off-white mt-1">{value}</p>
      {change && <div className="mt-1"><ChangeTag value={change} /></div>}
    </div>
  )
}

export default function Finances() {
  const [selectedMonth, setSelectedMonth] = useState('2025-06')
  const [activeTab, setActiveTab]         = useState('bills')

  const { data: summary, isLoading: sumLoading } = useFinances('summary', { month: selectedMonth })
  const { data: billLog, isLoading: billLoading } = useFinances('bills', { month: selectedMonth })
  const { data: wages, isLoading: wageLoading }   = useFinances('wages', { month: selectedMonth })
  const { data: bySite, isLoading: siteLoading }  = useFinances('by-site', { month: selectedMonth })

  const s = summary ?? {
    total_material_spend:  9750000,
    total_wage_payout:     1440000,
    total_site_spend:      11190000,
    vs_prev_material:      '+12%',
    vs_prev_wages:         '+3%',
    vs_prev_total:         '+10%',
  }

  const tabs = [
    { id: 'bills', label: 'Bill Log' },
    { id: 'wages', label: 'Wage Ledger' },
    { id: 'materials', label: 'By Material' },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Finances</h1>
          <p className="text-muted text-sm mt-1">Consolidated spend across all sites</p>
        </div>
        {/* Month selector */}
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="input-field w-44"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* ── Summary Cards ── */}
      {sumLoading ? <LoadingSpinner label="Loading summary…" /> : (
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard
            label="Material Spend"
            value={formatLKR(s.total_material_spend)}
            change={s.vs_prev_material}
            accent
          />
          <SummaryCard
            label="Wage Payout"
            value={formatLKR(s.total_wage_payout)}
            change={s.vs_prev_wages}
          />
          <SummaryCard
            label="Total Site Spend"
            value={formatLKR(s.total_site_spend)}
            change={s.vs_prev_total}
          />
          <SummaryCard
            label="Active Sites This Month"
            value={s.active_sites ?? 4}
          />
        </div>
      )}

      {/* ── Spend by Site chart ── */}
      <div className="card">
        <h2 className="section-title mb-4">Spend by Site — {MONTHS.find(m => m.value === selectedMonth)?.label}</h2>
        <SpendChart data={bySite} isLoading={siteLoading} />
      </div>

      {/* ── Tabs: Bill Log / Wage Ledger / By Material ── */}
      <div className="card">
        <div className="flex gap-1 border-b border-white/5 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-muted hover:text-off-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'bills' && (
          <BillLogTable
            bills={Array.isArray(billLog) ? billLog : billLog?.results}
            isLoading={billLoading}
            month={selectedMonth}
          />
        )}
        {activeTab === 'wages' && (
          <WageLedger
            workers={Array.isArray(wages) ? wages : wages?.results}
            isLoading={wageLoading}
            month={selectedMonth}
          />
        )}
        {activeTab === 'materials' && (
          <MaterialTable
            data={Array.isArray(billLog) ? billLog : billLog?.results}
            isLoading={billLoading}
          />
        )}
      </div>
    </div>
  )
}

// ─── Material breakdown table — derived from bill log data ────────────────────
function MaterialTable({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner label="Loading…" />

  // Aggregate by material type from raw bill log
  const bills = data?.results ?? data ?? []
  const aggregated = bills.reduce((acc, bill) => {
    const t = bill.material_type ?? 'other'
    if (!acc[t]) acc[t] = { material: t, qty: 0, total: 0, entries: 0, flagged: 0 }
    acc[t].qty     += Number(bill.quantity ?? 0)
    acc[t].total   += Number(bill.total_amount_lkr ?? 0)
    acc[t].entries += 1
    if (bill.is_flagged) acc[t].flagged += 1
    return acc
  }, {})

  const rows = Object.values(aggregated)

  if (rows.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No material data for this period.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-2 pr-4">Material</th>
            <th className="text-right py-2 pr-4">Total Qty</th>
            <th className="text-right py-2 pr-4">Total Spent (LKR)</th>
            <th className="text-right py-2 pr-4">Avg Unit Price</th>
            <th className="text-right py-2">Flagged</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.material} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 pr-4 capitalize font-medium text-off-white">{r.material}</td>
              <td className="py-3 pr-4 text-right font-mono">{r.qty.toLocaleString()}</td>
              <td className="py-3 pr-4 text-right font-mono">{r.total.toLocaleString('en-LK')}</td>
              <td className="py-3 pr-4 text-right font-mono">
                {r.entries > 0 ? Math.round(r.total / r.qty).toLocaleString('en-LK') : '—'}
              </td>
              <td className="py-3 text-right">
                {r.flagged > 0
                  ? <span className="text-red-400 font-mono">{r.flagged}</span>
                  : <span className="text-muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
