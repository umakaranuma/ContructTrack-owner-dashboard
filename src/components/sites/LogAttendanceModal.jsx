import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useSiteWorkers, useSubmitAttendance } from '../../hooks/useSites'

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'half', label: 'Half Day' },
  { value: 'absent', label: 'Absent' },
]

export default function LogAttendanceModal({ siteId, isOpen, onClose }) {
  const { data: workersData, isLoading } = useSiteWorkers(siteId, { enabled: isOpen })
  const submitAttendance = useSubmitAttendance(siteId)
  const [error, setError] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [isRainDay, setIsRainDay] = useState(false)
  const [records, setRecords] = useState({})

  const workers = Array.isArray(workersData) ? workersData : workersData?.results ?? []

  useEffect(() => {
    if (!workers.length) return
    const initial = {}
    for (const w of workers) {
      initial[w.id] = { status: 'present', overtime_hours: 0 }
    }
    setRecords(initial)
  }, [workers])

  const setWorker = (id, field, val) => {
    setRecords((r) => ({ ...r, [id]: { ...r[id], [field]: val } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!workers.length) {
      setError('No workers on this site. Add workers first.')
      return
    }
    const payload = {
      log_date: logDate,
      is_rain_day: isRainDay,
      records: workers.map((w) => ({
        worker_id: w.id,
        status: records[w.id]?.status ?? 'present',
        overtime_hours: Number(records[w.id]?.overtime_hours ?? 0),
      })),
    }
    try {
      await submitAttendance.mutateAsync(payload)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Attendance" size="xl">
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-5">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-offwhite mt-6 cursor-pointer">
            <input type="checkbox" checked={isRainDay} onChange={(e) => setIsRainDay(e.target.checked)} className="rounded" />
            Rain day
          </label>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading workers…" />
        ) : !workers.length ? (
          <p className="text-muted text-sm">No workers registered for this site yet.</p>
        ) : (
          <div className="border border-navy-light rounded-xl overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead className="bg-navy-primary text-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Worker</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">OT Hours</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id} className="border-t border-navy-light/50">
                    <td className="px-4 py-3">
                      <p className="text-offwhite font-medium">{w.full_name}</p>
                      <p className="text-muted text-xs">{w.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="select"
                        value={records[w.id]?.status ?? 'present'}
                        onChange={(e) => setWorker(w.id, 'status', e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="input w-20"
                        value={records[w.id]?.overtime_hours ?? 0}
                        onChange={(e) => setWorker(w.id, 'overtime_hours', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitAttendance.isPending || !workers.length}>
            {submitAttendance.isPending ? 'Submitting…' : 'Submit Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
