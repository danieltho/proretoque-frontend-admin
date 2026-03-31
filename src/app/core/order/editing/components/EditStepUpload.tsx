import { useRef } from 'react'
import { Upload, Trash } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderEdit } from '../context/OrderEditContext'
import { formatSize } from '../../types/batch'
import EditBatchTabs from './EditBatchTabs'

export default function EditStepUpload() {
  const { activeBatch, handleFiles, removeNewFile, validationErrors } = useOrderEdit()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!activeBatch) return null

  const hasNewFiles = activeBatch.newFiles.length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <EditBatchTabs />

      {/* Drop zone */}
      <div
        className="hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <Upload
          className={`text-muted-foreground ${hasNewFiles ? 'mb-1 h-6 w-6' : 'mb-3 h-10 w-10'}`}
        />
        <p className={`font-medium ${hasNewFiles ? 'text-sm' : 'text-base'}`}>
          {hasNewFiles ? 'Agregar archivos aquí' : 'Arrastra archivos aquí'}
        </p>
        {!hasNewFiles && (
          <p className="text-muted-foreground text-sm">o haz clic para seleccionar archivos</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/tiff,image/webp,.jpg,.jpeg,.png,.tiff,.tif,.webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <ul className="space-y-1 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationErrors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      {/* New files preview */}
      {hasNewFiles && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-600">
              {activeBatch.newFiles.length}{' '}
              {activeBatch.newFiles.length === 1 ? 'imagen nueva' : 'imágenes nuevas'} por subir
            </p>
            <p className="text-muted-foreground text-sm">
              {formatSize(activeBatch.newFiles.reduce((acc, f) => acc + f.size, 0))}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
            {activeBatch.newFiles.map((file, index) => (
              <div
                key={index}
                className={`hover:bg-muted/50 flex items-center gap-3 px-3 py-2 transition-colors ${index > 0 ? 'border-t' : ''}`}
              >
                <img
                  src={activeBatch.newPreviews[index]}
                  alt={file.name}
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
                <p className="min-w-0 flex-1 truncate text-sm">{file.name}</p>
                <span className="text-muted-foreground text-xs">{formatSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-7 w-7"
                  onClick={() => removeNewFile(index)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasNewFiles && (
        <div className="text-muted-foreground flex flex-1 items-center justify-center">
          <p>Selecciona imágenes para agregar al lote "{activeBatch.name}"</p>
        </div>
      )}
    </div>
  )
}
