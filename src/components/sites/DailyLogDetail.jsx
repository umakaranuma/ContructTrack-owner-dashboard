import Modal from '../ui/Modal'
import { stageLabel } from '../../constants/stages'
import { optionLabel, TOMORROW_STATUS_OPTIONS } from '../../constants/dailyLogOptions'

function formatLKR(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-off-white text-sm text-right font-mono">{value ?? '—'}</span>
    </div>
  )
}

export default function DailyLogDetail({ log, onClose }) {
  if (!log) return null

  return (
    <Modal isOpen onClose={onClose} title={`Daily Log — ${log.date ?? log.log_date}`} size="md">
      <div className="p-6 space-y-4">
        <DetailRow label="Date" value={log.date ?? log.log_date} />
        <DetailRow label="Manager" value={log.manager ?? log.manager_name ?? log.logged_by_name} />
        <DetailRow label="Stage" value={stageLabel(log.stage)} />
        <DetailRow label="Tomorrow status" value={optionLabel(log.tomorrow_status, TOMORROW_STATUS_OPTIONS)} />
        <DetailRow label="Materials In" value={`${log.materials_in ?? 0} items`} />
        <DetailRow label="Materials Out" value={`${log.materials_out ?? 0} items`} />
        <DetailRow label="Workers Present" value={log.workers ?? log.workers_present} />
        <DetailRow label="Total Wage" value={formatLKR(log.total_wage ?? log.total_wage_lkr)} />
        {(log.work_done_today || log.notes) && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Work done today</p>
            <p className="text-off-white text-sm leading-relaxed">{log.work_done_today ?? log.notes}</p>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-outline text-sm">Close</button>
        </div>
      </div>
    </Modal>
  )
}
