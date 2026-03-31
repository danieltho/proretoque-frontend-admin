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
  pendiente: {
    label: 'PENDIENTE',
    bg: 'bg-neutral-100',
    textColor: 'text-blue-200',
    dateColor: 'text-neutral-400',
    icon: QuestionIcon,
  },
  en_proceso: {
    label: 'EN PROCESO',
    bg: 'bg-blue-50',
    textColor: 'text-white',
    dateColor: 'text-neutral-200',
    icon: ClockCounterClockwiseIcon,
  },
  muestras_aceptadas: {
    label: 'MUESTRAS ACEPTADAS',
    bg: 'bg-blue-100',
    textColor: 'text-white',
    dateColor: 'text-neutral-200',
    icon: ListChecksIcon,
  },
  presupuesto_aceptado: {
    label: 'PRESUPUESTO ACEPTADO',
    bg: 'bg-blue-200',
    textColor: 'text-white',
    dateColor: 'text-neutral-400',
    icon: CheckCircleIcon,
  },
}

interface OrderAdminStatusBadgeProps {
  status: OrderAdminStatus
  date?: string | null
}

export function OrderAdminStatusBadge({ status, date }: OrderAdminStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendiente
  const Icon = config.icon
  const showDate = status !== 'pendiente' && status !== 'en_proceso' && date

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-footer font-medium',
        config.bg,
        config.textColor,
      )}
    >
      <Icon className="size-3 shrink-0" />
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
