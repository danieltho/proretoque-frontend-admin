import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'

interface SelectedProductsSummaryProps {
  selectedProducts: Record<number, number[]>
  onClear: () => void
}

export default function SelectedProductsSummary({
  selectedProducts,
  onClear,
}: SelectedProductsSummaryProps) {
  const count = Object.values(selectedProducts).filter((ids) => ids.length > 0).length

  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm font-medium">
            {count === 0
              ? 'Sin protocolos seleccionados'
              : `${count} protocolo${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}`}
          </p>
        </div>
        {count > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Limpiar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
