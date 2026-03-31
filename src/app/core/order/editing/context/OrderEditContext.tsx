import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useCategoryGroups from '../../hooks/useCategoryGroups'
import { useOrderLoader } from '../hooks/useOrderLoader'
import { useMediaActions } from '../hooks/useMediaActions'
import { useBatchLoader } from '../hooks/useBatchLoader'
import { useEditSubmit } from '../hooks/useEditSubmit'
import { hydrateEditableBatches } from '../utils/hydrateEditableBatches'
import { validateFiles } from '../../utils/validateFiles'
import type { Order, EditableBatch } from '../../types/order'
import type { ViewMode } from '../../types/batch'
import type { Category, CategoryGroup } from '@/shared/types/category'

interface OrderEditContextValue {
  // Order data
  order: Order | null
  loading: boolean
  error: Error | null

  // Editable state
  orderName: string
  setOrderName: (name: string) => void
  batches: EditableBatch[]
  activeBatchId: number | null
  setActiveBatchId: (id: number) => void
  activeBatch: EditableBatch | undefined

  // Navigation
  activeStep: number
  goStep: (step: number) => void

  // View
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Categories (for retoques step)
  categories: Category[]
  categoryGroups: CategoryGroup[]
  activeCategoryId: number | null
  setSelectedCategoryId: (id: number) => void

  // Product selection
  handleItemSelect: (productId: number, itemIds: number[]) => void

  // Media actions
  moveMedia: (mediaId: number, targetBatchId: number) => Promise<void>
  deleteMedia: (mediaId: number) => Promise<void>

  // File actions
  handleFiles: (files: FileList | null) => void
  removeNewFile: (index: number) => void
  validationErrors: string[]

  // Submit
  submitting: boolean
  canSubmit: boolean
  hasChanges: boolean
  handleSubmit: () => Promise<void>

  // Refetch
  refetchBatch: (batchId: number) => Promise<void>
}

const OrderEditContext = createContext<OrderEditContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderEdit() {
  const ctx = useContext(OrderEditContext)
  if (!ctx) throw new Error('useOrderEdit must be used within OrderEditProvider')
  return ctx
}

export function OrderEditProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Sanitize: ensure id param is a valid positive integer string before passing downstream
  const sanitizedId = id && /^\d+$/.test(id) ? id : ''

  // Compose hooks for different concerns
  const { order, loading, error } = useOrderLoader(sanitizedId)

  // Batches state management
  const [batches, setBatches] = useState<EditableBatch[]>([])
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null)

  // Initialize and hydrate batches when order loads
  useEffect(() => {
    if (order) {
      const hydrated = hydrateEditableBatches(order.batches)
      setBatches(hydrated)

      if (activeBatchId === null && hydrated.length > 0) {
        setActiveBatchId(hydrated[0].id)
      }
    } else {
      setBatches([])
      setActiveBatchId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  const activeBatch = useMemo(
    () => batches.find((b) => b.id === activeBatchId),
    [batches, activeBatchId],
  )

  // Media actions
  const { moveMedia, deleteMedia } = useMediaActions({
    batches,
    activeBatchId,
    setBatches,
  })

  // Load batch media when active batch changes
  useBatchLoader({ activeBatchId, setBatches })

  // Categories for retoques step
  const { categoryGroups, allCategories } = useCategoryGroups()
  const categories: Category[] = allCategories
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null

  // UI state: step navigation and view mode
  const [activeStep, setActiveStep] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Order editing state
  const [orderName, setOrderName] = useState('')

  // Initialize orderName when order loads
  useEffect(() => {
    if (order && orderName === '') {
      setOrderName(order.name)
    }
  }, [order, orderName])

  // Submit logic
  const onSubmitSuccess = useCallback(() => {
    navigate(`/orders/${order?.id}`)
  }, [order?.id, navigate])

  const { submitting, handleSubmit: handleSubmitLogic } = useEditSubmit({
    order,
    orderName,
    originalName: order?.name || '',
    batches,
    onSuccess: onSubmitSuccess,
  })

  // Navigation — 4 steps: 1=Batches, 2=Upload, 3=Retoques, 4=Guardar
  const goStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) setActiveStep(step)
  }, [])

  // Check if there are changes
  const hasChanges = orderName !== (order?.name || '') || batches.some((b) => b.newFiles.length > 0)

  // canSubmit: there must be changes and not currently submitting
  const canSubmit = hasChanges && !submitting

  // Validation errors state for file uploads
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Handle file uploads with validation
  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || !activeBatchId) return

      const fileArray = Array.from(newFiles)
      const validation = validateFiles(fileArray)

      setValidationErrors(validation.errors)

      // Only add valid files
      setBatches((prev) =>
        prev.map((batch) => {
          if (batch.id === activeBatchId) {
            const newPreviews = validation.valid.map((file) => URL.createObjectURL(file))
            return {
              ...batch,
              newFiles: [...batch.newFiles, ...validation.valid],
              newPreviews: [...batch.newPreviews, ...newPreviews],
            }
          }
          return batch
        }),
      )
    },
    [activeBatchId],
  )

  // Remove new file
  const removeNewFile = useCallback(
    (index: number) => {
      if (!activeBatchId) return

      setBatches((prev) =>
        prev.map((batch) => {
          if (batch.id !== activeBatchId) return batch
          const previewToRevoke = batch.newPreviews[index]
          if (previewToRevoke) {
            URL.revokeObjectURL(previewToRevoke)
          }
          return {
            ...batch,
            newFiles: batch.newFiles.filter((_, i) => i !== index),
            newPreviews: batch.newPreviews.filter((_, i) => i !== index),
          }
        }),
      )
    },
    [activeBatchId],
  )

  // Product selection for active batch
  const handleItemSelect = useCallback(
    (productId: number, itemIds: number[]) => {
      if (!activeBatchId) return
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== activeBatchId) return b
          const next = { ...b.products }
          if (itemIds.length === 0) {
            delete next[productId]
          } else {
            next[productId] = itemIds
          }
          return { ...b, products: next }
        }),
      )
    },
    [activeBatchId],
  )

  // Refetch batch (for external callers)
  const refetchBatch = useCallback(
    async (batchId: number) => {
      // Trigger reload by setting activeBatchId temporarily
      const currentId = activeBatchId
      if (currentId === batchId) {
        setActiveBatchId(batchId)
      }
    },
    [activeBatchId],
  )

  const value: OrderEditContextValue = {
    order: order ?? null,
    loading,
    error: error ?? null,
    orderName,
    setOrderName,
    batches,
    activeBatchId,
    setActiveBatchId,
    activeBatch,
    activeStep,
    goStep,
    viewMode,
    setViewMode,
    categories,
    categoryGroups,
    activeCategoryId,
    setSelectedCategoryId,
    handleItemSelect,
    moveMedia,
    deleteMedia,
    handleFiles,
    removeNewFile,
    validationErrors,
    submitting,
    canSubmit,
    hasChanges,
    handleSubmit: handleSubmitLogic,
    refetchBatch,
  }

  return <OrderEditContext.Provider value={value}>{children}</OrderEditContext.Provider>
}
