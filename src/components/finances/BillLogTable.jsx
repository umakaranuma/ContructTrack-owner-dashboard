import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../ui/DataTable'

function formatLKR(n) { return `LKR ${Number(n).toLocaleString('en-LK')}` }

const columns = [
  { key: 'date', label: 'Date', render: (v) => <span className="font-mono text-sm text-muted">{v}</span> },
  { key: 'site', label: 'Site', render: (v) => <span className="text-offwhite text-sm">{v}</span> },
  { key: 'supplier', label: 'Supplier', render: (v) => <span className="text-offwhite text-sm">{v}</span> },
  { key: 'material', label: 'Material', render: (v) => <span className="text-muted text-sm capitalize">{v}</span> },
  { key: 'qty', label: 'Qty', render: (v, row) => <span className="font-mono text-sm text-offwhite">{v} {row.unit}</span> },
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

function normaliseBill(b) {
  return {
    id:        b.id,
    date:      b.log_date ?? b.date ?? '',
    site:      b.site_name ?? b.site ?? '',
    supplier:  b.supplier_name ?? b.supplier ?? '',
    material:  b.material_type ?? b.material ?? '',
    qty:       b.quantity ?? b.qty ?? 0,
    unit:      b.unit ?? '',
    amount:    b.total_amount_lkr ?? b.amount ?? 0,
    has_photo: !!b.bill_photo_url || b.has_photo,
  }
}

export default function BillLogTable({ bills, isLoading }) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ supplier: '', material: '' })
  const data = (bills ?? []).map(normaliseBill)

  const filtered = data.filter((b) => {
    if (filters.supplier && !(b.supplier ?? '').toLowerCase().includes(filters.supplier.toLowerCase())) return false
    if (filters.material && b.material !== filters.material) return false
    return true
  })

  const totalAmount = filtered.reduce((s, b) => s + Number(b.amount), 0)
  const materials = [...new Set(data.map(b => b.material).filter(Boolean))]

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <input
          className="input-field"
          style={{ maxWidth: 200 }}
          placeholder="Filter by supplier…"
          value={filters.supplier}
          onChange={(e) => setFilters(f => ({ ...f, supplier: e.target.value }))}
        />
        <select
          className="input-field"
          style={{ maxWidth: 180 }}
          value={filters.material}
          onChange={(e) => setFilters(f => ({ ...f, material: e.target.value }))}
        >
          <option value="">All materials</option>
          {materials.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          onClick={() => setFilters({ supplier: '', material: '' })}
          className="btn-outline text-xs"
        >
          Clear
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-muted text-sm">{filtered.length} records</span>
          <span className="text-gold font-mono font-semibold text-sm">{formatLKR(totalAmount)}</span>
        </div>
      </div>

      <div className="border border-navy-light rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          keyField="id"
          onRowClick={(row) => navigate(`/dashboard/finances/bills/${row.id}`)}
          emptyTitle="No bills found"
          emptyDescription="Adjust your filters or check back when managers upload receipts."
        />
      </div>
    </div>
  )
}
