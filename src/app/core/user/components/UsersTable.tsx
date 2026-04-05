import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { DataTable } from '@/app/components/ui/data-table'
import { Input } from '@/app/components/ui/input'
import { SearchableSelect, type SearchableSelectOption } from '@/app/components/ui/searchable-select'
import type { User } from '../types/user'
import { getUserColumns } from './userColumns'

interface UsersTableProps {
  users: User[]
  search: string
  onSearchChange: (value: string) => void
  roleOptions: SearchableSelectOption[]
  selectedRoles: string[]
  onRolesChange: (roles: string[]) => void
  onDelete: (id: number) => void
}

export function UsersTable({
  users,
  search,
  onSearchChange,
  roleOptions,
  selectedRoles,
  onRolesChange,
  onDelete,
}: UsersTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: (id) => navigate(`/users/${id}/edit`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <SearchableSelect
          multiple
          options={roleOptions}
          value={selectedRoles}
          onChange={(ids) => onRolesChange(ids as string[])}
          placeholder="Roles"
          className="w-40"
        />
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  )
}
