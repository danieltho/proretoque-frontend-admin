import { useCallback, useEffect, useState } from 'react'
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
  const [saving, setSaving] = useState(false)
  const { productOptions, loading: loadingProducts } = useProductOptions(categories)

  useEffect(() => {
    if (!open) return
    getCategoriesByTagApi('retoque')
      .send()
      .then((res) => setCategories(res.categories))
  }, [open])

  useEffect(() => {
    if (!open) return
    getBatchProductsApi(batchId)
      .send()
      .then((res) => {
        const map: Record<number, string> = {}
        for (const itemId of res.product_item_ids) {
          for (const products of Object.values(productOptions)) {
            for (const product of products) {
              const match = product.options.find((o) => o.id === itemId)
              if (match) {
                map[product.id] = String(itemId)
              }
            }
          }
        }
        setSelections(map)
      })
      .catch(() => setSelections({}))
  }, [open, batchId, productOptions])

  const handleSelectionChange = useCallback((productId: number, optionId: string) => {
    setSelections((prev) => ({ ...prev, [productId]: optionId }))
  }, [])

  const handleClose = useCallback(async () => {
    const itemIds = Object.values(selections)
      .filter(Boolean)
      .map(Number)

    if (itemIds.length > 0) {
      setSaving(true)
      await saveBatchProductsApi(batchId, itemIds).send()
      setSaving(false)
      onSaved()
    }
    setSelections({})
    setCategories([])
    onClose()
  }, [selections, batchId, onSaved, onClose])

  return (
    <DialogModal
      open={open}
      onClose={handleClose}
      title="Retoques del lote"
      size="fullScreen"
    >
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
