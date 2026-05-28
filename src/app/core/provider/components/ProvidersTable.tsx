import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/app/components/ui/data-table'
import type { Provider } from '../types/provider'
import { getProviderColumns } from './providerColumns'

interface ProvidersTableProps {
  providers: Provider[]
  onDelete?: (id: number) => void
}

export function ProvidersTable({ providers, onDelete }: ProvidersTableProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns = useMemo(
    () =>
      getProviderColumns({
        t,
        onEdit: (id) => navigate(`/providers/${id}`),
        onDelete,
      }),
    [t, navigate, onDelete],
  )

  return <DataTable columns={columns} data={providers} />
}
