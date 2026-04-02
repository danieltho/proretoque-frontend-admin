import { CircleNotch, FloppyDisk } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderEdit } from '../context/OrderEditContext'

export default function EditStepGuardar() {
  const { canSubmit, submitting, handleSubmit, batches } = useOrderEdit()

  const totalNewFiles = batches.reduce((acc, b) => acc + b.newFiles.length, 0)
  const batchCount = batches.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Guardar cambios</h3>
        <p className="text-muted-foreground text-sm">Revisa el resumen antes de guardar</p>
      </div>

      {/* Summary */}
      <div className="rounded-md border p-4">
        <p className="text-sm">
          {batchCount} {batchCount === 1 ? 'lote' : 'lotes'} con {totalNewFiles}{' '}
          {totalNewFiles === 1 ? 'imagen nueva' : 'imágenes nuevas'}
        </p>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full"
        size="lg"
      >
        {submitting ? (
          <>
            <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <FloppyDisk className="mr-2 h-4 w-4" />
            Guardar pedido
          </>
        )}
      </Button>
    </div>
  )
}
