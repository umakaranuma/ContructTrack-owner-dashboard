import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useSite, useDailyLogs, useAttendance, useBills, useProgressPhotos, useSiteAlerts, useAcknowledgeAlert, useResolveAlert, useUpdateSite } from '../hooks/useSites'
import StageStepper from '../components/sites/StageStepper'
import BillPhotoGrid from '../components/sites/BillPhotoGrid'
import ProgressPhotoWall from '../components/sites/ProgressPhotoWall'
import AddBillModal from '../components/sites/AddBillModal'
import AddDailyLogModal from '../components/sites/AddDailyLogModal'
import LogAttendanceModal from '../components/sites/LogAttendanceModal'
import { StageBadge } from '../components/ui/Badge'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import DataTable from '../components/ui/DataTable'
import { stageLabel } from '../constants/stages'
import { optionLabel, TOMORROW_STATUS_OPTIONS } from '../constants/dailyLogOptions'
import { DUMMY_SITES } from '../components/overview/SiteGrid'

// ─── SiteDetail Page ───────────────────────────────────────────────────────────
// Full site detail with tabs: Overview | Daily Logs | Attendance | Bills |
// Progress Photos | Alerts
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'logs',      label: 'Daily Logs' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'bills',     label: 'Bills & Receipts' },
  { id: 'photos',    label: 'Progress Photos' },
  { id: 'alerts',    label: 'Alerts' },
]

// Dummy chart data for overview charts until dedicated endpoints exist
const DUMMY_BUDGET_CHART = [
  { month: 'Jan', budget: 2000000, actual: 1820000 },
  { month: 'Feb', budget: 2000000, actual: 2100000 },
  { month: 'Mar', budget: 2000000, actual: 1950000 },
  { month: 'Apr', budget: 2000000, actual: 2340000 },
  { month: 'May', budget: 2000000, actual: 2150000 },
  { month: 'Jun', budget: 2000000, actual: 4820000 },
]

const DUMMY_MATERIAL_PIE = [
  { name: 'Cement',    value: 2400000, color: '#C9A84C' },
  { name: 'Steel',     value: 1800000, color: '#F0C96B' },
  { name: 'Sand',      value: 480000,  color: '#7A8BA0' },
  { name: 'Tiles',     value: 320000,  color: '#1A3356' },
  { name: 'Others',    value: 220000,  color: '#112240' },
]

function formatLKR(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return 'LKR —'
  if (num >= 1000000) return `LKR ${(num/1000000).toFixed(2)}M`
  if (num >= 1000)    return `LKR ${(num/1000).toFixed(0)}K`
  return `LKR ${num.toLocaleString()}`
}

function BudgetTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-3 shadow-xl text-sm">
      <p className="font-syne font-semibold text-offwhite mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-mono text-offwhite">{formatLKR(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SiteDetail() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddBill, setShowAddBill] = useState(false)
  const [showAddLog, setShowAddLog] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [logDateFilter, setLogDateFilter] = useState('')

  // Site header loads once; tab data loads lazily per tab
  const { data: siteData, isLoading: siteLoading } = useSite(siteId)
  const updateSite = useUpdateSite(siteId)
  const logQueryParams = logDateFilter ? { date: logDateFilter } : {}
  const { data: logsData, isLoading: logsLoading } = useDailyLogs(siteId, logQueryParams, { enabled: activeTab === 'logs' })
  const { data: attendanceData, isLoading: attLoading } = useAttendance(siteId, {}, { enabled: activeTab === 'attendance' })
  const { data: billsData, isLoading: billsLoading } = useBills(siteId, {}, { enabled: activeTab === 'bills' })
  const { data: photosData, isLoading: photosLoading } = useProgressPhotos(siteId, {}, { enabled: activeTab === 'photos' })
  const { data: alertsData, isLoading: alertsLoading } = useSiteAlerts(siteId, { enabled: activeTab === 'alerts' })

  const acknowledgeAlert = useAcknowledgeAlert(siteId)
  const resolveAlert     = useResolveAlert(siteId)

  const site = siteData ?? DUMMY_SITES.find(s => s.id === siteId) ?? DUMMY_SITES[0]
  const logs = logsData?.results ?? logsData ?? []
  const attendance = attendanceData?.results ?? attendanceData ?? []
  const alerts = alertsData?.results ?? alertsData ?? []

  return (
    <div>
      {/* Site header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/sites" className="text-muted hover:text-gold text-sm transition-colors">My Sites</Link>
            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-offwhite text-sm">{site.name}</span>
          </div>
          <h1 className="font-syne font-bold text-2xl text-offwhite">{site.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-muted text-sm">{site.location}</span>
            <StageBadge stage={site.stage} />
            <Badge variant={site.status === 'active' ? 'success' : 'muted'}>{site.status}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs uppercase tracking-wider">Monthly Spend</p>
          <p className="font-mono font-bold text-gold text-xl">{formatLKR(site.monthly_spend)}</p>
          <p className="text-muted text-xs mt-0.5">of {formatLKR(site.budget)} budget</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-navy-light mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-gold border-gold'
                : 'text-muted hover:text-offwhite border-transparent'
            }`}
          >
            {tab.label}
            {tab.id === 'alerts' && alerts.length > 0 && alerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        siteLoading && !siteData ? (
          <LoadingSpinner label="Loading site overview…" />
        ) : (
        <div className="space-y-6">
          <StageStepper
            currentStage={site.stage ?? site.current_stage}
            onUpdateStage={(stage) => updateSite.mutate({ current_stage: stage })}
            isUpdating={updateSite.isPending}
          />

          <div className="grid grid-cols-2 gap-6">
            {/* Budget vs Actual */}
            <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
              <h3 className="font-syne font-semibold text-offwhite mb-4">Budget vs Actual Spend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DUMMY_BUDGET_CHART} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3356" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#7A8BA0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${(v/1000000).toFixed(1)}M`} tick={{ fill: '#7A8BA0', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip content={<BudgetTooltip />} cursor={{ fill: 'rgba(201,168,76,0.05)' }} />
                  <Bar dataKey="budget" name="Budget" fill="#1A3356" radius={[4,4,0,0]} maxBarSize={24} />
                  <Bar dataKey="actual" name="Actual" fill="#C9A84C" radius={[4,4,0,0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Material usage pie */}
            <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
              <h3 className="font-syne font-semibold text-offwhite mb-4">Material Spend Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={DUMMY_MATERIAL_PIE}
                    cx="40%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DUMMY_MATERIAL_PIE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(val, entry) => (
                      <span style={{ color: '#7A8BA0', fontSize: 12 }}>
                        {val} — {formatLKR(entry.payload.value)}
                      </span>
                    )}
                  />
                  <Tooltip
                    formatter={(val) => [formatLKR(val), 'Spend']}
                    contentStyle={{ background: '#112240', border: '1px solid #1A3356', borderRadius: 8, color: '#F4F2ED' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Labour vs Material split */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Material Cost', value: 5220000, pct: 72, color: 'gold' },
              { label: 'Labour Cost',   value: 2040000, pct: 28, color: 'info' },
              { label: 'Total Budget',  value: 12000000, pct: null, color: 'muted' },
            ].map(item => (
              <div key={item.label} className="bg-navy-secondary border border-navy-light rounded-xl p-4">
                <p className="text-muted text-xs uppercase tracking-wider mb-2">{item.label}</p>
                <p className="font-mono font-bold text-xl text-offwhite">{formatLKR(item.value)}</p>
                {item.pct !== null && (
                  <div className="mt-2">
                    <div className="h-1 bg-navy-primary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full progress-fill ${item.color === 'gold' ? 'bg-gold' : 'bg-blue-500'}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <p className="text-muted text-xs mt-1 font-mono">{item.pct}% of total spend</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )
      )}

      {/* ── Tab: Daily Logs ── */}
      {activeTab === 'logs' && (
        logsLoading ? (
          <LoadingSpinner label="Loading daily logs…" />
        ) : (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="label text-xs mb-1 block">Filter by date</label>
                <input
                  type="date"
                  className="input"
                  style={{ maxWidth: 180 }}
                  value={logDateFilter}
                  onChange={(e) => setLogDateFilter(e.target.value)}
                />
              </div>
              {logDateFilter && (
                <button
                  type="button"
                  className="btn-ghost text-xs mt-5"
                  onClick={() => setLogDateFilter('')}
                >
                  Clear filter
                </button>
              )}
              {logDateFilter && (
                <p className="text-muted text-xs mt-5">
                  Showing logs for <span className="text-offwhite font-mono">{logDateFilter}</span>
                </p>
              )}
            </div>
            <button type="button" className="btn-primary text-xs shrink-0" onClick={() => setShowAddLog(true)}>
              + Add Daily Log
            </button>
          </div>
          <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: v => <span className="font-mono text-sm text-muted">{v}</span> },
                { key: 'stage', label: 'Stage', render: v => <span className="text-offwhite text-sm">{stageLabel(v)}</span> },
                { key: 'work_done_today', label: 'Work Summary', render: v => (
                  <span className="text-muted text-sm line-clamp-2 max-w-xs">{v || '—'}</span>
                )},
                { key: 'tomorrow_status', label: 'Tomorrow', render: v => (
                  <span className="text-offwhite text-xs">{optionLabel(v, TOMORROW_STATUS_OPTIONS)}</span>
                )},
                { key: 'manager', label: 'Submitted by', render: v => <span className="text-offwhite text-sm">{v ?? '—'}</span> },
                { key: 'id', label: '', render: (_, row) => (
                  <Link
                    to={`/dashboard/sites/${siteId}/logs/${row.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted hover:text-gold transition-colors"
                  >
                    View details →
                  </Link>
                )},
              ]}
              data={logs}
              isLoading={logsLoading}
              keyField="id"
              onRowClick={(row) => navigate(`/dashboard/sites/${siteId}/logs/${row.id}`)}
              emptyTitle="No daily logs"
              emptyDescription="Add a daily log or wait for managers to submit from the mobile app."
            />
          </div>
        </div>
        )
      )}

      {/* ── Tab: Attendance ── */}
      {activeTab === 'attendance' && (
        attLoading ? (
          <LoadingSpinner label="Loading attendance…" />
        ) : (
        <div>
          <div className="flex justify-end mb-4">
            <button type="button" className="btn-primary text-xs" onClick={() => setShowAttendance(true)}>
              + Log Attendance
            </button>
          </div>
          <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
            <DataTable
              columns={[
                { key: 'name',         label: 'Worker',          render: (v, row) => <div><p className="text-offwhite text-sm font-medium">{v}</p><p className="text-muted text-xs">{row.role}</p></div> },
                { key: 'days',         label: 'Days Worked',     render: v => <span className="font-mono text-offwhite text-sm">{v}</span> },
                { key: 'total_earned', label: 'Total Earned',    render: v => <span className="font-mono text-offwhite text-sm">{formatLKR(v)}</span> },
                { key: 'total_paid',   label: 'Total Paid',      render: v => <span className="font-mono text-green-400 text-sm">{formatLKR(v)}</span> },
                { key: 'id', label: 'Balance Due', render: (_, row) => {
                  const b = row.total_earned - row.total_paid
                  return <span className={`font-mono font-semibold text-sm ${b > 0 ? 'text-amber-400' : 'text-muted'}`}>{b > 0 ? formatLKR(b) : '—'}</span>
                }},
              ]}
              data={attendance}
              isLoading={attLoading}
              keyField="id"
              emptyTitle="No attendance data"
            />
          </div>
        </div>
        )
      )}

      {/* ── Tab: Bills & Receipts ── */}
      {activeTab === 'bills' && (
        <div>
          <div className="flex justify-end mb-4">
            <button type="button" className="btn-primary text-xs" onClick={() => setShowAddBill(true)}>
              + Add Bill
            </button>
          </div>
          <BillPhotoGrid bills={billsData?.results ?? billsData} isLoading={billsLoading} />
        </div>
      )}

      {/* ── Tab: Progress Photos ── */}
      {activeTab === 'photos' && (
        <ProgressPhotoWall photos={photosData?.results ?? photosData} isLoading={photosLoading} />
      )}

      {/* ── Tab: Alerts ── */}
      {activeTab === 'alerts' && (
        alertsLoading ? (
          <LoadingSpinner label="Loading alerts…" />
        ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
                alert.acknowledged
                  ? 'border-navy-light/30 opacity-50'
                  : alert.severity === 'danger'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'danger' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-offwhite text-sm">{alert.message}</p>
                  <p className="text-muted text-xs mt-0.5 font-mono">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
              </div>
              {!alert.acknowledged && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => acknowledgeAlert.mutate(alert.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-navy-light/40 border border-navy-light text-muted hover:text-offwhite hover:border-gold/30 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => resolveAlert.mutate(alert.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center py-12 text-muted">No alerts for this site.</div>
          )}
        </div>
        )
      )}
      <AddBillModal siteId={siteId} isOpen={showAddBill} onClose={() => setShowAddBill(false)} />
      <AddDailyLogModal
        siteId={siteId}
        currentStage={site.stage ?? site.current_stage}
        isOpen={showAddLog}
        onClose={() => setShowAddLog(false)}
      />
      <LogAttendanceModal siteId={siteId} isOpen={showAttendance} onClose={() => setShowAttendance(false)} />
    </div>
  )
}
