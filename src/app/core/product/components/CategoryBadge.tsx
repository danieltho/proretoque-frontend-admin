import { Badge } from '@/app/components/ui/badge'

interface CategoryBadgeProps {
  name: string
}

export function CategoryBadge({ name }: CategoryBadgeProps) {
  return (
    <Badge variant="default" className="h-4 rounded-lg bg-blue-50 text-footer">
      {name.toUpperCase()}
    </Badge>
  )
}
