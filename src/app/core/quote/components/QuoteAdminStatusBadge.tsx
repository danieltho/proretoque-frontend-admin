import { cn } from '@/app/shared/utils/utils'
import {
  QuestionIcon,
  CheckCircleIcon,
  ListChecksIcon,
} from '@phosphor-icons/react'
import type { QuoteAdminStatus } from '../types/quote'

const STATUS_CONFIG: Record<
  QuoteAdminStatus,
  { label: string; bg: string; icon: typeof QuestionIcon }
> = {
  pendiente: { label: 'PENDIENTE', bg: 'bg-blue-50', icon: QuestionIcon },
  enviado: { label: 'ENVIADO', bg: 'bg-blue-100', icon: ListChecksIcon },
  aceptado: { label: 'ACEPTADO', bg: 'bg-blue-200', icon: CheckCircleIcon },
}

interface QuoteAdminStatusBadgeProps {
  status: QuoteAdminStatus
}

export function QuoteAdminStatusBadge({ status }: QuoteAdminStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendiente
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-footer font-medium text-white',
        config.bg,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  )
}
