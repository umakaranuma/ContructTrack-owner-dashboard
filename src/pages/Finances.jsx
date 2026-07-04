/**
 * Finances page — /dashboard/finances
 * Monthly spend overview with site filtering and detail drill-down.
 */
import { useState, useMemo } from 'react'
import { useFinances } from '../hooks/useFinances'
import SpendChart from '../components/finances/SpendChart'
import BillLogTable from '../components/finances/BillLogTable'
import WageLedger from '../components/finances/WageLedger'
import ContractsSummary from '../components/finances/ContractsSummary'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SiteFilter from '../components/ui/SiteFilter'
import { getRecentMonths } from '../utils/months'
import { PERIOD_TYPES, getPeriodRange, getRecentYears } from '../utils/periods'

const MONTHS = getRecentMonths(12)
const YEARS  = getRecentYears(6)

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
    <div className={`card border p-5 ${accent ? 'border-gold/40' : 'border-white/5'}`}>
      <p className="text-muted text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-mono text-offwhite mt-1">{value}</p>
      {change && <div className="mt-2"><ChangeTag value={change} /></div>}
    </div>
  )
}

export default function Finances() {
  const today = new Date().toISOString().split('T')[0]
  const [periodType, setPeriodType]       = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]?.value ?? '')
  const [selectedDate, setSelectedDate]   = useState(today)   // day + week pickers
  const [selectedYear, setSelectedYear]   = useState(YEARS[0])
  const [selectedSite, setSelectedSite]   = useState('')
  const [activeTab, setActiveTab]         = useState('bills')

  const periodRef = periodType === 'month' ? selectedMonth
                  : periodType === 'year'  ? selectedYear
                  : selectedDate

  const queryParams = useMemo(() => {
    const p = { ...getPeriodRange(periodType, periodRef) }
    if (selectedSite) p.site_id = selectedSite
    return p
  }, [periodType, periodRef, selectedSite])

  const { data: summary, isLoading: sumLoading } = useFinances('summary', queryParams)
  const { data: bySite, isLoading: siteLoading }  = useFinances('by-site', queryParams)
  const { data: billLog, isLoading: billLoading } = useFinances('bills', queryParams, {
    enabled: activeTab === 'bills' || activeTab === 'materials',
  })
  const { data: wages, isLoading: wageLoading } = useFinances('wages', queryParams, {
    enabled: activeTab === 'wages',
  })

  const s = summary ?? {
    total_material_spend: 0,
    total_wage_payout: 0,
    total_site_spend: 0,
    active_sites: 0,
  }

  const monthLabel = periodType === 'month'
    ? (MONTHS.find(m => m.value === selectedMonth)?.label ?? selectedMonth)
    : periodType === 'year' ? selectedYear
    : periodType === 'week' ? `Week of ${selectedDate}`
    : selectedDate

  const tabs = [
    { id: 'bills',     label: 'Bill Log' },
    { id: 'wages',     label: 'Wage Ledger' },
    { id: 'materials', label: 'By Material' },
    { id: 'contracts', label: 'Contracts & Subcontracts' },
  ]

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Finances</h1>
          <p className="text-muted text-sm mt-1">
            {activeTab === 'contracts'
              ? (selectedSite ? 'Contract & subcontract data for selected site' : 'Contract & subcontract overview across all sites')
              : (selectedSite ? 'Spend for selected site' : 'Consolidated spend across all sites')}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <SiteFilter
            value={selectedSite}
            onChange={setSelectedSite}
            label="Filter by site"
            className="w-full sm:w-56"
          />
          {activeTab !== 'contracts' && (
            <>
              <div className="w-full sm:w-32">
                <label className="form-label">Period</label>
                <select
                  value={periodType}
                  onChange={e => setPeriodType(e.target.value)}
                  className="input-field w-full"
                >
                  {PERIOD_TYPES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-44">
                {periodType === 'month' && (
                  <>
                    <label className="form-label">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="input-field w-full"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </>
                )}
                {periodType === 'year' && (
                  <>
                    <label className="form-label">Year</label>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(e.target.value)}
                      className="input-field w-full"
                    >
                      {YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </>
                )}
                {(periodType === 'day' || periodType === 'week') && (
                  <>
                    <label className="form-label">
                      {periodType === 'day' ? 'Date' : 'Any day in the week'}
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="input-field w-full"
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary cards — hidden on contracts tab */}
      {activeTab !== 'contracts' && (sumLoading ? <LoadingSpinner label="Loading summary…" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            value={s.active_sites ?? 0}
          />
        </div>
      ))}

      {/* Spend by site chart — hidden when viewing contracts tab */}
      {activeTab !== 'contracts' && (
        <SpendChart
          data={bySite}
          isLoading={siteLoading}
          monthLabel={monthLabel}
        />
      )}

      {/* Tabs */}
      <div className="card border border-white/5 overflow-hidden">
        <div className="flex gap-1 border-b border-white/5 px-5 pt-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-muted hover:text-offwhite'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
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
          {activeTab === 'contracts' && (
            <ContractsSummary siteId={selectedSite || null} />
          )}
        </div>
      </div>
    </div>
  )
}

function MaterialTable({ data, isLoading }) {
  if (isLoading) return <LoadingSpinner label="Loading…" />

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
    return <p className="text-muted text-sm text-center py-10">No material data for this period.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-muted text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-3">Material</th>
            <th className="text-right px-4 py-3">Total Qty</th>
            <th className="text-right px-4 py-3">Total Spent (LKR)</th>
            <th className="text-right px-4 py-3">Avg Unit Price</th>
            <th className="text-right px-4 py-3">Flagged</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.material} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="px-4 py-3 capitalize font-medium text-offwhite">{r.material}</td>
              <td className="px-4 py-3 text-right font-mono">{r.qty.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono">{r.total.toLocaleString('en-LK')}</td>
              <td className="px-4 py-3 text-right font-mono">
                {r.qty > 0 ? Math.round(r.total / r.qty).toLocaleString('en-LK') : '—'}
              </td>
              <td className="px-4 py-3 text-right">
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
