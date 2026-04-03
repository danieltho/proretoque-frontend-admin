import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/app/components/ui/data-table'
import type { ProductAdmin } from '../types/product'
import { getProductColumns } from './productColumns'

interface ProductsTableProps {
  products: ProductAdmin[]
  onDelete: (id: number) => void
}

export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (id) => navigate(`/products/${id}`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return <DataTable columns={columns} data={products} />
}
