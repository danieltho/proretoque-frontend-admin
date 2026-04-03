import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CaretLeftIcon } from '@phosphor-icons/react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Button } from '@/app/components/ui/button'
import { DataTable } from '@/app/components/ui/data-table'
import { getProvidersApi } from '@/app/core/provider/api/providerApi'
import {
  getBatchRetouchesApi,
  assignProviderApi,
  type BatchRetouchItem,
} from '../api/orderApi'
import type { ColumnDef } from '@tanstack/react-table'

interface AssignProviderSheetProps {
  open: boolean
  onClose: () => void
  batchId: number
  selectedImageIds: number[]
  onAssigned: () => void
}

interface ProviderOption {
  id: number
  label: string
}

export function AssignProviderSheet({
  open,
  onClose,
  batchId,
  selectedImageIds,
  onAssigned,
}: AssignProviderSheetProps) {
  const { id: orderId } = useParams<{ id: string }>()
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [costPerPhoto, setCostPerPhoto] = useState('')
  const [extraCost, setExtraCost] = useState('')
  const [retouches, setRetouches] = useState<BatchRetouchItem[]>([])
  const [selectedRetouchIds, setSelectedRetouchIds] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  // Load providers
  useEffect(() => {
    if (!open) return
    getProvidersApi(1, '')
      .send()
      .then((res) => {
        setProviders(
          res.providers.map((p) => ({
            id: p.id,
            label: `${p.firstname} ${p.lastname}`,
          })),
        )
      })
  }, [open])

  // Load retouches from batch (all checked by default)
  useEffect(() => {
    if (!open || !batchId) return
    getBatchRetouchesApi(batchId)
      .send()
      .then((res) => {
        setRetouches(res.retouches)
        setSelectedRetouchIds(new Set(res.retouches.map((r) => r.id)))
      })
      .catch(() => setRetouches([]))
  }, [open, batchId])

  const toggleRetouch = useCallback((id: number) => {
    setSelectedRetouchIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (selectedRetouchIds.size === retouches.length) {
      setSelectedRetouchIds(new Set())
    } else {
      setSelectedRetouchIds(new Set(retouches.map((r) => r.id)))
    }
  }, [retouches, selectedRetouchIds.size])

  const handleConfirm = useCallback(async () => {
    if (!orderId || !selectedProviderId) return
    setSaving(true)
    await assignProviderApi(Number(orderId), {
      provider_id: Number(selectedProviderId),
      batch_id: batchId,
      image_ids: selectedImageIds,
      retouch_ids: Array.from(selectedRetouchIds),
      cost_per_photo: costPerPhoto ? Number(costPerPhoto) : null,
      extra_cost: extraCost ? Number(extraCost) : null,
    }).send()
    setSaving(false)
    setSelectedProviderId('')
    setCostPerPhoto('')
    setExtraCost('')
    setSelectedRetouchIds(new Set())
    onAssigned()
  }, [
    orderId,
    selectedProviderId,
    batchId,
    selectedImageIds,
    selectedRetouchIds,
    costPerPhoto,
    extraCost,
    onAssigned,
  ])

  const columns: ColumnDef<BatchRetouchItem>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedRetouchIds.size === retouches.length && retouches.length > 0}
          onCheckedChange={toggleAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRetouchIds.has(row.original.id)}
          onCheckedChange={() => toggleRetouch(row.original.id)}
        />
      ),
      size: 30,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">RETOQUE</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: () => <span className="text-footer font-medium text-blue-200">TIPO</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.type}</span>
      ),
    },
    {
      accessorKey: 'duration',
      header: () => <span className="text-footer font-medium text-blue-200">TIEMPO</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.duration}</span>
      ),
    },
  ]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <button
            type="button"
            className="cursor-pointer text-neutral-600"
            onClick={onClose}
          >
            <CaretLeftIcon size={24} />
          </button>
          <SheetTitle className="sr-only">Asignar proveedor</SheetTitle>
          <Button variant="blue" onClick={handleConfirm} disabled={!selectedProviderId || saving}>
            {saving ? 'Guardando...' : 'Confirmar'}
          </Button>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {/* Provider selector + costs */}
          <div className="flex items-end gap-4">
            <div className="flex w-[250px] flex-col gap-3">
              <span className="text-sm font-semibold">Proveedor</span>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <span className="text-sm font-semibold">Costo por foto</span>
              <Input
                value={costPerPhoto}
                onChange={(e) => setCostPerPhoto(e.target.value)}
                placeholder="Indicar..."
                type="number"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <span className="text-sm font-semibold">Costo extra</span>
              <Input
                value={extraCost}
                onChange={(e) => setExtraCost(e.target.value)}
                placeholder="Indicar..."
                type="number"
              />
            </div>
          </div>

          {/* Retouches table */}
          <DataTable columns={columns} data={retouches} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
