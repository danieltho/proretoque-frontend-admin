import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderForm } from '../context/OrderFormContext'
import { useAuthStore } from '@/app/stores/authStore'
import { ChatPanel } from '@/customers/chat/components/ChatPanel'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { CircleNotch, Image as ImageIcon } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import BatchNameDialog from './BatchNameDialog'
import BatchSummaryPanel from './BatchSummaryPanel'
import OrderStepper from './OrderStepper'

export default function OrderFormLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [chatOrderOpen, setChatOrderOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const {
    orderName,
    setOrderName,
    activeStep,
    goStep,
    canSubmit,
    submitting,
    handleSubmit,
    editingBatch,
    setEditingBatch,
    renameBatch,
    blocker,
    conversationId,
  } = useOrderForm()

  return (
    <div className="flex h-full flex-col gap-4 font-raleway">
      {/* Title section */}
      <TitleSection
        breadcrumbs={[{ label: 'Inicio' }, { label: 'Pedidos' }]}
        title="Nuevo Pedido"
        onBack={() => navigate('/orders')}
        actions={[
          {
            label: 'Volver',
            onClick: () => (activeStep > 1 ? goStep(activeStep - 1) : navigate('/orders')),
            variant: 'ghost',
          },
          ...(activeStep < 4
            ? [
                {
                  label: 'Continuar',
                  onClick: () => goStep(activeStep + 1),
                  variant: 'default' as const,
                },
              ]
            : []),
        ]}
      />

      {/* Stepper */}
      <div className="flex items-center justify-center rounded-2xl bg-white p-4">
        <OrderStepper activeStep={activeStep} onStepChange={goStep} />
      </div>

      {/* Order name + batch controls */}
      {activeStep <= 3 && (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-body font-medium text-neutral-600">Nombre del Pedido</label>
            <Input
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="Introducir nombre de pedido"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {children}

      {/* Submit button (step 4 only) */}
      {activeStep === 4 && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? (
              <>
                <CircleNotch className="mr-2 size-4 animate-spin" /> Creando...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 size-4" /> Crear pedido
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {editingBatch && (
        <BatchNameDialog
          open={!!editingBatch}
          onClose={() => setEditingBatch(null)}
          currentName={editingBatch.name}
          onSave={(name) => renameBatch(editingBatch.id, name)}
        />
      )}

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="flex flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Resumen</SheetTitle>
          </SheetHeader>
          <BatchSummaryPanel />
        </SheetContent>
      </Sheet>

      <Sheet open={chatOrderOpen} onOpenChange={setChatOrderOpen}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Chat de pedido</SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel conversationId={conversationId} currentUserId={currentUser?.id ?? 0} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes datos sin guardar. Si sales ahora, perderás los cambios realizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
