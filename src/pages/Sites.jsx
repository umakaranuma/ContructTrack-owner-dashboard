import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSites } from '../hooks/useSites'
import SiteCard from '../components/sites/SiteCard'
import CreateSiteModal from '../components/sites/CreateSiteModal'
import DataTable from '../components/ui/DataTable'
import { StageBadge } from '../components/ui/Badge'
import Badge from '../components/ui/Badge'

// ─── Sites Page ────────────────────────────────────────────────────────────────
// Displays all sites in table or grid view (toggle). "+ Create Site" opens modal.
// ─────────────────────────────────────────────────────────────────────────────

function formatLKR(n) {
  if (n >= 1000000) return `LKR ${(n/1000000).toFixed(2)}M`
  if (n >= 1000)    return `LKR ${(n/1000).toFixed(0)}K`
  return `LKR ${n}`
}

const TABLE_COLUMNS = (navigate) => [
  {
    key: 'name',
    label: 'Site Name',
    render: (val, row) => (
      <div>
        <p className="text-offwhite font-medium text-sm">{val}</p>
        <p className="text-muted text-xs mt-0.5">{row.location}</p>
      </div>
    ),
  },
  { key: 'stage',         label: 'Stage',          render: (v) => <StageBadge stage={v} /> },
  {
    key: 'manager_name',
    label: 'Manager',
    render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
          <span className="font-syne font-bold text-gold text-[9px]">{v?.charAt(0)}</span>
        </div>
        <span className="text-offwhite text-sm">{v}</span>
      </div>
    ),
  },
  { key: 'workers_today', label: 'Active Workers',  render: (v) => <span className={`font-mono font-semibold text-sm ${v > 0 ? 'text-green-400' : 'text-muted'}`}>{v}</span> },
  { key: 'monthly_spend', label: 'Monthly Spend',   render: (v) => <span className="font-mono text-gold text-sm">{formatLKR(v)}</span> },
  {
    key: 'status',
    label: 'Status',
    render: (v) => <Badge variant={v === 'active' ? 'success' : 'muted'}>{v}</Badge>,
  },
  {
    key: 'id',
    label: 'Actions',
    render: (id) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sites/${id}`) }}
          className="text-xs px-3 py-1 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
        >
          View
        </button>
      </div>
    ),
  },
]

export default function Sites() {
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useSites()
  const navigate = useNavigate()

  const sites = data?.results ?? (Array.isArray(data) ? data : [])
  const filtered = search
    ? sites.filter(s => (s.name ?? '').toLowerCase().includes(search.toLowerCase()) || (s.location ?? '').toLowerCase().includes(search.toLowerCase()))
    : sites

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-sm">{sites.length} sites total · {sites.filter(s => s.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input pl-9"
              style={{ width: 220 }}
              placeholder="Search sites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-navy-secondary border border-navy-light rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gold/10 text-gold' : 'text-muted hover:text-offwhite'}`}
              title="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gold/10 text-gold' : 'text-muted hover:text-offwhite'}`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="btn-gold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Site
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-navy-secondary border border-navy-light rounded-xl overflow-hidden">
          <DataTable
            columns={TABLE_COLUMNS(navigate)}
            data={filtered}
            isLoading={isLoading}
            keyField="id"
            emptyTitle="No sites found"
            emptyDescription="Create your first construction site to get started."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}

      <CreateSiteModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
