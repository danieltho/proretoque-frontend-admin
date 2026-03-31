import alovaInstance from '@/app/shared/api/alovaInstance'
import type { OrderAdmin, OrdersAdminListResponse } from '../types/orderAdmin'

export const getOrdersAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<OrdersAdminListResponse>('/admin/orders', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getOrderAdminApi = (id: number) =>
  alovaInstance.Get<{ data: OrderAdmin }>(`/admin/orders/${id}`, { cacheFor: 0 })

export const deleteOrderAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/admin/orders/${id}`)
