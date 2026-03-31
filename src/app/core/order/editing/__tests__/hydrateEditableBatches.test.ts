/**
 * Tests TDD — hydrateEditableBatches (fase RED)
 *
 * Funcion pura: convierte un array de Batch (shape del API) en un array de
 * EditableBatch (shape local de edicion).
 *
 * Reglas del contrato:
 * - id, name y status se copian tal cual desde Batch
 * - files_size ← Batch.size
 * - files_count ← Batch.count
 * - media se inicializa como []
 * - newFiles se inicializa como []
 * - newPreviews se inicializa como []
 * - Los campos opcionales de Batch (products) no se pierden — se preserva
 *   el objeto original como referencia para acceso futuro si se necesita
 */

import { describe, it, expect } from 'vitest'
import type { Batch } from '../../types/order'
import { hydrateEditableBatches } from '../utils/hydrateEditableBatches'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeBatch = (overrides: Partial<Batch> = {}): Batch => ({
  id: 1,
  name: 'Lote 1',
  status: 'pending',
  size: 2048,
  count: 3,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hydrateEditableBatches — array vacio', () => {
  it('should_return_empty_array_when_input_is_empty', () => {
    // Arrange
    const batches: Batch[] = []

    // Act
    const result = hydrateEditableBatches(batches)

    // Assert
    expect(result).toEqual([])
  })
})

describe('hydrateEditableBatches — conversion de un batch', () => {
  it('should_map_batch_id_to_editable_batch_id', () => {
    // Arrange
    const batch = makeBatch({ id: 42 })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.id).toBe(42)
  })

  it('should_map_batch_name_to_editable_batch_name', () => {
    // Arrange
    const batch = makeBatch({ name: 'Bodas de plata' })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.name).toBe('Bodas de plata')
  })

  it('should_map_batch_status_to_editable_batch_status', () => {
    // Arrange
    const batch = makeBatch({ status: 'processing' })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.status).toBe('processing')
  })

  it('should_map_batch_size_to_files_size', () => {
    // Arrange
    const batch = makeBatch({ size: 8192 })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.files_size).toBe(8192)
  })

  it('should_map_batch_count_to_files_count', () => {
    // Arrange
    const batch = makeBatch({ count: 7 })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.files_count).toBe(7)
  })

  it('should_initialize_media_as_empty_array', () => {
    // Arrange
    const batch = makeBatch()

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.media).toEqual([])
  })

  it('should_initialize_newFiles_as_empty_array', () => {
    // Arrange
    const batch = makeBatch()

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.newFiles).toEqual([])
  })

  it('should_initialize_newPreviews_as_empty_array', () => {
    // Arrange
    const batch = makeBatch()

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert
    expect(result.newPreviews).toEqual([])
  })
})

describe('hydrateEditableBatches — multiples batches', () => {
  it('should_convert_all_batches_when_input_has_multiple_items', () => {
    // Arrange
    const batches = [
      makeBatch({ id: 1, name: 'Lote A' }),
      makeBatch({ id: 2, name: 'Lote B' }),
      makeBatch({ id: 3, name: 'Lote C' }),
    ]

    // Act
    const result = hydrateEditableBatches(batches)

    // Assert
    expect(result).toHaveLength(3)
  })

  it('should_preserve_individual_ids_for_each_batch', () => {
    // Arrange
    const batches = [makeBatch({ id: 10 }), makeBatch({ id: 20 })]

    // Act
    const result = hydrateEditableBatches(batches)

    // Assert
    expect(result[0].id).toBe(10)
    expect(result[1].id).toBe(20)
  })

  it('should_give_each_batch_its_own_empty_media_array', () => {
    // Arrange
    const batches = [makeBatch({ id: 1 }), makeBatch({ id: 2 })]

    // Act
    const result = hydrateEditableBatches(batches)

    // Assert — los arrays deben ser instancias distintas (no compartidas)
    expect(result[0].media).not.toBe(result[1].media)
  })

  it('should_give_each_batch_its_own_empty_newFiles_array', () => {
    // Arrange
    const batches = [makeBatch({ id: 1 }), makeBatch({ id: 2 })]

    // Act
    const result = hydrateEditableBatches(batches)

    // Assert — arrays separados, no la misma referencia
    expect(result[0].newFiles).not.toBe(result[1].newFiles)
  })
})

describe('hydrateEditableBatches — preserva campos originales', () => {
  it('should_not_lose_batch_data_for_batches_with_optional_products', () => {
    // Arrange
    const batch = makeBatch({
      id: 5,
      name: 'Batch con productos',
      size: 1024,
      count: 2,
      products: [{ product_id: 1, item_id: 10 }],
    })

    // Act
    const [result] = hydrateEditableBatches([batch])

    // Assert — los campos core se mapean correctamente independientemente de products
    expect(result.id).toBe(5)
    expect(result.name).toBe('Batch con productos')
    expect(result.files_size).toBe(1024)
    expect(result.files_count).toBe(2)
  })
})
