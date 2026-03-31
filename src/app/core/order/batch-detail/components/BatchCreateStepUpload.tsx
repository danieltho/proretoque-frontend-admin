import { useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Upload, X } from '@phosphor-icons/react'

interface BatchCreateStepUploadProps {
  files: File[]
  previews: string[]
  canGoNext: boolean
  onNext: () => void
  onBack: () => void
  onFilesChange: (files: FileList | null) => void
  onRemoveFile: (index: number) => void
}

export default function BatchCreateStepUpload({
  files,
  previews,
  canGoNext,
  onNext,
  onBack,
  onFilesChange,
  onRemoveFile,
}: BatchCreateStepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    onFilesChange(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesChange(e.target.files)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div className="space-y-6">
      <Card
        className="hover:border-primary/50 cursor-pointer border-2 border-dashed transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="text-muted-foreground mb-4 h-10 w-10" />
          <div className="text-center">
            <p className="text-lg font-medium">
              Arrastra imágenes aquí o haz clic para seleccionar archivos
            </p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/tiff,image/webp,.jpg,.jpeg,.png,.tiff,.tif,.webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {files.length} imágenes &middot; {formatSize(totalSize)}
            </p>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Agregar más
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {previews.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-md border"
              >
                <img src={src} alt={files[i].name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(i)
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="absolute right-0 bottom-0 left-0 truncate bg-black/60 px-1 py-0.5 text-xs text-white">
                  {formatSize(files[i].size)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={onNext} disabled={!canGoNext}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
