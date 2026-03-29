import alovaInstance from '@/shared/api/alovaInstance'
import type { Quote, QuoteDetail, QuotesListResponse } from '../../types/quote'
import type { QuotePayload } from '@/application/quote/creation/hooks/useQuoteSubmit'

export const getQuotesApi = () => alovaInstance.Get<QuotesListResponse>('/quotes', { cacheFor: 0 })

export const getQuoteApi = (id: number) =>
  alovaInstance.Get<Quote>(`/quotes/${id}`, { cacheFor: 0 })

export const getQuoteDetailApi = (id: number) =>
  alovaInstance.Get<QuoteDetail>(`/quotes/${id}/detail`, { cacheFor: 0 })

export const createQuoteApi = (data: QuotePayload) => alovaInstance.Post<Quote>('/quotes', data)

export const updateQuoteApi = (id: number, data: QuotePayload) =>
  alovaInstance.Put<void>(`/quotes/${id}`, data)

export const deleteQuoteApi = (id: number) => alovaInstance.Delete<void>(`/quotes/${id}`)
