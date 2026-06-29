import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import LoadingSpinner from '../ui/LoadingSpinner'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-3 shadow-xl">
      <p className="font-syne font-semibold text-offwhite mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-sm">
          <span style={{ color: entry.fill }}>{entry.name}</span>
          <span className="font-mono text-offwhite">LKR {(entry.value / 1000000).toFixed(2)}M</span>
        </div>
      ))}
      <div className="border-t border-navy-light mt-2 pt-2 flex items-center justify-between text-sm">
        <span className="text-muted">Total</span>
        <span className="font-mono text-gold font-semibold">
          LKR {(payload.reduce((s, p) => s + p.value, 0) / 1000000).toFixed(2)}M
        </span>
      </div>
    </div>
  )
}

function yTickFormat(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
  return val
}

function normaliseSpend(d) {
  return {
    site:      d.site_name ?? d.site ?? '',
    materials: d.materials ?? d.material_spend_lkr ?? 0,
    wages:     d.wages ?? d.wage_spend_lkr ?? 0,
  }
}

export default function SpendChart({ data, isLoading, monthLabel }) {
  const raw = Array.isArray(data) ? data : []
  const chartData = raw.map(normaliseSpend)

  if (isLoading) {
    return (
      <div className="card border border-white/5 p-5">
        <LoadingSpinner label="Loading chart…" />
      </div>
    )
  }

  return (
    <div className="card border border-white/5 p-5">
      <div className="mb-5">
        <h2 className="section-title">Spend by Site</h2>
        <p className="text-muted text-xs mt-0.5">
          Materials vs wages{monthLabel ? ` — ${monthLabel}` : ''}
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-muted text-sm text-center py-12">No spend data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1A3356" vertical={false} />
            <XAxis
              dataKey="site"
              tick={{ fill: '#7A8BA0', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={yTickFormat}
              tick={{ fill: '#7A8BA0', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.05)' }} />
            <Legend formatter={(val) => <span style={{ color: '#7A8BA0', fontSize: 12 }}>{val}</span>} />
            <Bar dataKey="materials" name="Materials" fill="#C9A84C" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="wages" name="Wages" fill="#1A3356" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
