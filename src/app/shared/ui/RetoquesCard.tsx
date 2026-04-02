import { ArrowRight } from '@phosphor-icons/react'
import { Label } from '@/app/components/ui/label'
import { Separator } from '@/app/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { useInitialCategoryId } from '@/shared/hooks/useInitialCategoryId'
import type { Category, ProductOptions } from '@/shared/types/category'

interface RetoquesCardProps {
  title: string
  categories: Category[]
  productOptions: Record<number, ProductOptions[]>
  selections: Record<number, string>
  onSelectionChange: (productId: number, optionId: string) => void
}

export default function RetoquesCard({
  title,
  categories,
  productOptions,
  selections,
  onSelectionChange,
}: RetoquesCardProps) {
  const [activeCategoryId, setActiveCategoryId] = useInitialCategoryId(
    categories,
    productOptions,
    selections,
  )

  const activeProducts = productOptions[activeCategoryId] ?? []

  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-[#b4b3b3] p-6">
      <h3 className="font-raleway text-[22px] font-medium leading-[26.4px]">{title}</h3>

      <div className="flex gap-6">
        {/* Categories sidebar */}
        <div className="flex w-[180px] shrink-0 flex-col rounded-2xl border border-[#b4b3b3]">
          {categories.map((category, index) => (
            <div key={category.id}>
              {index > 0 && <Separator />}
              <button
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`flex w-full items-center justify-between overflow-clip p-3 font-raleway text-base text-left font-medium text-foreground`}
              >
                <span>{category.name}</span>
                {activeCategoryId === category.id && <ArrowRight className="size-6 shrink-0" />}
              </button>
            </div>
          ))}
        </div>

        {/* Products selectors */}
        <div className="flex flex-1 flex-col gap-6 rounded-[20px] border border-[#b4b3b3] p-6">
          <div className="grid grid-cols-3 gap-6">
            {activeProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-1">
                <Label className="font-raleway text-sm font-medium">{product.label}</Label>
                <Select
                  value={selections[product.id] ?? ''}
                  onValueChange={(value) => onSelectionChange(product.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(product.options ?? []).map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
