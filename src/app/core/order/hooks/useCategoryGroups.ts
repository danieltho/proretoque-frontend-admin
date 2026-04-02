import { useRequest } from 'alova/client'
import { getCategoriesByTagApi } from '@/shared/api/productApi'
import type { Category, CategoryGroup } from '@/shared/types/category'

const TAG_GROUPS = [
  { tag: 'retoque', label: 'Retoques' },
  { tag: 'opciones-de-entrega', label: 'Opciones de entrega' },
  { tag: 'tiempo-de-entrega', label: 'Tiempo de entrega' },
]

interface UseCategoryGroupsReturn {
  categoryGroups: CategoryGroup[]
  allCategories: Category[]
  loading: boolean
}

export default function useCategoryGroups(): UseCategoryGroupsReturn {
  // Load all three tag groups in parallel
  const retoqueRequest = useRequest(getCategoriesByTagApi('retoque'), {
    initialData: { categories: [] },
  })
  const opcionesRequest = useRequest(getCategoriesByTagApi('opciones-de-entrega'), {
    initialData: { categories: [] },
  })
  const tiempoRequest = useRequest(getCategoriesByTagApi('tiempo-de-entrega'), {
    initialData: { categories: [] },
  })

  // Build category groups
  const categoryGroups: CategoryGroup[] = [
    {
      tag: TAG_GROUPS[0].tag,
      label: TAG_GROUPS[0].label,
      categories: retoqueRequest.data.categories,
    },
    {
      tag: TAG_GROUPS[1].tag,
      label: TAG_GROUPS[1].label,
      categories: opcionesRequest.data.categories,
    },
    {
      tag: TAG_GROUPS[2].tag,
      label: TAG_GROUPS[2].label,
      categories: tiempoRequest.data.categories,
    },
  ]

  // Flatten all categories into a single list
  const allCategories = categoryGroups.flatMap((group) => group.categories)

  // Check if any request is loading
  const loading = retoqueRequest.loading || opcionesRequest.loading || tiempoRequest.loading

  return {
    categoryGroups,
    allCategories,
    loading,
  }
}
