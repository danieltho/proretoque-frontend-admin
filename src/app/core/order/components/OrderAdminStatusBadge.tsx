import { cn } from '@/app/shared/utils/utils'
import {
  QuestionIcon,
  ClockCounterClockwiseIcon,
  ListChecksIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'
import { formatDateShort } from '@/app/shared/utils/date'
import type { OrderAdminStatus } from '../types/orderAdmin'

const STATUS_CONFIG: Record<
  OrderAdminStatus,
  { label: string; bg: string; textColor: string; dateColor: string; icon: typeof QuestionIcon }
> = {
  created: {
    label: 'CREADO',
    bg: 'bg-neutral-100',
    textColor: 'text-blue-200',
    dateColor: 'text-neutral-400',
    icon: QuestionIcon,
  },
  pending: {
    label: 'PENDIENTE',
    bg: 'bg-blue-50',
    textColor: 'text-white',
    dateColor: 'text-neutral-200',
    icon: ClockCounterClockwiseIcon,
  },
  completed: {
    label: 'COMPLETADO',
    bg: 'bg-blue-100',
    textColor: 'text-white',
    dateColor: 'text-neutral-200',
    icon: ListChecksIcon,
  },
  sended: {
    label: 'ENVIADO',
    bg: 'bg-blue-200',
    textColor: 'text-white',
    dateColor: 'text-neutral-400',
    icon: CheckCircleIcon,
  },
  archived: {
    label: 'ARCHIVADO',
    bg: 'bg-neutral-200',
    textColor: 'text-neutral-600',
    dateColor: 'text-neutral-400',
    icon: QuestionIcon,
  },
}

interface OrderAdminStatusBadgeProps {
  status: OrderAdminStatus
  date?: string | null
}

export function OrderAdminStatusBadge({ status, date }: OrderAdminStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.created
  const Icon = config.icon
  const showDate = status !== 'created' && status !== 'pending' && date

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-footer font-medium',
        config.bg,
        config.textColor,
      )}
    >
      <Icon className="shrink-0" />
      <span className="flex flex-col">
        <span>{config.label}</span>
        {showDate && (
          <span className={cn('font-normal', config.dateColor)}>
            {formatDateShort(date)}
          </span>
        )}
      </span>
    </span>
  )
}
