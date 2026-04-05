import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { DataTable } from '@/app/components/ui/data-table'
import { Input } from '@/app/components/ui/input'
import type { ProductAdmin } from '../types/product'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'
import { SearchableSelect } from '@/app/components/ui/searchable-select'
import { getProductColumns } from './productColumns'

interface ProductsTableProps {
  products: ProductAdmin[]
  search: string
  onSearchChange: (value: string) => void
  categoryOptions: SearchableSelectOption[]
  selectedCategories: number[]
  onCategoriesChange: (ids: number[]) => void
  onDelete: (id: number) => void
}

export function ProductsTable({
  products,
  search,
  onSearchChange,
  categoryOptions,
  selectedCategories,
  onCategoriesChange,
  onDelete,
}: ProductsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (id) => navigate(`/products/${id}/edit`),
        onDelete,
      }),
    [navigate, onDelete],
  )

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search & filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative w-86">
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
          options={categoryOptions}
          value={selectedCategories}
          onChange={(ids) => onCategoriesChange(ids as number[])}
          placeholder="Categorías"
          className="flex-1"
        />
      </div>

      <DataTable columns={columns} data={products} />
    </div>
  )
}
