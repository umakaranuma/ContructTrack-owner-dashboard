import { CONSTRUCTION_STAGES, stageLabel } from './stages'

export const STAGE_OPTIONS = CONSTRUCTION_STAGES.map((s) => ({
  value: s.slug,
  label: s.label,
}))

export const TOMORROW_STATUS_OPTIONS = [
  { value: 'working', label: 'Working' },
  { value: 'rain_hold', label: 'Rain Hold' },
  { value: 'material_wait', label: 'Waiting for Materials' },
  { value: 'awaiting_owner', label: 'Awaiting Owner' },
  { value: 'equipment_hold', label: 'Equipment Hold' },
  { value: 'holiday', label: 'Holiday / Off Day' },
]

const CUSTOM_PREFIX = 'ct_custom_options_'

export function formatCustomLabel(value) {
  if (!value) return ''
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function optionLabel(value, presets) {
  const hit = presets.find((o) => o.value === value)
  return hit?.label ?? formatCustomLabel(value)
}

export function stageDisplay(value) {
  return stageLabel(value)
}

export function normalizeCustomValue(input, maxLen = 80) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const preset = [...STAGE_OPTIONS, ...TOMORROW_STATUS_OPTIONS].find(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase() || o.value === trimmed,
  )
  if (preset) return preset.value
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, maxLen)
}

export function loadCustomOptions(key) {
  try {
    const raw = localStorage.getItem(`${CUSTOM_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomOption(key, value, label) {
  if (!value?.trim()) return
  const existing = loadCustomOptions(key).filter((o) => o.value !== value)
  const next = [{ value, label: label || formatCustomLabel(value) }, ...existing].slice(0, 12)
  localStorage.setItem(`${CUSTOM_PREFIX}${key}`, JSON.stringify(next))
}

export function mergeOptions(presets, customKey) {
  const customs = loadCustomOptions(customKey)
  const presetValues = new Set(presets.map((o) => o.value))
  const extra = customs.filter((o) => !presetValues.has(o.value))
  return [...presets, ...extra]
}
