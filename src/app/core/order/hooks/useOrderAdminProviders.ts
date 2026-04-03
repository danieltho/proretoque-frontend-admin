import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { getProviderColumns } from '../components/providerColumns'
import { getOrderProvidersApi, addOrderProviderApi, removeOrderProviderApi } from '../api/orderApi'

export function useOrderAdminProviders() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, loading, send } = useRequest(
    () => getOrderProvidersApi(Number(id!)),
    {
      immediate: true,
      initialData: { providers: [] },
    },
  )

  const columns = useMemo(
    () =>
      getProviderColumns({
        onEdit: (providerId) => navigate(`/providers/${providerId}`),
      }),
    [navigate],
  )

  const providers = data?.providers ?? []

  const handleAddProvider = useCallback(
    async (providerId: number) => {
      if (!id) return
      await addOrderProviderApi(Number(id), providerId).send()
      send()
    },
    [id, send],
  )

  const handleRemoveProvider = useCallback(
    async (providerId: number) => {
      if (!id) return
      await removeOrderProviderApi(Number(id), providerId).send()
      send()
    },
    [id, send],
  )

  return {
    providers,
    columns,
    loading,
    handleAddProvider,
    handleRemoveProvider,
    refetch: send,
  }
}
