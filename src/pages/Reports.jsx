/**
 * Reports page — /dashboard/reports
 * Pre-built report generators — PDF and Excel.
 * Enterprise-only reports show a locked badge when the current plan doesn't qualify.
 */
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import ReportGenerator from '../components/reports/ReportGenerator'

// Report catalogue — maps to backend report_type enum
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

const TIER_ORDER = { all: 0, pro: 1, enterprise: 2 }

function tierLabel(tier) {
  if (tier === 'pro') return 'Pro+'
  if (tier === 'enterprise') return 'Enterprise'
  return null
}

function canAccess(userTier, requiredTier) {
  // tier_order: lite < pro < enterprise
  const tiers = { lite: 0, pro: 1, enterprise: 2 }
  if (requiredTier === 'all') return true
  if (requiredTier === 'pro') return (tiers[userTier] ?? 0) >= 1
  if (requiredTier === 'enterprise') return (tiers[userTier] ?? 0) >= 2
  return true
}

export default function Reports() {
  const { user } = useAuthStore()
  // Get plan tier from user's tenant info (lowercase, e.g. 'pro')
  const currentTier = user?.tenant?.package?.name?.toLowerCase() ?? 'pro'

  const [activeReport, setActiveReport] = useState(null)

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="text-muted text-sm mt-1">
          Generate and download site reports in PDF or Excel.
          Current plan: <span className="text-gold capitalize">{currentTier}</span>
        </p>
      </div>

      {/* ── Report cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map(report => {
          const locked = !canAccess(currentTier, report.tier)
          const label  = tierLabel(report.tier)

          return (
            <div
              key={report.id}
              className={`card border transition-all ${
                locked
                  ? 'border-white/5 opacity-60 cursor-not-allowed'
                  : 'border-white/5 hover:border-gold/40 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl mt-0.5">{report.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                  <p className="text-muted text-sm mb-3">{report.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Format badges */}
                    {report.format.map(f => (
                      <span key={f} className="text-xs bg-navy-light text-muted px-2 py-0.5 rounded border border-white/5 uppercase font-mono">
                        {f}
                      </span>
                    ))}
                    <div className="flex-1" />
                    {locked ? (
                      <a
                        href="/dashboard/settings"
                        className="text-xs text-gold hover:text-gold-light transition-colors"
                      >
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

      {/* ── Report Generator modal — opened per report ── */}
      {activeReport && (
        <ReportGenerator
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  )
}
