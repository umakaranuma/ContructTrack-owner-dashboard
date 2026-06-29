// ─── StageStepper ─────────────────────────────────────────────────────────────
// Horizontal stepper showing all 10 construction stages.
// Current stage highlighted in gold; completed stages show checkmark.
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = [
  'Foundation',
  'Columns',
  'Slab',
  'Brickwork',
  'Roofing',
  'Plastering',
  'Electrical',
  'Plumbing',
  'Finishing',
  'Handover',
]

export default function StageStepper({ currentStage }) {
  const currentIndex = STAGES.indexOf(currentStage)

  return (
    <div className="bg-navy-secondary border border-navy-light rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-syne font-semibold text-offwhite">Construction Stage</h3>
        <span className="text-gold text-sm font-mono font-semibold">
          Stage {currentIndex + 1} / {STAGES.length}
        </span>
      </div>
      <p className="text-muted text-xs mb-5">{currentStage} — currently in progress</p>

      {/* Stepper */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-navy-light" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-px bg-gold transition-all duration-700"
          style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent   = idx === currentIndex
            const isPending   = idx > currentIndex

            return (
              <div key={stage} className="flex flex-col items-center gap-2" style={{ width: `${100 / STAGES.length}%` }}>
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                  isCurrent
                    ? 'bg-gold border-gold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                    : isCompleted
                      ? 'bg-gold/20 border-gold/60'
                      : 'bg-navy-primary border-navy-light'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-navy-primary" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-navy-light" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-[9px] font-semibold uppercase tracking-wider leading-tight ${
                    isCurrent ? 'text-gold' : isCompleted ? 'text-muted' : 'text-muted/50'
                  }`}>
                    {stage}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
