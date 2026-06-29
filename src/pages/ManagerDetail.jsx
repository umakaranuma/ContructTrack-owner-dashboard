import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import {
  useManager,
  useManagerActivity,
  useDeactivateManager,
  useRemoveManager,
  useRemoveFromSite,
} from '../hooks/useManagers'
import { StageBadge } from '../components/ui/Badge'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/LoadingSpinner'
import DataTable from '../components/ui/DataTable'
import { stageLabel } from '../constants/stages'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sites', label: 'Assigned Sites' },
  { id: 'activity', label: 'Activity' },
]

const ACTIVITY_ICONS = {
  progress_log: '📋',
  bill: '🧾',
  attendance: '👷',
}

function StatCard({ label, value }) {
  return (
    <div className="card border border-white/5 p-4">
      <p className="text-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono font-bold text-xl text-off-white">{value}</p>
    </div>
  )
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className={`text-off-white text-sm text-right ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function ManagerDetail() {
  const { managerId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [actionMsg, setActionMsg] = useState('')

  const { data: manager, isLoading, isError, refetch } = useManager(managerId)
  const { data: activity, isLoading: activityLoading } = useManagerActivity(managerId)

  const deactivate = useDeactivateManager()
  const removeManager = useRemoveManager()
  const removeFromSite = useRemoveFromSite()

  if (isLoading) return <PageLoader />

  if (isError || !manager) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Manager not found.</p>
        <Link to="/dashboard/managers" className="text-gold text-sm hover:underline">← Back to Managers</Link>
      </div>
    )
  }

  const name = manager.name ?? manager.full_name ?? 'Manager'
  const exp = manager.experience ?? {}
  const sites = manager.assigned_sites ?? []
  const activityList = Array.isArray(activity) ? activity : activity?.results ?? []

  async function handleDeactivate() {
    if (!window.confirm(`Deactivate ${name}? They will lose access until reactivated.`)) return
    try {
      await deactivate.mutateAsync(managerId)
      setActionMsg('Manager deactivated.')
      refetch()
    } catch {
      setActionMsg('Failed to deactivate manager.')
    }
  }

  async function handleRemove() {
    if (!window.confirm(`Remove ${name} from all your sites? Their account will remain on the platform.`)) return
    try {
      await removeManager.mutateAsync(managerId)
      navigate('/dashboard/managers')
    } catch {
      setActionMsg('Failed to remove manager.')
    }
  }

  async function handleUnassign(siteId, siteName) {
    if (!window.confirm(`Remove ${name} from ${siteName}?`)) return
    try {
      await removeFromSite.mutateAsync({ managerId, siteId })
      setActionMsg(`Removed from ${siteName}.`)
      refetch()
    } catch {
      setActionMsg('Failed to remove from site.')
    }
  }

  const siteColumns = [
    {
      key: 'name',
      label: 'Site',
      render: (v, row) => (
        <div>
          <p className="text-off-white font-medium text-sm">{v}</p>
          <p className="text-muted text-xs mt-0.5">{row.location || '—'}</p>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (v) => <StageBadge stage={v} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge variant={v === 'active' ? 'success' : 'muted'}>{v}</Badge>,
    },
    {
      key: 'assigned_at',
      label: 'Assigned',
      render: (v) => (
        <span className="font-mono text-muted text-xs">
          {v ? format(new Date(v), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2">
          <Link
            to={`/dashboard/sites/${id}`}
            className="text-xs px-2.5 py-1 rounded bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
          >
            View Site
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleUnassign(id, row.name) }}
            className="text-xs px-2.5 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Unassign
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Link to="/dashboard/managers" className="text-muted hover:text-gold text-sm transition-colors">
            ← Back to Managers
          </Link>
          <div className="flex items-center gap-4 mt-3">
            {manager.profile_photo_url ? (
              <img
                src={manager.profile_photo_url}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border border-gold/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <span className="font-syne font-bold text-gold text-2xl">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="page-title">{name}</h1>
                <Badge variant={manager.status === 'active' ? 'success' : manager.status === 'suspended' ? 'danger' : 'muted'}>
                  {manager.status}
                </Badge>
              </div>
              <p className="text-muted text-sm mt-0.5">{manager.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="font-mono text-gold text-sm">{manager.ref_code ?? manager.reference_code}</span>
                {manager.phone && <span className="text-muted text-sm">{manager.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-sm">
          <p className="text-muted text-xs uppercase tracking-wider">Last active</p>
          <p className="font-mono text-off-white mt-1">
            {manager.last_active
              ? formatDistanceToNow(new Date(manager.last_active), { addSuffix: true })
              : '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-gold text-gold'
                : 'border-transparent text-muted hover:text-off-white'
            }`}
          >
            {tab.label}
            {tab.id === 'sites' && sites.length > 0 && (
              <span className="ml-1.5 text-xs font-mono text-muted">({sites.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Sites Managed" value={exp.total_sites ?? sites.length} />
            <StatCard label="Progress Logs" value={exp.total_progress_logs ?? 0} />
            <StatCard label="Bills Logged" value={exp.total_bills_logged ?? 0} />
            <StatCard label="Attendance Logs" value={exp.total_attendance_submissions ?? 0} />
            <StatCard label="Days as Manager" value={exp.days_as_manager ?? 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card border border-white/5 p-5">
              <h2 className="section-title mb-4">Profile</h2>
              <DetailRow label="Full Name" value={manager.full_name ?? name} />
              <DetailRow label="Email" value={manager.email} mono />
              <DetailRow label="Phone" value={manager.phone} mono />
              <DetailRow label="NIC" value={manager.nic} mono />
              <DetailRow label="Reference Code" value={manager.ref_code ?? manager.reference_code} mono />
              <DetailRow
                label="Member Since"
                value={exp.member_since ? format(new Date(exp.member_since), 'dd MMM yyyy') : '—'}
              />
            </div>

            <div className="card border border-white/5 p-5">
              <h2 className="section-title mb-4">Experience Summary</h2>
              <p className="text-muted text-sm leading-relaxed mb-4">
                {name} has been on ConstructTrack for{' '}
                <span className="text-off-white font-medium">{exp.days_as_manager ?? 0} days</span>
                {', managing '}
                <span className="text-off-white font-medium">{exp.total_sites ?? sites.length} site(s)</span>
                {' with '}
                <span className="text-off-white font-medium">{exp.total_progress_logs ?? 0} daily logs</span>
                {', '}
                <span className="text-off-white font-medium">{exp.total_bills_logged ?? 0} bills</span>
                {', and '}
                <span className="text-off-white font-medium">{exp.total_attendance_submissions ?? 0} attendance submissions</span>
                {' across your account.'}
              </p>
              {sites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-muted text-xs uppercase tracking-wider">Current sites</p>
                  {sites.slice(0, 4).map(site => (
                    <Link
                      key={site.id}
                      to={`/dashboard/sites/${site.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 bg-navy-primary/40 hover:border-gold/30 transition-colors"
                    >
                      <span className="text-off-white text-sm">{site.name}</span>
                      <span className="text-muted text-xs">{stageLabel(site.stage)}</span>
                    </Link>
                  ))}
                  {sites.length > 4 && (
                    <button
                      onClick={() => setActiveTab('sites')}
                      className="text-gold text-xs hover:underline"
                    >
                      View all {sites.length} sites →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Sites */}
      {activeTab === 'sites' && (
        <div className="card border border-white/5 p-5">
          <h2 className="section-title mb-5">Assigned Sites</h2>
          {sites.length === 0 ? (
            <p className="text-muted text-sm text-center py-10">No sites assigned to this manager.</p>
          ) : (
            <div className="border border-navy-light rounded-xl overflow-hidden">
              <DataTable
                columns={siteColumns}
                data={sites}
                keyField="id"
                emptyTitle="No sites"
              />
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      {activeTab === 'activity' && (
        <div className="card border border-white/5 p-5">
          <h2 className="section-title mb-5">Recent Activity</h2>
          {activityLoading ? (
            <p className="text-muted text-sm py-8 text-center">Loading activity…</p>
          ) : activityList.length === 0 ? (
            <p className="text-muted text-sm text-center py-10">No activity recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {activityList.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{ACTIVITY_ICONS[entry.type] ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-off-white">{entry.description}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {entry.site_name}
                      {entry.site_id && (
                        <>
                          {' · '}
                          <Link to={`/dashboard/sites/${entry.site_id}`} className="text-gold hover:underline">
                            View site
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-muted text-[10px] font-mono flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="card border border-white/5 p-5">
        <h2 className="section-title mb-4">Account Actions</h2>
        {actionMsg && (
          <p className={`text-sm mb-4 px-4 py-3 rounded-lg border ${
            actionMsg.includes('Failed')
              ? 'text-red-400 bg-red-500/10 border-red-500/30'
              : 'text-green-400 bg-green-500/10 border-green-500/30'
          }`}>
            {actionMsg}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDeactivate}
            disabled={deactivate.isPending || manager.status !== 'active'}
            className="btn-outline text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          >
            {deactivate.isPending ? 'Deactivating…' : 'Deactivate Manager'}
          </button>
          <button
            onClick={handleRemove}
            disabled={removeManager.isPending}
            className="btn-danger"
          >
            {removeManager.isPending ? 'Removing…' : 'Remove from Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
