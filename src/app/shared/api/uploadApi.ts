import alovaInstance from '@/app/shared/api/alovaInstance'
import type { TempMedia } from '@/app/shared/types/protocol'

export const uploadTempMediaApi = (formData: FormData) =>
  alovaInstance.Post<TempMedia>('/uploads/temp', formData)
