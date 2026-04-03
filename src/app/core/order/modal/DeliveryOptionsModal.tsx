import { useCallback, useEffect, useState } from 'react'
import { XIcon } from '@phosphor-icons/react'
import DialogModal from '@/app/shared/ui/DialogModal'
import { Label } from '@/app/components/ui/label'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { DELIVERY_TIMES } from '@/app/shared/types/delivery'
import { useProductDeliveryOptions } from '@/app/shared/hooks/useProductDeliveryOptions'
import {
  getBatchDeliveryOptionsApi,
  saveBatchDeliveryOptionsApi,
  type BatchDeliveryOptionsPayload,
} from '../api/orderApi'

interface DeliveryOptionsModalProps {
  open: boolean
  batchId: number
  onClose: () => void
  onSaved: () => void
}

export function DeliveryOptionsModal({
  open,
  batchId,
  onClose,
  onSaved,
}: DeliveryOptionsModalProps) {
  const { formats, embedProfiles, bitDepths, colorModes } = useProductDeliveryOptions()

  const [deliveryTime, setDeliveryTime] = useState<string>('')
  const [format, setFormat] = useState('')
  const [embedProfile, setEmbedProfile] = useState('')
  const [bitDepth, setBitDepth] = useState('')
  const [colorMode, setColorMode] = useState('')
  const [resolution, setResolution] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [preserveMask, setPreserveMask] = useState(false)
  const [preserveLayers, setPreserveLayers] = useState(false)
  const [preserveOriginalLayer, setPreserveOriginalLayer] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    getBatchDeliveryOptionsApi(batchId)
      .send()
      .then((data) => {
        setDeliveryTime(data.delivery_time ?? '')
        setFormat(data.format ?? '')
        setEmbedProfile(data.embed_profile ?? '')
        setBitDepth(data.bit_depth ?? '')
        setColorMode(data.color_mode ?? '')
        setResolution(data.resolution ?? '')
        setWidth(data.dimension?.width ?? '')
        setHeight(data.dimension?.height ?? '')
        setPreserveMask(data.preserve_mask ?? false)
        setPreserveLayers(data.preserve_layers ?? false)
        setPreserveOriginalLayer(data.preserve_original_layer ?? false)
      })
      .catch(() => {})
  }, [open, batchId])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const payload: BatchDeliveryOptionsPayload = {
      delivery_time: deliveryTime || undefined,
      format: format || undefined,
      embed_profile: embedProfile || undefined,
      bit_depth: bitDepth || undefined,
      color_mode: colorMode || undefined,
      resolution: resolution || undefined,
      dimension: width && height ? { width, height } : null,
      preserve_mask: preserveMask,
      preserve_layers: preserveLayers,
      preserve_original_layer: preserveOriginalLayer,
    }
    await saveBatchDeliveryOptionsApi(batchId, payload).send()
    setSaving(false)
    onSaved()
    onClose()
  }, [
    batchId,
    deliveryTime,
    format,
    embedProfile,
    bitDepth,
    colorMode,
    resolution,
    width,
    height,
    preserveMask,
    preserveLayers,
    preserveOriginalLayer,
    onSaved,
    onClose,
  ])

  return (
    <DialogModal open={open} onClose={handleSave} title="Tiempo y Opciones de Entrega" size="xl">
      <div className="flex flex-col gap-6">
        {/* Tiempo de Entrega */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="flex-1 text-center text-sm font-bold text-neutral-600">
              Tiempo Estimado
            </span>
            <span className="flex-1 text-center text-sm font-bold text-neutral-600">Recargo</span>
          </div>
          <div className="flex flex-col">
            {DELIVERY_TIMES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setDeliveryTime(dt.value)}
                className={`flex h-10 cursor-pointer items-center rounded-lg transition-colors ${
                  deliveryTime === dt.value ? 'bg-neutral-200' : 'hover:bg-neutral-100'
                }`}
              >
                <span className="flex-1 text-center text-sm font-semibold text-neutral-600">
                  {dt.label.toLowerCase()}
                </span>
                <span className="flex-1 text-center text-sm font-semibold text-neutral-600">
                  {dt.surcharge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Opciones de Entrega */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Incrustar perfil</Label>
            <Select value={embedProfile} onValueChange={setEmbedProfile}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {embedProfiles.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Mapa de bits</Label>
            <Select value={bitDepth} onValueChange={setBitDepth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {bitDepths.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Modo de color</Label>
            <Select value={colorMode} onValueChange={setColorMode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {colorModes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Resolución</Label>
            <Input
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Resolución"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="font-raleway text-footer font-medium">Dimensiones</Label>
            <div className="flex items-center gap-2.5">
              <Input
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Ancho"
              />
              <XIcon size={16} className="shrink-0 text-neutral-400" />
              <Input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Alto"
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={preserveMask} onCheckedChange={(v) => setPreserveMask(!!v)} />
            <span className="text-sm font-medium">Conservar máscara de capas</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={preserveLayers} onCheckedChange={(v) => setPreserveLayers(!!v)} />
            <span className="text-sm font-medium">Preservar archivo en capas</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={preserveOriginalLayer}
              onCheckedChange={(v) => setPreserveOriginalLayer(!!v)}
            />
            <span className="text-sm font-medium">Preservar capa original</span>
          </label>
        </div>

        {saving && <div className="text-footer text-neutral-400">Guardando...</div>}
      </div>
    </DialogModal>
  )
}
