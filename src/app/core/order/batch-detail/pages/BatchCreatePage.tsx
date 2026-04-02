import { useBatchCreate } from '../hooks/useBatchCreate'
import { useParams } from 'react-router-dom'
import BatchCreateStepUpload from '../components/BatchCreateStepUpload'
import BatchCreateStepProducts from '../components/BatchCreateStepProducts'

export default function BatchCreatePage() {
  const { id } = useParams<{ id: string }>()

  const {
    currentStep,
    goToStep,
    files,
    previews,
    handleFiles,
    removeFile,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    selectedProducts,
    handleItemSelect,
    clearProducts,
    submit,
    submitting,
    canGoNext,
  } = useBatchCreate(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">
          {currentStep === 1 ? 'Subir imágenes' : 'Seleccionar protocolos'}
        </h2>
      </div>

      {currentStep === 1 ? (
        <BatchCreateStepUpload
          files={files}
          previews={previews}
          canGoNext={canGoNext}
          onNext={() => goToStep(2)}
          onBack={() => goToStep(1)}
          onFilesChange={handleFiles}
          onRemoveFile={removeFile}
        />
      ) : (
        <BatchCreateStepProducts
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={setActiveCategoryId}
          selectedProducts={selectedProducts}
          onItemSelect={handleItemSelect}
          onClearProducts={clearProducts}
          onSubmit={submit}
          onBack={() => goToStep(1)}
          submitting={submitting}
        />
      )}
    </div>
  )
}
