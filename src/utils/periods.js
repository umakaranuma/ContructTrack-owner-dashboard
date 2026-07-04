// Period helpers — convert a (type, reference) selection into an
// explicit { date_from, date_to } range for the finance API.

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const PERIOD_TYPES = [
  { id: 'day',   label: 'Day' },
  { id: 'week',  label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year',  label: 'Year' },
]

/**
 * getPeriodRange('day', '2026-07-03')   → that single day
 * getPeriodRange('week', '2026-07-03')  → Monday..Sunday containing that date
 * getPeriodRange('month', '2026-07')    → first..last day of month
 * getPeriodRange('year', '2026')        → Jan 1..Dec 31
 */
export function getPeriodRange(type, ref) {
  if (!ref) return {}

  if (type === 'day') {
    return { date_from: ref, date_to: ref }
  }

  if (type === 'week') {
    const d = new Date(`${ref}T00:00:00`)
    if (isNaN(d)) return {}
    const day = d.getDay() === 0 ? 7 : d.getDay() // Mon=1..Sun=7
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { date_from: iso(monday), date_to: iso(sunday) }
  }

  if (type === 'month') {
    const [y, m] = ref.split('-').map(Number)
    if (!y || !m) return {}
    const last = new Date(y, m, 0).getDate()
    const mm = String(m).padStart(2, '0')
    return { date_from: `${y}-${mm}-01`, date_to: `${y}-${mm}-${String(last).padStart(2, '0')}` }
  }

  if (type === 'year') {
    const y = Number(ref)
    if (!y) return {}
    return { date_from: `${y}-01-01`, date_to: `${y}-12-31` }
  }

  return {}
}

export function getRecentYears(count = 6) {
  const current = new Date().getFullYear()
  return Array.from({ length: count }, (_, i) => String(current - i))
}
