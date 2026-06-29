// ─── MetricCard ────────────────────────────────────────────────────────────────
// Top-row KPI card on the Overview dashboard.
// variant: 'gold' | 'success' | 'danger' | 'default'
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_STYLES = {
  gold:    'border-gold/40 glow-gold',
  success: 'border-green-500/30',
  danger:  'border-red-500/30',
  default: 'border-navy-light',
}

const ICON_BG = {
  gold:    'bg-gold/10 text-gold',
  success: 'bg-green-500/10 text-green-400',
  danger:  'bg-red-500/10 text-red-400',
  default: 'bg-navy-light/50 text-muted',
}

export default function MetricCard({
  title,
  value,
  sub,
  icon,
  variant = 'default',
  badge,
  trend,  // { value: '+12%', up: true }
}) {
  return (
    <div className={`bg-navy-secondary rounded-xl border p-5 ${VARIANT_STYLES[variant]} relative overflow-hidden`}>
      {/* Subtle background glow */}
      {variant === 'gold' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-end gap-2">
            <span className="font-mono font-bold text-3xl text-offwhite leading-none">{value}</span>
            {sub && (
              <span className="text-muted text-sm mb-0.5 font-mono">{sub}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-xs font-mono font-semibold ${trend.up ? 'text-green-400' : 'text-red-400'}`}>
                {trend.up ? '▲' : '▼'} {trend.value}
              </span>
            )}
            {badge}
          </div>
        </div>

        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ICON_BG[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
