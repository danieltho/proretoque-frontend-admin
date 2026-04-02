import { useMemo } from 'react'
import { getProviderColumns } from '../components/providerColumns'

export function useOrderAdminProviders() {
  const columns = useMemo(
    () =>
      getProviderColumns({
        onEdit: () => {},
      }),
    [],
  )

  return { columns }
}
