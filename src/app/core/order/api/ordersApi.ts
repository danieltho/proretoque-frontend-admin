import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Order } from '../types/order'

export interface OrdersListResponse {
  orders: Order[]
  count: number
  page: number
}

export const getOrdersApi = (page = 1, limit = 20) =>
  alovaInstance.Get<OrdersListResponse>('/orders', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getOrderApi = (id: number) =>
  alovaInstance.Get<Order>(`/orders/${id}`, { cacheFor: 0 })

export const createOrderApi = (data: { name: string; conversation_id?: string | null }) =>
  alovaInstance.Post<Order>('/orders', data)

export const updateOrderApi = (id: number, data: Partial<Order>) =>
  alovaInstance.Put<Order>(`/orders/${id}`, data)

export const deleteOrderApi = (id: number) => alovaInstance.Delete<void>(`/orders/${id}`)
