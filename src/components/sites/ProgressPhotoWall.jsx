import { useState } from 'react'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

// ─── ProgressPhotoWall ─────────────────────────────────────────────────────────
// Chronological photo wall, grouped by date. Click opens lightbox with
// GPS coordinates, timestamp, and manager note.
// ─────────────────────────────────────────────────────────────────────────────

const DUMMY_PHOTOS = [
  {
    date: '2026-06-28',
    photos: [
      { id: 'p1', url: 'https://placehold.co/600x400/0A1628/C9A84C?text=Slab+Work', note: 'Slab reinforcement complete — west wing', gps: '6.9271° N, 79.8612° E', ts: '08:34 AM' },
      { id: 'p2', url: 'https://placehold.co/600x400/112240/F0C96B?text=Column+Pour', note: 'Column pour — Level 3 north face', gps: '6.9272° N, 79.8614° E', ts: '10:12 AM' },
      { id: 'p3', url: 'https://placehold.co/600x400/0A1628/22C55E?text=Progress+Photo', note: 'General site overview — midday', gps: '6.9270° N, 79.8611° E', ts: '12:05 PM' },
    ],
  },
  {
    date: '2026-06-27',
    photos: [
      { id: 'p4', url: 'https://placehold.co/600x400/112240/C9A84C?text=Foundation', note: 'Foundation waterproofing applied — south section', gps: '6.9269° N, 79.8610° E', ts: '09:20 AM' },
      { id: 'p5', url: 'https://placehold.co/600x400/0A1628/F0C96B?text=Steel+Work', note: 'Steel rod binding — column grid C4', gps: '6.9271° N, 79.8612° E', ts: '02:45 PM' },
    ],
  },
  {
    date: '2026-06-26',
    photos: [
      { id: 'p6', url: 'https://placehold.co/600x400/112240/7A8BA0?text=Brickwork', note: 'Brickwork complete — ground floor east', gps: '6.9270° N, 79.8613° E', ts: '11:30 AM' },
    ],
  },
]

export default function ProgressPhotoWall({ photos, isLoading }) {
  const [lightbox, setLightbox] = useState(null)
  const grouped = photos ?? DUMMY_PHOTOS

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
