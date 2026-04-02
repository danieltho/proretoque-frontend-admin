/**
 * Tests TDD — useOrderLoader (fase RED)
 *
 * Hook: useOrderLoader(orderId: string)
 * Responsabilidad: cargar una pedido por ID desde la API y exponer
 * el estado de carga, la pedido resultante y el error si falla.
 *
 * Contrato de la interfaz retornada:
 *   {
 *     order: Order | null
 *     loading: boolean
 *     error: Error | null
 *     refetchOrder: () => void
 *   }
 *
 * Mocks:
 * - getOrderApi de la capa API — se mockea en el boundary del modulo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOrderLoader } from '../hooks/useOrderLoader'
import type { Order } from '../../types/order'

// ---------------------------------------------------------------------------
// Mock de la capa API
// ---------------------------------------------------------------------------

vi.mock('../../api/ordersApi', () => ({
  getOrderApi: vi.fn(),
}))

import { getOrderApi } from '../../api/ordersApi'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  number: 100,
  name: 'Pedido de prueba',
  status: 'pending',
  active: 1,
  created: '2026-01-01T00:00:00Z',
  size: 4096,
  count: 5,
  deadline: null,
  batches: [],
  ...overrides,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockApiSuccess(order: Order) {
  vi.mocked(getOrderApi).mockReturnValue({
    send: vi.fn().mockResolvedValue(order),
  } as unknown as ReturnType<typeof getOrderApi>)
}

function mockApiError(error: Error) {
  vi.mocked(getOrderApi).mockReturnValue({
    send: vi.fn().mockRejectedValue(error),
  } as unknown as ReturnType<typeof getOrderApi>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Estado inicial
// ---------------------------------------------------------------------------

describe('useOrderLoader — estado inicial', () => {
  it('should_have_order_null_on_mount', () => {
    // Arrange — API no se resuelve todavia (promise pendiente)
    vi.mocked(getOrderApi).mockReturnValue({
      send: vi.fn().mockReturnValue(new Promise(() => {})),
    } as unknown as ReturnType<typeof getOrderApi>)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    expect(result.current.order).toBeNull()
  })

  it('should_have_loading_true_on_mount', () => {
    // Arrange — promise que nunca resuelve para capturar el estado inicial
    vi.mocked(getOrderApi).mockReturnValue({
      send: vi.fn().mockReturnValue(new Promise(() => {})),
    } as unknown as ReturnType<typeof getOrderApi>)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    expect(result.current.loading).toBe(true)
  })

  it('should_have_error_null_on_mount', () => {
    // Arrange
    vi.mocked(getOrderApi).mockReturnValue({
      send: vi.fn().mockReturnValue(new Promise(() => {})),
    } as unknown as ReturnType<typeof getOrderApi>)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    expect(result.current.error).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests: Carga exitosa
// ---------------------------------------------------------------------------

describe('useOrderLoader — carga exitosa', () => {
  it('should_expose_order_when_api_resolves_successfully', async () => {
    // Arrange
    const order = makeOrder({ id: 99, name: 'Orden exitosa' })
    mockApiSuccess(order)

    // Act
    const { result } = renderHook(() => useOrderLoader('99'))

    // Assert
    await waitFor(() => {
      expect(result.current.order).not.toBeNull()
    })
    expect(result.current.order?.id).toBe(99)
    expect(result.current.order?.name).toBe('Orden exitosa')
  })

  it('should_set_loading_false_after_successful_fetch', async () => {
    // Arrange
    const order = makeOrder()
    mockApiSuccess(order)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should_keep_error_null_after_successful_fetch', async () => {
    // Arrange
    const order = makeOrder()
    mockApiSuccess(order)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBeNull()
  })

  it('should_call_getOrderApi_with_the_numeric_orderId', async () => {
    // Arrange
    const order = makeOrder({ id: 7 })
    mockApiSuccess(order)

    // Act
    renderHook(() => useOrderLoader('7'))

    // Assert
    await waitFor(() => {
      expect(getOrderApi).toHaveBeenCalledWith(7)
    })
  })
})

// ---------------------------------------------------------------------------
// Tests: Error de API
// ---------------------------------------------------------------------------

describe('useOrderLoader — error de API', () => {
  it('should_expose_error_when_api_rejects', async () => {
    // Arrange
    const apiError = new Error('Network failure')
    mockApiError(apiError)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
    expect(result.current.error?.message).toBe('Network failure')
  })

  it('should_set_loading_false_after_failed_fetch', async () => {
    // Arrange
    mockApiError(new Error('404 Not Found'))

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should_keep_order_null_after_failed_fetch', async () => {
    // Arrange
    mockApiError(new Error('Server error'))

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.order).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests: refetchOrder
// ---------------------------------------------------------------------------

describe('useOrderLoader — refetchOrder', () => {
  it('should_expose_refetchOrder_function', () => {
    // Arrange
    vi.mocked(getOrderApi).mockReturnValue({
      send: vi.fn().mockReturnValue(new Promise(() => {})),
    } as unknown as ReturnType<typeof getOrderApi>)

    // Act
    const { result } = renderHook(() => useOrderLoader('1'))

    // Assert
    expect(typeof result.current.refetchOrder).toBe('function')
  })

  it('should_call_getOrderApi_again_when_refetchOrder_is_called', async () => {
    // Arrange
    const order = makeOrder()
    mockApiSuccess(order)
    const { result } = renderHook(() => useOrderLoader('1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Act
    result.current.refetchOrder()

    // Assert — la API debe haberse llamado al menos dos veces (mount + refetch)
    await waitFor(() => {
      expect(getOrderApi).toHaveBeenCalledTimes(2)
    })
  })

  it('should_update_order_after_refetch_returns_new_data', async () => {
    // Arrange — primera llamada retorna una pedido, la segunda retorna una actualizada
    const sendMock = vi
      .fn()
      .mockResolvedValueOnce(makeOrder({ name: 'Nombre original' }))
      .mockResolvedValueOnce(makeOrder({ name: 'Nombre actualizado' }))

    vi.mocked(getOrderApi).mockReturnValue({
      send: sendMock,
    } as unknown as ReturnType<typeof getOrderApi>)

    const { result } = renderHook(() => useOrderLoader('1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Act
    result.current.refetchOrder()

    // Assert
    await waitFor(() => {
      expect(result.current.order?.name).toBe('Nombre actualizado')
    })
  })
})
