import { useState } from 'react'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'
import LoadingSpinner from '../ui/LoadingSpinner'

// ─── ProgressPhotoWall ─────────────────────────────────────────────────────────
// Chronological photo wall, grouped by date. Click opens lightbox with
// GPS coordinates, timestamp, and manager note.
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_PHOTO = 'https://placehold.co/600x400/0A1628/C9A84C?text=Progress+Photo'

function formatGps(lat, lng) {
  if (lat == null || lng == null) return '—'
  return `${lat}° N, ${lng}° E`
}

function formatTs(takenAt) {
  if (!takenAt) return '—'
  try {
    return new Date(takenAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function normalizePhoto(p) {
  return {
    id: p.id,
    url: p.url ?? p.photo_url ?? PLACEHOLDER_PHOTO,
    note: p.note ?? p.caption ?? 'Progress photo',
    gps: p.gps ?? formatGps(p.gps_lat ?? p.photo_gps_lat, p.gps_lng ?? p.photo_gps_lng),
    ts: p.ts ?? formatTs(p.taken_at ?? p.photo_taken_at),
    date: p.log_date ?? (p.taken_at ? String(p.taken_at).slice(0, 10) : null),
  }
}

function groupPhotos(photos) {
  if (!photos?.length) return []
  if (photos[0]?.photos) return photos

  const byDate = {}
  for (const raw of photos) {
    const p = normalizePhoto(raw)
    const date = p.date ?? 'unknown'
    if (!byDate[date]) byDate[date] = { date, photos: [] }
    byDate[date].photos.push(p)
  }
  return Object.values(byDate).sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export default function ProgressPhotoWall({ photos, isLoading }) {
  const [lightbox, setLightbox] = useState(null)
  const grouped = groupPhotos(photos)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  if (!grouped.length) {
    return (
      <EmptyState
        title="No progress photos yet"
        description="Managers upload site progress photos through the mobile app."
        icon={
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
    )
  }

  return (
    <>
      {grouped.map((group) => (
        <div key={group.date} className="mb-8">
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-navy-light/50" />
            <span className="text-muted text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-navy-light bg-navy-secondary">
              {new Date(group.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="h-px flex-1 bg-navy-light/50" />
          </div>

          {/* Photos */}
          <div className="grid grid-cols-3 gap-3">
            {group.photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="relative rounded-xl overflow-hidden cursor-pointer group border border-navy-light hover:border-gold/40 transition-all aspect-video"
              >
                <img
                  src={photo.url}
                  alt={photo.note}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-offwhite text-xs truncate">{photo.note}</p>
                  <p className="text-muted text-[10px] font-mono">{photo.ts}</p>
                </div>
                {/* GPS dot */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      <Modal isOpen={!!lightbox} onClose={() => setLightbox(null)} title="Progress Photo" size="xl">
        {lightbox && (
          <div className="p-6">
            <img
              src={lightbox.url}
              alt={lightbox.note}
              className="w-full rounded-xl border border-navy-light mb-4"
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="label">Note</label>
                <p className="text-offwhite">{lightbox.note}</p>
              </div>
              <div>
                <label className="label">Time</label>
                <p className="text-offwhite font-mono">{lightbox.ts}</p>
              </div>
              <div className="col-span-3">
                <label className="label">GPS Coordinates</label>
                <p className="text-gold font-mono text-sm">{lightbox.gps}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
