import type { QuoteAction } from '../../types/quote'

interface QuoteActionBadgeProps {
  action: QuoteAction | null
}

const actionLabels: Partial<Record<QuoteAction, string>> = {
  samples_sent: 'Confirmar muestras',
  quote_sent: 'Confirmar presupuesto',
}

export default function QuoteActionBadge({ action }: QuoteActionBadgeProps) {
  if (!action) return null

  const label = actionLabels[action]
  if (!label) return null

  return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium border border-border">
      {label}
    </span>
  )
}
