import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import api from '../../services/api'
import { useSites } from '../../hooks/useSites'

// ─── AddManagerModal ───────────────────────────────────────────────────────────
// Three-tab modal for adding managers to your ConstructTrack account:
//   A: By Reference Code — manager already has the app, owner enters MGR-XXXX
//   B: By Email Search   — find an existing registered manager by email
//   C: Send Email Invite — new person; backend sends a registration invitation email
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ref',    label: 'By Ref Code',  icon: '🔑' },
  { id: 'email',  label: 'By Email',     icon: '🔍' },
  { id: 'invite', label: 'Email Invite', icon: '✉️' },
]

const refSchema = z.object({
  ref_code: z.string().regex(/^MGR-[A-Z0-9]{4}$/i, 'Format: MGR-XXXX (4 alphanumeric characters)'),
})
const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
const inviteSchema = z.object({
  email:   z.string().email('Enter a valid email address'),
  site_id: z.string().optional(),
  message: z.string().max(300, 'Keep the message under 300 characters').optional(),
})

export default function AddManagerModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('ref')
  const [resolved, setResolved]   = useState(null)      // manager profile after lookup
  const [inviteSent, setInviteSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError]   = useState('')
  const [siteId, setSiteId]       = useState('')        // site to assign after add

  const { data: sitesData } = useSites()
  const sites = sitesData?.results ?? sitesData ?? []

  const refForm    = useForm({ resolver: zodResolver(refSchema) })
  const emailForm  = useForm({ resolver: zodResolver(emailSchema) })
  const inviteForm = useForm({ resolver: zodResolver(inviteSchema) })

  const handleClose = () => {
    setResolved(null)
    setInviteSent(false)
    setApiError('')
    refForm.reset()
    emailForm.reset()
    inviteForm.reset()
    onClose()
  }

  const switchTab = (id) => {
    setActiveTab(id)
    setResolved(null)
    setApiError('')
  }

  // ── Tab A: resolve manager by their MGR-XXXX reference code ──────────────
  const handleRefLookup = async ({ ref_code }) => {
    setIsLoading(true)
    setApiError('')
    try {
      const { data } = await api.get(`/api/managers/resolve/?code=${ref_code.toUpperCase()}`)
      setResolved(data.result)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Manager not found with that reference code.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Tab B: search by email ─────────────────────────────────────────────────
  const handleEmailLookup = async ({ email }) => {
    setIsLoading(true)
    setApiError('')
    try {
      const { data } = await api.get(`/api/managers/search/?email=${encodeURIComponent(email)}`)
      const list = data.result
      if (!list || list.length === 0) {
        setApiError('No registered manager found with that email. Use "Email Invite" to invite them.')
        return
      }
      // pick the first exact-or-closest match
      setResolved(list[0])
    } catch (err) {
      setApiError(err.response?.data?.message || 'Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Assign a found manager to a site ──────────────────────────────────────
  const handleAssign = async () => {
    if (!resolved?.id) return
    setIsLoading(true)
    setApiError('')
    try {
      if (siteId) {
        await api.post(`/api/managers/${resolved.id}/assign/`, { site_id: siteId })
      }
      handleClose()
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to assign manager.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Tab C: send email invite to a new person ───────────────────────────────
  const handleInvite = async ({ email, site_id, message }) => {
    setIsLoading(true)
    setApiError('')
    try {
      await api.post('/api/managers/invite/', { email, site_id: site_id || '', message: message || '' })
      setInviteSent(true)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={handleClose} title="Add Manager" size="md">
      {/* ── Tab strip ── */}
      <div className="flex border-b border-navy-light">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex-1 px-3 py-3 text-xs sm:text-sm font-medium transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted hover:text-offwhite'
            }`}
          >
            <span className="text-base sm:text-sm leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Global API error */}
        {apiError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
            {apiError}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB A — Reference Code lookup
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ref' && !resolved && (
          <form onSubmit={refForm.handleSubmit(handleRefLookup)} className="space-y-4">
            <div className="bg-navy-primary/40 rounded-xl p-4 border border-navy-light/40 mb-4">
              <p className="text-offwhite text-xs font-medium mb-1">How it works</p>
              <p className="text-muted text-xs leading-relaxed">
                The manager opens their ConstructTrack app → Profile → and shares their
                unique <span className="text-gold font-mono">MGR-XXXX</span> reference code with you.
                Enter it here to instantly link them to your account.
              </p>
            </div>
            <div>
              <label className="label">Manager Reference Code *</label>
              <input
                {...refForm.register('ref_code')}
                className="input font-mono tracking-widest text-center uppercase"
                placeholder="MGR-XXXX"
                maxLength={8}
                onInput={(e) => { e.target.value = e.target.value.toUpperCase() }}
              />
              {refForm.formState.errors.ref_code && (
                <p className="text-red-400 text-xs mt-1">{refForm.formState.errors.ref_code.message}</p>
              )}
            </div>
            <button type="submit" disabled={isLoading} className="btn-gold w-full">
              {isLoading ? 'Looking up…' : 'Find Manager'}
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB B — Email search
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'email' && !resolved && (
          <form onSubmit={emailForm.handleSubmit(handleEmailLookup)} className="space-y-4">
            <div className="bg-navy-primary/40 rounded-xl p-4 border border-navy-light/40 mb-4">
              <p className="text-offwhite text-xs font-medium mb-1">Search existing managers</p>
              <p className="text-muted text-xs leading-relaxed">
                If the manager is already registered on ConstructTrack, search by their email
                to add them to your account. If they haven't registered yet, use
                <span className="text-gold"> Email Invite</span> instead.
              </p>
            </div>
            <div>
              <label className="label">Manager Email Address *</label>
              <input
                {...emailForm.register('email')}
                type="email"
                className="input"
                placeholder="manager@example.com"
              />
              {emailForm.formState.errors.email && (
                <p className="text-red-400 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button type="submit" disabled={isLoading} className="btn-gold w-full">
              {isLoading ? 'Searching…' : 'Search Manager'}
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB C — Email Invite (new person, not yet registered)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'invite' && !inviteSent && (
          <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
            {/* What the invite email contains */}
            <div className="bg-navy-primary/40 rounded-xl p-4 border border-gold/20 mb-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-offwhite text-xs font-semibold mb-1">What happens when you send this</p>
                  <ul className="text-muted text-xs space-y-1 leading-relaxed">
                    <li>• Recipient gets an email from <span className="text-gold">ConstructTrack</span></li>
                    <li>• Email contains a registration link for the mobile app</li>
                    <li>• After they register, they share their <span className="text-gold font-mono">MGR-XXXX</span> code with you</li>
                    <li>• You then use the <span className="text-gold">"By Ref Code"</span> tab to confirm and assign them</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Recipient Email Address *</label>
              <input
                {...inviteForm.register('email')}
                type="email"
                className="input"
                placeholder="newmanager@example.com"
              />
              {inviteForm.formState.errors.email && (
                <p className="text-red-400 text-xs mt-1">{inviteForm.formState.errors.email.message}</p>
              )}
            </div>

            {sites.length > 0 && (
              <div>
                <label className="label">Mention a Site in the Email (optional)</label>
                <div className="relative">
                  <select {...inviteForm.register('site_id')} className="select pr-8">
                    <option value="">No specific site</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-muted text-xs mt-1">Site name will appear in the email body for context.</p>
              </div>
            )}

            <div>
              <label className="label">Personal Message (optional)</label>
              <textarea
                {...inviteForm.register('message')}
                className="input resize-none"
                rows={3}
                placeholder={`Hi, we'd love you to join our site team…`}
              />
              {inviteForm.formState.errors.message && (
                <p className="text-red-400 text-xs mt-1">{inviteForm.formState.errors.message.message}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-gold w-full flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending Invitation…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Send Invitation Email
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Invite sent success state ── */}
        {activeTab === 'invite' && inviteSent && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="font-syne font-semibold text-offwhite text-lg mb-2">Invitation Sent!</h3>
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
              An email with registration instructions has been sent. Once they register,
              ask them for their <span className="text-gold font-mono">MGR-XXXX</span> code
              and use the <span className="text-gold">By Ref Code</span> tab to add them.
            </p>
            <button onClick={handleClose} className="btn-gold mt-6">Done</button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Resolved profile (shared between Tab A and B)
        ══════════════════════════════════════════════════════════════════ */}
        {resolved && (
          <div className="space-y-4">
            {/* Manager profile card */}
            <div className="flex items-center gap-4 p-4 bg-navy-primary/50 rounded-xl border border-navy-light">
              <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                <span className="font-syne font-bold text-gold text-xl">
                  {(resolved.full_name || resolved.name || '?').charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-syne font-semibold text-offwhite truncate">
                  {resolved.full_name || resolved.name}
                </p>
                <p className="text-muted text-sm truncate">{resolved.email}</p>
                {resolved.reference_code && (
                  <span className="font-mono text-gold text-xs">{resolved.reference_code}</span>
                )}
              </div>
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Optional: pre-assign to a site */}
            {sites.length > 0 && (
              <div>
                <label className="label">Assign to Site (optional)</label>
                <div className="relative">
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="select pr-8"
                  >
                    <option value="">No site — assign later</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setResolved(null); setApiError('') }}
                className="btn-ghost flex-1"
              >
                ← Back
              </button>
              <button
                onClick={handleAssign}
                disabled={isLoading}
                className="btn-gold flex-1"
              >
                {isLoading ? 'Adding…' : 'Add Manager'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
