// Generate last N months as { label, value } for month selectors (value = YYYY-MM)
export function getRecentMonths(count = 12) {
  const months = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })
    months.push({ label, value })
  }
  return months
}
