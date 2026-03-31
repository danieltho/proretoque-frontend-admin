import { Button } from '@/app/components/ui/button'
import type { PaymentMethodOption } from '../../types/payment'

interface PaymentMethodCardProps {
  method: PaymentMethodOption
  disabled: boolean
  submitting: boolean
  onPay: () => void
}

export default function PaymentMethodCard({
  method,
  disabled,
  submitting,
  onPay,
}: PaymentMethodCardProps) {
  const isDisabled = disabled || submitting

  return (
    <div className="flex justify-between items-center gap-3 p-4 rounded-lg border border-border bg-card">
      <p className="text-sm font-medium">{method.label}</p>
      <Button disabled={isDisabled} onClick={onPay} variant="default">
        {method.buttonLabel}
      </Button>
    </div>
  )
}
