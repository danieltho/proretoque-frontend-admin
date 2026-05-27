import { useParams, useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { getOrderApi } from '../../api/ordersApi'
import { formatDateShort } from '@/app/shared/utils/date'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { Skeleton } from '@/app/components/ui/skeleton'
import { ArrowLeft, Plus, CheckCircle, CircleNotch, Clock } from '@phosphor-icons/react'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function BatchStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'processing':
      return <CircleNotch className="h-4 w-4 animate-spin text-blue-500" />
    default:
      return <Clock className="text-muted-foreground h-4 w-4" />
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, loading, error } = useRequest(() => getOrderApi(Number(id!)))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <p className="text-destructive">{error?.message || 'Orden no encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{order.name}</h2>
            <p className="text-muted-foreground text-sm">
              {order.count} imágenes &middot; {formatSize(order.size)} &middot;{' '}
              {formatDateShort(order.created)}
            </p>
          </div>
          <Badge className="ml-auto" variant={order.status === 'created' ? 'secondary' : 'default'}>
            {order.status}
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lotes ({order.batches.length})</h3>
          <Button size="sm" onClick={() => navigate(`/orders/${id}/batch/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo lote
          </Button>
        </div>

        {order.batches.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No hay lotes aún. Crea uno para subir imágenes.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {order.batches.map((batch) => (
              <Card
                key={batch.id}
                className="hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/batch/${batch.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{batch.name}</CardTitle>
                    <BatchStatusIcon status={batch.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>{batch.count} imágenes</span>
                    <span>{formatSize(batch.size)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
