import { useSites } from '../../hooks/useSites'

// Reusable site dropdown — filters by site name (UUID value sent to API as site_id)
export default function SiteFilter({ value, onChange, className = '', label = 'Site' }) {
  const { data: sitesData, isLoading } = useSites()
  const sites = Array.isArray(sitesData) ? sitesData : sitesData?.results ?? []

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field w-full min-w-[180px]"
        disabled={isLoading}
      >
        <option value="">All sites</option>
        {sites.map(site => (
          <option key={site.id} value={site.id}>{site.name}</option>
        ))}
      </select>
    </div>
  )
}
