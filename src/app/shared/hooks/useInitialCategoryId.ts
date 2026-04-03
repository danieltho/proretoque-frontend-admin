import { useEffect, useRef, useState } from 'react'
import type { Category, ProductOptions } from '@/app/shared/types/category'

export function useInitialCategoryId(
  categories: Category[],
  productOptions: Record<number, ProductOptions[]>,
  selections: Record<number, string>,
) {
  const hasResolved = useRef(false)
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0)

  useEffect(() => {
    if (hasResolved.current || categories.length === 0) return

    const selectedProductIds = Object.keys(selections)
      .map(Number)
      .filter((id) => selections[id])

    if (selectedProductIds.length > 0 && Object.keys(productOptions).length > 0) {
      const match = categories.find((cat) => {
        const products = productOptions[cat.id] ?? []
        return products.some((p) => selectedProductIds.includes(p.id))
      })
      if (match) {
        setActiveCategoryId(match.id)
        hasResolved.current = true
        return
      }
    }

    setActiveCategoryId(categories[0].id)
    hasResolved.current = true
  }, [categories, productOptions, selections])

  return [activeCategoryId, setActiveCategoryId] as const
}
