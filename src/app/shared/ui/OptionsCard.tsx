import type { ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { cn } from '@/app/shared/utils/utils'

export interface SelectFieldConfig {
  name: string
  label: string
  placeholder?: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

export interface DimensionFieldConfig {
  widthPlaceholder?: string
  heightPlaceholder?: string
  width?: string
  height?: string
  onWidthChange?: (value: string) => void
  onHeightChange?: (value: string) => void
}

export interface CheckboxFieldConfig {
  name: string
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export interface InputFieldConfig {
  name: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export interface OptionsCardProps {
  title: string
  selects?: SelectFieldConfig[]
  inputs?: InputFieldConfig[]
  dimensions?: DimensionFieldConfig
  checkboxes?: CheckboxFieldConfig[]
  selectColumns?: number
  children?: ReactNode
  className?: string
}

export default function OptionsCard({
  title,
  selects,
  inputs,
  dimensions,
  checkboxes,
  selectColumns = 3,
  children,
  className,
}: OptionsCardProps) {
  const gridColsClass =
    selectColumns === 2 ? 'grid-cols-2' : selectColumns === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <Card className={cn('rounded-[20px] border-[#b4b3b3] shadow-none', className)}>
      <CardHeader>
        <CardTitle className="font-[Raleway,sans-serif] text-[22px] font-medium leading-[26.4px]">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {selects && selects.length > 0 && (
          <div className={cn('grid gap-6', gridColsClass)}>
            {selects.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <Label
                  htmlFor={field.name}
                  className="font-[Raleway,sans-serif] text-sm font-medium"
                >
                  {field.label}
                </Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={field.placeholder ?? 'Seleccionar'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {inputs && inputs.length > 0 && (
          <div className={cn('grid gap-6', gridColsClass)}>
            {inputs.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <Label
                  htmlFor={field.name}
                  className="font-[Raleway,sans-serif] text-sm font-medium"
                >
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  placeholder={field.placeholder ?? ''}
                  value={field.value}
                  onChange={(e) => field.onChange?.(e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {(dimensions || checkboxes) && (
          <div className="flex gap-6">
            {dimensions && (
              <div className="flex flex-1 flex-col gap-1">
                <Label className="font-[Raleway,sans-serif] text-base font-medium">
                  Dimensiones
                </Label>
                <div className="flex items-center gap-2.5">
                  <Input
                    placeholder={dimensions.widthPlaceholder ?? 'Ancho'}
                    value={dimensions.width}
                    onChange={(e) => dimensions.onWidthChange?.(e.target.value)}
                  />
                  <XIcon className="size-5 shrink-0 text-foreground" />
                  <Input
                    placeholder={dimensions.heightPlaceholder ?? 'Alto'}
                    value={dimensions.height}
                    onChange={(e) => dimensions.onHeightChange?.(e.target.value)}
                  />
                </div>
              </div>
            )}

            {checkboxes && checkboxes.length > 0 && (
              <div className="flex flex-1 flex-col gap-[3px]">
                {checkboxes.map((cb) => (
                  <div key={cb.name} className="flex items-center gap-3">
                    <Checkbox
                      id={cb.name}
                      checked={cb.checked}
                      onCheckedChange={(checked) => cb.onChange?.(checked === true)}
                    />
                    <Label htmlFor={cb.name} className="cursor-pointer text-sm font-medium">
                      {cb.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  )
}
