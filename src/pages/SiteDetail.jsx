import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useSite, useDailyLogs, useAttendance, useBills, useProgressPhotos, useSiteAlerts, useAcknowledgeAlert, useResolveAlert, useUpdateSite } from '../hooks/useSites'
import StageStepper from '../components/sites/StageStepper'
import BillPhotoGrid from '../components/sites/BillPhotoGrid'
import ProgressPhotoWall from '../components/sites/ProgressPhotoWall'
import DailyLogDetail from '../components/sites/DailyLogDetail'
import { StageBadge } from '../components/ui/Badge'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/LoadingSpinner'
import DataTable from '../components/ui/DataTable'
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

// Dummy data
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

const DUMMY_LOGS = [
  { id: 'l1', date: '2026-06-28', manager: 'Rajan Perera', materials_in: 8, materials_out: 3, workers: 34, total_wage: 204000 },
  { id: 'l2', date: '2026-06-27', manager: 'Rajan Perera', materials_in: 5, materials_out: 2, workers: 31, total_wage: 186000 },
  { id: 'l3', date: '2026-06-26', manager: 'Rajan Perera', materials_in: 12, materials_out: 5, workers: 36, total_wage: 216000 },
  { id: 'l4', date: '2026-06-25', manager: 'Rajan Perera', materials_in: 3, materials_out: 1, workers: 28, total_wage: 168000 },
]

const DUMMY_ATTENDANCE = [
  { id: 'a1', name: 'Pradeep Kumara',  role: 'Foreman',     days: 24, total_earned: 108000, total_paid: 108000 },
  { id: 'a2', name: 'Niroshan Perera', role: 'Mason',       days: 22, total_earned: 70400,  total_paid: 60000  },
  { id: 'a3', name: 'Sarath Bandara',  role: 'Steel Fixer', days: 20, total_earned: 70000,  total_paid: 70000  },
  { id: 'a4', name: 'Chaminda Silva',  role: 'Helper',      days: 26, total_earned: 57200,  total_paid: 50000  },
  { id: 'a5', name: 'Roshan Fernando', role: 'Carpenter',   days: 18, total_earned: 68400,  total_paid: 68400  },
]

const DUMMY_SITE_ALERTS = [
  { id: 'sa1', severity: 'danger',  type: 'material_cap',    message: 'Cement usage at 95% of monthly cap', created_at: new Date(Date.now()-1000*60*8).toISOString(),  acknowledged: false },
  { id: 'sa2', severity: 'warning', type: 'missing_log',     message: 'Daily log not submitted for 2026-06-25', created_at: new Date(Date.now()-1000*60*60*26).toISOString(), acknowledged: true  },
  { id: 'sa3', severity: 'warning', type: 'delivery_no_bill', message: 'Steel delivery without attached bill photo', created_at: new Date(Date.now()-1000*60*180).toISOString(), acknowledged: false },
]

function formatLKR(n) {
  if (n >= 1000000) return `LKR ${(n/1000000).toFixed(2)}M`
  if (n >= 1000)    return `LKR ${(n/1000).toFixed(0)}K`
  return `LKR ${n}`
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
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLog, setSelectedLog] = useState(null)

  // API hooks — fall back to dummy data
  const { data: siteData, isLoading: siteLoading } = useSite(siteId)
  const updateSite = useUpdateSite(siteId)
  const { data: logsData, isLoading: logsLoading }       = useDailyLogs(siteId)
  const { data: attendanceData, isLoading: attLoading }  = useAttendance(siteId)
  const { data: billsData, isLoading: billsLoading }     = useBills(siteId)
  const { data: photosData, isLoading: photosLoading }   = useProgressPhotos(siteId)
  const { data: alertsData, isLoading: alertsLoading }   = useSiteAlerts(siteId)

  const acknowledgeAlert = useAcknowledgeAlert(siteId)
  const resolveAlert     = useResolveAlert(siteId)

  if (siteLoading) return <PageLoader />

  const site      = siteData ?? DUMMY_SITES.find(s => s.id === siteId) ?? DUMMY_SITES[0]
  const logs      = logsData?.results ?? logsData ?? DUMMY_LOGS
  const attendance = attendanceData?.results ?? attendanceData ?? DUMMY_ATTENDANCE
  const alerts    = alertsData?.results ?? alertsData ?? DUMMY_SITE_ALERTS

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
            {tab.id === 'alerts' && alerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
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
      )}

      {/* ── Tab: Daily Logs ── */}
      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input type="date" className="input" style={{ maxWidth: 160 }} />
            <button className="btn-ghost text-xs">Clear</button>
          </div>
          <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
            <DataTable
              columns={[
                { key: 'date',        label: 'Date',            render: v => <span className="font-mono text-sm text-muted">{v}</span> },
                { key: 'manager',     label: 'Manager',         render: v => <span className="text-offwhite text-sm">{v}</span> },
                { key: 'materials_in', label: 'Materials In',   render: v => <span className="font-mono text-green-400 text-sm">{v} items</span> },
                { key: 'materials_out', label: 'Materials Out', render: v => <span className="font-mono text-amber-400 text-sm">{v} items</span> },
                { key: 'workers',     label: 'Workers Present', render: v => <span className="font-mono text-offwhite text-sm">{v}</span> },
                { key: 'total_wage',  label: 'Total Wage',      render: v => <span className="font-mono text-gold text-sm font-semibold">{formatLKR(v)}</span> },
                { key: 'id', label: '', render: (_, row) => (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLog(row) }}
                    className="text-xs text-muted hover:text-gold transition-colors"
                  >
                    Details →
                  </button>
                )},
              ]}
              data={logs}
              isLoading={logsLoading}
              keyField="id"
              onRowClick={(row) => setSelectedLog(row)}
              emptyTitle="No daily logs"
              emptyDescription="Managers submit logs through the mobile app."
            />
          </div>
        </div>
      )}

      {/* ── Tab: Attendance ── */}
      {activeTab === 'attendance' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn-ghost flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
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
      )}

      {/* ── Tab: Bills & Receipts ── */}
      {activeTab === 'bills' && (
        <BillPhotoGrid bills={billsData?.results ?? billsData} isLoading={billsLoading} />
      )}

      {/* ── Tab: Progress Photos ── */}
      {activeTab === 'photos' && (
        <ProgressPhotoWall photos={photosData?.results ?? photosData} isLoading={photosLoading} />
      )}

      {/* ── Tab: Alerts ── */}
      {activeTab === 'alerts' && (
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
      )}
      <DailyLogDetail log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
