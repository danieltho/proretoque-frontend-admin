import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/app/components/ui/data-table'
import type { Provider } from '../types/provider'
import { getProviderColumns } from './providerColumns'

interface ProvidersTableProps {
  providers: Provider[]
  onDelete?: (id: number) => void
}

export function ProvidersTable({ providers, onDelete }: ProvidersTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getProviderColumns({
        onEdit: (id) => navigate(`/providers/${id}`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return <DataTable columns={columns} data={providers} />
}
