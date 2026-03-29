import { memo, useCallback, useRef } from 'react'
import type { CropperRef } from 'react-advanced-cropper'
import { Cropper } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { Button } from '@/components/ui/button'

interface ImageEditorDialogProps {
  open: boolean
  file: File
  preview: string
  onClose: () => void
  onSave: (editedFile: File) => void
}

function ImageEditorDialog({ open, file, preview, onClose, onSave }: ImageEditorDialogProps) {
  const cropperRef = useRef<CropperRef>(null)

  const handleSave = useCallback(() => {
    const canvas = cropperRef.current?.getCanvas()
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const binary = atob(dataUrl.split(',')[1])
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const editedFile = new File([bytes], file.name, { type: 'image/png' })
    onSave(editedFile)
  }, [file.name, onSave])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col h-[90vh] w-[90vw] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b">
          <Button size="sm" onClick={handleSave}>
            Guardar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0">
            <Cropper ref={cropperRef} src={preview} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ImageEditorDialog)
