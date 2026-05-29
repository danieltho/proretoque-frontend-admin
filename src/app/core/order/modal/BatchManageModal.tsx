import { useCallback, useEffect, useRef, useState } from 'react'
import { PlusCircleIcon } from '@phosphor-icons/react'
import DialogModal from '@/app/shared/ui/DialogModal'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import DropZone from '@/app/shared/ui/DropZone'
import FileGridView from '@/app/shared/ui/FileGridView'
import { RetoquesModal } from './RetoquesModal'
import { DeliveryOptionsModal } from './DeliveryOptionsModal'
import {
  getBatchMediaApi,
  deleteBatchMediaApi,
  saveBatchMediaApi,
  getBatchDeliveryOptionsApi,
  getBatchRetouchesApi,
  type BatchMediaFile,
  type BatchRetouchItem,
} from '../api/orderApi'
import type { MediaCollection } from '@/app/shared/types/protocol'
import type { MediaItem } from '@/app/shared/types/media'
import { uploadTempMediaApi } from '@/app/shared/api/uploadApi'
import type { TempMedia } from '@/app/shared/types/protocol'

interface BatchInfo {
  id: number
  name: string
}

interface BatchManageModalProps {
  open: boolean
  batches: BatchInfo[]
  initialBatchId: number | null
  orderName: string
  orderNumber: string | number
  onClose: () => void
  onSaved: () => void
  onAddBatch: () => void
}

type TabKey = 'original' | 'resource' | 'example'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'original', label: 'Archivos a Retocar' },
  { key: 'resource', label: 'Recursos' },
  { key: 'example', label: 'Ejemplos' },
]

function mapToMediaItem(file: BatchMediaFile): MediaItem {
  return {
    id: file.id,
    src: file.preview_url ?? file.url,
    name: file.file_name,
    fileName: file.file_name,
    mimeType: file.mime_type,
    size: file.size,
  }
}

