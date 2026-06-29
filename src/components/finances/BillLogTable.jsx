import { useState } from 'react'
import DataTable from '../ui/DataTable'

// ─── BillLogTable ──────────────────────────────────────────────────────────────
// Full filterable bill log table. Filters: site, supplier, material, date range.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_BILLS = [
  { id: 'b1',  date: '2026-06-28', site: 'Colombo Phase 2',   supplier: 'Holcim Lanka',    material: 'Cement',     qty: 200, unit: 'bags',   amount: 148500, has_photo: true },
  { id: 'b2',  date: '2026-06-28', site: 'Kandy Residential', supplier: 'Steel Corp PLC',  material: 'Steel Rod',  qty: 5,   unit: 'MT',     amount: 324000, has_photo: true },
  { id: 'b3',  date: '2026-06-27', site: 'Galle Fort Annex',  supplier: 'Lanka Tiles',     material: 'Tiles',      qty: 500, unit: 'sqft',   amount: 67200,  has_photo: false },
  { id: 'b4',  date: '2026-06-27', site: 'Negombo Towers',    supplier: 'Mahaweli Sand',   material: 'Sand',       qty: 8,   unit: 'loads',  amount: 48000,  has_photo: true },
  { id: 'b5',  date: '2026-06-26', site: 'Colombo Phase 2',   supplier: 'Holcim Lanka',    material: 'Cement',     qty: 218, unit: 'bags',   amount: 162000, has_photo: true },
  { id: 'b6',  date: '2026-06-26', site: 'Kandy Residential', supplier: 'Lanka Paint',     material: 'Paint',      qty: 50,  unit: 'litres', amount: 32500,  has_photo: true },
  { id: 'b7',  date: '2026-06-25', site: 'Negombo Towers',    supplier: 'Steel Corp PLC',  material: 'Steel Rod',  qty: 3,   unit: 'MT',     amount: 195000, has_photo: false },
  { id: 'b8',  date: '2026-06-25', site: 'Galle Fort Annex',  supplier: 'Lanka Timber',    material: 'Timber',     qty: 200, unit: 'planks', amount: 84000,  has_photo: true },
]

function formatLKR(n) { return `LKR ${n.toLocaleString()}` }

const columns = [
  { key: 'date',     label: 'Date',     render: (v) => <span className="font-mono text-sm text-muted">{v}</span> },
  { key: 'site',     label: 'Site',     render: (v) => <span className="text-offwhite text-sm">{v}</span> },
  { key: 'supplier', label: 'Supplier', render: (v) => <span className="text-offwhite text-sm">{v}</span> },
  { key: 'material', label: 'Material', render: (v) => <span className="text-muted text-sm">{v}</span> },
  { key: 'qty',      label: 'Qty',      render: (v, row) => <span className="font-mono text-sm text-offwhite">{v} {row.unit}</span> },
  {
    key: 'amount',
    label: 'Amount (LKR)',
    render: (v) => <span className="font-mono font-semibold text-gold text-sm">{formatLKR(v)}</span>,
  },
  {
    key: 'has_photo',
    label: 'Receipt',
    render: (v) => v
      ? <span className="text-green-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Uploaded</span>
      : <span className="text-red-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Missing</span>,
  },
]

export default function BillLogTable({ bills, isLoading }) {
  const [filters, setFilters] = useState({ site: '', supplier: '', material: '' })
  const data = bills ?? DUMMY_BILLS

  const filtered = data.filter((b) => {
    if (filters.site && !b.site.toLowerCase().includes(filters.site.toLowerCase())) return false
    if (filters.supplier && !b.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) return false
    if (filters.material && b.material !== filters.material) return false
    return true
  })

  const totalAmount = filtered.reduce((s, b) => s + b.amount, 0)

  return (
    <div>
      {/* Filter row */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="input"
          style={{ maxWidth: 180 }}
          placeholder="Filter by site…"
          value={filters.site}
          onChange={(e) => setFilters(f => ({ ...f, site: e.target.value }))}
        />
        <input
          className="input"
          style={{ maxWidth: 180 }}
          placeholder="Filter by supplier…"
          value={filters.supplier}
          onChange={(e) => setFilters(f => ({ ...f, supplier: e.target.value }))}
        />
        <div className="relative">
          <select
            className="select"
            style={{ maxWidth: 160 }}
            value={filters.material}
            onChange={(e) => setFilters(f => ({ ...f, material: e.target.value }))}
          >
            <option value="">All materials</option>
            {['Cement','Steel Rod','Sand','Tiles','Paint','Timber'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button
          onClick={() => setFilters({ site: '', supplier: '', material: '' })}
          className="btn-ghost text-xs"
        >
          Clear
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted text-sm">{filtered.length} records</span>
          <span className="text-gold font-mono font-semibold text-sm">{formatLKR(totalAmount)}</span>
        </div>
      </div>

      <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          keyField="id"
          emptyTitle="No bills found"
          emptyDescription="Adjust your filters or check back when managers upload receipts."
        />
      </div>
    </div>
  )
}
