import { Checkbox } from '@/app/components/ui/checkbox'
import PaymentMethodCard from './PaymentMethodCard'
import type { PaymentMethod, PaymentMethodOption } from '../../types/payment'
import { PAYMENT_METHODS } from '../../types/payment'

interface PaymentMethodSelectorProps {
  methods?: PaymentMethodOption[]
  termsAccepted: boolean
  submitting: boolean
  onTermsChange: (accepted: boolean) => void
  onPay: (method: PaymentMethod) => void
}

export default function PaymentMethodSelector({
  methods = PAYMENT_METHODS,
  termsAccepted,
  submitting,
  onTermsChange,
  onPay,
}: PaymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            disabled={!termsAccepted}
            submitting={submitting}
            onPay={() => onPay(method.id as PaymentMethod)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
        />
        <label htmlFor="terms" className="text-sm cursor-pointer">
          He leído y aceptado los terminos y condiciones
        </label>
      </div>
    </div>
  )
}
