import type { Icon } from '@phosphor-icons/react'
import { QuestionIcon, ClockClockwiseIcon, CheckCircleIcon } from '@phosphor-icons/react'
import { formatDateShort } from '@/shared/utils/date'
import type { QuoteStatus } from '../../types/quote'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  date?: string | null
}

const statusConfig: Record<QuoteStatus, { label: string; icon: Icon }> = {
  draft: { label: 'Borrador', icon: QuestionIcon },
  pending: { label: 'Pendiente', icon: ClockClockwiseIcon },
  in_progress: { label: 'En Proceso', icon: ClockClockwiseIcon },
  sample_accepted: { label: 'Muestras Aceptadas', icon: CheckCircleIcon },
  quote_accepted: { label: 'Presupuesto Aprobado', icon: CheckCircleIcon },
}

export default function QuoteStatusBadge({ status, date }: QuoteStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, icon: QuestionIcon }
  const IconComponent = config.icon
  const showDate = (status === 'sample_accepted' || status === 'quote_accepted') && date

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <IconComponent className="size-4 shrink-0" />
      <div className="flex flex-col">
        <span>{config.label}</span>
        {showDate && <span>{formatDateShort(date)}</span>}
      </div>
    </div>
  )
}
