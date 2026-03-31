import type { Icon } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'

interface Props {
  icon: Icon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <Icon className="text-muted-foreground h-10 w-10" />
      </div>
      <h2 className="mb-1 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
