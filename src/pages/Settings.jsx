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

      <div className="flex gap-6">
        {/* Vertical tab list */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-1">
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
    <form onSubmit={handleSave} className="card space-y-5">
      <h2 className="section-title">Company Profile</h2>

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
          className="input-field w-full h-20 resize-none"
          value={form.address}
          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <label className="form-label">Company Logo <span className="text-muted">(used in Enterprise PDF reports)</span></label>
        <div className="mt-1 flex items-center gap-4">
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

      {msg && <p className={`text-sm ${msg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

// ─── Package & Billing ────────────────────────────────────────────────────────
function BillingTab() {
  const { user } = useAuthStore()
  const pkg = user?.tenant?.package ?? {}

  // Dummy payment history — replaced when backend returns real data
  const payments = [
    { id: 1, date: '2025-01-01', amount: 50000, method: 'PayHere', status: 'success', ref: 'PH-2025-001234' },
    { id: 2, date: '2025-03-01', amount: 20000, method: 'Bank Transfer', status: 'success', ref: 'BOC-8871' },
  ]

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <div className="card border border-gold/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted text-xs uppercase tracking-widest mb-1">Current Plan</p>
            <h3 className="text-xl font-bold text-gold">{pkg.name ?? 'Pro'}</h3>
            <p className="text-muted text-sm mt-0.5">LKR {Number(pkg.price_lkr ?? 20000).toLocaleString()} / month</p>
          </div>
          <button className="btn-outline text-sm">Upgrade Plan</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Usage bars */}
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
        <div className="mt-3 text-muted text-sm flex gap-6">
          <span>Renews: <span className="text-off-white">{user?.tenant?.subscription_end ?? '2025-12-31'}</span></span>
        </div>
      </div>

      {/* Payment history */}
      <div className="card">
        <h2 className="section-title mb-4">Payment History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-muted text-xs uppercase">
              <th className="text-left py-2 pr-4">Date</th>
              <th className="text-left py-2 pr-4">Method</th>
              <th className="text-left py-2 pr-4">Reference</th>
              <th className="text-right py-2 pr-4">Amount</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-white/5 text-off-white">
                <td className="py-3 pr-4 font-mono">{p.date}</td>
                <td className="py-3 pr-4">{p.method}</td>
                <td className="py-3 pr-4 font-mono text-muted text-xs">{p.ref}</td>
                <td className="py-3 pr-4 text-right font-mono">LKR {p.amount.toLocaleString()}</td>
                <td className="py-3 text-right">
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
  )
}

function UsageBar({ label, used, max }) {
  const pct = max === '∞' ? 30 : Math.min(100, Math.round((used / max) * 100))
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-gold'
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>{label}</span>
        <span className="font-mono">{used} / {max}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setPrefs(p => ({ ...p, [id]: !p[id] }))}
          className={`w-10 h-5 rounded-full transition-colors relative ${prefs[id] ? 'bg-gold' : 'bg-white/10'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-off-white text-sm">{label}</span>
      </label>
    )
  }

  return (
    <div className="card space-y-5">
      <h2 className="section-title">Notifications</h2>

      <div className="space-y-3">
        <h3 className="text-muted text-xs uppercase tracking-widest">WhatsApp</h3>
        <Toggle id="whatsapp_alerts" label="WhatsApp daily alerts" />
        {prefs.whatsapp_alerts && (
          <div>
            <label className="form-label">WhatsApp number</label>
            <input
              className="input-field w-64"
              value={prefs.whatsapp_number}
              onChange={e => setPrefs(p => ({ ...p, whatsapp_number: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-muted text-xs uppercase tracking-widest">Email Digest</h3>
        {['daily', 'weekly', 'off'].map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
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
        <h3 className="text-muted text-xs uppercase tracking-widest">Alert Types</h3>
        <Toggle id="alert_material_cap" label="Material cap violations" />
        <Toggle id="alert_missing_log"  label="Missing daily logs" />
        <Toggle id="alert_anomaly"      label="Price anomaly alerts" />
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
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
    <div className="space-y-5">
      <form onSubmit={changePassword} className="card space-y-4">
        <h2 className="section-title">Change Password</h2>
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
        {msg && <p className={`text-sm ${msg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {/* Active sessions — placeholder listing */}
      <div className="card">
        <h2 className="section-title mb-4">Active Sessions</h2>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', ip: '203.94.96.11', location: 'Colombo, LK', last: 'Now', current: true },
            { device: 'Safari on iPhone',  ip: '203.94.96.12', location: 'Colombo, LK', last: '2 hours ago', current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <p className="text-off-white text-sm font-medium">
                  {s.device} {s.current && <span className="text-xs text-green-400 ml-1">• This session</span>}
                </p>
                <p className="text-muted text-xs mt-0.5">{s.ip} · {s.location} · {s.last}</p>
              </div>
              {!s.current && (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
