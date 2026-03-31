import { cn } from '@/app/shared/utils/utils'

const STEP_LABELS = ['Archivos', 'Retoques', 'Tiempo', 'Pago']

interface Props {
  activeStep: number
  onStepChange: (step: number) => void
}

export default function OrderStepper({ activeStep, onStepChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 font-raleway">
      {/* Labels */}
      <div className="flex items-center gap-5">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const isActive = activeStep === stepNum
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepChange(stepNum)}
              className={cn(
                'text-body text-neutral-600',
                isActive ? 'font-semibold' : 'font-normal opacity-50',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Radio dots + progress lines */}
      <div className="flex items-center py-px">
        {STEP_LABELS.map((_, i) => {
          const stepNum = i + 1
          const isActive = activeStep === stepNum
          const isPast = activeStep > stepNum
          return (
            <div key={i} className="flex items-center">
              {/* Radio dot */}
              <button
                type="button"
                onClick={() => onStepChange(stepNum)}
                className={cn(
                  'flex items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'size-6 border-[3px] border-blue-200 p-[5px]'
                    : 'size-6 border-2 border-neutral-400',
                  isPast && 'border-blue-200 bg-blue-200',
                )}
              >
                {isActive && <span className="size-2.5 rounded-full bg-blue-200" />}
              </button>

              {/* Progress line */}
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-[54px]',
                    activeStep > stepNum ? 'bg-blue-200' : 'bg-neutral-400',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
