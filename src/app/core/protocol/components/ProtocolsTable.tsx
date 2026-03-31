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
import { formatDateShort } from '@/app/shared/utils/date'
import type { ProtocolAdmin } from '../types/protocol'
import { ProtocolStatusBadge } from './ProtocolStatusBadge'

interface ProtocolsTableProps {
  protocols: ProtocolAdmin[]
  onDelete: (id: number) => void
}

export function ProtocolsTable({ protocols, onDelete }: ProtocolsTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200">ID</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">NOMBRES</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">NRO. FOTOS</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CREADO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ESTADO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {protocols.map((protocol) => (
          <TableRow
            key={protocol.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              #{protocol.id}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">{protocol.name}</TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {protocol.images_count}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {formatDateShort(protocol.created_at)}
            </TableCell>
            <TableCell>
              <ProtocolStatusBadge status={protocol.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/protocols/${protocol.id}`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => onDelete(protocol.id)}
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
