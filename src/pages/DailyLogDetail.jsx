import { Link, useParams } from 'react-router-dom'
import { useDailyLogDetail } from '../hooks/useSites'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { stageLabel } from '../constants/stages'
import { optionLabel, TOMORROW_STATUS_OPTIONS } from '../constants/dailyLogOptions'

const PLACEHOLDER_BILL = 'https://placehold.co/400x300/112240/C9A84C?text=Bill+Receipt'
const PLACEHOLDER_PHOTO = 'https://placehold.co/600x400/0A1628/C9A84C?text=Progress+Photo'

function formatLKR(n = 0) {
  return `LKR ${Number(n).toLocaleString('en-LK')}`
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return d
  }
}

function formatTime(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function Section({ title, count, children, empty }) {
  if (empty) return null
  return (
    <div className="card border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        {count != null && (
          <span className="text-muted text-xs font-mono bg-navy-primary px-2 py-1 rounded-full border border-navy-light">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

const STATUS_LABELS = { present: 'Present', half: 'Half Day', absent: 'Absent' }

export default function DailyLogDetailPage() {
  const { siteId, logId } = useParams()
  const { data: log, isLoading, isError } = useDailyLogDetail(siteId, logId)

  if (isLoading) return <PageLoader />

  if (isError || !log) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Daily log not found.</p>
        <Link to={`/dashboard/sites/${siteId}`} className="text-gold text-sm hover:underline">
          ← Back to site
        </Link>
      </div>
    )
  }

  const hasAttendance = log.attendance?.length > 0
  const hasBills = log.bills?.length > 0
  const hasPhotos = log.photos?.length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          to={`/dashboard/sites/${siteId}`}
          className="text-muted hover:text-gold text-sm transition-colors"
        >
          ← Back to {log.site_name}
        </Link>
        <h1 className="page-title mt-2">Daily Log</h1>
        <p className="text-muted text-sm mt-1">{formatDate(log.log_date)}</p>
      </div>

      {/* Log entry — what was submitted in the form */}
      <div className="card border border-white/5 p-5 space-y-4">
        <h2 className="section-title">Log Entry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Stage</p>
            <p className="text-offwhite">{stageLabel(log.stage)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Tomorrow status</p>
            <p className="text-offwhite">{optionLabel(log.tomorrow_status, TOMORROW_STATUS_OPTIONS)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Submitted by</p>
            <p className="text-offwhite">{log.manager ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Submitted at</p>
            <p className="text-offwhite font-mono text-xs">
              {log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : '—'}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-white/5">
          <p className="text-muted text-xs uppercase tracking-wider mb-2">Work done today</p>
          <p className="text-offwhite text-sm leading-relaxed whitespace-pre-wrap">
            {log.work_done_today || '—'}
          </p>
        </div>
        {log.blockers && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Blocker</p>
            <p className="text-amber-400 text-sm">{log.blockers.replace(/_/g, ' ')}</p>
            {log.blocker_note && <p className="text-muted text-sm mt-1">{log.blocker_note}</p>}
          </div>
        )}
      </div>

      {/* Same-day attendance */}
      <Section title="Workers & Attendance" count={log.attendance?.length} empty={!hasAttendance}>
        {log.attendance_summary && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Present', value: log.attendance_summary.total_present, color: 'text-green-400' },
              { label: 'Half day', value: log.attendance_summary.total_half, color: 'text-amber-400' },
              { label: 'Absent', value: log.attendance_summary.total_absent, color: 'text-red-400' },
              { label: 'Total wage', value: formatLKR(log.attendance_summary.total_wage_lkr), color: 'text-gold' },
            ].map((s) => (
              <div key={s.label} className="bg-navy-primary rounded-lg p-3 border border-navy-light text-center">
                <p className="text-muted text-[10px] uppercase tracking-wider">{s.label}</p>
                <p className={`font-mono font-semibold text-sm mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="overflow-x-auto rounded-xl border border-navy-light">
          <table className="w-full text-sm">
            <thead className="bg-navy-primary text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Worker</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">OT</th>
                <th className="text-right px-4 py-3">Earned</th>
                <th className="text-right px-4 py-3">Paid</th>
              </tr>
            </thead>
            <tbody>
              {log.attendance.map((row) => (
                <tr key={row.id} className="border-t border-navy-light/50">
                  <td className="px-4 py-3">
                    <p className="text-offwhite font-medium">{row.worker_name}</p>
                    <p className="text-muted text-xs">{row.role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      row.status === 'present' ? 'border-green-500/30 text-green-400 bg-green-500/10'
                        : row.status === 'half' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                          : 'border-red-500/30 text-red-400 bg-red-500/10'
                    }`}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">{row.overtime_hours}h</td>
                  <td className="px-4 py-3 font-mono text-offwhite text-right">{formatLKR(row.total_earned_lkr)}</td>
                  <td className="px-4 py-3 text-right">
                    {row.is_paid
                      ? <span className="text-green-400 text-xs">Paid</span>
                      : <span className="text-muted text-xs">Unpaid</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Same-day bills */}
      <Section title="Bills & Receipts" count={log.bills?.length} empty={!hasBills}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {log.bills.map((bill) => (
            <div key={bill.id} className="rounded-xl border border-navy-light overflow-hidden bg-navy-primary">
              <div className="aspect-video bg-navy-secondary">
                <img
                  src={bill.bill_photo_url || PLACEHOLDER_BILL}
                  alt={bill.supplier_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-offwhite font-medium text-sm truncate">{bill.supplier_name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-muted text-xs">{bill.material_label}</span>
                  <span className="font-mono text-gold text-sm font-semibold">{formatLKR(bill.total_amount_lkr)}</span>
                </div>
                <p className="text-muted text-[10px] mt-1 capitalize">{bill.payment_method?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Progress photos for this log */}
      <Section title="Progress Photos" count={log.photos?.length} empty={!hasPhotos}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {log.photos.map((photo) => (
            <div key={photo.id} className="rounded-xl overflow-hidden border border-navy-light group">
              <div className="aspect-video relative">
                <img
                  src={photo.photo_url || PLACEHOLDER_PHOTO}
                  alt={photo.caption || 'Progress photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-navy-primary/90 to-transparent">
                  <p className="text-offwhite text-xs truncate">{photo.caption || 'Progress photo'}</p>
                  <p className="text-muted text-[10px] font-mono">{formatTime(photo.taken_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {!hasAttendance && !hasBills && !hasPhotos && (
        <div className="text-center py-8 text-muted text-sm border border-dashed border-navy-light rounded-xl">
          No attendance, bills, or progress photos recorded for this date yet.
        </div>
      )}
    </div>
  )
}
