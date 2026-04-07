import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FunnelIcon, NotePencilIcon, XIcon } from '@phosphor-icons/react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/app/components/ui/data-table'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/app/components/ui/searchable-select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip'
import type { Role } from '../types/role'

interface RolesTableProps {
  roles: Role[]
  accessOptions: SearchableSelectOption[]
  onUpdate: (id: number, name: string, accessIds: number[]) => void
  onDelete: (id: number) => void
}

function EditableRoleRow({
  role,
  accessOptions,
  onUpdate,
  onCancel,
}: {
  role: Role
  accessOptions: SearchableSelectOption[]
  onUpdate: (name: string, accessIds: number[]) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(role.name)
  const [selectedAccess, setSelectedAccess] = useState<number[]>(
    (role.access ?? []).map((a) => a.id),
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (!name.trim()) return
    onUpdate(name.trim(), selectedAccess)
  }

  return (
    <>
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') onCancel()
        }}
        autoFocus
        className="h-7 text-footer"
      />
      <SearchableSelect
        multiple
        options={accessOptions}
        value={selectedAccess}
        onChange={(ids) => setSelectedAccess(ids as number[])}
        placeholder="Acceso"
      />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="blue" size="sm" onClick={handleSave}>
          Guardar
        </Button>
      </div>
    </>
  )
}

export function RolesTable({ roles, accessOptions, onUpdate, onDelete }: RolesTableProps) {
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState<number | null>(null)

  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: () => <span className="text-footer font-medium text-blue-200">ID</span>,
        cell: ({ row }) => <span className="text-footer text-neutral-600">#{row.original.id}</span>,
        size: 50,
      },
      {
        accessorKey: 'name',
        header: () => <span className="text-footer font-medium text-blue-200">NOMBRE</span>,
        cell: ({ row }) => {
          if (editingId === row.original.id) return null
          return <span className="text-footer text-neutral-600">{row.original.name}</span>
        },
        size: 200,
      },
      {
        id: 'access',
        header: () => <span className="text-footer font-medium text-blue-200">ACCESO</span>,
        cell: ({ row }) => {
          if (editingId === row.original.id) return null
          return (
            <div className="flex flex-wrap gap-1">
              {(row.original.access ?? []).map((a) => (
                <Badge
                  key={a.id}
                  className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-footer font-medium text-blue-200"
                >
                  {a.name.toUpperCase()}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
        cell: ({ row }) => {
          if (editingId === row.original.id) return null
          return (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                onClick={() => setEditingId(row.original.id)}
              >
                <NotePencilIcon />
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                      onClick={() => navigate(`/roles/${row.original.id}/restriction-access`)}
                    >
                      <FunnelIcon />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Restriction Access</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button
                type="button"
                className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                onClick={() => onDelete(row.original.id)}
              >
                <XIcon />
              </button>
            </div>
          )
        },
      },
    ],
    [editingId, onDelete, navigate],
  )

  // Custom row rendering: when editing, replace all cells with EditableRoleRow
  // Since DataTable doesn't support custom row rendering, we use a wrapper approach
  // The editing row returns null for name/access/actions columns and we overlay

  return (
    <div className="relative">
      <DataTable columns={columns} data={roles} />
      {/* Overlay editing rows */}
      {editingId &&
        (() => {
          const role = roles.find((r) => r.id === editingId)
          if (!role) return null
          const rowIndex = roles.findIndex((r) => r.id === editingId)
          return (
            <div
              className="absolute left-0 right-0 flex items-center gap-4 border-b border-neutral-100 bg-white px-2 py-1"
              style={{ top: `${48 + rowIndex * 40}px`, height: '40px' }}
            >
              <span className="w-12.5 shrink-0 text-footer text-neutral-600">#{role.id}</span>
              <div className="flex flex-1 items-center gap-4">
                <EditableRoleRow
                  role={role}
                  accessOptions={accessOptions}
                  onUpdate={(name, accessIds) => {
                    onUpdate(role.id, name, accessIds)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            </div>
          )
        })()}
    </div>
  )
}
