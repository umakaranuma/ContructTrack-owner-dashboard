import { useState } from 'react'
import Modal from '../ui/Modal'
import { useCreateBill } from '../../hooks/useSites'

const MATERIALS = [
  { value: 'cement', label: 'Cement' },
  { value: 'sand', label: 'Sand' },
  { value: 'steel', label: 'Steel' },
  { value: 'blocks', label: 'Blocks' },
  { value: 'aggregate', label: 'Aggregate' },
  { value: 'tiles', label: 'Tiles' },
  { value: 'paint', label: 'Paint' },
  { value: 'timber', label: 'Timber' },
  { value: 'other', label: 'Other' },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

const PURPOSES = [
  { value: 'foundation', label: 'Foundation' },
  { value: 'columns', label: 'Columns' },
  { value: 'slab', label: 'Slab' },
  { value: 'walls', label: 'Walls' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'other', label: 'Other' },
]

const PLACEHOLDER_PHOTO = 'https://placehold.co/400x300/112240/C9A84C?text=Bill+Receipt'

export default function AddBillModal({ siteId, isOpen, onClose }) {
  const createBill = useCreateBill(siteId)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    supplier_name: '',
    material_type: 'cement',
    quantity: '',
    unit: 'bags',
    unit_price_lkr: '',
    total_amount_lkr: '',
    payment_method: 'cash',
    purpose: 'other',
    log_date: new Date().toISOString().slice(0, 10),
    bill_photo_url: PLACEHOLDER_PHOTO,
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const qty = Number(form.quantity)
    const unitPrice = Number(form.unit_price_lkr)
    const total = form.total_amount_lkr
      ? Number(form.total_amount_lkr)
      : qty * unitPrice

    if (!form.supplier_name.trim()) {
      setError('Supplier name is required.')
      return
    }
    if (!qty || !unitPrice) {
      setError('Quantity and unit price are required.')
      return
    }

    try {
      await createBill.mutateAsync({
        ...form,
        quantity: qty,
        unit_price_lkr: unitPrice,
        total_amount_lkr: total,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bill.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bill / Receipt" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Supplier</label>
            <input className="input w-full" value={form.supplier_name} onChange={(e) => set('supplier_name', e.target.value)} placeholder="e.g. Holcim Lanka" />
          </div>
          <div>
            <label className="label">Material</label>
            <select className="select w-full" value={form.material_type} onChange={(e) => set('material_type', e.target.value)}>
              {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-full" value={form.log_date} onChange={(e) => set('log_date', e.target.value)} />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" step="any" className="input w-full" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
          </div>
          <div>
            <label className="label">Unit</label>
            <input className="input w-full" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="bags, kg, loads…" />
          </div>
          <div>
            <label className="label">Unit Price (LKR)</label>
            <input type="number" className="input w-full" value={form.unit_price_lkr} onChange={(e) => set('unit_price_lkr', e.target.value)} />
          </div>
          <div>
            <label className="label">Total (LKR)</label>
            <input type="number" className="input w-full" value={form.total_amount_lkr} onChange={(e) => set('total_amount_lkr', e.target.value)} placeholder="Auto: qty × price" />
          </div>
          <div>
            <label className="label">Payment</label>
            <select className="select w-full" value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Purpose</label>
            <select className="select w-full" value={form.purpose} onChange={(e) => set('purpose', e.target.value)}>
              {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Receipt photo URL</label>
            <input className="input w-full" value={form.bill_photo_url} onChange={(e) => set('bill_photo_url', e.target.value)} placeholder="Paste Supabase URL or use placeholder" />
            <p className="text-muted text-xs mt-1">A photo URL is required. Use a placeholder for testing.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={createBill.isPending}>
            {createBill.isPending ? 'Saving…' : 'Save Bill'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
