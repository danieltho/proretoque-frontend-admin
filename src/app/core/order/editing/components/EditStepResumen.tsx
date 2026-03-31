import { Check, Images, Pencil } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useOrderEdit } from '../context/OrderEditContext'
import { formatSize } from '../../types/batch'

export default function EditStepResumen() {
  const { order, orderName, batches, hasChanges } = useOrderEdit()

  if (!order) return null

  const nameChanged = orderName !== order.name
  const batchesWithNewFiles = batches.filter((b) => b.newFiles.length > 0)
  const totalNewFiles = batches.reduce((acc, b) => acc + b.newFiles.length, 0)
  const totalNewSize = batches.reduce(
    (acc, b) => acc + b.newFiles.reduce((sum, f) => sum + f.size, 0),
    0,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Resumen de cambios</h3>
        <p className="text-muted-foreground text-sm">Revisa los cambios antes de guardar</p>
      </div>

      {!hasChanges ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center">
            <Check className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <p>No hay cambios pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Name change */}
          {nameChanged && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pencil className="h-4 w-4" />
                  Nombre del pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground line-through">{order.name}</span>
                  <span>→</span>
                  <span className="font-medium">{orderName}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New files */}
          {totalNewFiles > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Images className="h-4 w-4 text-green-500" />
                  Nuevas imágenes ({totalNewFiles})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">Total: {formatSize(totalNewSize)}</p>

                {batchesWithNewFiles.map((batch) => (
                  <div key={batch.id} className="rounded-md border p-3">
                    <p className="mb-2 text-sm font-medium">{batch.name}</p>
                    <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
                      {batch.newPreviews.slice(0, 10).map((preview, i) => (
                        <img
                          key={i}
                          src={preview}
                          alt=""
                          className="aspect-square rounded object-cover"
                        />
                      ))}
                      {batch.newFiles.length > 10 && (
                        <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center rounded text-xs">
                          +{batch.newFiles.length - 10}
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {batch.newFiles.length} {batch.newFiles.length === 1 ? 'imagen' : 'imágenes'}{' '}
                      · {formatSize(batch.newFiles.reduce((acc, f) => acc + f.size, 0))}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
