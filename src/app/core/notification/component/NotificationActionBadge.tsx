// ---------------------------------------------------------------------------
// NotificationActionBadge — maps action type to display label
// ---------------------------------------------------------------------------

interface NotificationActionBadgeProps {
  actionType: string
}

const ACTION_TYPE_MAP: Record<string, string> = {
  quote_created: 'Presupuesto creado',
  requires_confirmation: 'Requiere confirmar',
  sample_sent: 'Muestra enviada',
  proposal_sent: 'Propuesta enviada',
}

export function NotificationActionBadge({ actionType }: NotificationActionBadgeProps) {
  const label = ACTION_TYPE_MAP[actionType] || actionType

  return (
    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
      {label}
    </span>
  )
}
