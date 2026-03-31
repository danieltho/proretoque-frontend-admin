/**
 * Tests TDD — useBatchCreate (fase RED)
 *
 * Hook: useBatchCreate(orderId?: string)
 * Responsabilidad: orquestar el flujo de creacion de un nuevo lote en 2 pasos:
 *   1. Paso 1 (Upload): seleccionar imágenes; canGoNext=true cuando files.length > 0
 *   2. Paso 2 (Protocolos): elegir categoría activa y seleccionar productos/items
 *   3. submit: uploadWithProgress → setBatchProductsApi → navigate(/orders/:id)
 *
 * Firma propuesta:
 *   useBatchCreate(orderId?: string): UseBatchCreateReturn
 *
 * Retorna:
 *   currentStep: 1 | 2
 *   goToStep: (step: 1 | 2) => void
 *   files: File[]
 *   previews: string[]
 *   handleFiles: (files: FileList | null) => void
 *   removeFile: (index: number) => void
 *   categories: Category[]
 *   activeCategoryId: number | null
 *   setActiveCategoryId: (id: number) => void
 *   selectedProducts: Record<number, number>
 *   handleItemSelect: (productId: number, itemId: number | null) => void
 *   clearProducts: () => void
 *   submit: () => Promise<void>
 *   submitting: boolean
 *   canGoNext: boolean
 *
 * Mocks:
 *   - @/features/orders/utils/uploadWithProgress — XHR de subida
 *   - @/features/orders/api/batchesApi (setBatchProductsApi)
 *   - @/api/categoriesApi (getCategoriesApi, getCategoriesByTagApi)
 *   - @/features/orders/hooks/useCategoryGroups — hook de grupos de categorías
 *   - @/app/stores/uploadStore (useUploadStore)
 *   - react-router-dom (useNavigate)
 *   - alova/client (useRequest)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBatchCreate } from '../hooks/useBatchCreate'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// uploadWithProgress necesita vi.hoisted porque se referencia desde vi.mock factory
const { mockUploadWithProgress } = vi.hoisted(() => ({
  mockUploadWithProgress: vi.fn(),
}))

vi.mock('@/features/orders/utils/uploadWithProgress', () => ({
  uploadWithProgress: mockUploadWithProgress,
}))

vi.mock('@/features/orders/api/batchesApi', () => ({
  setBatchProductsApi: vi.fn(),
  createBatchApi: vi.fn(),
}))

vi.mock('@/api/categoriesApi', () => ({
  getCategoriesApi: vi.fn(),
  getCategoriesByTagApi: vi.fn(),
}))

vi.mock('@/features/orders/hooks/useCategoryGroups', () => ({
  default: vi.fn(),
}))

vi.mock('@/app/stores/uploadStore', () => ({
  useUploadStore: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}))

// alova/client — useRequest usado para cargar categorías
vi.mock('alova/client', () => ({
  useRequest: vi.fn(),
}))

import { setBatchProductsApi } from '@/app/core/order/api/batchesApi'
import { useUploadStore } from '@/app/stores/uploadStore'
import useCategoryGroups from '@/app/core/order/hooks/useCategoryGroups'
import type { Category as CategoryType } from '@/app/shared/types/category'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockAddTask = vi.fn()
const mockUpdateTask = vi.fn()

const mockCategories: CategoryType[] = [
  { id: 1, name: 'Retratos' },
  { id: 2, name: 'Paisajes' },
]

function makeFile(name: string, type = 'image/jpeg'): File {
  const blob = new Blob(['x'], { type })
  return new File([blob], name, { type })
}

function makeFileList(files: File[]): FileList {
  const list = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: function* () {
      for (const f of files) yield f
    },
  } as unknown as FileList
  files.forEach((f, i) => Object.defineProperty(list, i, { value: f }))
  return list
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()

  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock-preview'),
    revokeObjectURL: vi.fn(),
  })

  vi.mocked(useUploadStore).mockReturnValue({
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
  } as unknown as ReturnType<typeof useUploadStore>)

  // useCategoryGroups devuelve categorías por defecto
  vi.mocked(useCategoryGroups).mockReturnValue({
    categoryGroups: [],
    allCategories: mockCategories,
    loading: false,
  } as unknown as ReturnType<typeof useCategoryGroups>)

  // uploadWithProgress resuelve con batchId por defecto
  mockUploadWithProgress.mockResolvedValue({ batch: { id: 99 } })

  // setBatchProductsApi resuelve ok por defecto
  vi.mocked(setBatchProductsApi).mockReturnValue({
    send: vi.fn().mockResolvedValue({ batch: {} }),
  } as unknown as ReturnType<typeof setBatchProductsApi>)
})

// ---------------------------------------------------------------------------
// Tests: Estado inicial
// ---------------------------------------------------------------------------

describe('useBatchCreate — estado inicial', () => {
  it('should_start_on_step_1', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.currentStep).toBe(1)
  })

  it('should_have_empty_files_on_mount', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.files).toHaveLength(0)
  })

  it('should_have_canGoNext_false_on_mount', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.canGoNext).toBe(false)
  })

  it('should_have_empty_selectedProducts_on_mount', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.selectedProducts).toEqual({})
  })

  it('should_have_activeCategoryId_null_on_mount', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.activeCategoryId).toBeNull()
  })

  it('should_have_submitting_false_on_mount', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert
    expect(result.current.submitting).toBe(false)
  })

  it('should_expose_categories_from_api', () => {
    // Arrange & Act
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Assert — las categorías provienen del useRequest mockeado
    expect(result.current.categories).toEqual(mockCategories)
  })
})

// ---------------------------------------------------------------------------
// Tests: handleFiles
// ---------------------------------------------------------------------------

describe('useBatchCreate — handleFiles', () => {
  it('should_add_files_when_handleFiles_called_with_image_files', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    const files = [makeFile('foto.jpg'), makeFile('otra.png', 'image/png')]

    // Act
    act(() => {
      result.current.handleFiles(makeFileList(files))
    })

    // Assert
    expect(result.current.files).toHaveLength(2)
  })

  it('should_set_canGoNext_true_after_adding_files', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Assert
    expect(result.current.canGoNext).toBe(true)
  })

  it('should_filter_out_non_image_files', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    const files = [makeFile('foto.jpg', 'image/jpeg'), makeFile('doc.pdf', 'application/pdf')]

    // Act
    act(() => {
      result.current.handleFiles(makeFileList(files))
    })

    // Assert — solo la imagen pasa el filtro
    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].name).toBe('foto.jpg')
  })

  it('should_do_nothing_when_handleFiles_called_with_null', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act
    act(() => {
      result.current.handleFiles(null)
    })

    // Assert
    expect(result.current.files).toHaveLength(0)
    expect(result.current.canGoNext).toBe(false)
  })

  it('should_create_preview_urls_for_added_files', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Assert
    expect(result.current.previews).toHaveLength(1)
    expect(result.current.previews[0]).toBe('blob:mock-preview')
  })
})

// ---------------------------------------------------------------------------
// Tests: removeFile
// ---------------------------------------------------------------------------

describe('useBatchCreate — removeFile', () => {
  it('should_remove_file_at_given_index', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('a.jpg'), makeFile('b.jpg')]))
    })

    // Act — eliminar el primer archivo
    act(() => {
      result.current.removeFile(0)
    })

    // Assert
    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].name).toBe('b.jpg')
  })

  it('should_revoke_object_url_when_file_removed', () => {
    // Arrange
    const mockRevokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:preview-to-revoke'),
      revokeObjectURL: mockRevokeObjectURL,
    })
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    act(() => {
      result.current.removeFile(0)
    })

    // Assert
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-to-revoke')
  })

  it('should_set_canGoNext_false_when_last_file_removed', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })
    expect(result.current.canGoNext).toBe(true)

    // Act
    act(() => {
      result.current.removeFile(0)
    })

    // Assert
    expect(result.current.canGoNext).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Tests: goToStep
// ---------------------------------------------------------------------------

describe('useBatchCreate — goToStep', () => {
  it('should_not_advance_to_step_2_when_canGoNext_is_false', () => {
    // Arrange — sin archivos, canGoNext=false
    const { result } = renderHook(() => useBatchCreate(undefined))
    expect(result.current.canGoNext).toBe(false)

    // Act
    act(() => {
      result.current.goToStep(2)
    })

    // Assert — permanece en paso 1
    expect(result.current.currentStep).toBe(1)
  })

  it('should_advance_to_step_2_when_canGoNext_is_true', () => {
    // Arrange — con archivos, canGoNext=true
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })
    expect(result.current.canGoNext).toBe(true)

    // Act
    act(() => {
      result.current.goToStep(2)
    })

    // Assert
    expect(result.current.currentStep).toBe(2)
  })

  it('should_always_allow_going_back_to_step_1', () => {
    // Arrange — avanzar a paso 2 primero
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })
    act(() => {
      result.current.goToStep(2)
    })
    expect(result.current.currentStep).toBe(2)

    // Act — volver al paso 1
    act(() => {
      result.current.goToStep(1)
    })

    // Assert — siempre permitido retroceder
    expect(result.current.currentStep).toBe(1)
  })

  it('should_allow_going_back_to_step_1_even_without_files', () => {
    // Arrange — directamente en paso 1, sin archivos
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act
    act(() => {
      result.current.goToStep(1)
    })

    // Assert — no hay error, sigue en paso 1
    expect(result.current.currentStep).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: setActiveCategoryId
// ---------------------------------------------------------------------------

describe('useBatchCreate — setActiveCategoryId', () => {
  it('should_update_activeCategoryId_when_setActiveCategoryId_called', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act
    act(() => {
      result.current.setActiveCategoryId(1)
    })

    // Assert
    expect(result.current.activeCategoryId).toBe(1)
  })

  it('should_change_activeCategoryId_when_called_again_with_different_id', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.setActiveCategoryId(1)
    })

    // Act
    act(() => {
      result.current.setActiveCategoryId(2)
    })

    // Assert
    expect(result.current.activeCategoryId).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Tests: handleItemSelect
// ---------------------------------------------------------------------------

describe('useBatchCreate — handleItemSelect', () => {
  it('should_add_product_item_selection_to_selectedProducts', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act — seleccionar item 10 para producto 5
    act(() => {
      result.current.handleItemSelect(5, [10])
    })

    // Assert
    expect(result.current.selectedProducts).toEqual({ 5: [10] })
  })

  it('should_override_previous_selection_for_same_product', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleItemSelect(5, [10])
    })

    // Act — seleccionar otro item para el mismo producto
    act(() => {
      result.current.handleItemSelect(5, [20])
    })

    // Assert — solo queda el último
    expect(result.current.selectedProducts).toEqual({ 5: [20] })
  })

  it('should_remove_product_when_handleItemSelect_called_with_empty_array', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleItemSelect(5, [10])
    })
    expect(result.current.selectedProducts[5]).toEqual([10])

    // Act — deseleccionar pasando array vacío
    act(() => {
      result.current.handleItemSelect(5, [])
    })

    // Assert — el producto ya no está en selectedProducts
    expect(result.current.selectedProducts[5]).toBeUndefined()
  })

  it('should_accumulate_multiple_product_selections', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))

    // Act — seleccionar varios productos
    act(() => {
      result.current.handleItemSelect(1, [100])
      result.current.handleItemSelect(2, [200])
      result.current.handleItemSelect(3, [300])
    })

    // Assert
    expect(result.current.selectedProducts).toEqual({ 1: [100], 2: [200], 3: [300] })
  })
})

// ---------------------------------------------------------------------------
// Tests: clearProducts
// ---------------------------------------------------------------------------

describe('useBatchCreate — clearProducts', () => {
  it('should_reset_selectedProducts_to_empty_object', () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleItemSelect(1, [100])
      result.current.handleItemSelect(2, [200])
    })
    expect(Object.keys(result.current.selectedProducts)).toHaveLength(2)

    // Act
    act(() => {
      result.current.clearProducts()
    })

    // Assert
    expect(result.current.selectedProducts).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// Tests: submit — flujo principal
// ---------------------------------------------------------------------------

describe('useBatchCreate — submit', () => {
  it('should_call_uploadWithProgress_with_files_on_submit', async () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — se llamó uploadWithProgress con la ruta correcta
    expect(mockUploadWithProgress).toHaveBeenCalledWith(
      '/orders/42/batch',
      expect.any(FormData),
      expect.any(Function),
    )
  })

  it('should_call_setBatchProductsApi_with_selected_item_ids_when_products_selected', async () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
      result.current.handleItemSelect(1, [100])
      result.current.handleItemSelect(2, [200])
    })

    // La respuesta de upload retorna batchId=99
    mockUploadWithProgress.mockResolvedValue({ batch: { id: 99 } })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — setBatchProductsApi llamado con los itemIds seleccionados
    expect(setBatchProductsApi).toHaveBeenCalledWith(99, {
      products: expect.arrayContaining([100, 200]),
    })
  })

  it('should_not_call_setBatchProductsApi_when_no_products_selected', async () => {
    // Arrange — sin productos seleccionados
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — no se llama setBatchProductsApi
    expect(setBatchProductsApi).not.toHaveBeenCalled()
  })

  it('should_navigate_to_order_detail_after_successful_submit', async () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — navega a la ruta del pedido
    expect(mockNavigate).toHaveBeenCalledWith('/orders/42')
  })

  it('should_add_upload_task_to_uploadStore_on_submit', async () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — se registra la tarea de upload
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'uploading',
        progress: 0,
      }),
    )
  })

  it('should_set_submitting_true_during_submit', async () => {
    // Arrange — bloquear la promesa para verificar el estado intermedio
    let resolveUpload: (value: { batch: { id: number } }) => void
    const uploadPromise = new Promise<{ batch: { id: number } }>((resolve) => {
      resolveUpload = resolve
    })
    mockUploadWithProgress.mockReturnValue(uploadPromise)

    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act — iniciar submit sin await
    act(() => {
      result.current.submit()
    })

    // Assert — durante la subida, submitting debe ser true
    await waitFor(() => {
      expect(result.current.submitting).toBe(true)
    })

    // Limpiar — resolver la promesa pendiente
    act(() => {
      resolveUpload!({ batch: { id: 99 } })
    })
  })

  it('should_set_submitting_false_after_successful_submit', async () => {
    // Arrange
    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert
    expect(result.current.submitting).toBe(false)
  })

  it('should_set_submitting_false_after_failed_submit', async () => {
    // Arrange — upload falla
    mockUploadWithProgress.mockRejectedValue(new Error('Upload failed'))

    const { result } = renderHook(() => useBatchCreate('42'))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      try {
        await result.current.submit()
      } catch {
        // ignorar error
      }
    })

    // Assert — incluso en error, submitting vuelve a false
    expect(result.current.submitting).toBe(false)
  })

  it('should_navigate_to_orders_route_when_no_orderId_provided', async () => {
    // Arrange — sin orderId, el hook crea el pedido internamente y navega
    // uploadWithProgress ya resuelve con { batch: { id: 99 } } por defecto en beforeEach
    const { result } = renderHook(() => useBatchCreate(undefined))
    act(() => {
      result.current.handleFiles(makeFileList([makeFile('foto.jpg')]))
    })

    // Act
    await act(async () => {
      await result.current.submit()
    })

    // Assert — debe navegar a alguna ruta de orders (el id depende de la implementación)
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/orders\//))
  })
})
