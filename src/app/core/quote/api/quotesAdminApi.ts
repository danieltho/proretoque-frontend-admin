import alovaInstance from '@/app/shared/api/alovaInstance'
import type { QuoteAdmin, QuotesAdminListResponse } from '../types/quote'

export const getQuotesAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<QuotesAdminListResponse>('/admin/quotes', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getQuoteAdminApi = (id: number) =>
  alovaInstance.Get<{ data: QuoteAdmin }>(`/admin/quotes/${id}`, { cacheFor: 0 })

export const deleteQuoteAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/admin/quotes/${id}`)
