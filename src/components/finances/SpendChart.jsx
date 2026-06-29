import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ─── SpendChart ────────────────────────────────────────────────────────────────
// Recharts BarChart — monthly spend per site, split into materials vs wages.
// Month selector changes which month's data is displayed.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_SPEND = [
  { site: 'Colombo P2',  materials: 3200000, wages: 1620000 },
  { site: 'Kandy Res',   materials: 1540000, wages: 800000  },
  { site: 'Galle Fort',  materials: 1200000, wages: 670000  },
  { site: 'Negombo T',   materials: 620000,  wages: 360000  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

export default function SpendChart({ data, isLoading, selectedMonth, onMonthChange }) {
  const chartData = data ?? DUMMY_SPEND
  const currentMonth = new Date().getMonth()

  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-syne font-semibold text-offwhite">Spend by Site</h3>
          <p className="text-muted text-xs mt-0.5">Materials vs wages per site</p>
        </div>
        <div className="relative">
          <select
            value={selectedMonth ?? currentMonth}
            onChange={(e) => onMonthChange?.(Number(e.target.value))}
            className="select"
            style={{ width: 120 }}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m} 2026</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%">
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
          <Legend
            formatter={(val) => <span style={{ color: '#7A8BA0', fontSize: 12 }}>{val}</span>}
          />
          <Bar dataKey="materials" name="Materials" fill="#C9A84C" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="wages"     name="Wages"     fill="#1A3356" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
