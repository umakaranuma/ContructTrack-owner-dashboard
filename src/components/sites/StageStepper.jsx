import { useState } from 'react'
import { CONSTRUCTION_STAGES, stageIndex, stageLabel } from '../../constants/stages'

export default function StageStepper({ currentStage, onUpdateStage, isUpdating }) {
  const slug = currentStage ?? 'excavation'
  const currentIndex = stageIndex(slug)
  const [showPicker, setShowPicker] = useState(false)
  const [selected, setSelected] = useState(slug)

  const handleSave = () => {
    if (selected !== slug && onUpdateStage) {
      onUpdateStage(selected)
    }
    setShowPicker(false)
  }

  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h3 className="font-syne font-semibold text-offwhite">Construction Stage</h3>
        <div className="flex items-center gap-3">
          <span className="text-gold text-sm font-mono font-semibold">
            Stage {currentIndex + 1} / {CONSTRUCTION_STAGES.length}
          </span>
          {onUpdateStage && (
            <button
              onClick={() => { setSelected(slug); setShowPicker(v => !v) }}
              className="btn-outline text-xs py-1 px-3"
              disabled={isUpdating}
            >
              Update Stage
            </button>
          )}
        </div>
      </div>
      <p className="text-muted text-xs mb-5">{stageLabel(slug)} — currently in progress</p>

      {showPicker && (
        <div className="mb-5 p-4 rounded-xl border border-gold/30 bg-navy-primary/50 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="form-label">Set construction stage</label>
            <select
              className="input-field w-full"
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              {CONSTRUCTION_STAGES.map(s => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} disabled={isUpdating} className="btn-primary text-xs">
            {isUpdating ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setShowPicker(false)} className="btn-outline text-xs">Cancel</button>
        </div>
      )}

      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-px bg-navy-light" />
        <div
          className="absolute top-4 left-0 h-px bg-gold transition-all duration-700"
          style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (CONSTRUCTION_STAGES.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between gap-1">
          {CONSTRUCTION_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent   = idx === currentIndex

            return (
              <div key={stage.slug} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all flex-shrink-0 ${
                  isCurrent
                    ? 'bg-gold border-gold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                    : isCompleted
                      ? 'bg-gold/20 border-gold/60'
                      : 'bg-navy-primary border-navy-light'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-navy-primary" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-navy-light" />
                  )}
                </div>
                <p className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider leading-tight text-center truncate w-full px-0.5 ${
                  isCurrent ? 'text-gold' : isCompleted ? 'text-muted' : 'text-muted/50'
                }`}>
                  {stage.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
