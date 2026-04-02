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
import type { ProductAdmin } from '../types/product'
import { CategoryBadge } from './CategoryBadge'

interface ProductsTableProps {
  products: ProductAdmin[]
  onDelete: (id: number) => void
}

export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200" />
          <TableHead className="text-footer font-medium text-blue-200">NOMBRES</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CATEGORÍAS</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              <div className="flex items-center gap-1">
                <span>{product.sort_order}</span>
                <ListIcon className="size-4 text-neutral-400" />
              </div>
            </TableCell>
            <TableCell className="text-footer text-neutral-600">{product.name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-1">
                {product.categories.map((cat) => (
                  <CategoryBadge key={cat.id} name={cat.name} />
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => onDelete(product.id)}
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
