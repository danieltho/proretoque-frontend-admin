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
import type { QuoteAdmin } from '../types/quote'
import { QuoteAdminStatusBadge } from './QuoteAdminStatusBadge'

interface QuotesTableProps {
  quotes: QuoteAdmin[]
  onDelete: (id: number) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function QuotesTable({ quotes, onDelete }: QuotesTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200">ID</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">NOMBRES</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CLIENTE</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">
            TIEMPO DE ENTREGA
          </TableHead>
          <TableHead className="text-footer font-medium text-blue-200">NRO. FOTOS</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CREADO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">DEADLINE</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CUPÓN</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">TOTAL</TableHead>
          <TableHead className="w-30 text-footer font-medium text-blue-200">ESTADO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow
            key={quote.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              #{quote.number}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">{quote.name}</TableCell>
            <TableCell className="text-footer text-neutral-600">
              {quote.customer_name}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {quote.delivery_time}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {quote.images_count}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {formatDateShort(quote.created_at)}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {quote.deadline ? formatDateShort(quote.deadline) : '--'}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {quote.coupon ?? '--'}
            </TableCell>
            <TableCell className="text-right text-footer font-semibold text-neutral-600">
              {formatCurrency(quote.total)}
            </TableCell>
            <TableCell className="w-30">
              <QuoteAdminStatusBadge status={quote.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/quotes/${quote.id}/detail`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => onDelete(quote.id)}
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
