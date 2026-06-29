import MetricCard from '../components/overview/MetricCard'
import SiteGrid from '../components/overview/SiteGrid'
import ActivityFeed from '../components/overview/ActivityFeed'
import Badge from '../components/ui/Badge'
import { useOverviewStats, useActivityFeed, useSites } from '../hooks/useSites'

// ─── Overview Page ─────────────────────────────────────────────────────────────
// Main dashboard: 4 KPI metric cards, site status grid, and activity feed.
// ─────────────────────────────────────────────────────────────────────────────

// Dummy stats while API is not connected
const DUMMY_STATS = {
  active_sites:       4,
  max_sites:          10,
  total_spend_month:  9010000,
  workers_on_site:    99,
  open_alerts:        3,
  spend_vs_last_month: '+8.4%',
  spend_up:           true,
}

export default function Overview() {
  const { data: stats, isLoading: statsLoading }         = useOverviewStats()
  const { data: activity, isLoading: activityLoading }   = useActivityFeed(20)
  const { data: sitesData, isLoading: sitesLoading }     = useSites()

  const s     = stats ?? DUMMY_STATS
  const sites = sitesData?.results ?? sitesData ?? null

  function formatLKR(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
    if (n >= 1000)    return (n / 1000).toFixed(0) + 'K'
    return String(n)
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Active Sites"
          value={s.active_sites}
          sub={`/ ${s.max_sites}`}
          variant="gold"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        <MetricCard
          title="Total Spend This Month"
          value={`LKR ${formatLKR(s.total_spend_month)}`}
          variant="default"
          trend={{ value: s.spend_vs_last_month, up: s.spend_up }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Workers on Site Today"
          value={s.workers_on_site}
          variant={s.workers_on_site > 0 ? 'success' : 'default'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Open Material Alerts"
          value={s.open_alerts}
          variant={s.open_alerts > 0 ? 'danger' : 'default'}
          badge={s.open_alerts > 0 ? <Badge variant="danger">{s.open_alerts} unresolved</Badge> : null}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* ── Site Status Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Site Status</h2>
          <a href="/dashboard/sites" className="text-gold text-sm hover:text-gold-light transition-colors flex items-center gap-1">
            View all sites
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <SiteGrid sites={sites} isLoading={sitesLoading} />
      </div>

      {/* ── Activity Feed ── */}
      <ActivityFeed
        activities={activity?.results ?? activity}
        isLoading={activityLoading}
      />
    </div>
  )
}
