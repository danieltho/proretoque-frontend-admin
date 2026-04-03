import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DialogModal from '@/app/shared/ui/DialogModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Button } from '@/app/components/ui/button'
import {
  getOrderAdminBatchesApi,
  getBatchImagesApi,
  type BatchImage,
} from '../api/orderApi'
import type { OrderAdminBatch } from '../types/orderDetailType'
import { AssignProviderSheet } from './AssignProviderSheet'

interface AssignProviderModalProps {
  open: boolean
  onClose: () => void
  onAssigned: () => void
}

export function AssignProviderModal({ open, onClose, onAssigned }: AssignProviderModalProps) {
  const { id: orderId } = useParams<{ id: string }>()
  const [batches, setBatches] = useState<OrderAdminBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [images, setImages] = useState<BatchImage[]>([])
  const [totalImages, setTotalImages] = useState(0)
  const [unassigned, setUnassigned] = useState(0)
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(new Set())
  const [loadingImages, setLoadingImages] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Load batches on open
  useEffect(() => {
    if (!open || !orderId) return
    getOrderAdminBatchesApi(Number(orderId), 1, 'sort_order', 'asc')
      .send()
      .then((res) => {
        setBatches(res.batches)
        if (res.batches.length > 0) {
          setSelectedBatchId(String(res.batches[0].id))
        }
      })
  }, [open, orderId])

  // Load images when batch changes
  useEffect(() => {
    if (!selectedBatchId) return
    setLoadingImages(true)
    setSelectedImageIds(new Set())
    getBatchImagesApi(Number(selectedBatchId))
      .send()
      .then((res) => {
        setImages(res.images)
        setTotalImages(res.total)
        setUnassigned(res.unassigned)
      })
      .finally(() => setLoadingImages(false))
  }, [selectedBatchId])

  const toggleImage = useCallback((imageId: number) => {
    setSelectedImageIds((prev) => {
      const next = new Set(prev)
      if (next.has(imageId)) next.delete(imageId)
      else next.add(imageId)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedImageIds(new Set(images.map((img) => img.id)))
  }, [images])

  const handleClose = useCallback(() => {
    setBatches([])
    setSelectedBatchId('')
    setImages([])
    setSelectedImageIds(new Set())
    onClose()
  }, [onClose])

  const handleAssigned = useCallback(() => {
    setSheetOpen(false)
    setSelectedImageIds(new Set())
    // Reload images to reflect assignment
    if (selectedBatchId) {
      getBatchImagesApi(Number(selectedBatchId))
        .send()
        .then((res) => {
          setImages(res.images)
          setTotalImages(res.total)
          setUnassigned(res.unassigned)
        })
    }
    onAssigned()
  }, [selectedBatchId, onAssigned])

  return (
    <DialogModal open={open} onClose={handleClose} title="Asignar proveedores" size="fullScreen">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span>
          <span className="font-semibold">Total de archivos:</span> {totalImages}
        </span>
        <span>
          <span className="font-semibold">Sin asignar:</span> {unassigned}
        </span>
        <span>
          <span className="font-semibold">Archivos seleccionados:</span> {selectedImageIds.size}
        </span>
      </div>

      {/* Batch selector */}
      <div className="w-64">
        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar Lote" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={String(batch.id)}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Image grid */}
      {loadingImages ? (
        <div className="text-footer text-neutral-400">Cargando imágenes...</div>
      ) : (
        <div className="relative flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-4">
            {images.map((img) => {
              const isSelected = selectedImageIds.has(img.id)
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => toggleImage(img.id)}
                  className={`relative size-[100px] cursor-pointer overflow-hidden rounded-lg border-4 ${
                    isSelected ? 'border-blue-200' : 'border-white'
                  }`}
                >
                  <img
                    src={img.preview_url ?? img.url}
                    alt={img.file_name}
                    className="size-full object-cover"
                  />
                  <div
                    className={`absolute top-2 left-2 size-[30px] rounded-lg border-4 shadow-xs ${
                      isSelected
                        ? 'border-blue-200 bg-blue-200'
                        : 'border-white bg-white'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Bulk action bar */}
          {selectedImageIds.size > 0 && (
            <div className="sticky bottom-4 mx-auto flex w-fit items-center gap-2.5 rounded-2xl bg-white px-2.5 py-2 shadow-[10px_10px_30px_0px_rgba(69,132,255,0.4),-10px_-10px_30px_0px_rgba(69,132,255,0.2)]">
              <span className="text-footer text-neutral-600">
                {selectedImageIds.size} de {totalImages} seleccionados
              </span>
              <div className="h-5 w-px bg-neutral-300" />
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Seleccionar Todos
              </Button>
              <div className="h-5 w-px bg-neutral-300" />
              <Button variant="blue" size="sm" onClick={() => setSheetOpen(true)}>
                Asignar Proveedor
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Provider assignment sheet */}
      <AssignProviderSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        batchId={Number(selectedBatchId)}
        selectedImageIds={Array.from(selectedImageIds)}
        onAssigned={handleAssigned}
      />
    </DialogModal>
  )
}
