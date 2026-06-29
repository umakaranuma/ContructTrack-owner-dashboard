/**
 * Reports page — /dashboard/reports
 * Pre-built report generators with site filtering and generation history.
 */
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import ReportGenerator from '../components/reports/ReportGenerator'
import SiteFilter from '../components/ui/SiteFilter'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useReportHistory } from '../hooks/useReports'

const REPORTS = [
  {
    id: 'material_consumption',
    title: 'Material Consumption Sheet',
    description: 'Itemised list of all materials by site and date range.',
    format: ['pdf'],
    tier: 'all',
    icon: '📦',
  },
  {
    id: 'attendance_log',
    title: 'Worker Attendance Log',
    description: 'Daily roll call summary — workers present, wages, paid status.',
    format: ['pdf', 'excel'],
    tier: 'all',
    icon: '📋',
  },
  {
    id: 'monthly_spend',
    title: 'Monthly Site Spend Summary',
    description: 'Material and wage totals per site for a given month.',
    format: ['pdf'],
    tier: 'all',
    icon: '💰',
  },
  {
    id: 'bank_loan',
    title: 'Bank Loan Progress Report',
    description: 'Stage completion %, material proof, and site photos — formatted for bank submission.',
    format: ['pdf'],
    tier: 'enterprise',
    icon: '🏦',
  },
  {
    id: 'custom',
    title: 'Custom Date Range Report',
    description: 'Any period, any site(s) — exported to Excel for further analysis.',
    format: ['excel'],
    tier: 'pro',
    icon: '📊',
  },
  {
    id: 'subcontractor',
    title: 'Subcontractor Scorecard',
    description: 'Performance ratings per subcontractor across all sites.',
    format: ['pdf'],
    tier: 'enterprise',
    icon: '⭐',
  },
]

const REPORT_TYPE_LABELS = Object.fromEntries(REPORTS.map(r => [r.id, r.title]))

function tierLabel(tier) {
  if (tier === 'pro') return 'Pro+'
  if (tier === 'enterprise') return 'Enterprise'
  return null
}

function canAccess(userTier, requiredTier) {
  const tiers = { lite: 0, pro: 1, enterprise: 2 }
  if (requiredTier === 'all') return true
  if (requiredTier === 'pro') return (tiers[userTier] ?? 0) >= 1
  if (requiredTier === 'enterprise') return (tiers[userTier] ?? 0) >= 2
  return true
}

function statusBadge(status) {
  const map = {
    ready: 'text-green-400 bg-green-500/10 border-green-500/30',
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    generating: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    failed: 'text-red-400 bg-red-500/10 border-red-500/30',
  }
  return map[status] ?? 'text-muted bg-white/5 border-white/10'
}

export default function Reports() {
  const { user } = useAuthStore()
  const currentTier = user?.tenant?.package?.name?.toLowerCase() ?? 'pro'

  const [selectedSite, setSelectedSite] = useState('')
  const [activeReport, setActiveReport] = useState(null)

  const historyParams = selectedSite ? { site_id: selectedSite } : {}
  const { data: historyData, isLoading: historyLoading } = useReportHistory(historyParams)
  const history = historyData?.results ?? (Array.isArray(historyData) ? historyData : [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-muted text-sm mt-1">
            Generate and download site reports in PDF or Excel.
            Current plan: <span className="text-gold capitalize">{currentTier}</span>
          </p>
        </div>
        <SiteFilter
          value={selectedSite}
          onChange={setSelectedSite}
          label="Filter by site"
          className="w-52"
        />
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(report => {
          const locked = !canAccess(currentTier, report.tier)
          const label  = tierLabel(report.tier)

          return (
            <div
              key={report.id}
              className={`card border p-5 transition-all ${
                locked
                  ? 'border-white/5 opacity-60'
                  : 'border-white/5 hover:border-gold/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl mt-0.5">{report.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-off-white">{report.title}</h3>
                    {label && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        locked ? 'bg-white/10 text-muted' : 'bg-gold/20 text-gold'
                      }`}>
                        {label}
                      </span>
                    )}
                    {locked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted">
                        🔒 Upgrade required
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm mb-4">{report.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {report.format.map(f => (
                      <span key={f} className="text-xs bg-navy-light text-muted px-2 py-0.5 rounded border border-white/5 uppercase font-mono">
                        {f}
                      </span>
                    ))}
                    <div className="flex-1" />
                    {locked ? (
                      <a href="/dashboard/settings" className="text-xs text-gold hover:text-gold-light transition-colors">
                        Upgrade plan →
                      </a>
                    ) : (
                      <button
                        onClick={() => setActiveReport(report)}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        Generate →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Generation history */}
      <div className="card border border-white/5 p-5">
        <h2 className="section-title mb-4">Recent Reports</h2>
        {historyLoading ? (
          <LoadingSpinner label="Loading history…" />
        ) : history.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">
            No reports generated yet{selectedSite ? ' for this site' : ''}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Report</th>
                  <th className="text-left px-4 py-3">Site</th>
                  <th className="text-left px-4 py-3">Period</th>
                  <th className="text-left px-4 py-3">Format</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-off-white">{REPORT_TYPE_LABELS[item.report_type] ?? item.report_type}</td>
                    <td className="px-4 py-3 text-muted">{item.site_name ?? 'All Sites'}</td>
                    <td className="px-4 py-3 font-mono text-muted text-xs">{item.date_from} → {item.date_to}</td>
                    <td className="px-4 py-3 uppercase text-muted text-xs">{item.format}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'ready' && item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold text-xs hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeReport && (
        <ReportGenerator
          report={activeReport}
          onClose={() => setActiveReport(null)}
          defaultSiteId={selectedSite}
        />
      )}
    </div>
  )
}
