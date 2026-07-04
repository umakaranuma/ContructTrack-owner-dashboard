import api from './api'

export const contractService = {
  // ─── Site Contract ──────────────────────────────────────────────────────────
  getSiteContract: (siteId) =>
    api.get(`/api/contracts/sites/${siteId}/`).then((r) => r.data.result),

  createContract: (siteId, payload) =>
    api.post(`/api/contracts/sites/${siteId}/`, payload).then((r) => r.data.result),

  updateContract: (siteId, payload) =>
    api.patch(`/api/contracts/sites/${siteId}/`, payload).then((r) => r.data.result),

  // ─── Payment Certificates ───────────────────────────────────────────────────
  addPaymentCert: (siteId, payload) =>
    api.post(`/api/contracts/sites/${siteId}/certs/`, payload).then((r) => r.data.result),

  updatePaymentCert: (siteId, certId, payload) =>
    api.patch(`/api/contracts/sites/${siteId}/certs/${certId}/`, payload).then((r) => r.data.result),

  deletePaymentCert: (siteId, certId) =>
    api.delete(`/api/contracts/sites/${siteId}/certs/${certId}/`).then((r) => r.data),

  // ─── Subcontracts ────────────────────────────────────────────────────────────
  getSubcontracts: (siteId) =>
    api.get(`/api/contracts/sites/${siteId}/subcontracts/`).then((r) => r.data.result),

  createSubcontract: (siteId, payload) =>
    api.post(`/api/contracts/sites/${siteId}/subcontracts/`, payload).then((r) => r.data.result),

  updateSubcontract: (siteId, subId, payload) =>
    api.patch(`/api/contracts/sites/${siteId}/subcontracts/${subId}/`, payload).then((r) => r.data.result),

  deleteSubcontract: (siteId, subId) =>
    api.delete(`/api/contracts/sites/${siteId}/subcontracts/${subId}/`).then((r) => r.data),

  // ─── Subcontract Payments ───────────────────────────────────────────────────
  addSubcontractPayment: (siteId, subId, payload) =>
    api.post(`/api/contracts/sites/${siteId}/subcontracts/${subId}/payments/`, payload).then((r) => r.data.result),

  deleteSubcontractPayment: (siteId, subId, paymentId) =>
    api.delete(`/api/contracts/sites/${siteId}/subcontracts/${subId}/payments/${paymentId}/`).then((r) => r.data),

  // ─── Cross-site summary ─────────────────────────────────────────────────────
  getContractsSummary: (params = {}) =>
    api.get('/api/contracts/summary/', { params }).then((r) => r.data.result),
}
