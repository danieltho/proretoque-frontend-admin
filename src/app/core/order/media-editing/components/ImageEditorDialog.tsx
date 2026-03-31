import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { usePhotoEditor } from '../hooks/usePhotoEditor'
import { getCroppedImage } from '../utils/cropImage'
import { updateMediaApi } from '../../api/batchesApi'
import type { Media } from '../../types/order'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Slider } from '@/app/components/ui/slider'
import {
  CircleNotch,
  ArrowClockwise,
  FlipHorizontal,
  FlipVertical,
  Sun,
  CircleHalf,
  Drop,
  Crop,
  SlidersHorizontal,
} from '@phosphor-icons/react'

type Step = 'crop' | 'adjust'

interface Props {
  open: boolean
  onClose: () => void
  media: Media
  batchId: number
  onSaved: () => void
}

export default function ImageEditorDialog({ open, onClose, media, batchId, onSaved }: Props) {
  const [step, setStep] = useState<Step>('crop')
  const [saving, setSaving] = useState(false)

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // File for photo editor (generated after crop step)
  const [editFile, setEditFile] = useState<File | undefined>(undefined)

  const {
    canvasRef,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturate,
    setSaturate,
    flipHorizontal,
    setFlipHorizontal,
    flipVertical,
    setFlipVertical,
    generateEditedFile,
    resetFilters,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
  } = usePhotoEditor({ file: editFile })

  // Reset crop state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('crop')
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedAreaPixels(null)
      setEditFile(undefined)
      setSaving(false)
    }
  }, [open])

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleNextStep = async () => {
    if (!croppedAreaPixels) return
    const file = await getCroppedImage(media.url, croppedAreaPixels, rotation, media.file_name)
    setEditFile(file)
    setStep('adjust')
  }

  const handleSkipCrop = async () => {
    // Convertir la imagen original a File sin recortar
    const res = await fetch(media.url)
    const blob = await res.blob()
    const file = new File([blob], media.file_name, { type: blob.type })
    setEditFile(file)
    setStep('adjust')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const editedFile = await generateEditedFile()
      if (!editedFile) return

      const formData = new FormData()
      formData.append('image', editedFile)
      await updateMediaApi(batchId, media.id, formData).send()
      onSaved()
      onClose()
    } catch {
      // Error al guardar
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'crop' ? (
              <>
                <Crop className="h-5 w-5" /> Recortar imagen
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-5 w-5" /> Ajustar imagen
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'crop' && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="bg-muted relative h-[400px] overflow-hidden rounded-md">
              <Cropper
                image={media.url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground w-16 text-sm">Zoom</span>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground w-16 text-sm">Rotar</span>
              <Slider
                min={0}
                max={360}
                step={1}
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <ArrowClockwise className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'adjust' && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="bg-muted flex justify-center overflow-hidden rounded-md p-2">
              <canvas
                ref={canvasRef}
                className="max-h-[350px] max-w-full object-contain"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
                onWheel={handleWheel}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Sun className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="w-20 text-sm">Brillo</span>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[brightness]}
                  onValueChange={([v]) => setBrightness(v)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <CircleHalf className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="w-20 text-sm">Contraste</span>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[contrast]}
                  onValueChange={([v]) => setContrast(v)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Drop className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="w-20 text-sm">Saturación</span>
                <Slider
                  min={0}
                  max={200}
                  step={1}
                  value={[saturate]}
                  onValueChange={([v]) => setSaturate(v)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={flipHorizontal ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipHorizontal((v) => !v)}
                >
                  <FlipHorizontal className="mr-1 h-4 w-4" /> Horizontal
                </Button>
                <Button
                  variant={flipVertical ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipVertical((v) => !v)}
                >
                  <FlipVertical className="mr-1 h-4 w-4" /> Vertical
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'crop' && (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="outline" onClick={handleSkipCrop}>
                Saltar recorte
              </Button>
              <Button onClick={handleNextStep}>Siguiente</Button>
            </>
          )}
          {step === 'adjust' && (
            <>
              <Button variant="ghost" onClick={() => setStep('crop')}>
                Volver
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Resetear
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
