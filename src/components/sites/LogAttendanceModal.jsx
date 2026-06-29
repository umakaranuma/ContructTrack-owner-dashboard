import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useSiteWorkers, useSubmitAttendance, useCreateWorker } from '../../hooks/useSites'

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'half', label: 'Half Day' },
  { value: 'absent', label: 'Absent' },
]

const ROLE_SUGGESTIONS = [
  'mason', 'helper', 'labourer', 'carpenter', 'electrician',
  'plumber', 'operator', 'bar_bender', 'supervisor',
]

const EMPTY_WORKER = { full_name: '', role: 'labourer', daily_rate_lkr: '' }

export default function LogAttendanceModal({
  siteId,
  isOpen,
  onClose,
  defaultDate,
  lockDate = false,
  existingAttendance = [],
}) {
  const { data: workersData, isLoading, refetch } = useSiteWorkers(siteId, { enabled: isOpen })
  const submitAttendance = useSubmitAttendance(siteId)
  const createWorker = useCreateWorker(siteId)

  const [error, setError] = useState('')
  const [logDate, setLogDate] = useState(defaultDate || new Date().toISOString().slice(0, 10))
  const [isRainDay, setIsRainDay] = useState(false)
  const [records, setRecords] = useState({})
  const [included, setIncluded] = useState({})
  const [search, setSearch] = useState('')
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [newWorker, setNewWorker] = useState(EMPTY_WORKER)
  const [addError, setAddError] = useState('')

  const workers = Array.isArray(workersData) ? workersData : workersData?.results ?? []

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setAddError('')
    setSearch('')
    setShowAddWorker(false)
    setNewWorker(EMPTY_WORKER)
    setLogDate(defaultDate || new Date().toISOString().slice(0, 10))
  }, [isOpen, defaultDate])

  useEffect(() => {
    if (!isOpen || isLoading) return

    const existingByWorker = Object.fromEntries(
      (existingAttendance || []).map((r) => [r.worker_id, r]),
    )

    const nextRecords = {}
    const nextIncluded = {}

    for (const w of workers) {
      const ex = existingByWorker[w.id]
      nextRecords[w.id] = {
        status: ex?.status ?? 'present',
        overtime_hours: ex?.overtime_hours ?? 0,
      }
      // Only pre-select workers already marked for this day
      nextIncluded[w.id] = !!ex
    }

    setRecords(nextRecords)
    setIncluded(nextIncluded)
  }, [workers, isOpen, isLoading, existingAttendance])

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return workers
    return workers.filter(
      (w) => w.full_name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q),
    )
  })

  const includedWorkers = workers.filter((w) => included[w.id])

  const summary = useMemo(() => {
    let present = 0
    let half = 0
    let absent = 0
    for (const w of includedWorkers) {
      const st = records[w.id]?.status ?? 'present'
      if (st === 'present') present += 1
      else if (st === 'half') half += 1
      else absent += 1
    }
    return { present, half, absent, total: includedWorkers.length }
  }, [includedWorkers, records])

  const setWorker = (id, field, val) => {
    setRecords((r) => ({ ...r, [id]: { ...r[id], [field]: val } }))
    setIncluded((inc) => ({ ...inc, [id]: true }))
  }

  const toggleInclude = (id) => {
    setIncluded((inc) => ({ ...inc, [id]: !inc[id] }))
  }

  const markAll = (status) => {
    const next = { ...records }
    const nextInc = { ...included }
    for (const w of workers) {
      next[w.id] = { ...next[w.id], status, overtime_hours: next[w.id]?.overtime_hours ?? 0 }
      nextInc[w.id] = true
    }
    setRecords(next)
    setIncluded(nextInc)
  }

  const handleAddWorker = async (e) => {
    e.preventDefault()
    setAddError('')
    if (!newWorker.full_name.trim()) {
      setAddError('Worker name is required.')
      return
    }
    const rate = Number(newWorker.daily_rate_lkr)
    if (!rate || rate <= 0) {
      setAddError('Enter a valid daily rate (LKR).')
      return
    }
    try {
      const created = await createWorker.mutateAsync({
        full_name: newWorker.full_name.trim(),
        role: newWorker.role.trim() || 'labourer',
        daily_rate_lkr: rate,
        contract_type: 'daily',
      })
      await refetch()
      const id = created?.id
      if (id) {
        setRecords((r) => ({ ...r, [id]: { status: 'present', overtime_hours: 0 } }))
        setIncluded((inc) => ({ ...inc, [id]: true }))
      }
      setNewWorker(EMPTY_WORKER)
      setShowAddWorker(false)
    } catch (err) {
      setAddError(err.response?.data?.message || 'Could not add worker.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const selected = workers.filter((w) => included[w.id])
    if (!selected.length) {
      setError('Select at least one worker for this day, or add a new worker.')
      return
    }
    const payload = {
      log_date: logDate,
      is_rain_day: isRainDay,
      records: selected.map((w) => ({
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

        {/* Date & options */}
        <div className="flex flex-wrap items-end gap-4 mb-5 pb-5 border-b border-navy-light">
          <div>
            <label className="label">Attendance date</label>
            <input
              type="date"
              className="input"
              value={logDate}
              disabled={lockDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
            {lockDate && (
              <p className="text-muted text-xs mt-1">Fixed to this daily log date</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-offwhite cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={isRainDay}
              onChange={(e) => setIsRainDay(e.target.checked)}
              className="rounded"
            />
            Rain day (reduced work)
          </label>
          <div className="flex gap-2 ml-auto">
            <button type="button" className="btn-ghost text-xs" onClick={() => markAll('present')}>
              All present
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => markAll('absent')}>
              All absent
            </button>
          </div>
        </div>

        {/* Add new worker — workers change day to day */}
        <div className="mb-5">
          {!showAddWorker ? (
            <button
              type="button"
              className="btn-outline text-xs w-full sm:w-auto"
              onClick={() => setShowAddWorker(true)}
            >
              + Add new worker for today
            </button>
          ) : (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-offwhite text-sm font-medium">New worker on site today</p>
                <button type="button" className="text-muted text-xs hover:text-offwhite" onClick={() => setShowAddWorker(false)}>
                  Cancel
                </button>
              </div>
              {addError && <p className="text-red-400 text-xs">{addError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Full name</label>
                  <input
                    className="input w-full"
                    placeholder="e.g. Roshan Silva"
                    value={newWorker.full_name}
                    onChange={(e) => setNewWorker((w) => ({ ...w, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    className="input w-full"
                    list="worker-roles"
                    placeholder="e.g. mason"
                    value={newWorker.role}
                    onChange={(e) => setNewWorker((w) => ({ ...w, role: e.target.value }))}
                  />
                  <datalist id="worker-roles">
                    {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Daily rate (LKR)</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="4500"
                    value={newWorker.daily_rate_lkr}
                    onChange={(e) => setNewWorker((w) => ({ ...w, daily_rate_lkr: e.target.value }))}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={createWorker.isPending}
                onClick={handleAddWorker}
              >
                {createWorker.isPending ? 'Adding…' : 'Add to roster & mark present'}
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading site workers…" />
        ) : !workers.length ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-navy-light mb-5">
            <p className="text-muted text-sm mb-2">No workers on this site yet.</p>
            <p className="text-muted text-xs">Use &quot;Add new worker for today&quot; above to register the first worker.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <input
                type="search"
                className="input flex-1 min-w-[180px]"
                placeholder="Search workers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <p className="text-muted text-xs font-mono">
                {summary.present} present · {summary.half} half · {summary.absent} absent
              </p>
            </div>

            <p className="text-muted text-xs mb-2">
              Tick workers who were on site this day. Unticked workers are excluded from this submission.
            </p>

            <div className="border border-navy-light rounded-xl overflow-hidden mb-5 max-h-[340px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-primary text-muted text-xs uppercase sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-3 py-3 w-10">On site</th>
                    <th className="text-left px-3 py-3">Worker</th>
                    <th className="text-left px-3 py-3">Status</th>
                    <th className="text-left px-3 py-3">OT (hrs)</th>
                    <th className="text-right px-3 py-3 hidden sm:table-cell">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((w) => {
                    const isOn = included[w.id]
                    return (
                      <tr
                        key={w.id}
                        className={`border-t border-navy-light/50 transition-colors ${isOn ? '' : 'opacity-45'}`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={!!isOn}
                            onChange={() => toggleInclude(w.id)}
                            className="rounded"
                            aria-label={`Include ${w.full_name}`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-offwhite font-medium">{w.full_name}</p>
                          <p className="text-muted text-xs capitalize">{w.role?.replace(/_/g, ' ')}</p>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            className="select text-xs"
                            disabled={!isOn}
                            value={records[w.id]?.status ?? 'present'}
                            onChange={(e) => setWorker(w.id, 'status', e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            disabled={!isOn}
                            className="input w-16 text-xs"
                            value={records[w.id]?.overtime_hours ?? 0}
                            onChange={(e) => setWorker(w.id, 'overtime_hours', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-muted text-xs hidden sm:table-cell">
                          {Number(w.daily_rate_lkr).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!filteredWorkers.length && (
                <p className="text-center text-muted text-sm py-8">No workers match your search.</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-navy-light">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitAttendance.isPending || (!workers.length && !showAddWorker)}
          >
            {submitAttendance.isPending ? 'Saving…' : `Save attendance (${summary.total} workers)`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
