import { useNavigate } from 'react-router-dom'
import { StageBadge } from '../ui/Badge'
import Badge from '../ui/Badge'

// ─── SiteCard ──────────────────────────────────────────────────────────────────
// Used in the My Sites page grid view. Richer version with budget bar.
// ─────────────────────────────────────────────────────────────────────────────

function formatLKR(n) {
  if (n >= 1000000) return `LKR ${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `LKR ${(n / 1000).toFixed(0)}K`
  return `LKR ${n}`
}

export default function SiteCard({ site }) {
  const navigate = useNavigate()
  const budgetPct = Math.round((site.monthly_spend / site.budget) * 100)

  return (
    <div className="bg-navy-secondary border border-navy-light hover:border-gold/30 rounded-xl p-5 transition-all cursor-pointer group"
         onClick={() => navigate(`/dashboard/sites/${site.id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-syne font-semibold text-offwhite group-hover:text-gold transition-colors">{site.name}</h3>
          <p className="text-muted text-xs mt-0.5">{site.location}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StageBadge stage={site.stage} />
          <Badge variant={site.status === 'active' ? 'success' : 'muted'}>{site.status}</Badge>
        </div>
      </div>

      {/* Budget usage */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-muted mb-1">
          <span className="uppercase tracking-wider">Budget Used</span>
          <span className="font-mono">{formatLKR(site.monthly_spend)} / {formatLKR(site.budget)}</span>
        </div>
        <div className="h-1.5 bg-navy-primary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-fill ${budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-400' : 'bg-gold'}`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-navy-primary/50 rounded-lg py-2 px-1">
          <p className="font-mono font-bold text-green-400 text-lg">{site.workers_today}</p>
          <p className="text-muted text-[10px]">Workers</p>
        </div>
        <div className="bg-navy-primary/50 rounded-lg py-2 px-1">
          <p className="font-mono font-bold text-offwhite text-sm">{site.material_usage_pct}%</p>
          <p className="text-muted text-[10px]">Materials</p>
        </div>
        <div className="bg-navy-primary/50 rounded-lg py-2 px-1">
          <p className="font-mono font-bold text-gold text-sm">{budgetPct}%</p>
          <p className="text-muted text-[10px]">Budget</p>
        </div>
      </div>
    </div>
  )
}
