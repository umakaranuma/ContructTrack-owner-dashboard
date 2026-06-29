import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

// ─── DataTable ─────────────────────────────────────────────────────────────────
// Reusable, sortable data table with loading and empty states.
// columns: [{ key, label, render?, sortable?, width? }]
// ─────────────────────────────────────────────────────────────────────────────

export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = '',
  emptyIcon,
  keyField = 'id',
  onRowClick,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
