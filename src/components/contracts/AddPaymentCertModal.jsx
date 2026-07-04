import { useState } from 'react'
import { CONSTRUCTION_STAGES } from '../../constants/stages'

const STAGE_OPTIONS = CONSTRUCTION_STAGES.map(s => s.label)

export default function AddPaymentCertModal({ initial, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    cert_number:      initial?.cert_number      ?? '',
    amount_lkr:       initial?.amount_lkr       ?? '',
    stage_milestone:  initial?.stage_milestone  ?? '',
    status:           initial?.status           ?? 'pending',
    submitted_date:   initial?.submitted_date   ?? '',
    received_date:    initial?.received_date    ?? '',
    notes:            initial?.notes            ?? '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      cert_number:  form.cert_number  ? Number(form.cert_number)  : undefined,
      amount_lkr:   Number(form.amount_lkr),
      submitted_date: form.submitted_date || null,
      received_date:  form.received_date  || null,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-syne font-bold text-offwhite text-lg">
            {initial ? 'Edit Certificate' : 'Add Payment Certificate'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-offwhite transition-colors text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Cert # (auto if blank)</label>
              <input
                className="input-field w-full"
                type="number"
                min="1"
                value={form.cert_number}
                onChange={e => set('cert_number', e.target.value)}
                placeholder="Auto"
              />
            </div>
            <div>
              <label className="form-label">Amount (LKR) *</label>
              <input
                className="input-field w-full"
                type="number"
                min="0"
                step="0.01"
                value={form.amount_lkr}
                onChange={e => set('amount_lkr', e.target.value)}
                placeholder="e.g. 4000000"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Stage / Milestone</label>
            <input
              className="input-field w-full"
              list="stage-options"
              value={form.stage_milestone}
              onChange={e => set('stage_milestone', e.target.value)}
              placeholder="e.g. Foundation complete"
            />
            <datalist id="stage-options">
              {STAGE_OPTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="pending">Pending — not yet submitted</option>
              <option value="submitted">Submitted — waiting for client payment</option>
              <option value="received">Received — payment in bank</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Submitted Date</label>
              <input
                className="input-field w-full"
                type="date"
                value={form.submitted_date}
                onChange={e => set('submitted_date', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Received Date</label>
              <input
                className="input-field w-full"
                type="date"
                value={form.received_date}
                onChange={e => set('received_date', e.target.value)}
                disabled={form.status !== 'received'}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Retention %, deductions, reference number…"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving…' : initial ? 'Save Changes' : 'Add Certificate'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
