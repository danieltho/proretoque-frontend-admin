import { useState } from 'react'
import { OrderFormProvider, useOrderForm } from '../context/OrderFormContext'
import OrderFormLayout from '../components/OrderFormLayout'
import BatchTabs from '../components/BatchTabs'
import StepUpload from '../components/StepUpload'
import StepRetoques from '../components/StepRetoques'
import StepResumen from '../components/StepResumen'
import StepConfirmar from '../components/step-confirmar/StepConfirmar'
import ProtocolSelectorDialog from '../components/ProtocolSelectorDialog'
import type { Protocol } from '../components/ProtocolSelectorDialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { PlusCircle } from '@phosphor-icons/react'
import Template from '@/app/components/Template'

function OrderNewContent() {
  const { activeStep, activeBatch, batches, setEditingBatch, initProductsFromProtocol } =
    useOrderForm()
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false)
  const [selectedProtocols, setSelectedProtocols] = useState<Protocol[]>([])

  const handleProtocolSave = (protocols: Protocol[]) => {
    setSelectedProtocols(protocols)
    const allProductItems = protocols.flatMap((p) => p.product_items)
    if (allProductItems.length > 0) {
      initProductsFromProtocol(allProductItems)
    }
  }

  return (
    <Template>
      <OrderFormLayout>
        {activeStep <= 3 && (
          <>
            {/* Batch tabs + Protocolos */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <BatchTabs showRemove showAdd />
                </div>
                <Button onClick={() => setProtocolDialogOpen(true)}>
                  <PlusCircle className="size-5" />
                  {selectedProtocols.length > 0
                    ? `${selectedProtocols.length} Protocolos`
                    : 'Protocolos'}
                </Button>
              </div>

              {/* Active batch name input */}
              {activeBatch && (
                <Input
                  value={activeBatch.name}
                  onChange={() => setEditingBatch(activeBatch)}
                  placeholder={`Lote ${batches.indexOf(activeBatch) + 1}`}
                  readOnly
                  onClick={() => setEditingBatch(activeBatch)}
                  className="cursor-pointer"
                />
              )}
            </div>

            {/* Three-column layout */}
            {activeStep === 1 && (
              <div className="flex gap-4">
                {/* Archivos a retocar (main) */}
                <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white p-4">
                  <h3 className="text-h3 font-semibold text-neutral-600">Archivos a retocar</h3>
                  <StepUpload />
                </div>

                {/* Recursos */}
                <div className="flex w-[380px] shrink-0 flex-col gap-4 rounded-2xl bg-white p-4">
                  <h3 className="text-h3 font-semibold text-neutral-600">Recursos</h3>
                  <StepUpload />
                </div>

                {/* Ejemplos */}
                <div className="flex w-[380px] shrink-0 flex-col gap-4 rounded-2xl bg-white p-4">
                  <h3 className="text-h3 font-semibold text-neutral-600">Ejemplos</h3>
                  <StepUpload />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="rounded-2xl bg-white p-4">
                <StepRetoques />
              </div>
            )}

            {activeStep === 3 && (
              <div className="rounded-2xl bg-white p-4">
                <StepResumen />
              </div>
            )}

            <ProtocolSelectorDialog
              open={protocolDialogOpen}
              onClose={() => setProtocolDialogOpen(false)}
              onSave={handleProtocolSave}
              initialSelected={selectedProtocols}
            />
          </>
        )}
        {activeStep === 4 && <StepConfirmar />}
      </OrderFormLayout>
    </Template>
  )
}

export default function OrderNewPageV2() {
  return (
    <OrderFormProvider>
      <OrderNewContent />
    </OrderFormProvider>
  )
}