export function BatchManageModal({
  open,
  batches,
  initialBatchId,
  orderName,
  orderNumber,
  onClose,
  onSaved,
  onAddBatch,
}: BatchManageModalProps) {
  const [activeBatchId, setActiveBatchId] = useState<number | null>(initialBatchId)
  const [activeTab, setActiveTab] = useState<TabKey>('original')
  const [mediaByTab, setMediaByTab] = useState<Record<TabKey, MediaItem[]>>({
    original: [],
    resource: [],
    example: [],
  })
  const [retouchCount, setRetouchCount] = useState(0)
  const [deliveryBadges, setDeliveryBadges] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Sub-modals
  const [retoquesOpen, setRetoquesOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set initial batch
  useEffect(() => {
    if (open && initialBatchId) {
      setActiveBatchId(initialBatchId)
    }
  }, [open, initialBatchId])

  // Load batch data when active batch changes
  useEffect(() => {
    if (!open || !activeBatchId) return

    // Load media
    getBatchMediaApi(activeBatchId)
      .send()
      .then((data) => {
        setMediaByTab({
          original: (data.original ?? []).map(mapToMediaItem),
          resource: (data.resource ?? []).map(mapToMediaItem),
          example: (data.example ?? []).map(mapToMediaItem),
        })
      })
      .catch(() => setMediaByTab({ original: [], resource: [], example: [] }))

    // Load retouch count
    getBatchRetouchesApi(activeBatchId)
      .send()
      .then((res) => setRetouchCount(res.retouches?.length ?? 0))
      .catch(() => setRetouchCount(0))

    // Load delivery options for badges
    getBatchDeliveryOptionsApi(activeBatchId)
      .send()
      .then((data) => {
        const badges: string[] = []
        if (data.delivery_time) badges.push(data.delivery_time)
        if (data.format) badges.push(data.format)
        if (data.bit_depth) badges.push(data.bit_depth)
        if (data.color_mode) badges.push(data.color_mode)
        if (data.resolution) badges.push(data.resolution + 'ppp')
        if (data.preserve_mask) badges.push('Conservar mascara')
        if (data.preserve_layers) badges.push('Preservar archivo')
        if (data.embed_profile) badges.push(data.embed_profile)
        if (data.preserve_original_layer) badges.push('Preservar capa')
        setDeliveryBadges(badges)
      })
      .catch(() => setDeliveryBadges([]))
  }, [open, activeBatchId])

  const handleUploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !activeBatchId) return
      setUploading(true)

      const entries: { temp_id: string; file_name: string; collection: MediaCollection }[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('collection', activeTab)
        const result: TempMedia = await uploadTempMediaApi(formData).send()
        entries.push({ temp_id: result.temp_id, file_name: result.file_name, collection: activeTab })
      }

      if (entries.length > 0) {
        await saveBatchMediaApi(activeBatchId, entries).send()
        // Refresh media
        const data = await getBatchMediaApi(activeBatchId).send()
        setMediaByTab({
          original: (data.original ?? []).map(mapToMediaItem),
          resource: (data.resource ?? []).map(mapToMediaItem),
          example: (data.example ?? []).map(mapToMediaItem),
        })
      }
      setUploading(false)
    },
    [activeBatchId, activeTab],
  )

  const handleRemoveMedia = useCallback(
    async (index: number) => {
      if (!activeBatchId) return
      const item = mediaByTab[activeTab][index]
      if (!item?.id) return
      await deleteBatchMediaApi(activeBatchId, item.id).send()
      setMediaByTab((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((_, i) => i !== index),
      }))
    },
    [activeBatchId, activeTab, mediaByTab],
  )

  const totalFiles = mediaByTab.original.length
  const currentTabFiles = mediaByTab[activeTab]

  const handleRefreshBatch = useCallback(() => {
    // Re-trigger load
    setActiveBatchId((prev) => {
      if (prev) {
        // Force re-load by toggling
        setTimeout(() => setActiveBatchId(prev), 0)
      }
      return null
    })
    onSaved()
  }, [onSaved])

  if (!activeBatchId) return null

  return (
    <>
      <DialogModal
        open={open}
        onClose={onClose}
        title=""
        size="fullScreen"
        showCloseButton={false}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-hidden font-raleway">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Lotes /</span>
              <span className="text-body text-muted-foreground">
                {orderName} #{orderNumber}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="blue" size="sm" onClick={onClose}>
                Guardar
              </Button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-4 text-body">
            <span>
              <span className="font-semibold">Archivos a retocar:</span> {totalFiles}
            </span>
            <span>
              <span className="font-semibold">Retoques:</span> {retouchCount}
            </span>
            <span className="font-semibold">Tiempos y Opciones de Entrega</span>
          </div>

          {/* Delivery badges */}
          {deliveryBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deliveryBadges.map((badge) => (
                <Badge
                  key={badge}
                  className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-footer font-medium text-blue-200"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Batch selector row */}
          <div className="flex items-center gap-4">
            <Select
              value={String(activeBatchId)}
              onValueChange={(val) => setActiveBatchId(Number(val))}
            >
              <SelectTrigger className="w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              className="cursor-pointer text-neutral-600 hover:text-neutral-350"
              onClick={onAddBatch}
            >
              <PlusCircleIcon className="size-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-2.5 overflow-hidden">
            {/* Upload link */}
            <button
              type="button"
              className="cursor-pointer self-start text-footer text-blue-300 underline"
              onClick={() => fileInputRef.current?.click()}
            >
              {currentTabFiles.length > 0
                ? 'Para subir mas imagenes, haz clic aqui.'
                : 'Para subir imagenes, haz clic aqui.'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleUploadFiles(e.target.files)
                e.target.value = ''
              }}
            />

            {/* Tab bar */}
            <div className="flex items-center gap-6 border-b border-neutral-200">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`cursor-pointer border-b-2 pb-2 text-body font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-200 text-blue-200'
                      : 'border-transparent text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {currentTabFiles.length > 0 ? (
                <FileGridView
                  items={currentTabFiles}
                  onRemove={handleRemoveMedia}
                />
              ) : (
                <DropZone onFilesAdded={handleUploadFiles} />
              )}
            </div>

            {uploading && (
              <div className="text-footer text-neutral-400">Subiendo archivos...</div>
            )}
          </div>

          {/* Floating action bar */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeliveryOpen(true)}
            >
              Asignar Tiempo y Opciones de Entrega
            </Button>
            <div className="h-6 w-px bg-neutral-200" />
            <Button
              variant="blue"
              size="sm"
              onClick={() => setRetoquesOpen(true)}
            >
              Asignar Retoques
            </Button>
          </div>
        </div>
      </DialogModal>

      {/* Sub-modals */}
      <RetoquesModal
        open={retoquesOpen}
        batchId={activeBatchId}
        onClose={() => setRetoquesOpen(false)}
        onSaved={handleRefreshBatch}
      />
      <DeliveryOptionsModal
        open={deliveryOpen}
        batchId={activeBatchId}
        onClose={() => setDeliveryOpen(false)}
        onSaved={handleRefreshBatch}
      />
    </>
  )
}
