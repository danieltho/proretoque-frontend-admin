import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/app/components/ui/data-table'
import type { Client } from '../types/client'
import { getClientColumns } from './clientColumns'

interface ClientsTableProps {
  clients: Client[]
  onDelete: (id: number) => void
}

export function ClientsTable({ clients, onDelete }: ClientsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getClientColumns({
        onEdit: (id) => navigate(`/clients/${id}`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return <DataTable columns={columns} data={clients} />
}
