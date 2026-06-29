import api from './api'

// ─── Report Service ────────────────────────────────────────────────────────────
// Handles report generation requests and polling for download links.
// ─────────────────────────────────────────────────────────────────────────────

export const reportService = {
  // Request report generation — returns a job ID
  generateReport: (payload) =>
    api.post('/api/reports/generate/', payload).then((r) => r.data),

  // Poll report job status
  getReportStatus: (jobId) =>
    api.get(`/api/reports/status/${jobId}/`).then((r) => r.data),

  // List previously generated reports
  getReportHistory: (params = {}) =>
    api.get('/api/reports/', { params }).then((r) => r.data),

  // Download a completed report
  downloadReport: (reportId) =>
    api
      .get(`/api/reports/${reportId}/download/`, { responseType: 'blob' })
      .then((r) => r.data),

  // Financial summary data for Finances page
  getFinancialSummary: (params = {}) =>
    api.get('/api/finances/summary/', { params }).then((r) => r.data),

  // Spend by site chart data
  getSpendBySite: (params = {}) =>
    api.get('/api/finances/spend-by-site/', { params }).then((r) => r.data),

  // Bill log (filterable)
  getBillLog: (params = {}) =>
    api.get('/api/finances/bills/', { params }).then((r) => r.data),

  // Wage ledger
  getWageLedger: (params = {}) =>
    api.get('/api/finances/wages/', { params }).then((r) => r.data),
}
