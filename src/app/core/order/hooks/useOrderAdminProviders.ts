import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { getProviderColumns } from '../components/providerColumns'
import { getOrderProvidersApi, addOrderProviderApi, removeOrderProviderApi } from '../api/orderApi'
import { parseRouteId } from '@/app/shared/utils/routeId'

export function useOrderAdminProviders() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const routeId = parseRouteId(id)

  const { data, loading, send } = useRequest(
    () => getOrderProvidersApi(routeId ?? 0),
    {
      immediate: routeId !== null,
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
      if (routeId === null) return
      await addOrderProviderApi(routeId, providerId).send()
      send()
    },
    [routeId, send],
  )

  const handleRemoveProvider = useCallback(
    async (providerId: number) => {
      if (routeId === null) return
      await removeOrderProviderApi(routeId, providerId).send()
      send()
    },
    [routeId, send],
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
