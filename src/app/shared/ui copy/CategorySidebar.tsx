import { Button } from '@/components/ui/button'
import type { Category, CategoryGroup } from '@/shared/types/category'

interface CategorySidebarProps {
  categoryGroups?: CategoryGroup[]
  categories?: Category[]
  activeCategoryId: number | null
  onCategorySelect: (id: number) => void
}

export default function CategorySidebar({
  categoryGroups,
  categories,
  activeCategoryId,
  onCategorySelect,
}: CategorySidebarProps) {
  // Mode 1: Grouped categories (if categoryGroups is provided)
  if (categoryGroups) {
    return (
      <div className="flex flex-col gap-4">
        {categoryGroups.map((group) => (
          <div key={group.tag} className="flex flex-col gap-2">
            <h3 className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
              {group.label}
            </h3>
            {group.categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategoryId === category.id ? 'default' : 'ghost'}
                onClick={() => onCategorySelect(category.id)}
                className="justify-start"
              >
                {category.name}
              </Button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Mode 2: Flat list (backwards compatibility)
  const flatCategories = categories ?? []
  return (
    <div className="flex flex-col gap-2">
      {flatCategories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategoryId === category.id ? 'default' : 'ghost'}
          onClick={() => onCategorySelect(category.id)}
          className="justify-start"
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
