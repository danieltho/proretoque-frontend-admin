import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '../schema/productSchema'
import {
  getProductAdminApi,
  createProductAdminApi,
  updateProductAdminApi,
  sortProductItemsApi,
} from '../api/productsAdminApi'
import { getCategoriesAdminApi } from '@/app/core/category/api/categoriesAdminApi'
import type { ProductItem } from '../types/product'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'

export function useProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id
  const [loading, setLoading] = useState(!isNew)
  const [items, setItems] = useState<ProductItem[]>([])
  const [categoryOptions, setCategoryOptions] = useState<SearchableSelectOption[]>([])

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category_ids: [],
      type: '',
      price: 0,
      time: 0,
    },
  })

  // Load category options
  useEffect(() => {
    getCategoriesAdminApi(1, 100)
      .send()
      .then((res) => {
        setCategoryOptions(res.categories.map((cat) => ({ id: cat.id, label: cat.name })))
      })
  }, [])

  // Load product data for edit mode
  useEffect(() => {
    if (isNew || !id) return
    setLoading(true)
    getProductAdminApi(Number(id))
      .send()
      .then((res) => {
        const p = res
        form.reset({
          name: p.name,
          description: p.description ?? '',
          category_ids: p.categories.map((c) => c.id),
          type: p.type ?? '',
          price: p.price ?? 0,
          time: p.time ?? 0,
        })
        setItems(p.items ?? [])
      })
      .finally(() => setLoading(false))
  }, [id, isNew, form])

  const addItem = useCallback((item: Omit<ProductItem, 'id' | 'sort_order'>) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: -Date.now(),
        sort_order: prev.length + 1,
      },
    ])
  }, [])

  const removeItem = useCallback((itemId: number) => {
    setItems((prev) =>
      prev.filter((i) => i.id !== itemId).map((i, idx) => ({ ...i, sort_order: idx + 1 })),
    )
  }, [])

  const reorderItems = useCallback(
    (reordered: ProductItem[]) => {
      const updated = reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 }))
      setItems(updated)

      // Persist order to backend if editing an existing product
      if (!isNew && id) {
        const ids = updated.filter((i) => i.id > 0).map((i) => i.id)
        if (ids.length > 0) {
          sortProductItemsApi(Number(id), ids).send()
        }
      }
    },
    [id, isNew],
  )

  const updateItem = useCallback((itemId: number, data: Omit<ProductItem, 'id' | 'sort_order'>) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...data } : i)))
  }, [])

  const updateItemField = useCallback((itemId: number, field: 'name' | 'price' | 'duration_task', value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)))
  }, [])

  const [itemsError, setItemsError] = useState<string | null>(null)

  const handleSave = useCallback(() => {
    const onSubmit = async (values: ProductFormData) => {
      if (values.type === 'choice' && items.length === 0) {
        setItemsError('Debe agregar al menos un item')
        return
      }
      setItemsError(null)

      const payload = {
        name: values.name,
        description: values.description,
        category_ids: values.category_ids,
        type: values.type,
        price: values.price,
        time: values.time,
        ...(values.type === 'choice'
          ? {
              items: items.map((item, idx) => ({
                ...(item.id > 0 ? { id: item.id } : {}),
                name: item.name,
                description: item.description,
                tooltip: item.tooltip,
                description_provider: item.description_provider,
                description_postpro: item.description_postpro,
                price: item.price,
                duration_task: item.duration_task,
                lang: item.lang,
                sort_order: idx + 1,
              })),
            }
          : {}),
      }

      if (isNew) {
        await createProductAdminApi(payload).send()
      } else {
        await updateProductAdminApi(Number(id), payload).send()
      }
      navigate('/products')
    }

    form.handleSubmit(onSubmit as never)()
  }, [id, isNew, form, navigate, items])

  return {
    id,
    isNew,
    form,
    loading,
    items,
    itemsError,
    categoryOptions,
    addItem,
    removeItem,
    reorderItems,
    updateItem,
    updateItemField,
    handleSave,
  }
}
