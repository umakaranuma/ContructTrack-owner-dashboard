import api from './api'

// ─── Manager Service ───────────────────────────────────────────────────────────
// API calls for site manager management (lookup, invite, assign, remove).
// ─────────────────────────────────────────────────────────────────────────────

export const managerService = {
  // List all managers under this owner's subscription
  getManagers: (params = {}) =>
    api.get('/api/managers/', { params }).then((r) => r.data.result),

  // Fetch single manager profile
  getManager: (managerId) =>
    api.get(`/api/managers/${managerId}/`).then((r) => r.data.result),

  // Look up manager by reference code (e.g. MGR-A7F2)
  lookupByRefCode: (refCode) =>
    api.get('/api/managers/lookup/', { params: { ref_code: refCode } }).then((r) => r.data.result),

  // Look up manager by email
  lookupByEmail: (email) =>
    api.get('/api/managers/lookup/', { params: { email } }).then((r) => r.data.result),

  // Add manager to owner account (after lookup)
  addManager: (managerId, siteIds = []) =>
    api.post('/api/managers/add/', { manager_id: managerId, site_ids: siteIds }).then((r) => r.data.result),

  // Send invite to new manager via email
  sendInvite: (payload) =>
    api.post('/api/managers/invite/', payload).then((r) => r.data.result),

  // Assign manager to a site
  assignToSite: (managerId, siteId) =>
    api.post(`/api/managers/${managerId}/assign/`, { site_id: siteId }).then((r) => r.data.result),

  // Remove manager from a site
  removeFromSite: (managerId, siteId) =>
    api.post(`/api/managers/${managerId}/unassign/`, { site_id: siteId }).then((r) => r.data.result),

  // Deactivate manager account
  deactivateManager: (managerId) =>
    api.patch(`/api/managers/${managerId}/deactivate/`).then((r) => r.data.result),

  // Remove manager from owner account entirely
  removeManager: (managerId) =>
    api.delete(`/api/managers/${managerId}/`).then((r) => r.data.result),

  // Manager activity log
  getManagerActivity: (managerId, params = {}) =>
    api.get(`/api/managers/${managerId}/activity/`, { params }).then((r) => r.data.result),
}
