/**
 * ContractPanel — embedded in SiteDetail Overview tab.
 * Shows site contract value, payment certificate progress, and subcontracts.
 */
import { useState } from 'react'
import {
  useSiteContract,
  useCreateContract, useUpdateContract,
  useAddPaymentCert, useUpdatePaymentCert, useDeletePaymentCert,
  useCreateSubcontract, useUpdateSubcontract, useDeleteSubcontract,
  useAddSubcontractPayment, useDeleteSubcontractPayment,
} from '../../hooks/useContracts'
import LoadingSpinner from '../ui/LoadingSpinner'
import AddContractModal    from './AddContractModal'
import AddPaymentCertModal from './AddPaymentCertModal'
import AddSubcontractModal from './AddSubcontractModal'
import AddSubPaymentModal  from './AddSubPaymentModal'

function fmt(n = 0) {
  const num = Number(n)
  if (num >= 1_000_000) return `LKR ${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000)     return `LKR ${(num / 1_000).toFixed(0)}K`
  return `LKR ${num.toLocaleString('en-LK')}`
}

function ProgressBar({ pct, color = 'bg-gold' }) {
  return (
    <div className="w-full h-2 bg-navy-primary rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

function CertStatusBadge({ status }) {
  const map = {
    received:  'text-green-400 bg-green-500/10 border-green-500/30',
    submitted: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    pending:   'text-muted bg-white/5 border-white/10',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${map[status] ?? map.pending}`}>
      {status}
    </span>
  )
}

