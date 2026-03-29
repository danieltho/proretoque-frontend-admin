import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'
import toast from 'react-hot-toast'

const alovaInstance = createAlova({
  statesHook: reactHook,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  requestAdapter: adapterFetch(),
  beforeRequest(method) {
    const token = localStorage.getItem('auth-token')
    if (token) {
      method.config.headers['Authorization'] = `Bearer ${token}`
    }
  },
  responded: {
    onSuccess: async (response, method) => {
      if (response.status === 401) {
        localStorage.removeItem('auth-token')
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
      if (response.status === 204) return null
      return response.json()
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
