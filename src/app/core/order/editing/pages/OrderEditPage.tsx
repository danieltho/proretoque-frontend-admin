import { OrderEditProvider, useOrderEdit } from '../context/OrderEditContext'
import OrderEditLayout from '../components/OrderEditLayout'
import EditStepBatches from '../components/EditStepBatches'
import EditStepUpload from '../components/EditStepUpload'
import EditStepResumen from '../components/EditStepResumen'

function OrderEditContent() {
  const { activeStep } = useOrderEdit()

  return (
    <OrderEditLayout>
      {activeStep === 1 && <EditStepBatches />}
      {activeStep === 2 && <EditStepUpload />}
      {activeStep === 3 && <EditStepResumen />}
    </OrderEditLayout>
  )
}

export default function OrderEditPage() {
  return (
    <OrderEditProvider>
      <OrderEditContent />
    </OrderEditProvider>
  )
}
