import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { DataTable } from '@/app/components/ui/data-table'
import { Input } from '@/app/components/ui/input'
import { SearchableSelect } from '@/app/components/ui/searchable-select'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'
import type { ProtocolAdmin } from '../types/protocol'
import { getProtocolColumns } from './protocolColumns'

const STATUS_OPTIONS: SearchableSelectOption[] = [
  { id: 'creado', label: 'Creado' },
  { id: 'en_revision', label: 'En Revisión' },
  { id: 'aprobado', label: 'Aprobado' },
  { id: 'aceptado', label: 'Aceptado' },
]

interface ProtocolsTableProps {
  protocols: ProtocolAdmin[]
  search: string
  onSearchChange: (value: string) => void
  selectedStatus: string | null
  onStatusChange: (status: string | null) => void
  onDelete: (id: number) => void
}

export function ProtocolsTable({
  protocols,
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onDelete,
}: ProtocolsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getProtocolColumns({
        onEdit: (id) => navigate(`/protocols/${id}`),
        onDuplicate: (id) => navigate(`/protocols/${id}/duplicate`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-4">
        <div className="relative w-86">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <SearchableSelect
          options={STATUS_OPTIONS}
          value={selectedStatus}
          onChange={(value) => onStatusChange(value as string | null)}
          placeholder="Estado"
          className="w-[150px]"
        />
      </div>

      <DataTable columns={columns} data={protocols} />
    </div>
  )
}
