import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCategoryGroups from '../../hooks/useCategoryGroups'
import { useUploadStore } from '@/app/stores/uploadStore'
import { uploadWithProgress } from '@/app/core/order/utils/uploadWithProgress'
import { setBatchProductsApi } from '@/app/core/order/api/batchesApi'
import { validateFiles, sanitizeFileName } from '@/app/core/order/utils/validateFiles'
import type { Category, CategoryGroup } from '@/app/shared/types/category'

export interface UseBatchCreateReturn {
  currentStep: 1 | 2
  goToStep: (step: 1 | 2) => void
  files: File[]
  previews: string[]
  handleFiles: (files: FileList | null) => void
  removeFile: (index: number) => void
  categories: Category[]
  categoryGroups: CategoryGroup[]
  activeCategoryId: number | null
  setActiveCategoryId: (id: number) => void
  selectedProducts: Record<number, number[]>
  handleItemSelect: (productId: number, itemIds: number[]) => void
  clearProducts: () => void
  submit: () => Promise<void>
  submitting: boolean
  canGoNext: boolean
}

export function useBatchCreate(orderId: string | undefined): UseBatchCreateReturn {
  const navigate = useNavigate()
  const { addTask, updateTask } = useUploadStore()

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // File management (Step 1)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const previewUrlsRef = useRef<string[]>([])

  // Categories & products (Step 2)
  const { categoryGroups, allCategories } = useCategoryGroups()
  const categories = allCategories

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number[]>>({})

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)

  // Computed
  const canGoNext = files.length > 0

  // Handle files from input
  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return

    const filesToValidate = Array.from(fileList)
    const { valid: validFiles, errors: validationErrors } = validateFiles(filesToValidate)

    // Log validation errors for debugging
    if (validationErrors.length > 0) {
      console.warn('File validation errors:', validationErrors)
    }

    setFiles((prev) => [...prev, ...validFiles])

    const newPreviews = validFiles.map((f) => URL.createObjectURL(f))
    previewUrlsRef.current.push(...newPreviews)
    setPreviews((prev) => [...prev, ...newPreviews])
  }, [])

  // Remove a file by index
  const removeFile = useCallback((index: number) => {
    const urlToRevoke = previewUrlsRef.current[index]
    if (urlToRevoke) URL.revokeObjectURL(urlToRevoke)

    previewUrlsRef.current.splice(index, 1)
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Navigate between steps
  const goToStep = useCallback(
    (step: 1 | 2) => {
      // Only allow going forward if canGoNext, or always allow going back
      if (step > currentStep && !canGoNext) return
      setCurrentStep(step)
    },
    [currentStep, canGoNext],
  )

  // Handle product selection
  const handleItemSelect = useCallback((productId: number, itemIds: number[]) => {
    setSelectedProducts((prev) => {
      const next = { ...prev }
      if (itemIds.length === 0) {
        delete next[productId]
      } else {
        next[productId] = itemIds
      }
      return next
    })
  }, [])

  // Clear all selected products
  const clearProducts = useCallback(() => {
    setSelectedProducts({})
  }, [])

  // Submit the batch creation
  const submit = useCallback(async () => {
    // Guard against double submit
    if (isSubmittingRef.current) return

    // Validate orderId as positive integer, or use generic route if not provided
    let id: number | undefined
    let navigatePath = '/orders/'

    if (orderId) {
      id = parseInt(orderId, 10)
      if (isNaN(id) || id < 1) {
        console.error('Invalid orderId:', orderId)
        return
      }
      navigatePath = `/orders/${id}`
    }

    isSubmittingRef.current = true
    setSubmitting(true)
    try {
      const taskId = crypto.randomUUID()
      const formData = new FormData()
      files.forEach((file) => {
        const sanitized = sanitizeFileName(file.name)
        formData.append('images[]', file, sanitized)
      })

      addTask({
        id: taskId,
        name: `${files.length} imágenes`,
        progress: 0,
        status: 'uploading',
      })

      // Upload files
      const uploadUrl = id ? `/orders/${id}/batch` : '/batch'
      const uploadRes = await uploadWithProgress(uploadUrl, formData, (percent) =>
        updateTask(taskId, { progress: percent }),
      )

      // Validate response before using
      if (!uploadRes?.batch?.id) {
        throw new Error('Invalid response from server: missing batch.id')
      }

      const batchId = uploadRes.batch.id

      // If products are selected, set them on the batch
      if (Object.keys(selectedProducts).length > 0) {
        const productIds = Object.values(selectedProducts).flat()
        await setBatchProductsApi(batchId, { products: productIds }).send()
      }

      updateTask(taskId, { status: 'completed', batchId })

      // Navigate to order detail or orders list
      navigate(navigatePath)
      setSubmitting(false)
    } catch (err) {
      // Log error without re-throwing to avoid unhandled rejection
      console.error('Batch creation error:', err)
      setSubmitting(false)
    } finally {
      isSubmittingRef.current = false
    }
  }, [files, selectedProducts, orderId, addTask, updateTask, navigate])

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return {
    currentStep,
    goToStep,
    files,
    previews,
    handleFiles,
    removeFile,
    categories,
    categoryGroups,
    activeCategoryId,
    setActiveCategoryId,
    selectedProducts,
    handleItemSelect,
    clearProducts,
    submit,
    submitting,
    canGoNext,
  }
}
