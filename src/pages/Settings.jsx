/**
 * Settings page — /dashboard/settings
 * 4 vertically-tabbed sections: Company Profile, Package & Billing,
 * Notifications, Security.
 */
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import api from '../services/api'

const TABS = [
  { id: 'company',       label: 'Company Profile',    icon: '🏢' },
  { id: 'billing',       label: 'Package & Billing',  icon: '📦' },
  { id: 'notifications', label: 'Notifications',      icon: '🔔' },
  { id: 'security',      label: 'Security',           icon: '🔒' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your company, subscription, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical tab list */}
        <aside className="lg:w-56 shrink-0">
          <nav className="card border border-white/5 p-2 space-y-1 lg:sticky lg:top-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  activeTab === t.id
                    ? 'bg-gold/10 text-gold font-medium'
                    : 'text-muted hover:bg-white/5 hover:text-off-white'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'company'       && <CompanyProfileTab />}
          {activeTab === 'billing'       && <BillingTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security'      && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Company Profile ──────────────────────────────────────────────────────────
function CompanyProfileTab() {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company_name:    user?.tenant?.company_name ?? '',
    address:         user?.tenant?.address ?? '',
    contact_email:   user?.tenant?.contact_email ?? user?.email ?? '',
    contact_phone:   user?.tenant?.contact_phone ?? user?.phone ?? '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [msg, setMsg] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/api/settings/', form)
      if (logoFile) {
        const fd = new FormData()
        fd.append('logo', logoFile)
        await api.post('/api/settings/logo/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setMsg('Saved successfully.')
    } catch {
      setMsg('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="card border border-white/5 p-5 space-y-6">
      <h2 className="section-title">Company Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="form-label">Company Name</label>
          <input
            className="input-field w-full"
            value={form.company_name}
            onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="form-label">Address</label>
          <textarea
            className="input-field w-full h-24 resize-none"
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="input-field w-full"
              value={form.contact_email}
              onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Contact Phone</label>
            <input
              className="input-field w-full"
              value={form.contact_phone}
              onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="form-label">
            Company Logo <span className="text-muted normal-case tracking-normal">(used in Enterprise PDF reports)</span>
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-4 p-4 rounded-xl border border-white/5 bg-navy-primary/40">
            {user?.tenant?.logo_url && (
              <img src={user.tenant.logo_url} alt="logo" className="h-12 w-auto rounded border border-white/10" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogoFile(e.target.files[0])}
              className="text-sm text-muted"
            />
          </div>
        </div>
      </div>

      {msg && (
        <p className={`text-sm px-4 py-3 rounded-lg border ${
          msg.includes('success')
            ? 'text-green-400 bg-green-500/10 border-green-500/30'
            : 'text-red-400 bg-red-500/10 border-red-500/30'
        }`}>
          {msg}
        </p>
      )}

      <div className="pt-2 border-t border-white/5">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ─── Package & Billing ────────────────────────────────────────────────────────
function BillingTab() {
  const { user } = useAuthStore()
  const pkg = user?.tenant?.package ?? {}

  const payments = [
    { id: 1, date: '2025-01-01', amount: 50000, method: 'PayHere', status: 'success', ref: 'PH-2025-001234' },
    { id: 2, date: '2025-03-01', amount: 20000, method: 'Bank Transfer', status: 'success', ref: 'BOC-8871' },
  ]

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="card border border-gold/30 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-muted text-xs uppercase tracking-widest mb-1">Current Plan</p>
            <h3 className="text-xl font-bold text-gold capitalize">{pkg.name ?? 'Pro'}</h3>
            <p className="text-muted text-sm mt-1">LKR {Number(pkg.price_lkr ?? 20000).toLocaleString()} / month</p>
          </div>
          <button className="btn-outline text-sm self-start">Upgrade Plan</button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UsageBar
            label="Sites"
            used={user?.tenant?.sites_count ?? 2}
            max={pkg.max_sites === -1 ? '∞' : pkg.max_sites ?? 6}
          />
          <UsageBar
            label="Managers"
            used={user?.tenant?.managers_count ?? 2}
            max={pkg.max_managers === -1 ? '∞' : pkg.max_managers ?? 6}
          />
        </div>

        <p className="mt-5 pt-4 border-t border-white/5 text-muted text-sm">
          Renews: <span className="text-off-white">{user?.tenant?.subscription_end ?? '2025-12-31'}</span>
        </p>
      </div>

      {/* Payment history */}
      <div className="card border border-white/5 p-5">
        <h2 className="section-title mb-5">Payment History</h2>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-off-white">{p.date}</td>
                  <td className="px-4 py-3 text-off-white">{p.method}</td>
                  <td className="px-4 py-3 font-mono text-muted text-xs">{p.ref}</td>
                  <td className="px-4 py-3 text-right font-mono text-off-white">LKR {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function UsageBar({ label, used, max }) {
  const pct = max === '∞' ? 30 : Math.min(100, Math.round((used / max) * 100))
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-gold'
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-2">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-mono">{used} / {max}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Notifications ─────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    whatsapp_alerts:    true,
    whatsapp_number:    '+94771234567',
    email_digest:       'daily',
    alert_material_cap: true,
    alert_missing_log:  true,
    alert_anomaly:      true,
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await api.patch('/api/settings/notifications/', prefs) }
    catch { /* silent for now */ }
    finally { setSaving(false) }
  }

  function Toggle({ id, label }) {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none py-1">
        <div
          onClick={() => setPrefs(p => ({ ...p, [id]: !p[id] }))}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${prefs[id] ? 'bg-gold' : 'bg-white/10'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-off-white text-sm">{label}</span>
      </label>
    )
  }

  return (
    <div className="card border border-white/5 p-5 space-y-6">
      <h2 className="section-title">Notifications</h2>

      <div className="space-y-4 pb-6 border-b border-white/5">
        <h3 className="text-muted text-xs uppercase tracking-widest">WhatsApp</h3>
        <Toggle id="whatsapp_alerts" label="WhatsApp daily alerts" />
        {prefs.whatsapp_alerts && (
          <div className="sm:ml-[52px]">
            <label className="form-label">WhatsApp number</label>
            <input
              className="input-field w-full max-w-xs"
              value={prefs.whatsapp_number}
              onChange={e => setPrefs(p => ({ ...p, whatsapp_number: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className="space-y-3 pb-6 border-b border-white/5">
        <h3 className="text-muted text-xs uppercase tracking-widest mb-2">Email Digest</h3>
        {['daily', 'weekly', 'off'].map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="radio"
              name="digest"
              value={opt}
              checked={prefs.email_digest === opt}
              onChange={() => setPrefs(p => ({ ...p, email_digest: opt }))}
              className="accent-gold"
            />
            <span className="text-off-white text-sm capitalize">{opt}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-muted text-xs uppercase tracking-widest mb-2">Alert Types</h3>
        <Toggle id="alert_material_cap" label="Material cap violations" />
        <Toggle id="alert_missing_log"  label="Missing daily logs" />
        <Toggle id="alert_anomaly"      label="Price anomaly alerts" />
      </div>

      <div className="pt-2 border-t border-white/5">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

// ─── Security ─────────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function changePassword(e) {
    e.preventDefault()
    if (form.newPwd !== form.confirm) { setMsg('Passwords do not match.'); return }
    setSaving(true)
    try {
      await api.post('/api/auth/change-password/', {
        current_password: form.current,
        new_password:     form.newPwd,
      })
      setMsg('Password changed successfully.')
      setForm({ current: '', newPwd: '', confirm: '' })
    } catch {
      setMsg('Failed to change password. Check your current password.')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={changePassword} className="card border border-white/5 p-5 space-y-5">
        <h2 className="section-title">Change Password</h2>

        <div className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" className="input-field w-full" value={form.current}
              onChange={e => setForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" className="input-field w-full" value={form.newPwd}
              onChange={e => setForm(p => ({ ...p, newPwd: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="input-field w-full" value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>

        {msg && (
          <p className={`text-sm px-4 py-3 rounded-lg border ${
            msg.includes('success')
              ? 'text-green-400 bg-green-500/10 border-green-500/30'
              : 'text-red-400 bg-red-500/10 border-red-500/30'
          }`}>
            {msg}
          </p>
        )}

        <div className="pt-2 border-t border-white/5">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>

      <div className="card border border-white/5 p-5">
        <h2 className="section-title mb-5">Active Sessions</h2>
        <div className="divide-y divide-white/5">
          {[
            { device: 'Chrome on Windows', ip: '203.94.96.11', location: 'Colombo, LK', last: 'Now', current: true },
            { device: 'Safari on iPhone',  ip: '203.94.96.12', location: 'Colombo, LK', last: '2 hours ago', current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-off-white text-sm font-medium">
                  {s.device}
                  {s.current && <span className="text-xs text-green-400 ml-2">• This session</span>}
                </p>
                <p className="text-muted text-xs mt-1">{s.ip} · {s.location} · {s.last}</p>
              </div>
              {!s.current && (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
