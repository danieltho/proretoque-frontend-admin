/**
 * Tests TDD — useMediaActions (fase RED)
 *
 * Hook: useMediaActions()
 * Responsabilidad: encapsular las operaciones de mover y borrar media
 * dentro de los batches de una pedido en edicion.
 *
 * El hook recibe batches y activeBatchId del exterior (via parametros o
 * a traves del contexto de edicion) y expone:
 *   {
 *     moveMedia: (mediaId: number, targetBatchId: number) => Promise<void>
 *     deleteMedia: (mediaId: number) => Promise<void>
 *     movingMediaId: number | null     — id del media en proceso de mover
 *     deletingMediaId: number | null   — id del media en proceso de eliminar
 *   }
 *
 * Las actualizaciones de estado (setBatches) se reciben como callback
 * inyectado para mantener el hook desacoplado del proveedor.
 *
 * Mocks:
 * - moveMediaApi, deleteMediaApi de batchesApi
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { EditableBatch, MoveMediaResponse, BatchDetail, Media } from '../../types/order'
import { useMediaActions } from '../hooks/useMediaActions'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../api/batchesApi', () => ({
  moveMediaApi: vi.fn(),
  deleteMediaApi: vi.fn(),
}))

import { moveMediaApi, deleteMediaApi } from '../../api/batchesApi'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeMedia = (id: number): Media => ({
  id,
  file_name: `file-${id}.jpg`,
  size: 1024,
  url: `https://example.com/media/${id}`,
})

const makeBatchDetail = (id: number, mediaIds: number[] = []): BatchDetail => ({
  id,
  name: `Lote ${id}`,
  status: 'pending',
  files_size: 1024 * mediaIds.length,
  files_count: mediaIds.length,
  media: mediaIds.map(makeMedia),
})

const makeEditableBatch = (id: number, mediaIds: number[] = []): EditableBatch => ({
  id,
  name: `Lote ${id}`,
  status: 'pending',
  files_size: 1024 * mediaIds.length,
  files_count: mediaIds.length,
  media: mediaIds.map(makeMedia),
  products: {},
  newFiles: [],
  newPreviews: [],
})

const makeMoveResponse = (
  sourceBatchId: number,
  sourceMediaIds: number[],
  targetBatchId: number,
  targetMediaIds: number[],
): MoveMediaResponse => ({
  source_batch: makeBatchDetail(sourceBatchId, sourceMediaIds),
  target_batch: makeBatchDetail(targetBatchId, targetMediaIds),
})

function mockMoveSuccess(response: MoveMediaResponse) {
  vi.mocked(moveMediaApi).mockReturnValue({
    send: vi.fn().mockResolvedValue(response),
  } as unknown as ReturnType<typeof moveMediaApi>)
}

function mockMoveError(error: Error) {
  vi.mocked(moveMediaApi).mockReturnValue({
    send: vi.fn().mockRejectedValue(error),
  } as unknown as ReturnType<typeof moveMediaApi>)
}

function mockDeleteSuccess() {
  vi.mocked(deleteMediaApi).mockReturnValue({
    send: vi.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof deleteMediaApi>)
}

function mockDeleteError(error: Error) {
  vi.mocked(deleteMediaApi).mockReturnValue({
    send: vi.fn().mockRejectedValue(error),
  } as unknown as ReturnType<typeof deleteMediaApi>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Estado de tracking inicial
// ---------------------------------------------------------------------------

describe('useMediaActions — estado inicial', () => {
  it('should_have_movingMediaId_null_on_mount', () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10, 20]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()

    // Act
    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Assert
    expect(result.current.movingMediaId).toBeNull()
  })

  it('should_have_deletingMediaId_null_on_mount', () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()

    // Act
    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Assert
    expect(result.current.deletingMediaId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests: moveMedia — caso exitoso
// ---------------------------------------------------------------------------

describe('useMediaActions — moveMedia exitoso', () => {
  it('should_call_moveMediaApi_with_correct_arguments', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10, 20]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    const response = makeMoveResponse(1, [20], 2, [10])
    mockMoveSuccess(response)

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert — debe llamar con (sourceBatchId, mediaId, targetBatchId)
    expect(moveMediaApi).toHaveBeenCalledWith(1, 10, 2)
  })

  it('should_call_setBatches_with_updated_data_after_move', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10, 20]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    const response = makeMoveResponse(1, [20], 2, [10])
    mockMoveSuccess(response)

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert — setBatches fue llamada para actualizar el estado
    expect(setBatches).toHaveBeenCalled()
  })

  it('should_set_movingMediaId_during_move_operation', async () => {
    // Arrange
    let resolveMove: (value: MoveMediaResponse) => void
    const movePromise = new Promise<MoveMediaResponse>((resolve) => {
      resolveMove = resolve
    })
    vi.mocked(moveMediaApi).mockReturnValue({
      send: vi.fn().mockReturnValue(movePromise),
    } as unknown as ReturnType<typeof moveMediaApi>)

    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act — iniciar la operacion sin esperar
    act(() => {
      result.current.moveMedia(10, 2)
    })

    // Assert — durante la operacion, movingMediaId debe ser el id del media
    await waitFor(() => {
      expect(result.current.movingMediaId).toBe(10)
    })

    // Completar la operacion
    act(() => {
      resolveMove!(makeMoveResponse(1, [], 2, [10]))
    })
  })

  it('should_reset_movingMediaId_to_null_after_move_completes', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    const response = makeMoveResponse(1, [], 2, [10])
    mockMoveSuccess(response)

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert
    expect(result.current.movingMediaId).toBeNull()
  })

  it('should_not_call_moveMediaApi_when_targetBatchId_equals_activeBatchId', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()
    mockMoveSuccess(makeMoveResponse(1, [10], 1, [10]))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act — intentar mover al mismo batch
    await act(async () => {
      await result.current.moveMedia(10, 1)
    })

    // Assert — la API no debe haberse llamado
    expect(moveMediaApi).not.toHaveBeenCalled()
  })

  it('should_not_call_moveMediaApi_when_activeBatchId_is_null', async () => {
    // Arrange
    const batches: EditableBatch[] = []
    const setBatches = vi.fn()

    const { result } = renderHook(() =>
      useMediaActions({ batches, activeBatchId: null, setBatches }),
    )

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert
    expect(moveMediaApi).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: moveMedia — manejo de errores y rollback
// ---------------------------------------------------------------------------

describe('useMediaActions — moveMedia con error', () => {
  it('should_reset_movingMediaId_to_null_after_move_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    mockMoveError(new Error('Network error'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert
    expect(result.current.movingMediaId).toBeNull()
  })

  it('should_expose_lastError_when_moveMedia_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    mockMoveError(new Error('Move failed'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert — el hook captura el error y lo expone via lastError
    expect(result.current.lastError).toBe('Move failed')
  })

  it('should_not_call_setBatches_when_moveMedia_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10]), makeEditableBatch(2, [])]
    const setBatches = vi.fn()
    mockMoveError(new Error('API error'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.moveMedia(10, 2)
    })

    // Assert — no debe actualizar el estado si la API falla
    expect(setBatches).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: deleteMedia — caso exitoso
// ---------------------------------------------------------------------------

describe('useMediaActions — deleteMedia exitoso', () => {
  it('should_call_deleteMediaApi_with_correct_arguments', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10, 20])]
    const setBatches = vi.fn()
    mockDeleteSuccess()

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert — debe llamar con (batchId, mediaId)
    expect(deleteMediaApi).toHaveBeenCalledWith(1, 10)
  })

  it('should_call_setBatches_to_remove_media_from_active_batch', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10, 20])]
    const setBatches = vi.fn()
    mockDeleteSuccess()

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert
    expect(setBatches).toHaveBeenCalled()
  })

  it('should_set_deletingMediaId_during_delete_operation', async () => {
    // Arrange
    let resolveDelete: () => void
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve
    })
    vi.mocked(deleteMediaApi).mockReturnValue({
      send: vi.fn().mockReturnValue(deletePromise),
    } as unknown as ReturnType<typeof deleteMediaApi>)

    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    act(() => {
      result.current.deleteMedia(10)
    })

    // Assert — durante la operacion
    await waitFor(() => {
      expect(result.current.deletingMediaId).toBe(10)
    })

    // Resolver la promise
    act(() => {
      resolveDelete!()
    })
  })

  it('should_reset_deletingMediaId_to_null_after_delete_completes', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()
    mockDeleteSuccess()

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert
    expect(result.current.deletingMediaId).toBeNull()
  })

  it('should_not_call_deleteMediaApi_when_activeBatchId_is_null', async () => {
    // Arrange
    const batches: EditableBatch[] = []
    const setBatches = vi.fn()

    const { result } = renderHook(() =>
      useMediaActions({ batches, activeBatchId: null, setBatches }),
    )

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert
    expect(deleteMediaApi).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: deleteMedia — manejo de errores y rollback
// ---------------------------------------------------------------------------

describe('useMediaActions — deleteMedia con error', () => {
  it('should_reset_deletingMediaId_to_null_after_delete_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()
    mockDeleteError(new Error('Delete failed'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert
    expect(result.current.deletingMediaId).toBeNull()
  })

  it('should_expose_lastError_when_deleteMedia_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()
    mockDeleteError(new Error('Delete failed'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert — el hook captura el error y lo expone via lastError
    expect(result.current.lastError).toBe('Delete failed')
  })

  it('should_not_call_setBatches_when_deleteMedia_fails', async () => {
    // Arrange
    const batches = [makeEditableBatch(1, [10])]
    const setBatches = vi.fn()
    mockDeleteError(new Error('API error'))

    const { result } = renderHook(() => useMediaActions({ batches, activeBatchId: 1, setBatches }))

    // Act
    await act(async () => {
      await result.current.deleteMedia(10)
    })

    // Assert
    expect(setBatches).not.toHaveBeenCalled()
  })
})
