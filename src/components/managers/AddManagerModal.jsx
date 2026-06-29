import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'

// ─── AddManagerModal ───────────────────────────────────────────────────────────
// Three-tab modal for adding managers:
//   A: By Reference Code (MGR-XXXX)
//   B: By Email lookup
//   C: Send Invite
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ref',    label: 'By Ref Code' },
  { id: 'email',  label: 'By Email' },
  { id: 'invite', label: 'Send Invite' },
]

// Schemas per tab
const refSchema    = z.object({ ref_code: z.string().regex(/^MGR-[A-Z0-9]{4}$/, 'Format: MGR-XXXX (4 alphanumeric characters)') })
const emailSchema  = z.object({ email: z.string().email('Enter a valid email address') })
const inviteSchema = z.object({
  email:   z.string().email('Enter a valid email address'),
  site_id: z.string().optional(),
  message: z.string().optional(),
})

// Dummy resolved manager result
const DUMMY_RESOLVED = {
  id: 'm99',
  name: 'Pradeep Wijesinghe',
  email: 'pradeep.w@gmail.com',
  ref_code: 'MGR-X9K2',
  phone: '+94 71 234 5678',
  experience_years: 8,
  rating: 4.7,
}

export default function AddManagerModal({ isOpen, onClose, sites = [] }) {
  const [activeTab, setActiveTab] = useState('ref')
  const [resolved, setResolved] = useState(null)
  const [isResolving, setIsResolving] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const refForm    = useForm({ resolver: zodResolver(refSchema) })
  const emailForm  = useForm({ resolver: zodResolver(emailSchema) })
  const inviteForm = useForm({ resolver: zodResolver(inviteSchema) })

  const handleClose = () => {
    setResolved(null)
    setInviteSent(false)
    refForm.reset()
    emailForm.reset()
    inviteForm.reset()
    onClose()
  }

  const handleRefLookup = async (data) => {
    setIsResolving(true)
    await new Promise(r => setTimeout(r, 800)) // simulate API call
    setResolved(DUMMY_RESOLVED)
    setIsResolving(false)
  }

  const handleEmailLookup = async (data) => {
    setIsResolving(true)
    await new Promise(r => setTimeout(r, 800))
    setResolved(DUMMY_RESOLVED)
    setIsResolving(false)
  }

  const handleInvite = async (data) => {
    setIsResolving(true)
    await new Promise(r => setTimeout(r, 1000))
    setInviteSent(true)
    setIsResolving(false)
  }

  const handleAddManager = () => {
    // In real app: call addManager mutation
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Manager" size="md">
      {/* Tabs */}
      <div className="flex border-b border-navy-light">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResolved(null) }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted hover:text-offwhite'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── Tab A: Reference Code ── */}
        {activeTab === 'ref' && !resolved && (
          <form onSubmit={refForm.handleSubmit(handleRefLookup)} className="space-y-4">
            <div>
              <label className="label">Manager Reference Code</label>
              <input
                {...refForm.register('ref_code')}
                className="input font-mono"
                placeholder="MGR-XXXX"
                style={{ textTransform: 'uppercase' }}
              />
              {refForm.formState.errors.ref_code && (
                <p className="text-red-400 text-xs mt-1">{refForm.formState.errors.ref_code.message}</p>
              )}
              <p className="text-muted text-xs mt-1">Ask the manager to share their unique reference code from the ConstructTrack app.</p>
            </div>
            <button type="submit" disabled={isResolving} className="btn-gold w-full">
              {isResolving ? 'Looking up…' : 'Look Up Manager'}
            </button>
          </form>
        )}

        {/* ── Tab B: By Email ── */}
        {activeTab === 'email' && !resolved && (
          <form onSubmit={emailForm.handleSubmit(handleEmailLookup)} className="space-y-4">
            <div>
              <label className="label">Manager Email Address</label>
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
            <button type="submit" disabled={isResolving} className="btn-gold w-full">
              {isResolving ? 'Searching…' : 'Find Manager'}
            </button>
          </form>
        )}

        {/* ── Tab C: Send Invite ── */}
        {activeTab === 'invite' && !inviteSent && (
          <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
            <div>
              <label className="label">Recipient Email *</label>
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
                <label className="label">Pre-assign to Site</label>
                <div className="relative">
                  <select {...inviteForm.register('site_id')} className="select">
                    <option value="">No site (assign later)</option>
                    {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            <div>
              <label className="label">Personal Message (optional)</label>
              <textarea
                {...inviteForm.register('message')}
                className="input min-h-[80px] resize-none"
                placeholder="Welcome to our ConstructTrack team…"
              />
            </div>
            <button type="submit" disabled={isResolving} className="btn-gold w-full">
              {isResolving ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        )}

        {/* ── Invite sent state ── */}
        {activeTab === 'invite' && inviteSent && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-syne font-semibold text-offwhite mb-1">Invite Sent!</h3>
            <p className="text-muted text-sm">The manager will receive an email with instructions to join your ConstructTrack account.</p>
            <button onClick={handleClose} className="btn-gold mt-5">Done</button>
          </div>
        )}

        {/* ── Resolved profile ── */}
        {resolved && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-navy-primary/50 rounded-xl border border-navy-light">
              <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                <span className="font-syne font-bold text-gold text-xl">{resolved.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-syne font-semibold text-offwhite">{resolved.name}</p>
                <p className="text-muted text-sm">{resolved.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-gold text-xs">{resolved.ref_code}</span>
                  <span className="text-muted text-xs">{resolved.experience_years} yrs experience</span>
                  <span className="text-amber-400 text-xs">★ {resolved.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-muted text-sm">Add this manager to your account? You can assign them to sites after adding.</p>

            <div className="flex gap-3">
              <button onClick={() => setResolved(null)} className="btn-ghost flex-1">Back</button>
              <button onClick={handleAddManager} className="btn-gold flex-1">Add Manager</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
