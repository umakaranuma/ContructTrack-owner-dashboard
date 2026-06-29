import { useState } from 'react'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'
import LoadingSpinner from '../ui/LoadingSpinner'

// ─── BillPhotoGrid ─────────────────────────────────────────────────────────────
// 3-column photo grid for bill receipts. Each tile shows date, supplier, amount.
// Clicking a tile opens a lightbox with full details.
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_PHOTO = 'https://placehold.co/400x300/112240/C9A84C?text=Bill+Receipt'

const MATERIAL_LABELS = {
  cement: 'Cement', sand: 'Sand', steel: 'Steel', blocks: 'Blocks',
  aggregate: 'Aggregate', pipes: 'Pipes', timber: 'Timber', bricks: 'Bricks',
  roofing: 'Roofing', electrical: 'Electrical', plumbing: 'Plumbing',
  tiles: 'Tiles', paint: 'Paint', other: 'Other',
}

function normalizeBill(raw) {
  const amount = Number(raw.amount ?? raw.total_amount_lkr ?? 0)
  const mat = raw.material ?? raw.material_type ?? ''
  return {
    id: raw.id,
    date: raw.date ?? raw.log_date ?? '',
    supplier: raw.supplier ?? raw.supplier_name ?? 'Unknown supplier',
    amount: Number.isFinite(amount) ? amount : 0,
    material: MATERIAL_LABELS[mat] ?? mat ?? '—',
    photo_url: raw.photo_url ?? raw.bill_photo_url ?? PLACEHOLDER_PHOTO,
  }
}

function formatLKR(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return 'LKR —'
  return `LKR ${num.toLocaleString()}`
}

export default function BillPhotoGrid({ bills, isLoading, filters, onFilterChange }) {
  const [lightbox, setLightbox] = useState(null)
  const displayBills = (bills ?? []).map(normalizeBill)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  if (!displayBills.length) {
    return (
      <EmptyState
        title="No bills uploaded"
        description="Bill photos will appear here once managers upload receipts."
        icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />
    )
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Supplier name…"
          className="input"
          style={{ maxWidth: 200 }}
          onChange={(e) => onFilterChange?.({ supplier: e.target.value })}
        />
        <div className="relative">
          <select className="select" style={{ maxWidth: 160 }} onChange={(e) => onFilterChange?.({ material: e.target.value })}>
            <option value="">All materials</option>
            {['Cement','Steel Rod','Sand','Tiles','Paint','Timber'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <input type="date" className="input" style={{ maxWidth: 160 }} onChange={(e) => onFilterChange?.({ from: e.target.value })} />
        <input type="date" className="input" style={{ maxWidth: 160 }} onChange={(e) => onFilterChange?.({ to: e.target.value })} />
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-4">
        {displayBills.map((bill) => (
          <div
            key={bill.id}
            onClick={() => setLightbox(bill)}
            className="relative rounded-xl overflow-hidden cursor-pointer group border border-navy-light hover:border-gold/40 transition-colors bg-navy-primary aspect-[4/3]"
          >
            <img
              src={bill.photo_url}
              alt={`Bill from ${bill.supplier}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-semibold text-offwhite text-sm truncate">{bill.supplier}</p>
              <div className="flex items-center justify-between">
                <span className="text-muted text-xs">{bill.date}</span>
                <span className="font-mono text-gold text-xs font-semibold">{formatLKR(bill.amount)}</span>
              </div>
            </div>
            {/* Zoom icon */}
            <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-navy-secondary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Modal isOpen={!!lightbox} onClose={() => setLightbox(null)} title="Bill Receipt" size="lg">
        {lightbox && (
          <div className="p-6">
            <img
              src={lightbox.photo_url}
              alt="Bill receipt"
              className="w-full rounded-xl mb-4 border border-navy-light"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Supplier</label>
                <p className="text-offwhite font-medium">{lightbox.supplier}</p>
              </div>
              <div>
                <label className="label">Material</label>
                <p className="text-offwhite font-medium">{lightbox.material}</p>
              </div>
              <div>
                <label className="label">Amount</label>
                <p className="text-gold font-mono font-bold text-lg">{formatLKR(lightbox.amount)}</p>
              </div>
              <div>
                <label className="label">Date</label>
                <p className="text-offwhite font-mono">{lightbox.date}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
