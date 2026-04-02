import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCategoryGroups from '../../hooks/useCategoryGroups'
import { createOrderApi } from '../../api/ordersApi'
import { createConversationApi } from '@/customers/chat/data/conversationsApi'
import { setBatchProductsApi } from '../../api/batchesApi'
import { uploadWithProgress } from '../../utils/uploadWithProgress'
import { useUploadStore } from '@/app/stores/uploadStore'
import { useBatchManager } from '../hooks/useBatchManager'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'
import type { LocalBatch, ViewMode, DeliveryOptions } from '../../types/batch'
import type { Category, CategoryGroup } from '@/shared/types/category'
import type { Order } from '../../types/order'
import type { Blocker } from 'react-router-dom'
import type { ProtocolProductItem } from '@/shared/types/protocol'

interface OrderFormContextValue {
  // Categories
  categories: Category[]
  categoryGroups: CategoryGroup[]

  // Batch manager (all from useBatchManager)
  batches: LocalBatch[]
  activeBatchId: string
  setActiveBatchId: (id: string) => void
  activeBatch: LocalBatch | undefined
  batchCount: number
  totalFiles: number
  validationErrors: string[]
  addBatch: () => void
  removeBatch: (id: string) => void
  renameBatch: (id: string, name: string) => void
  handleFiles: (files: FileList | null) => void
  removeFile: (index: number) => void
  handleItemSelect: (productId: number, itemIds: number[]) => void
  clearBatchProducts: () => void
  initProductsFromProtocol: (productItems: ProtocolProductItem[]) => void
  updateDeliveryOptions: (batchId: string, options: Partial<DeliveryOptions>) => void
  applyDeliveryToAll: (options: DeliveryOptions) => void

  // Order form state
  orderName: string
  setOrderName: (name: string) => void
  activeStep: number
  goStep: (step: number) => void
  canAdvanceFromCurrentStep: boolean
  activeCategoryId: number | null
  setSelectedCategoryId: (id: number | null) => void
  editingBatch: LocalBatch | null
  setEditingBatch: (batch: LocalBatch | null) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Chat
  conversationId: string | null

  // Submit
  submitting: boolean
  canSubmit: boolean
  handleSubmit: () => Promise<void>

  // Unsaved guard
  blocker: Blocker
}

const OrderFormContext = createContext<OrderFormContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderForm() {
  const ctx = useContext(OrderFormContext)
  if (!ctx) throw new Error('useOrderForm must be used within OrderFormProvider')
  return ctx
}

export function OrderFormProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { addTask, updateTask } = useUploadStore()

  // Categories with groups
  const { categoryGroups, allCategories } = useCategoryGroups()
  const categories: Category[] = allCategories

  // Batch manager
  const bm = useBatchManager()

  // Local state
  const [orderName, setOrderName] = useState('')
  const [activeStep, setActiveStep] = useState(1)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [editingBatch, setEditingBatch] = useState<LocalBatch | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [submitting, setSubmitting] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    createConversationApi()
      .send()
      .then((res) => setConversationId(res.data.id))
      .catch(() => {
        // Chat is optional — form continues without it
      })
  }, [])

  // Derived
  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null

  const isDirty =
    orderName.trim() !== '' ||
    bm.batches.some((b) => b.files.length > 0) ||
    bm.batches.some((b) => Object.values(b.products).some((ids) => ids.length > 0))

  const blocker = useUnsavedGuard(isDirty, submitting)

  const canSubmit = orderName.trim() !== '' && bm.totalFiles > 0 && !submitting

  const canAdvanceFromCurrentStep = activeStep === 1 ? bm.totalFiles > 0 : true

  const goStep = (step: number) => {
    if (step < 1 || step > 4) return
    if (activeStep === 1 && step > 1 && bm.totalFiles === 0) return
    setActiveStep(step)
  }

  const handleSubmit = async () => {
    // Guard: canSubmit must be true to proceed
    if (!canSubmit) return

    setSubmitting(true)

    try {
      // Step 1: Create the order
      let order: Order
      try {
        order = await createOrderApi({
          name: orderName.trim(),
          conversation_id: conversationId,
        }).send()
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear la pedido'
        // Log error but don't crash — setSubmitting(false) will be called in finally
        console.error('Failed to create order:', errorMsg)
        throw err
      }

      const orderId = order.id

      // Step 2: Upload batches sequentially
      for (const batch of bm.batches) {
        if (batch.files.length === 0) continue

        const taskId = crypto.randomUUID()
        const formData = new FormData()
        batch.files.forEach((file) => formData.append('images[]', file))

        addTask({
          id: taskId,
          name: `${batch.name} — ${batch.files.length} imágenes`,
          progress: 0,
          status: 'uploading',
        })

        try {
          const res = await uploadWithProgress(`/orders/${orderId}/batch`, formData, (percent) =>
            updateTask(taskId, { progress: percent }),
          )

          updateTask(taskId, { status: 'processing', progress: 0, batchId: res.batch.id })

          // Step 3: Set batch products
          const productItemIds = Object.values(batch.products).flat()
          try {
            await setBatchProductsApi(res.batch.id, { products: productItemIds }).send()
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al asignar productos'
            updateTask(taskId, {
              status: 'error',
              error: errorMsg,
            })
            // Continue to next batch even if product assignment fails
            continue
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error al subir imágenes'
          updateTask(taskId, {
            status: 'error',
            error: errorMsg,
          })
          // Continue to next batch even if upload fails
          continue
        }
      }

      // Only navigate if order was created successfully
      navigate(`/orders/${orderId}`)
    } catch (err) {
      // Order creation failed — don't navigate, stay on form
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Order submission failed:', errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const value: OrderFormContextValue = {
    categories,
    categoryGroups,
    ...bm,
    orderName,
    setOrderName,
    activeStep,
    goStep,
    canAdvanceFromCurrentStep,
    activeCategoryId,
    setSelectedCategoryId,
    editingBatch,
    setEditingBatch,
    viewMode,
    setViewMode,
    conversationId,
    submitting,
    canSubmit,
    handleSubmit,
    blocker,
  }

  return <OrderFormContext.Provider value={value}>{children}</OrderFormContext.Provider>
}
