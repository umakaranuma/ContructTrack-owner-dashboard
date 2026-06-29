import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import { useCreateSite } from '../../hooks/useSites'

// ─── CreateSiteModal ───────────────────────────────────────────────────────────
// Form modal for creating a new construction site.
// Validates with Zod, submits via React Hook Form.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  name:            z.string().min(3, 'Site name must be at least 3 characters'),
  location:        z.string().min(5, 'Please enter a full address'),
  project_type:    z.string().min(1, 'Select a project type'),
  start_date:      z.string().min(1, 'Start date is required'),
  end_date:        z.string().optional(),
  budget:          z.coerce.number().positive('Budget must be a positive amount'),
  manager_search:  z.string().optional(),
})

const PROJECT_TYPES = [
  'Residential (Single)',
  'Residential (Multi-Unit)',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Mixed Use',
  'Renovation',
]

export default function CreateSiteModal({ isOpen, onClose }) {
  const { mutate: createSite, isPending, error } = useCreateSite()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      project_type: '',
      start_date:   new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = (data) => {
    createSite(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Site" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error.message || 'Failed to create site. Please try again.'}
          </div>
        )}

        {/* Site name */}
        <div>
          <label className="label">Site Name *</label>
          <input
            {...register('name')}
            className="input"
            placeholder="e.g. Colombo City Phase 2"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="label">Location / Address *</label>
          <input
            {...register('location')}
            className="input"
            placeholder="e.g. 45 Galle Road, Colombo 03, Western Province"
          />
          {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
        </div>

        {/* Project type */}
        <div>
          <label className="label">Project Type *</label>
          <div className="relative">
            <select {...register('project_type')} className="select">
              <option value="">Select project type…</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.project_type && <p className="text-red-400 text-xs mt-1">{errors.project_type.message}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Estimated Start Date *</label>
            <input type="date" {...register('start_date')} className="input" />
            {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="label">Estimated End Date</label>
            <input type="date" {...register('end_date')} className="input" />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="label">Total Budget (LKR) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">LKR</span>
            <input
              {...register('budget')}
              type="number"
              min="0"
              step="1000"
              className="input pl-12 font-mono"
              placeholder="0"
            />
          </div>
          {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget.message}</p>}
        </div>

        {/* Manager search */}
        <div>
          <label className="label">Assign Manager(s)</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              {...register('manager_search')}
              className="input pl-9"
              placeholder="Search by name or ref code…"
            />
          </div>
          <p className="text-muted text-xs mt-1">You can also assign managers after creating the site.</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-navy-light">
          <button type="button" onClick={handleClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-gold flex items-center gap-2">
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </>
            ) : 'Create Site'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
