import { useNavigate } from 'react-router-dom'
import { NotePencilIcon, XIcon } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import type { Client } from '../types/client'
import { MembershipBadge } from './MembershipBadge'

interface ClientsTableProps {
  clients: Client[]
  onDelete: (id: number) => void
}

export function ClientsTable({ clients, onDelete }: ClientsTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200">ID</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">USERNAME</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">EMAIL</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">NOMBRE</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">APELLIDO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">MEMBRESÍA</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow
            key={client.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              #{client.id}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {client.username}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {client.email}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {client.firstname}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {client.lastname}
            </TableCell>
            <TableCell>
              <MembershipBadge name={client.membership_tier.name} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => onDelete(client.id)}
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
