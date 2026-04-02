import { cn } from '@/app/shared/utils/utils'

const MEMBERSHIP_STYLES: Record<string, string> = {
  Esencial: 'bg-neutral-100 text-blue-200',
  Profesional: 'bg-blue-50 text-primary-foreground',
  Experto: 'bg-blue-100 text-primary-foreground',
  Premium: 'bg-blue-200 text-primary-foreground',
}

interface MembershipBadgeProps {
  name: string
}

export function MembershipBadge({ name }: MembershipBadgeProps) {
  const style = MEMBERSHIP_STYLES[name] ?? MEMBERSHIP_STYLES.Esencial

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-footer font-medium',
        style,
      )}
    >
      {name.toUpperCase()}
    </span>
  )
}
