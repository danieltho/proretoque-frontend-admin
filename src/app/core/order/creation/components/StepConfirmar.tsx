import { Image as ImageIcon, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderForm } from '../context/OrderFormContext'

export default function StepConfirmar() {
  const { batchCount, totalFiles, canSubmit, submitting, handleSubmit } = useOrderForm()

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="space-y-4 text-center">
        <ImageIcon className="text-muted-foreground mx-auto h-12 w-12" />
        <h3 className="text-lg font-semibold">¿Crear la pedido?</h3>
        <p className="text-muted-foreground text-sm">
          {batchCount} {batchCount === 1 ? 'lote' : 'lotes'} con {totalFiles}{' '}
          {totalFiles === 1 ? 'imagen' : 'imágenes'}
        </p>
        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
          {submitting ? (
            <>
              <CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Creando...
            </>
          ) : (
            'Crear pedido'
          )}
        </Button>
      </div>
    </div>
  )
}
