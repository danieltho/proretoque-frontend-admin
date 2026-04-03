import { useCallback, useEffect, useRef, useState } from 'react'
import DialogModal from '@/app/shared/ui/DialogModal'
import { RetoquesSelector } from '@/app/shared/ui/RetoquesCard'
import { useProductOptions } from '@/app/shared/hooks/useProductOptions'
import { getCategoriesByTagApi } from '@/app/shared/api/productApi'
import { getBatchProductsApi, saveBatchProductsApi } from '../api/orderApi'
import type { Category } from '@/app/shared/types/category'

interface RetoquesModalProps {
  open: boolean
  batchId: number
  onClose: () => void
  onSaved: () => void
}

export function RetoquesModal({ open, batchId, onClose, onSaved }: RetoquesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [savedItemIds, setSavedItemIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const hasLoadedSelections = useRef(false)
  const { productOptions, loading: loadingProducts } = useProductOptions(categories)

  // Load categories on open
  useEffect(() => {
    if (!open) {
      hasLoadedSelections.current = false
      return
    }
    getCategoriesByTagApi('retoque')
      .send()
      .then((res) => setCategories(res.categories))
  }, [open])

  // Load saved product items on open
  useEffect(() => {
    if (!open) return
    getBatchProductsApi(batchId)
      .send()
      .then((res) => setSavedItemIds(res.product_item_ids ?? []))
      .catch(() => setSavedItemIds([]))
  }, [open, batchId])

  // Map saved item IDs to selections once productOptions are loaded
  useEffect(() => {
    if (hasLoadedSelections.current || savedItemIds.length === 0) return
    if (Object.keys(productOptions).length === 0) return

    const map: Record<number, string> = {}
    for (const itemId of savedItemIds) {
      for (const products of Object.values(productOptions)) {
        for (const product of products) {
          const match = product.options.find((o) => o.id === itemId)
          if (match) {
            map[product.id] = String(itemId)
          }
        }
      }
    }
    if (Object.keys(map).length > 0) {
      setSelections(map)
      hasLoadedSelections.current = true
    }
  }, [savedItemIds, productOptions])

  const handleSelectionChange = useCallback((productId: number, optionId: string) => {
    setSelections((prev) => ({ ...prev, [productId]: optionId }))
  }, [])

  const handleClose = useCallback(async () => {
    const itemIds = Object.values(selections)
      .filter(Boolean)
      .map(Number)

    setSaving(true)
    await saveBatchProductsApi(batchId, itemIds).send()
    setSaving(false)
    onSaved()

    setSelections({})
    setSavedItemIds([])
    setCategories([])
    onClose()
  }, [selections, batchId, onSaved, onClose])

  return (
    <DialogModal open={open} onClose={handleClose} title="Retoques del lote" size="fullScreen">
      {loadingProducts && categories.length > 0 ? (
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
