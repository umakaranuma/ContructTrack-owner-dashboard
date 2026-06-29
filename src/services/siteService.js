import api from './api'

// ─── Site Service ──────────────────────────────────────────────────────────────
// All API calls related to construction sites.
// ─────────────────────────────────────────────────────────────────────────────

export const siteService = {
  // Fetch all sites for the authenticated owner
  getSites: (params = {}) =>
    api.get('/api/sites/', { params }).then((r) => r.data.result),

  // Fetch single site detail
  getSite: (siteId) =>
    api.get(`/api/sites/${siteId}/`).then((r) => r.data.result),

  // Create a new site
  createSite: (payload) =>
    api.post('/api/sites/', payload).then((r) => r.data.result),

  // Update site details
  updateSite: (siteId, payload) =>
    api.patch(`/api/sites/${siteId}/`, payload).then((r) => r.data.result),

  // Delete / archive a site
  deleteSite: (siteId) =>
    api.delete(`/api/sites/${siteId}/`).then((r) => r.data.result),

  // Daily logs for a site
  getDailyLogs: (siteId, params = {}) =>
    api.get(`/api/sites/${siteId}/daily-logs/`, { params }).then((r) => r.data.result),

  // Attendance records
  getAttendance: (siteId, params = {}) =>
    api.get(`/api/sites/${siteId}/attendance/`, { params }).then((r) => r.data.result),

  // Bills & receipts
  getBills: (siteId, params = {}) =>
    api.get(`/api/sites/${siteId}/bills/`, { params }).then((r) => r.data.result),

  // Progress photos
  getProgressPhotos: (siteId, params = {}) =>
    api.get(`/api/sites/${siteId}/photos/`, { params }).then((r) => r.data.result),

  // Alerts for a site
  getSiteAlerts: (siteId) =>
    api.get(`/api/sites/${siteId}/alerts/`).then((r) => r.data.result),

  // Acknowledge an alert
  acknowledgeAlert: (siteId, alertId) =>
    api.post(`/api/sites/${siteId}/alerts/${alertId}/acknowledge/`).then((r) => r.data.result),

  // Resolve an alert
  resolveAlert: (siteId, alertId) =>
    api.post(`/api/sites/${siteId}/alerts/${alertId}/resolve/`).then((r) => r.data.result),

  // Fetch overview stats (active sites, spend, workers, alerts)
  getOverviewStats: () =>
    api.get('/api/dashboard/overview/').then((r) => r.data.result),

  // Recent activity feed
  getActivityFeed: (limit = 20) =>
    api.get('/api/dashboard/activity/', { params: { limit } }).then((r) => r.data.result),

  // All alerts (for drawer)
  getAllAlerts: () =>
    api.get('/api/dashboard/alerts/').then((r) => r.data.result),
}
