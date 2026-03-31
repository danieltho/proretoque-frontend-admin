interface CategoryBadgeProps {
  name: string
}

export function CategoryBadge({ name }: CategoryBadgeProps) {
  return (
    <span className="inline-flex h-4 items-center justify-center rounded-lg bg-blue-50 px-2 py-0.5 text-footer font-medium text-primary-foreground">
      {name.toUpperCase()}
    </span>
  )
}
