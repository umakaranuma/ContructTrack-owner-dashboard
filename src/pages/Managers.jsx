/**
 * Managers page — /dashboard/managers
 * Shows all managers linked to this tenant's sites.
 * Supports 3 add-manager methods: Reference Code, Email search, Email invite.
 */
import { useState } from 'react'
import { useManagers } from '../hooks/useManagers'
import ManagerTable from '../components/managers/ManagerTable'
import AddManagerModal from '../components/managers/AddManagerModal'
import ManagerDetail from '../components/managers/ManagerDetail'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function Managers() {
  const { data: managers, isLoading, error } = useManagers()
  const [showAddModal, setShowAddModal]       = useState(false)
  const [selectedManager, setSelectedManager] = useState(null)
  const [search, setSearch]                   = useState('')

  const list = managers?.results ?? managers ?? []

  // Client-side filter while API returns full list
  const filtered = list.filter(m =>
    !search ||
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.reference_code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Managers</h1>
          <p className="text-muted text-sm mt-1">
            {list.length} manager{list.length !== 1 ? 's' : ''} across all sites
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Manager
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, ref code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 w-full"
        />
      </div>

      {/* ── Table / Loading / Empty states ── */}
      {isLoading ? (
        <LoadingSpinner label="Loading managers…" />
      ) : error ? (
        <div className="card text-red-400 text-sm">Failed to load managers. Please refresh.</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title={search ? 'No managers match your search' : 'No managers yet'}
          description={search ? 'Try a different name, email, or reference code.' : 'Add your first site manager to get started.'}
          action={!search && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary mt-4">
              + Add Manager
            </button>
          )}
        />
      ) : (
        <ManagerTable
          managers={filtered}
          onView={setSelectedManager}
        />
      )}

      {/* ── Add Manager modal (3-method) ── */}
      {showAddModal && (
        <AddManagerModal onClose={() => setShowAddModal(false)} />
      )}

      {/* ── Manager detail modal ── */}
      {selectedManager && (
        <ManagerDetail
          manager={selectedManager}
          onClose={() => setSelectedManager(null)}
        />
      )}
    </div>
  )
}
