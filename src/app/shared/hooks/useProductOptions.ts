import { useEffect, useRef, useState } from 'react'
import { getCategoryProductsApi } from '@/app/shared/api/productApi'
import type { Category, ProductOptions } from '@/app/shared/types/category'

export function useProductOptions(categories: Category[]) {
  const [productOptions, setProductOptions] = useState<Record<number, ProductOptions[]>>({})
  const [loading, setLoading] = useState(false)
  const fetchedIds = useRef<Set<number>>(new Set())

  useEffect(() => {
    const newCategories = categories.filter((cat) => !fetchedIds.current.has(cat.id))
    if (newCategories.length === 0) return

    setLoading(true)
    let pending = newCategories.length

    newCategories.forEach((cat) => {
      fetchedIds.current.add(cat.id)
      getCategoryProductsApi(cat.id)
        .then((res) => {
          setProductOptions((prev) => ({ ...prev, [cat.id]: res.products ?? [] }))
        })
        .catch(() => {})
        .finally(() => {
          pending--
          if (pending === 0) setLoading(false)
        })
    })
  }, [categories])

  return { productOptions, loading }
}
