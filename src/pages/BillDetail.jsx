import { Link, useParams } from 'react-router-dom'
import { useBillDetail } from '../hooks/useFinances'
import { PageLoader } from '../components/ui/LoadingSpinner'

function formatLKR(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className={`text-off-white text-sm text-right ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function BillDetail() {
  const { billId } = useParams()
  const { data: bill, isLoading, isError } = useBillDetail(billId)

  if (isLoading) return <PageLoader />

  if (isError || !bill) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Bill not found.</p>
        <Link to="/dashboard/finances" className="text-gold text-sm hover:underline">← Back to Finances</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/dashboard/finances" className="text-muted hover:text-gold text-sm transition-colors">
          ← Back to Finances
        </Link>
        <h1 className="page-title mt-2">Bill Receipt</h1>
        <p className="text-muted text-sm mt-1">{bill.site_name} · {bill.log_date}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border border-white/5 p-5 space-y-0">
          <h2 className="section-title mb-4">Bill Details</h2>
          <DetailRow label="Site" value={bill.site_name} />
          <DetailRow label="Date" value={bill.log_date} mono />
          <DetailRow label="Supplier" value={bill.supplier_name} />
          <DetailRow label="Material" value={bill.material_type} />
          <DetailRow label="Quantity" value={`${bill.quantity} ${bill.unit}`} mono />
          <DetailRow label="Unit Price" value={formatLKR(bill.unit_price_lkr)} mono />
          <DetailRow label="Total Amount" value={formatLKR(bill.total_amount_lkr)} mono />
          <DetailRow label="Payment Method" value={bill.payment_method} />
          <DetailRow label="Purpose" value={bill.purpose} />
          <DetailRow label="Logged By" value={bill.logged_by_name} />
        </div>

        <div className="card border border-white/5 p-5">
          <h2 className="section-title mb-4">Receipt Photo</h2>
          {bill.bill_photo_url ? (
            <div className="rounded-xl overflow-hidden border border-navy-light aspect-[4/3] bg-navy-primary">
              <img
                src={bill.bill_photo_url}
                alt={`Receipt from ${bill.supplier_name}`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-red-500/30 bg-red-500/5">
              <p className="text-red-400 text-sm">No receipt photo uploaded</p>
            </div>
          )}
          {bill.delivery_vehicle_no && (
            <p className="text-muted text-xs mt-3">Vehicle: {bill.delivery_vehicle_no}</p>
          )}
        </div>
      </div>
    </div>
  )
}
