/**
 * Tests TDD — useEditSubmit (fase RED)
 *
 * Hook: useEditSubmit(params)
 * Responsabilidad: orquestar el guardado de los cambios de edicion:
 * - Actualiza el nombre de la pedido si cambio
 * - Sube archivos nuevos (newFiles) por cada batch que los tenga
 * - Llama setBatchProductsApi si los productos del batch cambiaron
 * - Expone `submitting` para mostrar estado de carga
 * - Navega de vuelta al detalle de la pedido tras exito
 * - En caso de error: no navega, mantiene el estado
 *
 * Firma del hook (propuesta):
 *   useEditSubmit({
 *     order: Order | null,
 *     orderName: string,
 *     originalName: string,
 *     batches: EditableBatch[],
 *     onSuccess: () => void,
 *   })
 *
 * Retorna:
 *   {
 *     submitting: boolean,
 *     handleSubmit: () => Promise<void>,
 *   }
 *
 * Mocks:
 * - updateOrderApi — actualizar nombre de pedido
 * - uploadBatchImagesApi — subir imagenes nuevas
 * - setBatchProductsApi — actualizar productos del batch
 * - useUploadStore — tareas de progreso de carga
 * - useNavigate — redireccion tras exito
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Order, EditableBatch } from '../../types/order'
import { useEditSubmit } from '../hooks/useEditSubmit'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../api/ordersApi', () => ({
  updateOrderApi: vi.fn(),
}))

vi.mock('../../api/batchesApi', () => ({
  uploadBatchImagesApi: vi.fn(),
  setBatchProductsApi: vi.fn(),
}))

vi.mock('@/app/stores/uploadStore', () => ({
  useUploadStore: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

import { updateOrderApi } from '../../api/ordersApi'
import { uploadBatchImagesApi, setBatchProductsApi } from '../../api/batchesApi'
import { useUploadStore } from '@/app/stores/uploadStore'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  number: 100,
  name: 'Pedido original',
  status: 'pending',
  active: 1,
  created: '2026-01-01T00:00:00Z',
  size: 2048,
  count: 2,
  deadline: null,
  batches: [],
  ...overrides,
})

const makeEditableBatch = (overrides: Partial<EditableBatch> = {}): EditableBatch => ({
  id: 1,
  name: 'Lote 1',
  status: 'pending',
  files_size: 1024,
  files_count: 2,
  media: [],
  products: {},
  newFiles: [],
  newPreviews: [],
  ...overrides,
})

function makeFile(name: string): File {
  const blob = new Blob(['x'], { type: 'image/jpeg' })
  const file = new File([blob], name, { type: 'image/jpeg' })
  return file
}

const mockAddTask = vi.fn()
const mockUpdateTask = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  // Configurar useUploadStore mock por defecto
  vi.mocked(useUploadStore).mockReturnValue({
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
  } as unknown as ReturnType<typeof useUploadStore>)

  // API mocks por defecto (exitosos)
  vi.mocked(updateOrderApi).mockReturnValue({
    send: vi.fn().mockResolvedValue(makeOrder()),
  } as unknown as ReturnType<typeof updateOrderApi>)

  vi.mocked(uploadBatchImagesApi).mockReturnValue({
    send: vi.fn().mockResolvedValue({ batch: {} }),
  } as unknown as ReturnType<typeof uploadBatchImagesApi>)

  vi.mocked(setBatchProductsApi).mockReturnValue({
    send: vi.fn().mockResolvedValue({ batch: {} }),
  } as unknown as ReturnType<typeof setBatchProductsApi>)
})

// ---------------------------------------------------------------------------
// Helper para renderizar el hook con parametros tipicos
// ---------------------------------------------------------------------------

interface UseEditSubmitParams {
  order?: Order | null
  orderName?: string
  originalName?: string
  batches?: EditableBatch[]
  onSuccess?: () => void
}

function renderSubmitHook(overrides: UseEditSubmitParams = {}) {
  const defaults = {
    order: makeOrder(),
    orderName: 'Pedido original',
    originalName: 'Pedido original',
    batches: [makeEditableBatch()],
    onSuccess: vi.fn(),
  }
  const params = { ...defaults, ...overrides }
  return renderHook(() => useEditSubmit(params))
}

// ---------------------------------------------------------------------------
// Tests: Estado inicial
// ---------------------------------------------------------------------------

describe('useEditSubmit — estado inicial', () => {
  it('should_have_submitting_false_on_mount', () => {
    // Arrange & Act
    const { result } = renderSubmitHook()

    // Assert
    expect(result.current.submitting).toBe(false)
  })

  it('should_expose_handleSubmit_function', () => {
    // Arrange & Act
    const { result } = renderSubmitHook()

    // Assert
    expect(typeof result.current.handleSubmit).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// Tests: No hay cambios — no hace nada
// ---------------------------------------------------------------------------

describe('useEditSubmit — sin cambios', () => {
  it('should_not_call_updateOrderApi_when_name_has_not_changed', async () => {
    // Arrange — nombre igual, sin archivos nuevos
    const { result } = renderSubmitHook({
      orderName: 'Pedido original',
      originalName: 'Pedido original',
      batches: [makeEditableBatch({ newFiles: [] })],
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(updateOrderApi).not.toHaveBeenCalled()
  })

  it('should_not_call_uploadBatchImagesApi_when_no_batch_has_newFiles', async () => {
    // Arrange
    const { result } = renderSubmitHook({
      batches: [
        makeEditableBatch({ id: 1, newFiles: [] }),
        makeEditableBatch({ id: 2, newFiles: [] }),
      ],
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(uploadBatchImagesApi).not.toHaveBeenCalled()
  })

  it('should_call_onSuccess_even_when_there_are_no_changes', async () => {
    // Arrange
    const onSuccess = vi.fn()
    const { result } = renderSubmitHook({
      orderName: 'Pedido original',
      originalName: 'Pedido original',
      batches: [makeEditableBatch({ newFiles: [] })],
      onSuccess,
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert — onSuccess siempre se llama al completar el guardado
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Actualizacion del nombre
// ---------------------------------------------------------------------------

describe('useEditSubmit — actualizar nombre', () => {
  it('should_call_updateOrderApi_when_name_changed', async () => {
    // Arrange
    const order = makeOrder({ id: 5 })
    const { result } = renderSubmitHook({
      order,
      orderName: 'Nombre nuevo',
      originalName: 'Nombre viejo',
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(updateOrderApi).toHaveBeenCalledWith(5, { name: 'Nombre nuevo' })
  })

  it('should_not_call_updateOrderApi_when_name_is_unchanged', async () => {
    // Arrange
    const { result } = renderSubmitHook({
      orderName: 'Igual',
      originalName: 'Igual',
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(updateOrderApi).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Subida de archivos nuevos
// ---------------------------------------------------------------------------

describe('useEditSubmit — subir archivos nuevos', () => {
  it('should_call_uploadBatchImagesApi_for_each_batch_with_newFiles', async () => {
    // Arrange
    const file1 = makeFile('a.jpg')
    const file2 = makeFile('b.jpg')
    const batches = [
      makeEditableBatch({ id: 10, newFiles: [file1] }),
      makeEditableBatch({ id: 20, newFiles: [file2] }),
    ]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(uploadBatchImagesApi).toHaveBeenCalledTimes(2)
    expect(uploadBatchImagesApi).toHaveBeenCalledWith(10, expect.any(FormData))
    expect(uploadBatchImagesApi).toHaveBeenCalledWith(20, expect.any(FormData))
  })

  it('should_skip_batches_that_have_no_newFiles', async () => {
    // Arrange
    const file = makeFile('img.jpg')
    const batches = [
      makeEditableBatch({ id: 1, newFiles: [file] }),
      makeEditableBatch({ id: 2, newFiles: [] }), // sin archivos — debe saltarse
    ]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert — solo se llama una vez (para el batch 1)
    expect(uploadBatchImagesApi).toHaveBeenCalledTimes(1)
    expect(uploadBatchImagesApi).toHaveBeenCalledWith(1, expect.any(FormData))
  })

  it('should_add_upload_task_for_each_batch_being_uploaded', async () => {
    // Arrange
    const file = makeFile('foto.jpg')
    const batches = [makeEditableBatch({ id: 1, name: 'Lote fotos', newFiles: [file] })]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(mockAddTask).toHaveBeenCalledTimes(1)
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'uploading',
        progress: 0,
      }),
    )
  })

  it('should_update_task_to_completed_after_successful_upload', async () => {
    // Arrange
    const file = makeFile('foto.jpg')
    const batches = [makeEditableBatch({ id: 1, newFiles: [file] })]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 'completed', progress: 100 }),
    )
  })
})

// ---------------------------------------------------------------------------
// Tests: submitting — estado durante el guardado
// ---------------------------------------------------------------------------

describe('useEditSubmit — submitting state', () => {
  it('should_set_submitting_true_during_handleSubmit', async () => {
    // Arrange — simular una API lenta para capturar el estado intermedio
    let resolveUpdate: (value: Order) => void
    const updatePromise = new Promise<Order>((resolve) => {
      resolveUpdate = resolve
    })
    vi.mocked(updateOrderApi).mockReturnValue({
      send: vi.fn().mockReturnValue(updatePromise),
    } as unknown as ReturnType<typeof updateOrderApi>)

    const { result } = renderSubmitHook({
      orderName: 'Nombre nuevo',
      originalName: 'Nombre viejo',
    })

    // Act — iniciar submit sin esperar
    act(() => {
      result.current.handleSubmit()
    })

    // Assert — durante la operacion, submitting debe ser true
    await waitFor(() => {
      expect(result.current.submitting).toBe(true)
    })

    // Completar la operacion
    act(() => {
      resolveUpdate!(makeOrder())
    })
  })

  it('should_set_submitting_false_after_successful_submit', async () => {
    // Arrange
    const file = makeFile('img.jpg')
    const batches = [makeEditableBatch({ id: 1, newFiles: [file] })]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(result.current.submitting).toBe(false)
  })

  it('should_set_submitting_false_after_failed_submit', async () => {
    // Arrange — API de actualizacion de nombre falla
    vi.mocked(updateOrderApi).mockReturnValue({
      send: vi.fn().mockRejectedValue(new Error('API Error')),
    } as unknown as ReturnType<typeof updateOrderApi>)

    const { result } = renderSubmitHook({
      orderName: 'Nombre diferente',
      originalName: 'Nombre original',
    })

    // Act
    await act(async () => {
      try {
        await result.current.handleSubmit()
      } catch {
        // ignorar
      }
    })

    // Assert — incluso en error, submitting vuelve a false
    expect(result.current.submitting).toBe(false)
  })

  it('should_not_call_handleSubmit_if_order_is_null', async () => {
    // Arrange
    const { result } = renderSubmitHook({ order: null })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert — sin pedido no hay nada que guardar
    expect(updateOrderApi).not.toHaveBeenCalled()
    expect(uploadBatchImagesApi).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Navegacion y callback de exito
// ---------------------------------------------------------------------------

describe('useEditSubmit — onSuccess y navegacion', () => {
  it('should_call_onSuccess_after_all_changes_are_saved', async () => {
    // Arrange
    const onSuccess = vi.fn()
    const file = makeFile('img.jpg')
    const { result } = renderSubmitHook({
      orderName: 'Nuevo nombre',
      originalName: 'Viejo nombre',
      batches: [makeEditableBatch({ id: 1, newFiles: [file] })],
      onSuccess,
    })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_onSuccess_when_submit_fails', async () => {
    // Arrange
    vi.mocked(updateOrderApi).mockReturnValue({
      send: vi.fn().mockRejectedValue(new Error('Fallo')),
    } as unknown as ReturnType<typeof updateOrderApi>)

    const onSuccess = vi.fn()
    const { result } = renderSubmitHook({
      orderName: 'Nombre nuevo',
      originalName: 'Nombre viejo',
      onSuccess,
    })

    // Act
    await act(async () => {
      try {
        await result.current.handleSubmit()
      } catch {
        // ignorar el error
      }
    })

    // Assert
    expect(onSuccess).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Subida con error — tarea marcada como error
// ---------------------------------------------------------------------------

describe('useEditSubmit — error en subida de imagenes', () => {
  it('should_mark_upload_task_as_error_when_uploadBatchImagesApi_fails', async () => {
    // Arrange
    vi.mocked(uploadBatchImagesApi).mockReturnValue({
      send: vi.fn().mockRejectedValue(new Error('Upload failed')),
    } as unknown as ReturnType<typeof uploadBatchImagesApi>)

    const file = makeFile('img.jpg')
    const batches = [makeEditableBatch({ id: 1, newFiles: [file] })]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert — la tarea de upload debe marcarse como error
    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 'error' }),
    )
  })

  it('should_continue_with_other_batches_even_if_one_upload_fails', async () => {
    // Arrange — primer batch falla, segundo debe intentarse igual
    vi.mocked(uploadBatchImagesApi)
      .mockReturnValueOnce({
        send: vi.fn().mockRejectedValue(new Error('Upload batch 1 failed')),
      } as unknown as ReturnType<typeof uploadBatchImagesApi>)
      .mockReturnValueOnce({
        send: vi.fn().mockResolvedValue({ batch: {} }),
      } as unknown as ReturnType<typeof uploadBatchImagesApi>)

    const file1 = makeFile('a.jpg')
    const file2 = makeFile('b.jpg')
    const batches = [
      makeEditableBatch({ id: 1, newFiles: [file1] }),
      makeEditableBatch({ id: 2, newFiles: [file2] }),
    ]
    const { result } = renderSubmitHook({ batches })

    // Act
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Assert — se intentaron los dos uploads
    expect(uploadBatchImagesApi).toHaveBeenCalledTimes(2)
  })
})
