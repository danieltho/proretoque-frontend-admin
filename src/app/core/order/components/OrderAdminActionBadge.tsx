import type { OrderAdminAction } from '../types/orderAdmin'

const ACTION_LABELS: Record<OrderAdminAction, string> = {
  requiere_muestras: 'REQUIERE MUESTRAS',
  muestras_enviadas: 'MUESTRAS ENVIADAS',
  requiere_presupuesto: 'REQUIERE PRESUPUESTO',
  presupuesto_enviado: 'PRESUPUESTO ENVIADO',
}

interface OrderAdminActionBadgeProps {
  action: OrderAdminAction | null
}

export function OrderAdminActionBadge({ action }: OrderAdminActionBadgeProps) {
  if (!action) return null

  return (
    <span className="inline-flex items-center justify-center rounded-lg border border-neutral-600 px-2.5 py-0.5 text-footer font-medium text-foreground">
      {ACTION_LABELS[action] ?? action}
    </span>
  )
}