function SubStatusBadge({ status }) {
  const map = {
    active:    'text-green-400 bg-green-500/10 border-green-500/30',
    completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    pending:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${map[status] ?? map.pending}`}>
      {status}
    </span>
  )
}

export default function ContractPanel({ siteId }) {
  const { data, isLoading } = useSiteContract(siteId)
  const contract     = data?.contract
  const subcontracts = data?.subcontracts ?? []

  const createContract    = useCreateContract(siteId)
  const updateContract    = useUpdateContract(siteId)
  const addCert           = useAddPaymentCert(siteId)
  const updateCert        = useUpdatePaymentCert(siteId)
  const deleteCert        = useDeletePaymentCert(siteId)
  const createSub         = useCreateSubcontract(siteId)
  const updateSub         = useUpdateSubcontract(siteId)
  const deleteSub         = useDeleteSubcontract(siteId)
  const addSubPayment     = useAddSubcontractPayment(siteId)
  const deleteSubPayment  = useDeleteSubcontractPayment(siteId)

  const [showContractModal, setShowContractModal]   = useState(false)
  const [showCertModal, setShowCertModal]           = useState(false)
  const [showSubModal, setShowSubModal]             = useState(false)
  const [editingCert, setEditingCert]               = useState(null)
  const [editingSub, setEditingSub]                 = useState(null)
  const [subPaymentTarget, setSubPaymentTarget]     = useState(null)
  const [expandedSubId, setExpandedSubId]           = useState(null)

  if (isLoading) return <LoadingSpinner label="Loading contract data…" />

  // ── No contract yet ───────────────────────────────────────────────────────
  if (!contract) {
    return (
      <div className="bg-navy-secondary border border-navy-light rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-offwhite font-semibold mb-1">No contract set up</p>
        <p className="text-muted text-sm mb-4">Add the client contract to track payment certificates and subcontracts.</p>
        <button onClick={() => setShowContractModal(true)} className="btn-primary text-sm">
          + Add Client Contract
        </button>
        {showContractModal && (
          <AddContractModal
            onClose={() => setShowContractModal(false)}
            onSubmit={(data) => createContract.mutate(data, { onSuccess: () => setShowContractModal(false) })}
            isLoading={createContract.isPending}
          />
        )}
      </div>
    )
  }

  const receivedPct = contract.received_pct ?? 0

  return (
    <div className="space-y-4">
      {/* ── Contract header card ─────────────────────────────────────────── */}
      <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-0.5">Client Contract</p>
            <h3 className="font-syne font-bold text-offwhite text-lg">{contract.client_name}</h3>
            <p className="text-muted text-xs mt-0.5">Since {contract.contract_date}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${
              contract.status === 'active'
                ? 'text-green-400 bg-green-500/10 border-green-500/30'
                : contract.status === 'closed'
                  ? 'text-muted bg-white/5 border-white/10'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            }`}>{contract.status}</span>
            <button
              onClick={() => setShowContractModal(true)}
              className="text-xs text-muted hover:text-gold transition-colors px-2 py-1 rounded border border-navy-light hover:border-gold/30"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Summary numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Contract Value',  value: fmt(contract.contract_value_lkr), color: 'text-offwhite' },
            { label: 'Received',        value: fmt(contract.total_received_lkr),  color: 'text-green-400' },
            { label: 'Submitted / Due', value: fmt(contract.total_submitted_lkr), color: 'text-amber-400' },
            { label: 'Outstanding',     value: fmt(contract.outstanding_lkr),     color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-navy-primary rounded-lg p-3">
              <p className="text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className={`font-mono font-bold text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Receipt progress bar */}
        <div className="flex items-center gap-3">
          <ProgressBar pct={receivedPct} color="bg-green-500" />
          <span className="text-muted text-xs font-mono whitespace-nowrap">{receivedPct}% received</span>
        </div>
      </div>

      {/* ── Payment Certificates ─────────────────────────────────────────── */}
      <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-light">
          <h3 className="font-syne font-semibold text-offwhite text-sm">Payment Certificates</h3>
          <button onClick={() => { setEditingCert(null); setShowCertModal(true) }} className="btn-primary text-xs py-1.5 px-3">
            + Add Certificate
          </button>
        </div>

        {contract.payment_certs?.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No payment certificates yet.</p>
        ) : (
          <div className="divide-y divide-navy-light">
            {contract.payment_certs.map((cert) => (
              <div key={cert.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-primary/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-navy-primary border border-navy-light flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-gold text-xs font-bold">#{cert.cert_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-offwhite text-sm font-medium truncate">
                    {cert.stage_milestone || `Certificate #${cert.cert_number}`}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {cert.submitted_date ? `Submitted ${cert.submitted_date}` : 'Not yet submitted'}
                    {cert.received_date ? ` · Received ${cert.received_date}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono font-semibold text-gold text-sm">{fmt(cert.amount_lkr)}</p>
                  <CertStatusBadge status={cert.status} />
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingCert(cert); setShowCertModal(true) }}
                    className="text-xs text-muted hover:text-gold px-2 py-1 rounded border border-transparent hover:border-gold/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this certificate?')) deleteCert.mutate(cert.id) }}
                    className="text-xs text-muted hover:text-red-400 px-2 py-1 rounded border border-transparent hover:border-red-400/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Subcontracts ─────────────────────────────────────────────────── */}
      <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-light">
          <h3 className="font-syne font-semibold text-offwhite text-sm">Subcontracts</h3>
          <button onClick={() => { setEditingSub(null); setShowSubModal(true) }} className="btn-outline text-xs py-1.5 px-3">
            + Add Subcontract
          </button>
        </div>

        {subcontracts.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No subcontracts for this site.</p>
        ) : (
          <div className="divide-y divide-navy-light">
            {subcontracts.map((sub) => (
              <div key={sub.id}>
                {/* Subcontract row */}
                <div
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-navy-primary/40 transition-colors"
                  onClick={() => setExpandedSubId(expandedSubId === sub.id ? null : sub.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-offwhite text-sm font-medium">{sub.company_name}</p>
                      <SubStatusBadge status={sub.status} />
                    </div>
                    <p className="text-muted text-xs truncate">{sub.scope_of_work}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <ProgressBar pct={sub.paid_pct ?? 0} color="bg-gold" />
                      <span className="text-muted text-xs font-mono whitespace-nowrap">{sub.paid_pct ?? 0}% paid</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-gold text-sm">{fmt(sub.contract_value_lkr)}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Paid: <span className="text-green-400 font-mono">{fmt(sub.total_paid_lkr)}</span>
                    </p>
                    <p className="text-xs text-muted">
                      Bal: <span className="text-amber-400 font-mono">{fmt(sub.balance_lkr)}</span>
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingSub(sub); setShowSubModal(true) }}
                      className="text-xs text-muted hover:text-gold px-2 py-1 rounded border border-transparent hover:border-gold/30 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Delete subcontract with ${sub.company_name}?`)) deleteSub.mutate(sub.id)
                      }}
                      className="text-xs text-muted hover:text-red-400 px-2 py-1 rounded border border-transparent hover:border-red-400/30 transition-colors"
                    >
                      ✕
                    </button>
                    <svg
                      className={`w-4 h-4 text-muted transition-transform ${expandedSubId === sub.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded payment history */}
                {expandedSubId === sub.id && (
                  <div className="bg-navy-primary/60 px-5 pb-4 pt-1 border-t border-navy-light">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-muted text-xs uppercase tracking-wider">Payment History</p>
                      <button
                        onClick={() => setSubPaymentTarget(sub)}
                        className="text-xs text-gold hover:underline"
                      >
                        + Record Payment
                      </button>
                    </div>
                    {sub.payments?.length === 0 ? (
                      <p className="text-muted text-xs py-2">No payments recorded yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sub.payments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg bg-navy-secondary px-3 py-2">
                            <div>
                              <span className="font-mono text-gold text-sm font-semibold">{fmt(p.amount_lkr)}</span>
                              <span className="text-muted text-xs ml-3">{p.payment_date}</span>
                              {p.payment_method && <span className="text-muted text-xs ml-2 capitalize">· {p.payment_method.replace('_', ' ')}</span>}
                              {p.reference_no && <span className="text-muted text-xs ml-2">#{p.reference_no}</span>}
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this payment?'))
                                  deleteSubPayment.mutate({ subId: sub.id, paymentId: p.id })
                              }}
                              className="text-xs text-muted hover:text-red-400 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {showContractModal && (
        <AddContractModal
          initial={contract}
          onClose={() => setShowContractModal(false)}
          onSubmit={(data) => {
            const action = contract
              ? updateContract.mutate(data, { onSuccess: () => setShowContractModal(false) })
              : createContract.mutate(data, { onSuccess: () => setShowContractModal(false) })
            return action
          }}
          isLoading={createContract.isPending || updateContract.isPending}
        />
      )}

      {showCertModal && (
        <AddPaymentCertModal
          initial={editingCert}
          onClose={() => { setShowCertModal(false); setEditingCert(null) }}
          onSubmit={(data) => {
            if (editingCert) {
              updateCert.mutate({ certId: editingCert.id, ...data }, { onSuccess: () => { setShowCertModal(false); setEditingCert(null) } })
            } else {
              addCert.mutate(data, { onSuccess: () => setShowCertModal(false) })
            }
          }}
          isLoading={addCert.isPending || updateCert.isPending}
        />
      )}

      {showSubModal && (
        <AddSubcontractModal
          initial={editingSub}
          onClose={() => { setShowSubModal(false); setEditingSub(null) }}
          onSubmit={(data) => {
            if (editingSub) {
              updateSub.mutate({ subId: editingSub.id, ...data }, { onSuccess: () => { setShowSubModal(false); setEditingSub(null) } })
            } else {
              createSub.mutate(data, { onSuccess: () => setShowSubModal(false) })
            }
          }}
          isLoading={createSub.isPending || updateSub.isPending}
        />
      )}

      {subPaymentTarget && (
        <AddSubPaymentModal
          subcontract={subPaymentTarget}
          onClose={() => setSubPaymentTarget(null)}
          onSubmit={(data) =>
            addSubPayment.mutate(
              { subId: subPaymentTarget.id, ...data },
              { onSuccess: () => setSubPaymentTarget(null) },
            )
          }
          isLoading={addSubPayment.isPending}
        />
      )}
    </div>
  )
}
