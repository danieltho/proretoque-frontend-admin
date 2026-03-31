import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

interface CouponSectionProps {
  couponCode: string
  onCouponChange: (code: string) => void
  onApply: () => void
}

export default function CouponSection({ couponCode, onCouponChange, onApply }: CouponSectionProps) {
  const [localValue, setLocalValue] = useState(couponCode)

  useEffect(() => {
    setLocalValue(couponCode)
  }, [couponCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onCouponChange(newValue)
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Ingrese cupón de descuento</label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="¿TIENES CÓDIGO?"
          value={localValue}
          onChange={handleChange}
          className="flex-1"
        />
        <Button variant="outline" onClick={onApply}>
          APLICAR
        </Button>
        <Button variant="outline">Mis Cupones</Button>
      </div>
    </div>
  )
}
