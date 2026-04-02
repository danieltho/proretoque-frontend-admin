import { useState, useEffect } from 'react'
import { getOrderApi } from '../../api/ordersApi'
import type { Order } from '../../types/order'

interface UseOrderLoaderReturn {
  order: Order | null
  loading: boolean
  error: Error | null
  refetchOrder: () => void
}

/**
 * Hook that loads an order by ID from the API and exposes loading/error states.
 * Calls getOrderApi(orderId) on mount and whenever refetchOrder is called.
 */
export function useOrderLoader(orderId: string): UseOrderLoaderReturn {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      const numericId = Number(orderId)

      if (!Number.isFinite(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        throw new Error('ID de pedido inválido')
      }

      const response = await getOrderApi(numericId).send()
      setOrder(response)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const refetchOrder = () => {
    fetchOrder()
  }

  return {
    order,
    loading,
    error,
    refetchOrder,
  }
}
