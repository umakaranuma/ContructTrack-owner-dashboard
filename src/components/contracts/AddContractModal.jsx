import { useState } from 'react'

export default function AddContractModal({ initial, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    client_name:         initial?.client_name         ?? '',
    contract_value_lkr:  initial?.contract_value_lkr  ?? '',
    contract_date:       initial?.contract_date        ?? new Date().toISOString().split('T')[0],
    status:              initial?.status               ?? 'active',
    notes:               initial?.notes               ?? '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      contract_value_lkr: Number(form.contract_value_lkr),
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-syne font-bold text-offwhite text-lg">
            {initial ? 'Edit Contract' : 'Add Client Contract'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-offwhite transition-colors text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Client / Developer Name *</label>
            <input
              className="input-field w-full"
              value={form.client_name}
              onChange={e => set('client_name', e.target.value)}
              placeholder="e.g. Perera & Sons Ltd"
              required
            />
          </div>

          <div>
            <label className="form-label">Contract Value (LKR) *</label>
            <input
              className="input-field w-full"
              type="number"
              min="0"
              step="0.01"
              value={form.contract_value_lkr}
              onChange={e => set('contract_value_lkr', e.target.value)}
              placeholder="e.g. 20000000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Contract Date *</label>
              <input
                className="input-field w-full"
                type="date"
                value={form.contract_date}
                onChange={e => set('contract_date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional details…"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving…' : initial ? 'Save Changes' : 'Create Contract'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
