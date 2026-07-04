import { useState } from 'react'

function fmt(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

export default function AddSubPaymentModal({ subcontract, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    amount_lkr:      '',
    payment_date:    new Date().toISOString().split('T')[0],
    payment_method:  'bank_transfer',
    reference_no:    '',
    notes:           '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const maxAmount = subcontract?.balance_lkr ?? 0

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, amount_lkr: Number(form.amount_lkr) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-offwhite text-lg">Record Payment</h2>
          <button onClick={onClose} className="text-muted hover:text-offwhite transition-colors text-xl leading-none">✕</button>
        </div>

        {/* Sub summary */}
        <div className="bg-navy-primary rounded-lg p-3 mb-5 flex gap-4 text-sm">
          <div>
            <p className="text-muted text-xs mb-0.5">Subcontractor</p>
            <p className="text-offwhite font-medium">{subcontract?.company_name}</p>
          </div>
          <div>
            <p className="text-muted text-xs mb-0.5">Balance Due</p>
            <p className="text-amber-400 font-mono font-semibold">{fmt(maxAmount)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Amount (LKR) *</label>
            <input
              className="input-field w-full"
              type="number"
              min="1"
              max={maxAmount}
              step="0.01"
              value={form.amount_lkr}
              onChange={e => set('amount_lkr', e.target.value)}
              placeholder={`Max ${fmt(maxAmount)}`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Payment Date *</label>
              <input
                className="input-field w-full"
                type="date"
                value={form.payment_date}
                onChange={e => set('payment_date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Method</label>
              <select className="input-field w-full" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Reference / Cheque No.</label>
            <input
              className="input-field w-full"
              value={form.reference_no}
              onChange={e => set('reference_no', e.target.value)}
              placeholder="e.g. TXN-2025-001"
            />
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Record Payment'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
