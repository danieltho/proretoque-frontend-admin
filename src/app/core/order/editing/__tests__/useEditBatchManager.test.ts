/**
 * Tests TDD — useEditBatchManager (fase RED)
 *
 * Hook: useEditBatchManager(order: Order | null)
 * Responsabilidad: gestionar el estado local de los batches editables
 * a partir de una pedido cargada. Hidrata via hydrateEditableBatches,
 * gestiona el batch activo, agrega/quita archivos nuevos con validacion.
 *
 * Contrato de la interfaz retornada:
 *   {
 *     batches: EditableBatch[]
 *     activeBatchId: number | null
 *     setActiveBatchId: (id: number) => void
 *     activeBatch: EditableBatch | undefined
 *     addNewFiles: (files: FileList | File[]) => void
 *     removeNewFile: (index: number) => void
 *     validationErrors: string[]
 *   }
 *
 * Mocks:
 * - hydrateEditableBatches — mockeada para controlar el output
 * - validateFiles — mockeada para controlar la validacion
 * - URL.createObjectURL — nativa del browser, debe stubbearse en jsdom
 * - URL.revokeObjectURL — idem
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Order, EditableBatch } from '../../types/order'
import { useEditBatchManager } from '../hooks/useEditBatchManager'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../utils/hydrateEditableBatches', () => ({
  hydrateEditableBatches: vi.fn(),
}))

vi.mock('../../utils/validateFiles', () => ({
  validateFiles: vi.fn(),
}))

import { hydrateEditableBatches } from '../utils/hydrateEditableBatches'
import { validateFiles } from '../../utils/validateFiles'

// ---------------------------------------------------------------------------
// Stub de URL.createObjectURL / revokeObjectURL (jsdom no los implementa)
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  URL.createObjectURL = vi.fn((file: Blob) => `blob:mock/${(file as File).name ?? 'file'}`)
  URL.revokeObjectURL = vi.fn()
})

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeOrder = (batchCount = 2): Order => ({
  id: 1,
  number: 100,
  name: 'Pedido test',
  status: 'pending',
  active: 1,
  created: '2026-01-01T00:00:00Z',
  size: 2048,
  count: batchCount,
  deadline: null,
  batches: Array.from({ length: batchCount }, (_, i) => ({
    id: i + 1,
    name: `Lote ${i + 1}`,
    status: 'pending',
    size: 1024,
    count: 2,
  })),
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

function makeFile(name: string, type = 'image/jpeg', size = 1024): File {
  const blob = new Blob(['x'], { type })
  const file = new File([blob], name, { type })
  Object.defineProperty(file, 'size', { value: size, configurable: true })
  return file
}

// ---------------------------------------------------------------------------
// Tests: Con order null
// ---------------------------------------------------------------------------

describe('useEditBatchManager — con order null', () => {
  it('should_return_empty_batches_when_order_is_null', () => {
    // Arrange — hidracion devuelve [] por defecto cuando la pedido es null
    vi.mocked(hydrateEditableBatches).mockReturnValue([])

    // Act
    const { result } = renderHook(() => useEditBatchManager(null))

    // Assert
    expect(result.current.batches).toEqual([])
  })

  it('should_have_activeBatchId_null_when_order_is_null', () => {
    // Arrange
    vi.mocked(hydrateEditableBatches).mockReturnValue([])

    // Act
    const { result } = renderHook(() => useEditBatchManager(null))

    // Assert
    expect(result.current.activeBatchId).toBeNull()
  })

  it('should_have_activeBatch_undefined_when_order_is_null', () => {
    // Arrange
    vi.mocked(hydrateEditableBatches).mockReturnValue([])

    // Act
    const { result } = renderHook(() => useEditBatchManager(null))

    // Assert
    expect(result.current.activeBatch).toBeUndefined()
  })

  it('should_have_empty_validationErrors_when_order_is_null', () => {
    // Arrange
    vi.mocked(hydrateEditableBatches).mockReturnValue([])

    // Act
    const { result } = renderHook(() => useEditBatchManager(null))

    // Assert
    expect(result.current.validationErrors).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Tests: Con order — hidratacion inicial
// ---------------------------------------------------------------------------

describe('useEditBatchManager — hidratacion con order', () => {
  it('should_call_hydrateEditableBatches_with_order_batches', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [makeEditableBatch({ id: 1 }), makeEditableBatch({ id: 2 })]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)

    // Act
    renderHook(() => useEditBatchManager(order))

    // Assert
    expect(hydrateEditableBatches).toHaveBeenCalledWith(order.batches)
  })

  it('should_expose_hydrated_batches_in_batches_array', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [
      makeEditableBatch({ id: 1, name: 'A' }),
      makeEditableBatch({ id: 2, name: 'B' }),
    ]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)

    // Act
    const { result } = renderHook(() => useEditBatchManager(order))

    // Assert
    expect(result.current.batches).toHaveLength(2)
    expect(result.current.batches[0].name).toBe('A')
    expect(result.current.batches[1].name).toBe('B')
  })

  it('should_set_activeBatchId_to_first_batch_id_after_hydration', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [makeEditableBatch({ id: 10 }), makeEditableBatch({ id: 20 })]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)

    // Act
    const { result } = renderHook(() => useEditBatchManager(order))

    // Assert — el primer batch se establece como activo por defecto
    expect(result.current.activeBatchId).toBe(10)
  })

  it('should_not_reset_activeBatchId_when_order_changes_if_already_set', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [makeEditableBatch({ id: 1 }), makeEditableBatch({ id: 2 })]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)
    const { result, rerender } = renderHook(({ o }) => useEditBatchManager(o), {
      initialProps: { o: order },
    })

    // Cambiar al batch 2
    act(() => {
      result.current.setActiveBatchId(2)
    })
    expect(result.current.activeBatchId).toBe(2)

    // Act — re-renderizar con la misma pedido (simula re-fetch sin cambio de batches)
    rerender({ o: { ...order, name: 'Nombre cambiado' } })

    // Assert — el batch activo no se resetea
    expect(result.current.activeBatchId).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Tests: setActiveBatchId
// ---------------------------------------------------------------------------

describe('useEditBatchManager — setActiveBatchId', () => {
  it('should_change_activeBatchId_when_setActiveBatchId_is_called', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [makeEditableBatch({ id: 1 }), makeEditableBatch({ id: 2 })]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)
    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.setActiveBatchId(2)
    })

    // Assert
    expect(result.current.activeBatchId).toBe(2)
  })

  it('should_update_activeBatch_reference_when_activeBatchId_changes', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [
      makeEditableBatch({ id: 1, name: 'Primero' }),
      makeEditableBatch({ id: 2, name: 'Segundo' }),
    ]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)
    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.setActiveBatchId(2)
    })

    // Assert
    expect(result.current.activeBatch?.name).toBe('Segundo')
  })
})

// ---------------------------------------------------------------------------
// Tests: activeBatch computed
// ---------------------------------------------------------------------------

describe('useEditBatchManager — activeBatch', () => {
  it('should_return_the_batch_matching_activeBatchId', () => {
    // Arrange
    const order = makeOrder(3)
    const editableBatches = [
      makeEditableBatch({ id: 1, name: 'Alpha' }),
      makeEditableBatch({ id: 2, name: 'Beta' }),
      makeEditableBatch({ id: 3, name: 'Gamma' }),
    ]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)
    const { result } = renderHook(() => useEditBatchManager(order))
    act(() => {
      result.current.setActiveBatchId(3)
    })

    // Assert
    expect(result.current.activeBatch?.name).toBe('Gamma')
  })

  it('should_return_undefined_when_activeBatchId_does_not_match_any_batch', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const { result } = renderHook(() => useEditBatchManager(order))

    // Act — forzar un id que no existe en el array
    act(() => {
      result.current.setActiveBatchId(999)
    })

    // Assert
    expect(result.current.activeBatch).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Tests: addNewFiles — happy path
// ---------------------------------------------------------------------------

describe('useEditBatchManager — addNewFiles (archivos validos)', () => {
  it('should_add_valid_files_to_active_batch_newFiles', () => {
    // Arrange
    const order = makeOrder(1)
    const editableBatch = makeEditableBatch({ id: 1 })
    vi.mocked(hydrateEditableBatches).mockReturnValue([editableBatch])
    const file = makeFile('foto.jpg', 'image/jpeg')
    vi.mocked(validateFiles).mockReturnValue({ valid: [file], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert
    expect(result.current.activeBatch?.newFiles).toHaveLength(1)
    expect(result.current.activeBatch?.newFiles[0].name).toBe('foto.jpg')
  })

  it('should_add_preview_url_for_each_valid_file', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('imagen.png', 'image/png')
    vi.mocked(validateFiles).mockReturnValue({ valid: [file], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert — URL.createObjectURL fue llamada y se almaceno la URL
    expect(result.current.activeBatch?.newPreviews).toHaveLength(1)
    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
  })

  it('should_accumulate_files_on_successive_addNewFiles_calls', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file1 = makeFile('a.jpg', 'image/jpeg')
    const file2 = makeFile('b.jpg', 'image/jpeg')
    vi.mocked(validateFiles)
      .mockReturnValueOnce({ valid: [file1], errors: [] })
      .mockReturnValueOnce({ valid: [file2], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file1])
    })
    act(() => {
      result.current.addNewFiles([file2])
    })

    // Assert
    expect(result.current.activeBatch?.newFiles).toHaveLength(2)
  })

  it('should_call_validateFiles_with_the_provided_files', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('test.tiff', 'image/tiff')
    vi.mocked(validateFiles).mockReturnValue({ valid: [file], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert
    expect(validateFiles).toHaveBeenCalledWith([file])
  })
})

// ---------------------------------------------------------------------------
// Tests: addNewFiles — archivos invalidos
// ---------------------------------------------------------------------------

describe('useEditBatchManager — addNewFiles (archivos invalidos)', () => {
  it('should_not_add_invalid_files_to_newFiles', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('doc.pdf', 'application/pdf')
    vi.mocked(validateFiles).mockReturnValue({
      valid: [],
      errors: ['doc.pdf: formato no permitido (solo JPG, PNG, TIFF, WEBP)'],
    })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert
    expect(result.current.activeBatch?.newFiles).toHaveLength(0)
  })

  it('should_expose_validationErrors_returned_by_validateFiles', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('huge.jpg', 'image/jpeg', 60 * 1024 * 1024)
    const errorMsg = 'huge.jpg: excede el tamaño máximo de 50 MB'
    vi.mocked(validateFiles).mockReturnValue({ valid: [], errors: [errorMsg] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert
    expect(result.current.validationErrors).toContain(errorMsg)
  })

  it('should_clear_validationErrors_when_all_files_are_valid', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const invalidFile = makeFile('bad.pdf', 'application/pdf')
    const validFile = makeFile('ok.jpg', 'image/jpeg')

    vi.mocked(validateFiles)
      .mockReturnValueOnce({ valid: [], errors: ['bad.pdf: formato no permitido'] })
      .mockReturnValueOnce({ valid: [validFile], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Primero agregar un archivo invalido
    act(() => {
      result.current.addNewFiles([invalidFile])
    })
    expect(result.current.validationErrors).toHaveLength(1)

    // Act — ahora agregar un archivo valido
    act(() => {
      result.current.addNewFiles([validFile])
    })

    // Assert — los errores anteriores deben limpiarse
    expect(result.current.validationErrors).toHaveLength(0)
  })

  it('should_not_add_preview_for_invalid_files', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('bad.pdf', 'application/pdf')
    vi.mocked(validateFiles).mockReturnValue({
      valid: [],
      errors: ['bad.pdf: formato no permitido'],
    })

    const { result } = renderHook(() => useEditBatchManager(order))

    // Act
    act(() => {
      result.current.addNewFiles([file])
    })

    // Assert
    expect(result.current.activeBatch?.newPreviews).toHaveLength(0)
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: removeNewFile
// ---------------------------------------------------------------------------

describe('useEditBatchManager — removeNewFile', () => {
  it('should_remove_file_at_given_index_from_active_batch', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const fileA = makeFile('a.jpg', 'image/jpeg')
    const fileB = makeFile('b.jpg', 'image/jpeg')
    vi.mocked(validateFiles).mockReturnValue({ valid: [fileA, fileB], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))
    act(() => {
      result.current.addNewFiles([fileA, fileB])
    })
    expect(result.current.activeBatch?.newFiles).toHaveLength(2)

    // Act — eliminar el primer archivo (indice 0)
    act(() => {
      result.current.removeNewFile(0)
    })

    // Assert
    expect(result.current.activeBatch?.newFiles).toHaveLength(1)
    expect(result.current.activeBatch?.newFiles[0].name).toBe('b.jpg')
  })

  it('should_remove_preview_at_given_index_from_active_batch', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const fileA = makeFile('a.jpg', 'image/jpeg')
    const fileB = makeFile('b.jpg', 'image/jpeg')
    vi.mocked(validateFiles).mockReturnValue({ valid: [fileA, fileB], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))
    act(() => {
      result.current.addNewFiles([fileA, fileB])
    })

    // Act
    act(() => {
      result.current.removeNewFile(0)
    })

    // Assert
    expect(result.current.activeBatch?.newPreviews).toHaveLength(1)
  })

  it('should_call_URL_revokeObjectURL_when_removing_a_file', () => {
    // Arrange
    const order = makeOrder(1)
    vi.mocked(hydrateEditableBatches).mockReturnValue([makeEditableBatch({ id: 1 })])
    const file = makeFile('foto.jpg', 'image/jpeg')
    const fakeUrl = 'blob:mock/foto.jpg'
    vi.mocked(validateFiles).mockReturnValue({ valid: [file], errors: [] })
    vi.mocked(URL.createObjectURL).mockReturnValue(fakeUrl)

    const { result } = renderHook(() => useEditBatchManager(order))
    act(() => {
      result.current.addNewFiles([file])
    })

    // Act
    act(() => {
      result.current.removeNewFile(0)
    })

    // Assert
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(fakeUrl)
  })

  it('should_only_remove_from_active_batch_not_from_other_batches', () => {
    // Arrange
    const order = makeOrder(2)
    const editableBatches = [makeEditableBatch({ id: 1 }), makeEditableBatch({ id: 2 })]
    vi.mocked(hydrateEditableBatches).mockReturnValue(editableBatches)
    const file = makeFile('img.jpg', 'image/jpeg')
    vi.mocked(validateFiles).mockReturnValue({ valid: [file], errors: [] })

    const { result } = renderHook(() => useEditBatchManager(order))
    // El batch activo es el 1 por defecto, agregar archivo ahi
    act(() => {
      result.current.addNewFiles([file])
    })
    // Cambiar al batch 2 y agregar un archivo
    act(() => {
      result.current.setActiveBatchId(2)
    })
    vi.mocked(validateFiles).mockReturnValue({ valid: [makeFile('img2.jpg')], errors: [] })
    act(() => {
      result.current.addNewFiles([makeFile('img2.jpg')])
    })

    // Volver al batch 1 y eliminar
    act(() => {
      result.current.setActiveBatchId(1)
    })
    act(() => {
      result.current.removeNewFile(0)
    })

    // Assert — batch 1 queda vacio, batch 2 sigue con su archivo
    const batch1 = result.current.batches.find((b) => b.id === 1)
    const batch2 = result.current.batches.find((b) => b.id === 2)
    expect(batch1?.newFiles).toHaveLength(0)
    expect(batch2?.newFiles).toHaveLength(1)
  })
})
