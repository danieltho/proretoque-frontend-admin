import { Badge } from '@/app/components/ui/badge'

interface CategoryBadgeProps {
  name: string
}

export function CategoryBadge({ name }: CategoryBadgeProps) {
  return (
    <Badge className="rounded-lg bg-blue-50 px-2 py-0.5 text-footer font-medium text-primary-foreground">
      {name.toUpperCase()}
    </Badge>
  )
}
