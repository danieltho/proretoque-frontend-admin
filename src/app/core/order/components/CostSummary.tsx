import { Separator } from '@/app/components/ui/separator'

interface CostSummaryProps {
  discount: number | null
  couponName: string | null
  subtotal: number | null
  iva: number | null
  total: number | null
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function CostSummary({
  discount,
  couponName,
  subtotal,
  iva,
  total,
}: CostSummaryProps) {
  return (
    <div className="flex w-[280px] flex-col gap-2.5">
      {couponName && (
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-neutral-600">Cupón de descuento</span>
          <span className="text-body font-medium text-neutral-600">
            -{formatCurrency(discount)}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-body font-semibold text-neutral-600">Sub Total</span>
        <span className="text-body font-medium text-neutral-600">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-body font-semibold text-neutral-600">IVA 21%</span>
        <span className="text-body font-medium text-neutral-600">{formatCurrency(iva)}</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-h2 font-semibold text-neutral-600">Total</span>
        <span className="text-body font-semibold text-neutral-600">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
