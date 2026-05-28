import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/app/components/ui/data-table'
import type { Client } from '../types/client'
import { getClientColumns } from './clientColumns'

interface ClientsTableProps {
  clients: Client[]
  onDelete: (id: number) => void
}

export function ClientsTable({ clients, onDelete }: ClientsTableProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns = useMemo(
    () =>
      getClientColumns({
        t,
        onEdit: (id) => navigate(`/clients/${id}`),
        onDelete,
      }),
    [t, navigate, onDelete],
  )

  return <DataTable columns={columns} data={clients} />
}
