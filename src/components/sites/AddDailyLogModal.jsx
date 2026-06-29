import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import CreatableCombobox from '../ui/CreatableCombobox'
import { useCreateDailyLog } from '../../hooks/useSites'
import {
  STAGE_OPTIONS,
  TOMORROW_STATUS_OPTIONS,
  mergeOptions,
  stageDisplay,
  optionLabel,
} from '../../constants/dailyLogOptions'

const EMPTY_FORM = {
  log_date: '',
  stage: '',
  work_done_today: '',
  tomorrow_status: 'working',
}

export default function AddDailyLogModal({ siteId, currentStage, isOpen, onClose }) {
  const createLog = useCreateDailyLog(siteId)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const stageOptions = useMemo(
    () => mergeOptions(STAGE_OPTIONS, 'daily_log_stage'),
    [isOpen],
  )
  const tomorrowOptions = useMemo(
    () => mergeOptions(TOMORROW_STATUS_OPTIONS, 'daily_log_tomorrow'),
    [isOpen],
  )

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setForm({
      log_date: new Date().toISOString().slice(0, 10),
      stage: currentStage || 'foundation',
      work_done_today: '',
      tomorrow_status: 'working',
    })
  }, [isOpen, currentStage])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.log_date) {
      setError('Select a date for this log.')
      return
    }
    if (!form.work_done_today.trim()) {
      setError('Describe the work completed today.')
      return
    }
    if (!form.stage?.trim()) {
      setError('Select or enter a construction stage.')
      return
    }
    if (!form.tomorrow_status?.trim()) {
      setError('Select or enter tomorrow\'s status.')
      return
    }
    try {
      await createLog.mutateAsync(form)
      onClose()
    } catch (err) {
      const detail = err.response?.data?.result
      const fieldMsg = detail && typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : ''
      setError(err.response?.data?.message || fieldMsg || 'Failed to save daily log.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Daily Log" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Log date</label>
            <input
              type="date"
              className="input w-full"
              value={form.log_date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('log_date', e.target.value)}
            />
            <p className="text-muted text-xs mt-1">One log per site per day</p>
          </div>

          <CreatableCombobox
            label="Construction stage"
            placeholder="Select stage or type custom…"
            value={form.stage}
            onChange={(v) => set('stage', v)}
            options={stageOptions}
            storageKey="daily_log_stage"
            maxLength={30}
          />
        </div>

        <div>
          <label className="label">Work done today</label>
          <textarea
            className="input w-full min-h-[110px]"
            value={form.work_done_today}
            onChange={(e) => set('work_done_today', e.target.value)}
            placeholder="Describe progress, materials used, blockers…"
          />
        </div>

        <CreatableCombobox
          label="Tomorrow status"
          placeholder="Select status or type custom…"
          value={form.tomorrow_status}
          onChange={(v) => set('tomorrow_status', v)}
          options={tomorrowOptions}
          storageKey="daily_log_tomorrow"
          maxLength={100}
        />

        {(form.stage || form.tomorrow_status) && (
          <div className="rounded-lg border border-navy-light bg-navy-primary/50 px-4 py-3 text-sm">
            <p className="text-muted text-xs uppercase tracking-wider mb-2">Summary</p>
            <p className="text-offwhite">
              <span className="text-muted">Stage:</span>{' '}
              {stageDisplay(form.stage)}
              {' · '}
              <span className="text-muted">Tomorrow:</span>{' '}
              {optionLabel(form.tomorrow_status, tomorrowOptions)}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={createLog.isPending}>
            {createLog.isPending ? 'Saving…' : 'Save Daily Log'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
