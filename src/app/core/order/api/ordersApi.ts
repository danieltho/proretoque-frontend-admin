import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Order } from '../types/order'
import type { OrderAdmin } from '../types/orderAdmin'

export interface OrdersListResponse {
  orders: OrderAdmin[]
  count: number
  pages: number
}

export const getOrdersApi = (page = 1) =>
  alovaInstance.Get<OrdersListResponse>('/backend/orders', {
    params: { page },
    cacheFor: 0,
  })

export const getOrderApi = (id: number) =>
  alovaInstance.Get<Order>(`/backend/orders/${id}`, { cacheFor: 0 })

export const createOrderApi = (data: { name: string; conversation_id?: string | null }) =>
  alovaInstance.Post<Order>('/backend/orders', data)

export const updateOrderApi = (id: number, data: Partial<Order>) =>
  alovaInstance.Put<Order>(`/backend/orders/${id}`, data)

export const deleteOrderApi = (id: number) => alovaInstance.Delete<void>(`/orders/${id}`)
