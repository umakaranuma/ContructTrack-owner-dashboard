// ─── Badge ─────────────────────────────────────────────────────────────────────
// Status/label pill badge. Variants map to semantic colours.
// ─────────────────────────────────────────────────────────────────────────────

import { stageLabel } from '../../constants/stages'

const VARIANTS = {
  gold:      'bg-gold/15 text-gold border border-gold/30',
  success:   'bg-green-500/15 text-green-400 border border-green-500/30',
  warning:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:    'bg-red-500/15 text-red-400 border border-red-500/30',
  muted:     'bg-navy-light/50 text-muted border border-navy-light',
  info:      'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  purple:    'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  locked:    'bg-navy-light/30 text-muted/60 border border-navy-light/50',
}

export default function Badge({ variant = 'muted', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant] || VARIANTS.muted} ${className}`}>
      {children}
    </span>
  )
}

// Dot indicator used in activity feeds
export function StatusDot({ color = 'green' }) {
  const colorMap = {
    green:  'bg-green-400',
    amber:  'bg-amber-400',
    red:    'bg-red-400',
    blue:   'bg-blue-400',
    muted:  'bg-muted',
    gold:   'bg-gold',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colorMap[color] || colorMap.green}`} />
  )
}

// Stage badge — maps construction stage slugs to display labels and colours
const STAGE_COLORS = {
  excavation:  'muted',
  foundation:  'gold',
  ground_slab: 'info',
  columns:     'info',
  beams:       'purple',
  upper_slab:  'purple',
  walls:       'warning',
  roof:        'success',
  finishing:   'success',
  completed:   'gold',
}

export function StageBadge({ stage }) {
  const variant = STAGE_COLORS[stage] || 'muted'
  return <Badge variant={variant}>{stageLabel(stage)}</Badge>
}
