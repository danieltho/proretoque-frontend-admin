import { useState } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

interface CouponSectionProps {
  couponName: string | null
  onApply: (code: string) => void
  onRemove: () => void
}

export function CouponSection({ couponName, onApply, onRemove }: CouponSectionProps) {
  const [code, setCode] = useState('')

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim())
      setCode('')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-body font-medium text-neutral-600">
        Ingresa cupón de descuento
      </label>
      <div className="flex items-end gap-2.5">
        <Input
          className="w-80"
          placeholder="¿Tienes código?"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <Button onClick={handleApply}>Aplicar</Button>
        <Button variant="outline">Mis Cupones</Button>
      </div>
      {couponName && (
        <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-neutral-600 px-2.5 py-0.5 text-footer font-medium text-primary-foreground">
          <button type="button" onClick={onRemove} className="cursor-pointer">
            <XIcon className="size-3" />
          </button>
          {couponName}
        </span>
      )}
    </div>
  )
}
