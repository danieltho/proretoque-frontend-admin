import { useRequest } from 'alova/client'
import { getDeliveryOptionsApi, type DeliveryOptionsResponse } from '@/shared/api/productApi'

const INITIAL_DATA: DeliveryOptionsResponse = {
  delivery_times: [],
  formats: [],
  embed_profiles: [],
  bit_depths: [],
  color_modes: [],
}

export function useProductDeliveryOptions() {
  const { data, loading } = useRequest(getDeliveryOptionsApi, {
    initialData: INITIAL_DATA,
  })

  return {
    deliveryTimes: data?.delivery_times ?? [],
    formats: data?.formats ?? [],
    embedProfiles: data?.embed_profiles ?? [],
    bitDepths: data?.bit_depths ?? [],
    colorModes: data?.color_modes ?? [],
    loading,
  }
}
