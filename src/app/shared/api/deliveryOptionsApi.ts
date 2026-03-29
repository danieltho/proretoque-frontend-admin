import alovaInstance from './alovaInstance'

export interface DeliveryOptionsResponse {
  delivery_times: { value: string; label: string }[]
  formats: string[]
  embed_profiles: string[]
  bit_depths: string[]
  color_modes: string[]
}

export const getDeliveryOptionsApi = () =>
  alovaInstance.Get<DeliveryOptionsResponse>('/delivery-options', { cacheFor: 0 })
