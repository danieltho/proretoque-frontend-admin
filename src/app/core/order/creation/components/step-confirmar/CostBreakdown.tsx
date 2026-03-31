import { formatPrice } from '../../../types/batch'

interface CostBreakdownProps {
  orderCost: number
  deliverySurcharge: number
  vatAmount: number
  total: number
}

export default function CostBreakdown({
  orderCost,
  deliverySurcharge,
  vatAmount,
  total,
}: CostBreakdownProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between" data-testid="cost-row-order">
        <span className="font-medium">COSTE DE PEDIDO</span>
        <span>{formatPrice(orderCost)}</span>
      </div>

      <div className="flex justify-between" data-testid="cost-row-delivery">
        <span className="font-medium">RECARGO DE ENTREGA TOTAL</span>
        <span>{formatPrice(deliverySurcharge)}</span>
      </div>

      <div className="flex justify-between" data-testid="cost-row-vat">
        <span className="font-medium">IVA 21%</span>
        <span>{formatPrice(vatAmount)}</span>
      </div>

      <div className="border-t border-border pt-2" data-testid="cost-row-total">
        <div className="flex justify-between">
          <span className="font-semibold">TOTAL</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
