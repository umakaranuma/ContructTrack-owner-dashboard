import { useNavigate } from 'react-router-dom'
import { StageBadge } from '../ui/Badge'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

// ─── SiteGrid ──────────────────────────────────────────────────────────────────
// Grid of site cards on the Overview page.
// Each card shows: site name, location, stage, material usage bar,
// attendance count, manager info, and action buttons.
// ─────────────────────────────────────────────────────────────────────────────

// Dummy sites for when backend is not connected
export const DUMMY_SITES = [
  {
    id: '1',
    name: 'Colombo City Phase 2',
    location: 'Colombo 07, Western Province',
    stage: 'Columns',
    material_usage_pct: 87,
    workers_today: 34,
    manager_name: 'Rajan Perera',
    manager_last_seen: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    monthly_spend: 4820000,
    budget: 12000000,
    status: 'active',
  },
  {
    id: '2',
    name: 'Kandy Residential Complex',
    location: 'Kandy, Central Province',
    stage: 'Slab',
    material_usage_pct: 62,
    workers_today: 21,
    manager_name: 'Sunil Bandara',
    manager_last_seen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    monthly_spend: 2340000,
    budget: 8500000,
    status: 'active',
  },
  {
    id: '3',
    name: 'Galle Fort Annex',
    location: 'Galle, Southern Province',
    stage: 'Roofing',
    material_usage_pct: 95,
    workers_today: 16,
    manager_name: 'Nimal Jayasena',
    manager_last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    monthly_spend: 1870000,
    budget: 6000000,
    status: 'active',
  },
  {
    id: '4',
    name: 'Negombo Towers Block B',
    location: 'Negombo, Western Province',
    stage: 'Foundation',
    material_usage_pct: 41,
    workers_today: 28,
    manager_name: 'Chamara Silva',
    manager_last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    monthly_spend: 980000,
    budget: 15000000,
    status: 'active',
  },
]

function formatLKR(amount) {
  if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `LKR ${(amount / 1000).toFixed(0)}K`
  return `LKR ${amount}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function UsageBar({ pct }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted text-[10px] uppercase tracking-wider">Material Usage</span>
        <span className={`font-mono text-xs font-semibold ${pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-green-400'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-navy-primary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full progress-fill ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function SiteGrid({ sites, isLoading }) {
  const navigate = useNavigate()
  const displaySites = sites ?? DUMMY_SITES

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!displaySites.length) {
    return (
      <EmptyState
        title="No active sites"
        description="Create your first construction site to get started."
        icon={
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
      {displaySites.map((site) => (
        <SiteCard key={site.id} site={site} onNavigate={() => navigate(`/dashboard/sites/${site.id}`)} />
      ))}
    </div>
  )
}

function SiteCard({ site, onNavigate }) {
  // Normalise field names — backend may return `address`/`current_stage`/`budget_lkr`
  // while older dummy data uses `location`/`stage`/`budget`. Support both.
  const location       = site.location ?? site.address ?? ''
  const stage          = site.stage ?? site.current_stage ?? 'excavation'
  const usagePct       = site.material_usage_pct ?? 0
  const workersToday   = site.workers_today ?? 0
  const monthlySpend   = site.monthly_spend ?? 0
  const managerName    = site.manager_name ?? 'No manager assigned'
  const lastSeen       = site.manager_last_seen ?? site.created_at

  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-5 hover:border-gold/30 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-syne font-semibold text-offwhite text-base leading-tight truncate group-hover:text-gold transition-colors">
            {site.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-muted text-xs truncate">{location}</span>
          </div>
        </div>
        <StageBadge stage={stage} />
      </div>

      {/* Material usage bar */}
      <div className="mb-4">
        <UsageBar pct={usagePct} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-navy-primary/60 rounded-lg px-3 py-2">
          <p className="text-muted text-[10px] uppercase tracking-wider mb-0.5">Workers Today</p>
          <p className={`font-mono font-bold text-lg ${workersToday > 0 ? 'text-green-400' : 'text-muted'}`}>
            {workersToday}
          </p>
        </div>
        <div className="bg-navy-primary/60 rounded-lg px-3 py-2">
          <p className="text-muted text-[10px] uppercase tracking-wider mb-0.5">Monthly Spend</p>
          <p className="font-mono font-bold text-sm text-offwhite">{formatLKR(monthlySpend)}</p>
        </div>
      </div>

      {/* Manager info */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-navy-light/50">
        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
          <span className="font-syne font-bold text-gold text-[10px]">
            {managerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-offwhite text-xs font-medium truncate">{managerName}</span>
          <span className="text-muted text-[10px] font-mono flex-shrink-0 ml-2">
            {lastSeen ? timeAgo(lastSeen) : '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onNavigate}
          className="flex-1 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          View Site
        </button>
        <button
          onClick={onNavigate}
          className="flex-1 bg-navy-light/30 hover:bg-navy-light/60 border border-navy-light text-muted hover:text-offwhite text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          View Log
        </button>
      </div>
    </div>
  )
}
