import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/app/stores/authStore'
import i18n from '@/i18n/i18n'

// HTTP method → translation key for the success toast.
const SUCCESS_MESSAGE_KEYS: Record<string, string> = {
  POST: 'messages.createdSuccess',
  PUT: 'messages.updatedSuccess',
  PATCH: 'messages.updatedSuccess',
  DELETE: 'messages.deletedSuccess',
}

function showSuccessToast(method: { type: string; meta?: Record<string, unknown> }) {
  if (method.meta?.silentSuccess === true) return
  const key = SUCCESS_MESSAGE_KEYS[method.type.toUpperCase()]
  if (key) toast.success(i18n.t(key))
}

const alovaInstance = createAlova({
  statesHook: reactHook,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  requestAdapter: adapterFetch(),
  beforeRequest(method) {
    const token = useAuthStore.getState().token
    if (token) {
      method.config.headers['Authorization'] = `Bearer ${token}`
    }
  },
  responded: {
    onSuccess: async (response, method) => {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        throw new Error('No autorizado')
      }
      if (!response.ok) {
        const errorData = await response.json()
        const message = errorData.message || i18n.t('messages.requestError')
        if (method.meta?.silentError !== true) {
          toast.error(message)
        }
        throw new Error(message)
      }
      if (response.status === 204) {
        showSuccessToast(method)
        return null
      }
      const data = await response.json()
      showSuccessToast(method)
      return data
    },
    onError: (error, method) => {
      if (method.meta?.silentError !== true) {
        toast.error(error instanceof Error ? error.message : 'Error de conexión')
      }
      throw error
    },
  },
})

export default alovaInstance
