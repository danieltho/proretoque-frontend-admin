import { useState } from 'react'
import { useOrderForm } from '../../context/OrderFormContext'
import PaymentMethodSelector from './PaymentMethodSelector'
import OrderConfirmSummaryTable from './OrderConfirmSummaryTable'
import CouponSection from './CouponSection'
import CostBreakdown from './CostBreakdown'
import { PAYMENT_METHODS } from '../../types/payment'
import { Card, CardContent, CardFooter } from '@/app/components/ui/card'

export default function StepConfirmar() {
  const { batches, totalFiles, submitting, handleSubmit } = useOrderForm()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const handlePay = async () => {
    if (!termsAccepted) return
    await handleSubmit()
  }

  const summaryRows = batches.map((batch) => ({
    id: batch.id,
    name: batch.name,
    fileCount: batch.files.length,
    deliveryTime: batch.deliveryOptions.deliveryTime,
    format: batch.deliveryOptions.format,
  }))

  return (
    <div className="flex justify-between gap-6 p-6">
      {/* Left column — Payment methods */}
      <div className="flex flex-col w-1/3">
        <PaymentMethodSelector
          methods={PAYMENT_METHODS}
          termsAccepted={termsAccepted}
          submitting={submitting}
          onTermsChange={setTermsAccepted}
          onPay={handlePay}
        />
      </div>

      <div className="w-1/2">
        {/* Right column — Summary panel */}
        <Card className="py-0">
          <CardContent className="py-5">
            <OrderConfirmSummaryTable rows={summaryRows} totalFiles={totalFiles} />
          </CardContent>
          <CardFooter className="flex justify-between items-center py-5 bg-muted">
            <CouponSection
              couponCode={couponCode}
              onCouponChange={setCouponCode}
              onApply={() => {
                // Placeholder for coupon logic
              }}
            />

            <CostBreakdown orderCost={0} deliverySurcharge={0} vatAmount={0} total={0} />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
