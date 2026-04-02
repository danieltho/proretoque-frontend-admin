import { useNavigate } from 'react-router-dom'
import { useOrderEdit } from '../context/OrderEditContext'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Skeleton } from '@/app/components/ui/skeleton'
import { ArrowLeft, CircleNotch, FloppyDisk } from '@phosphor-icons/react'

const STEPS = [
  { num: 1, label: 'Lotes' },
  { num: 2, label: 'Agregar' },
  { num: 3, label: 'Guardar' },
]

function EditStepper({
  activeStep,
  onStepChange,
}: {
  activeStep: number
  onStepChange: (step: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <button
            type="button"
            onClick={() => onStepChange(step.num)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeStep === step.num
                ? 'bg-primary text-primary-foreground'
                : activeStep > step.num
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span className="font-semibold">{step.num}</span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
          {i < STEPS.length - 1 && <div className="bg-border mx-1 h-px w-4" />}
        </div>
      ))}
    </div>
  )
}

export default function OrderEditLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const {
    order,
    loading,
    error,
    orderName,
    setOrderName,
    activeStep,
    goStep,
    hasChanges,
    submitting,
    handleSubmit,
  } = useOrderEdit()

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="ml-auto h-10 w-48" />
        </div>
        <Skeleton className="flex-1" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <p className="text-destructive">{error?.message || 'Pedido no encontrado'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${order.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            placeholder="Nombre del pedido"
            className="max-w-xs"
          />
        </div>

        <EditStepper activeStep={activeStep} onStepChange={goStep} />

        <div className="shrink-0 text-right text-sm">
          <p className="text-muted-foreground">Pedido #{order.number}</p>
        </div>
      </div>

      {/* Content */}
      {children}

      {/* Footer */}
      <div className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() =>
            activeStep > 1 ? goStep(activeStep - 1) : navigate(`/orders/${order.id}`)
          }
        >
          {activeStep <= 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {activeStep < 3 ? (
          <Button onClick={() => goStep(activeStep + 1)}>Siguiente</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!hasChanges || submitting}>
            {submitting ? (
              <>
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <FloppyDisk className="mr-2 h-4 w-4" /> Guardar cambios
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
