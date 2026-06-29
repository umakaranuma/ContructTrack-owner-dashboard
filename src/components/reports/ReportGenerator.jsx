import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import SiteFilter from '../ui/SiteFilter'
import { reportService } from '../../services/reportService'
import { useReportStatus } from '../../hooks/useReports'

function defaultDateRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmt = (d) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

export default function ReportGenerator({ report, onClose, defaultSiteId = '' }) {
  const [siteId, setSiteId] = useState(defaultSiteId)
  const [dateFrom, setDateFrom] = useState(() => defaultDateRange().from)
  const [dateTo, setDateTo] = useState(() => defaultDateRange().to)
  const [format, setFormat] = useState(report?.format?.[0] ?? 'pdf')
  const [jobId, setJobId] = useState(null)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  const { data: statusData } = useReportStatus(jobId, !!jobId)

  useEffect(() => {
    if (statusData?.status === 'ready' && statusData?.file_url) {
      window.open(statusData.file_url, '_blank')
      setJobId(null)
      setGenerating(false)
    }
    if (statusData?.status === 'failed') {
      setError('Report generation failed. Please try again.')
      setJobId(null)
      setGenerating(false)
    }
  }, [statusData])

  if (!report) return null

  const handleGenerate = async () => {
    setError(null)
    setGenerating(true)
    try {
      const payload = {
        report_type: report.id,
        date_from: dateFrom,
        date_to: dateTo,
        format,
      }
      if (siteId) payload.site = siteId

      const result = await reportService.generateReport(payload)
      setJobId(result.id)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to queue report generation.')
      setGenerating(false)
    }
  }

  const isPolling = generating && jobId && statusData?.status !== 'ready'

  return (
    <Modal isOpen onClose={onClose} title={report.title} size="lg">
      <div className="p-6 space-y-5">
        <p className="text-muted text-sm leading-relaxed">{report.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SiteFilter
            value={siteId}
            onChange={setSiteId}
            label="Site"
            className="sm:col-span-2"
          />
          <div>
            <label className="form-label">From date</label>
            <input
              type="date"
              className="input-field w-full"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">To date</label>
            <input
              type="date"
              className="input-field w-full"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
          {report.format?.length > 1 && (
            <div>
              <label className="form-label">Format</label>
              <select
                className="input-field w-full"
                value={format}
                onChange={e => setFormat(e.target.value)}
              >
                {report.format.map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={generating || isPolling || !dateFrom || !dateTo}
            className="btn-primary flex items-center gap-2"
          >
            {(generating || isPolling) && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isPolling ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
