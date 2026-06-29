// ─── EmptyState ────────────────────────────────────────────────────────────────
// Consistent empty-state placeholder with icon, title, and optional CTA.
// ─────────────────────────────────────────────────────────────────────────────

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-navy-light/50 flex items-center justify-center mb-4 text-muted">
          {icon}
        </div>
      )}
      <h3 className="font-syne font-semibold text-offwhite mb-1">{title}</h3>
      {description && (
        <p className="text-muted text-sm max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  )
}
