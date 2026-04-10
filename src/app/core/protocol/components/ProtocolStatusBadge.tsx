import { cn } from '@/app/shared/utils/utils'
import type { ProtocolAdminStatus } from '../types/protocol'

const STATUS_CONFIG: Record<ProtocolAdminStatus, { label: string; bg: string }> = {
  creado: { label: 'CREADO', bg: 'bg-blue-200' },
  en_revision: { label: 'EN REVISIÓN', bg: 'bg-blue-100' },
  aprobado: { label: 'APROBADO', bg: 'bg-blue-200' },
  aceptado: { label: 'ACEPTADO', bg: 'bg-blue-50' },
}

interface ProtocolStatusBadgeProps {
  status: ProtocolAdminStatus
}

export function ProtocolStatusBadge({ status }: ProtocolStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.creado

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-footer font-medium text-primary-foreground',
        config.bg,
      )}
    >
      {config.label}
    </span>
  )
}
