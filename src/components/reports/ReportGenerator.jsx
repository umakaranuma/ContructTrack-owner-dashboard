import { useState } from 'react'
import Badge from '../ui/Badge'

// ─── ReportGenerator ───────────────────────────────────────────────────────────
// Table of report types with site/date selectors and Generate buttons.
// Simulates an async generation job with status polling.
// Locked reports show a badge and disabled state for lower-tier plans.
// ─────────────────────────────────────────────────────────────────────────────

// Current plan — in real app from auth store / subscription API
const CURRENT_PLAN = 'Pro' // 'Starter' | 'Pro' | 'Enterprise'

const REPORTS = [
  {
    id: 'material_consumption',
    name: 'Material Consumption Sheet',
    description: 'Detailed breakdown of all materials used per site, with supplier and cost analysis.',
    format: 'PDF',
    minPlan: 'Starter',
    icon: '📦',
  },
  {
    id: 'worker_attendance',
    name: 'Worker Attendance Log',
    description: 'Full attendance record with daily presence, wages, and payment status per worker.',
    format: 'PDF / Excel',
    minPlan: 'Starter',
    icon: '👷',
  },
  {
    id: 'monthly_spend',
    name: 'Monthly Site Spend Summary',
    description: 'Month-over-month spend comparison per site including materials, wages, and overheads.',
    format: 'PDF',
    minPlan: 'Starter',
    icon: '📊',
  },
  {
    id: 'bank_loan',
    name: 'Bank Loan Progress Report',
    description: 'Structured progress report formatted for bank loan drawdown submission.',
    format: 'PDF',
    minPlan: 'Enterprise',
    icon: '🏦',
  },
  {
    id: 'custom_date',
    name: 'Custom Date Range Report',
    description: 'Fully configurable report across any date range — materials, wages, and activities.',
    format: 'Excel',
    minPlan: 'Pro',
    icon: '📅',
  },
  {
    id: 'subcontractor',
    name: 'Subcontractor Scorecard',
    description: 'Performance scorecard for subcontractors — quality, timeliness, cost vs estimate.',
    format: 'PDF',
    minPlan: 'Enterprise',
    icon: '🏗️',
  },
]

const PLAN_RANK = { Starter: 0, Pro: 1, Enterprise: 2 }

const DUMMY_SITES = [
  { id: '1', name: 'Colombo City Phase 2' },
  { id: '2', name: 'Kandy Residential Complex' },
  { id: '3', name: 'Galle Fort Annex' },
  { id: '4', name: 'Negombo Towers Block B' },
]

function isUnlocked(minPlan) {
  return PLAN_RANK[CURRENT_PLAN] >= PLAN_RANK[minPlan]
}

export default function ReportGenerator() {
  // job state: { [reportId]: 'idle' | 'generating' | 'ready' }
  const [jobs, setJobs] = useState({})
  const [configs, setConfigs] = useState({})

  const setConfig = (reportId, key, value) => {
    setConfigs(prev => ({
      ...prev,
      [reportId]: { ...prev[reportId], [key]: value },
    }))
  }

  const handleGenerate = (reportId) => {
    setJobs(prev => ({ ...prev, [reportId]: 'generating' }))
    // Simulate 2.5s generation job
    setTimeout(() => {
      setJobs(prev => ({ ...prev, [reportId]: 'ready' }))
    }, 2500)
  }

  const handleDownload = (report) => {
    // In real app: call reportService.downloadReport(jobId)
    alert(`Downloading: ${report.name}`)
    setJobs(prev => ({ ...prev, [report.id]: 'idle' }))
  }

  return (
    <div className="space-y-4">
      {REPORTS.map((report) => {
        const unlocked = isUnlocked(report.minPlan)
        const jobStatus = jobs[report.id] || 'idle'
        const config = configs[report.id] || {}

        return (
          <div
            key={report.id}
            className={`bg-navy-secondary border rounded-xl p-5 transition-colors ${
              unlocked ? 'border-navy-light hover:border-gold/20' : 'border-navy-light/30 opacity-60'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-navy-primary/60 border border-navy-light flex items-center justify-center text-xl flex-shrink-0">
                {report.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-syne font-semibold text-offwhite">{report.name}</h3>
                  <Badge variant="muted">{report.format}</Badge>
                  {!unlocked && (
                    <Badge variant="locked">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {report.minPlan}
                    </Badge>
                  )}
                </div>
                <p className="text-muted text-sm mb-3 leading-relaxed">{report.description}</p>

                {/* Config row */}
                {unlocked && (
                  <div className="flex gap-3 flex-wrap">
                    {/* Site selector */}
                    <div className="relative">
                      <select
                        className="select text-xs"
                        style={{ width: 200 }}
                        value={config.site || ''}
                        onChange={(e) => setConfig(report.id, 'site', e.target.value)}
                        disabled={!unlocked}
                      >
                        <option value="">All sites</option>
                        {DUMMY_SITES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Date range */}
                    <input
                      type="date"
                      className="input text-xs"
                      style={{ width: 140 }}
                      value={config.from || ''}
                      onChange={(e) => setConfig(report.id, 'from', e.target.value)}
                    />
                    <input
                      type="date"
                      className="input text-xs"
                      style={{ width: 140 }}
                      value={config.to || ''}
                      onChange={(e) => setConfig(report.id, 'to', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {!unlocked ? (
                  <button className="btn-ghost text-muted/50 cursor-not-allowed text-xs" disabled>
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Upgrade to {report.minPlan}
                  </button>
                ) : jobStatus === 'idle' ? (
                  <button
                    onClick={() => handleGenerate(report.id)}
                    className="btn-gold text-xs flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate
                  </button>
                ) : jobStatus === 'generating' ? (
                  <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-light/30 border border-navy-light text-muted text-xs cursor-wait">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating…
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-xs font-semibold"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
