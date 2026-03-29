import alovaInstance from '@/shared/api/alovaInstance'
import type { Quote, QuotesListResponse, CreateQuotePayload } from '@/shared/types/quote'

export const getQuotesApi = () => alovaInstance.Get<QuotesListResponse>('/quotes', { cacheFor: 0 })

export const getQuoteApi = (id: number) =>
  alovaInstance.Get<Quote>(`/quotes/${id}`, { cacheFor: 0 })

export const createQuoteApi = (data: CreateQuotePayload) =>
  alovaInstance.Post<{ quote: Quote }>('/quotes', data)

export const updateQuoteApi = (id: number, data: Partial<Quote>) =>
  alovaInstance.Put<{ quote: Quote }>(`/quotes/${id}`, data)

export const deleteQuoteApi = (id: number) => alovaInstance.Delete<void>(`/quotes/${id}`)
