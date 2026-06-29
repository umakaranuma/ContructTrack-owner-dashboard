// Construction stages — must match backend CONSTRUCTION_STAGES in sites/models.py
export const CONSTRUCTION_STAGES = [
  { slug: 'excavation',  label: 'Excavation' },
  { slug: 'foundation',  label: 'Foundation' },
  { slug: 'ground_slab', label: 'Ground Slab' },
  { slug: 'columns',     label: 'Columns' },
  { slug: 'beams',       label: 'Beams' },
  { slug: 'upper_slab',  label: 'Upper Slab' },
  { slug: 'walls',       label: 'Walls' },
  { slug: 'roof',        label: 'Roof' },
  { slug: 'finishing',   label: 'Finishing' },
  { slug: 'completed',   label: 'Completed' },
]

export const STAGE_SLUGS = CONSTRUCTION_STAGES.map(s => s.slug)

const LABEL_MAP = Object.fromEntries(CONSTRUCTION_STAGES.map(s => [s.slug, s.label]))

export function stageLabel(slug) {
  if (!slug) return 'Unknown'
  return LABEL_MAP[slug] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function stageIndex(slug) {
  const idx = STAGE_SLUGS.indexOf(slug)
  return idx >= 0 ? idx : 0
}

export function nextStage(slug) {
  const idx = stageIndex(slug)
  return idx < STAGE_SLUGS.length - 1 ? STAGE_SLUGS[idx + 1] : null
}
