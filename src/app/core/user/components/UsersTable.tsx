import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/app/components/ui/data-table'
import type { User } from '../types/user'
import { getUserColumns } from './userColumns'

interface UsersTableProps {
  users: User[]
  onDelete: (id: number) => void
}

export function UsersTable({ users, onDelete }: UsersTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: (id) => navigate(`/users/${id}/edit`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return <DataTable columns={columns} data={users} />
}
