import { useState } from 'react'
import Modal from '../ui/Modal'
import { useCreateDailyLog } from '../../hooks/useSites'
import { CONSTRUCTION_STAGES } from '../../constants/stages'

const TOMORROW_OPTIONS = [
  { value: 'working', label: 'Working' },
  { value: 'rain_hold', label: 'Rain Hold' },
  { value: 'material_wait', label: 'Waiting for Materials' },
  { value: 'awaiting_owner', label: 'Awaiting Owner' },
]

export default function AddDailyLogModal({ siteId, currentStage, isOpen, onClose }) {
  const createLog = useCreateDailyLog(siteId)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    log_date: new Date().toISOString().slice(0, 10),
    stage: currentStage || 'foundation',
    work_done_today: '',
    tomorrow_status: 'working',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.work_done_today.trim()) {
      setError('Describe the work completed today.')
      return
    }
    try {
      await createLog.mutateAsync(form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save daily log.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Daily Log" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-full" value={form.log_date} onChange={(e) => set('log_date', e.target.value)} />
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="select w-full" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
              {CONSTRUCTION_STAGES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Work done today</label>
            <textarea
              className="input w-full min-h-[100px]"
              value={form.work_done_today}
              onChange={(e) => set('work_done_today', e.target.value)}
              placeholder="Describe progress, materials used, blockers…"
            />
          </div>
          <div>
            <label className="label">Tomorrow status</label>
            <select className="select w-full" value={form.tomorrow_status} onChange={(e) => set('tomorrow_status', e.target.value)}>
              {TOMORROW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={createLog.isPending}>
            {createLog.isPending ? 'Saving…' : 'Save Log'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
