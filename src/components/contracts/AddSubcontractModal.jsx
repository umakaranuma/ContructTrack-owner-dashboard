import { useState } from 'react'

export default function AddSubcontractModal({ initial, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    company_name:        initial?.company_name        ?? '',
    contact_person:      initial?.contact_person      ?? '',
    contact_phone:       initial?.contact_phone       ?? '',
    scope_of_work:       initial?.scope_of_work       ?? '',
    contract_value_lkr:  initial?.contract_value_lkr  ?? '',
    start_date:          initial?.start_date          ?? '',
    end_date:            initial?.end_date            ?? '',
    status:              initial?.status              ?? 'active',
    notes:               initial?.notes              ?? '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      contract_value_lkr: Number(form.contract_value_lkr),
      start_date: form.start_date || null,
      end_date:   form.end_date   || null,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-syne font-bold text-offwhite text-lg">
            {initial ? 'Edit Subcontract' : 'Add Subcontract'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-offwhite transition-colors text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Company / Contractor Name *</label>
            <input
              className="input-field w-full"
              value={form.company_name}
              onChange={e => set('company_name', e.target.value)}
              placeholder="e.g. Silva Electrical Works"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Contact Person</label>
              <input
                className="input-field w-full"
                value={form.contact_person}
                onChange={e => set('contact_person', e.target.value)}
                placeholder="Name"
              />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input
                className="input-field w-full"
                type="tel"
                value={form.contact_phone}
                onChange={e => set('contact_phone', e.target.value)}
                placeholder="07X XXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Scope of Work *</label>
            <input
              className="input-field w-full"
              value={form.scope_of_work}
              onChange={e => set('scope_of_work', e.target.value)}
              placeholder="e.g. Full electrical wiring — floors 1–3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Subcontract Value (LKR) *</label>
              <input
                className="input-field w-full"
                type="number"
                min="0"
                step="0.01"
                value={form.contract_value_lkr}
                onChange={e => set('contract_value_lkr', e.target.value)}
                placeholder="e.g. 1000000"
                required
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Start Date</label>
              <input className="input-field w-full" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="input-field w-full" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Payment terms, warranty period, etc."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving…' : initial ? 'Save Changes' : 'Create Subcontract'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
