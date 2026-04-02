/**
 * Tests TDD (RED phase) para useCategoryGroups
 *
 * useCategoryGroups es un hook que carga 3 grupos de categorías en paralelo
 * usando getCategoriesByTagApi (nuevo endpoint) para cada tag:
 *   - 'retoque'            → label 'Retoques'
 *   - 'opciones-de-entrega' → label 'Opciones de entrega'
 *   - 'tiempo-de-entrega'  → label 'Tiempo de entrega'
 *
 * El hook expone:
 *   - categoryGroups: CategoryGroup[]   (los 3 grupos ordenados)
 *   - allCategories: Category[]         (lista plana de todas las categorías)
 *   - loading: boolean                  (true mientras alguna petición está en vuelo)
 *
 * Dependencias externas:
 *   - useRequest de alova/client        (mockeado a nivel de módulo)
 *   - getCategoriesByTagApi             (mockeado junto con el módulo de categorías)
 *
 * Comportamientos cubiertos:
 *   - should_return_three_groups_when_all_apis_succeed
 *   - should_return_allCategories_as_flat_list_when_loaded
 *   - should_return_loading_true_while_fetching
 *   - should_return_empty_groups_when_api_returns_empty
 */

import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Category } from '@/shared/types/category'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('alova/client', () => ({
  useRequest: vi.fn(),
}))

vi.mock('@/api/categoriesApi', () => ({
  getCategoriesByTagApi: vi.fn((tag: string) => ({ tag })),
}))

import { useRequest } from 'alova/client'
import useCategoryGroups from '../useCategoryGroups'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCategory(id: number, name: string): Category {
  return { id, name }
}

/**
 * Configura el mock de useRequest para simular las 3 llamadas en orden:
 *   1ra → retoque
 *   2da → opciones-de-entrega
 *   3ra → tiempo-de-entrega
 *
 * useRequest es llamado 3 veces por el hook; mockReturnValueOnce permite
 * controlar cada invocación por separado.
 */
function mockThreeRequests({
  retoqueCategories = [] as Category[],
  opcionesCategories = [] as Category[],
  tiempoCategories = [] as Category[],
  loading = false,
} = {}) {
  vi.mocked(useRequest)
    .mockReturnValueOnce({
      data: { categories: retoqueCategories },
      loading,
      error: null,
    } as unknown as ReturnType<typeof useRequest>)
    .mockReturnValueOnce({
      data: { categories: opcionesCategories },
      loading,
      error: null,
    } as unknown as ReturnType<typeof useRequest>)
    .mockReturnValueOnce({
      data: { categories: tiempoCategories },
      loading,
      error: null,
    } as unknown as ReturnType<typeof useRequest>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCategoryGroups', () => {
  it('should_return_three_groups_when_all_apis_succeed', () => {
    // Arrange
    const retoqueCategories = [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]
    const opcionesCategories = [buildCategory(3, 'Express')]
    const tiempoCategories = [buildCategory(4, '24h'), buildCategory(5, '48h')]

    mockThreeRequests({ retoqueCategories, opcionesCategories, tiempoCategories })

    // Act
    const { result } = renderHook(() => useCategoryGroups())

    // Assert — 3 grupos con sus tags y labels correctos
    expect(result.current.categoryGroups).toHaveLength(3)

    const [g1, g2, g3] = result.current.categoryGroups

    expect(g1.tag).toBe('retoque')
    expect(g1.label).toBe('Retoques')
    expect(g1.categories).toEqual(retoqueCategories)

    expect(g2.tag).toBe('opciones-de-entrega')
    expect(g2.label).toBe('Opciones de entrega')
    expect(g2.categories).toEqual(opcionesCategories)

    expect(g3.tag).toBe('tiempo-de-entrega')
    expect(g3.label).toBe('Tiempo de entrega')
    expect(g3.categories).toEqual(tiempoCategories)
  })

  it('should_return_allCategories_as_flat_list_when_loaded', () => {
    // Arrange
    const retoqueCategories = [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]
    const opcionesCategories = [buildCategory(3, 'Express')]
    const tiempoCategories = [buildCategory(4, '24h')]

    mockThreeRequests({ retoqueCategories, opcionesCategories, tiempoCategories })

    // Act
    const { result } = renderHook(() => useCategoryGroups())

    // Assert — allCategories es la concatenación de los 3 grupos en orden
    expect(result.current.allCategories).toEqual([
      ...retoqueCategories,
      ...opcionesCategories,
      ...tiempoCategories,
    ])
  })

  it('should_return_loading_true_while_fetching', () => {
    // Arrange — al menos una petición está cargando
    mockThreeRequests({ loading: true })

    // Act
    const { result } = renderHook(() => useCategoryGroups())

    // Assert
    expect(result.current.loading).toBe(true)
  })

  it('should_return_loading_false_when_all_loaded', () => {
    // Arrange — ninguna petición está cargando
    mockThreeRequests({ loading: false })

    // Act
    const { result } = renderHook(() => useCategoryGroups())

    // Assert
    expect(result.current.loading).toBe(false)
  })

  it('should_return_empty_groups_when_api_returns_empty', () => {
    // Arrange — todas las APIs devuelven arrays vacíos
    mockThreeRequests({
      retoqueCategories: [],
      opcionesCategories: [],
      tiempoCategories: [],
    })

    // Act
    const { result } = renderHook(() => useCategoryGroups())

    // Assert — 3 grupos definidos pero con listas vacías
    expect(result.current.categoryGroups).toHaveLength(3)
    result.current.categoryGroups.forEach((group) => {
      expect(group.categories).toHaveLength(0)
    })
    expect(result.current.allCategories).toHaveLength(0)
  })
})
