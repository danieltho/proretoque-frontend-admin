import { useCallback, useEffect, useState } from 'react'
import DialogModal from '@/app/shared/ui/DialogModal'
import { RetoquesSelector } from '@/app/shared/ui/RetoquesCard'
import { useProductOptions } from '@/app/shared/hooks/useProductOptions'
import { getCategoriesByTagApi } from '@/app/shared/api/productApi'
import { getBatchProductsApi, saveBatchProductsApi } from '../api/orderApi'
import type { Category, ProductOptions } from '@/app/shared/types/category'

interface RetoquesModalProps {
  open: boolean
  batchId: number
  onClose: () => void
  onSaved: () => void
}

function mapSavedIdsToSelections(
  savedItemIds: number[],
  productOptions: Record<number, ProductOptions[]>,
): Record<number, string> {
  const map: Record<number, string> = {}
  for (const itemId of savedItemIds) {
    for (const products of Object.values(productOptions)) {
      for (const product of products) {
        if (product.options.some((o) => o.id === itemId)) {
          map[product.id] = String(itemId)
        }
      }
    }
  }
  return map
}

export function RetoquesModal({ open, batchId, onClose, onSaved }: RetoquesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const { productOptions, loading: loadingProducts } = useProductOptions(categories)

  // Load categories + saved items, then map selections once products are ready
  useEffect(() => {
    if (!open) {
      setCategories([])
      setSelections({})
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all([
      getCategoriesByTagApi('retoque').send(),
      getBatchProductsApi(batchId).send(),
    ])
      .then(([catRes, productsRes]) => {
        if (cancelled) return
        setCategories(catRes.categories)
        const savedIds = productsRes.product_item_ids ?? []
        if (savedIds.length > 0) {
          // productOptions may not be ready yet — store savedIds to map later
          setSavedIds(savedIds)
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, batchId])

  // Internal state to bridge async loading of saved IDs and product options
  const [savedIds, setSavedIds] = useState<number[]>([])

  // Map saved IDs → selections once ALL productOptions finish loading
  useEffect(() => {
    if (savedIds.length === 0 || loadingProducts) return
    if (Object.keys(productOptions).length === 0) return

    const mapped = mapSavedIdsToSelections(savedIds, productOptions)
    if (Object.keys(mapped).length > 0) {
      setSelections(mapped)
    }
    setSavedIds([])
  }, [savedIds, productOptions, loadingProducts])

  const handleSelectionChange = useCallback((productId: number, optionId: string) => {
    setSelections((prev) => ({ ...prev, [productId]: optionId }))
  }, [])

  const handleSave = useCallback(async () => {
    const itemIds = Object.values(selections)
      .filter(Boolean)
      .map(Number)

    setSaving(true)
    try {
      await saveBatchProductsApi(batchId, itemIds).send()
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }, [selections, batchId, onSaved, onClose])

  const isLoading = loading || (loadingProducts && categories.length > 0)

  return (
    <DialogModal open={open} onClose={handleSave} title="Retoques del lote" size="fullScreen">
      {isLoading ? (
        <div className="text-footer text-neutral-400">Cargando productos...</div>
      ) : (
        <RetoquesSelector
          categories={categories}
          productOptions={productOptions}
          selections={selections}
          onSelectionChange={handleSelectionChange}
        />
      )}
      {saving && <div className="text-footer text-neutral-400">Guardando...</div>}
    </DialogModal>
  )
}
