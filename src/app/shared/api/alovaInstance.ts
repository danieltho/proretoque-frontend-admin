import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/app/stores/authStore'

const SUCCESS_MESSAGES: Record<string, string> = {
  POST: 'Creado correctamente',
  PUT: 'Actualizado correctamente',
  PATCH: 'Actualizado correctamente',
  DELETE: 'Eliminado correctamente',
}

function showSuccessToast(method: { type: string; meta?: Record<string, unknown> }) {
  if (method.meta?.silentSuccess === true) return
  const message = SUCCESS_MESSAGES[method.type.toUpperCase()]
  if (message) toast.success(message)
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
        const message = errorData.message || 'Error en la petición'
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
