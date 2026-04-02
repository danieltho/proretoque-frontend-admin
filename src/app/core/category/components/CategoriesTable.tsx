import { useNavigate } from 'react-router-dom'
import { NotePencilIcon, XIcon, ListIcon } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import type { CategoryAdmin } from '../types/category'

interface CategoriesTableProps {
  categories: CategoryAdmin[]
  onDelete: (id: number) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function CategoriesTable({ categories, onDelete }: CategoriesTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200" />
          <TableHead className="text-footer font-medium text-blue-200">NOMBRES</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">TIEMPO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">PRECIO</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow
            key={category.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              <div className="flex items-center gap-1">
                <span>{category.sort_order}</span>
                <ListIcon className="size-4 text-neutral-400" />
              </div>
            </TableCell>
            <TableCell className="text-footer text-neutral-600">{category.name}</TableCell>
            <TableCell className="text-footer text-neutral-600">
              {category.duration_task}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {formatCurrency(category.price)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/categories/${category.id}`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => onDelete(category.id)}
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
