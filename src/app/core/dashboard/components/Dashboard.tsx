import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import {
  CaretLeftIcon,
  CaretRightIcon,
  CircleNotchIcon,
  CloudArrowUpIcon,
  LinkSimpleIcon,
  XIcon
} from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { getOrdersApi } from '@/app/core/order/api/ordersApi'
import type { Order } from '@/app/core/order/types/order'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Template from '@/app/components/Template'

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

export default function Dashboard() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [remoteUrl, setRemoteUrl] = useState('')
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [urlInputVisible, setUrlInputVisible] = useState(false)

  const { data } = useRequest(getOrdersApi(), { initialData: { orders: [] } })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const handlePreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const ordersByDay = useMemo(() => {
    const map: Record<number, Order[]> = {}
    if (!data?.orders) return map
    for (const order of data.orders) {
      if (!order.deadline) continue
      const d = new Date(order.deadline)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(order)
      }
    }
    return map
  }, [data, year, month])

  const calendarRows = useMemo(() => {
    const rows: { day: number; inMonth: boolean; orders: Order[] }[][] = []
    let row: { day: number; inMonth: boolean; orders: Order[] }[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      const d = prevMonthLastDay - startingDayOfWeek + 1 + i
      row.push({ day: d, inMonth: false, orders: [] })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      row.push({ day, inMonth: true, orders: ordersByDay[day] || [] })
      if (row.length === 7) {
        rows.push(row)
        row = []
      }
    }

    if (row.length > 0) {
      let nextDay = 1
      while (row.length < 7) {
        row.push({ day: nextDay++, inMonth: false, orders: [] })
      }
      rows.push(row)
    }

    return rows
  }, [startingDayOfWeek, daysInMonth, prevMonthLastDay, ordersByDay])

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const isValidUrl = useCallback((text: string) => {
    try {
      const url = new URL(text.trim())
      return url.protocol === 'https:' || url.protocol === 'http:'
    } catch {
      return false
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      // Check for dropped text (URL)
      const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list')
      if (droppedText && isValidUrl(droppedText)) {
        setRemoteUrl(droppedText.trim())
        setUrlInputVisible(true)
        return
      }

      // Otherwise handle as files
      const dropped = Array.from(e.dataTransfer.files)
      if (dropped.length > 0) {
        setFiles((prev) => [...prev, ...dropped])
      }
    },
    [isValidUrl],
  )

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }, [])

  const handleUrlSubmit = useCallback(async () => {
    if (!remoteUrl || !isValidUrl(remoteUrl)) {
      toast.error('URL no válida')
      return
    }

    setIsUrlLoading(true)
    try {
      // TODO: Llamar a POST /api/v1/uploads/from-url cuando el backend lo implemente
      // const response = await uploadFromUrlApi(remoteUrl)
      // setFiles(prev => [...prev, ...response.files])
      toast.error('Función en desarrollo — esperando endpoint backend')
    } finally {
      setIsUrlLoading(false)
    }
  }, [remoteUrl, isValidUrl])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const totalSize = useMemo(() => {
    const bytes = files.reduce((acc, f) => acc + f.size, 0)
    return (bytes / (1024 * 1024)).toFixed(1)
  }, [files])

  const getExtension = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || ''
    return ext
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection title="Dashboard" breadcrumbs={[{ label: 'Inicio' }]} />

        <div className="flex gap-4">
          {/* Calendar */}
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-white p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="flex size-12 items-center justify-center rounded-md"
                aria-label="Mes anterior"
              >
                <CaretLeftIcon />
              </button>
              <span className="text-body font-semibold text-neutral-600">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="flex size-12 items-center justify-center rounded-md"
                aria-label="Mes siguiente"
              >
                <CaretRightIcon />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex h-5.25 items-center justify-center text-body font-medium text-neutral-350"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex flex-1 flex-col">
              {calendarRows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid flex-1 grid-cols-7 pt-2">
                  {row.map((cell, cellIdx) => {
                    const isTodayCell = cell.inMonth && isToday(cell.day)
                    return (
                      <div
                        key={cellIdx}
                        className={`flex min-h-12 flex-col items-center gap-1 rounded-md p-1 ${
                          !cell.inMonth ? 'opacity-50' : ''
                        } ${isTodayCell ? 'rounded-md bg-blue-200 text-white' : ''} ${
                          cell.inMonth && !isTodayCell ? 'cursor-pointer hover:bg-neutral-100' : ''
                        }`}
                      >
                        <span
                          className={`text-body ${isTodayCell ? 'font-semibold text-white' : 'text-neutral-600'}`}
                        >
                          {cell.day}
                        </span>
                        {cell.orders.map((order) => (
                          <button
                            key={order.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                            }}
                            className={`w-full truncate rounded-md px-2 py-1.5 text-left text-footer ${
                              isTodayCell
                                ? 'bg-white text-neutral-600'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {order.number} - Pedido...
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* File upload card */}
          <div className="flex w-110 shrink-0 flex-col gap-4 rounded-2xl bg-white p-4">
            <h3 className="text-h3 font-semibold text-neutral-600">
              Sube tus archivos para crear un pedido
            </h3>

            {/* Drop zone */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-4xl border border-dashed border-neutral-400 p-6"
            >
              <CloudArrowUpIcon />
              <span className="text-body font-medium text-neutral-600">
                Arrastra archivos o una URL para añadir
              </span>
              <span className="text-footer text-neutral-300">
                WeTransfer, Google Drive, Dropbox...
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*"
              />
            </label>

            {/* URL input */}
            {urlInputVisible && (
              <div className="flex items-center gap-2 rounded-[10px] border border-neutral-400 p-2.5">
                <LinkSimpleIcon className="shrink-0 text-neutral-300" />
                <input
                  type="url"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text')
                    if (isValidUrl(pasted)) {
                      setRemoteUrl(pasted.trim())
                    }
                  }}
                  placeholder="https://we.tl/..."
                  className="min-w-0 flex-1 bg-transparent text-body text-neutral-600 outline-none placeholder:text-neutral-300"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={isUrlLoading || !remoteUrl}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-200 px-3 py-1.5 text-footer font-medium text-white disabled:opacity-50"
                >
                  {isUrlLoading ? (
                    <CircleNotchIcon className="animate-spin" />
                  ) : (
                    'Importar'
                  )}
                </button>
                <button
                  onClick={() => {
                    setUrlInputVisible(false)
                    setRemoteUrl('')
                  }}
                  className="text-neutral-300 hover:text-neutral-600"
                >
                  <XIcon />
                </button>
              </div>
            )}

            {/* Manual URL toggle */}
            {!urlInputVisible && (
              <button
                onClick={() => setUrlInputVisible(true)}
                className="flex items-center justify-center gap-1.5 text-footer font-medium text-blue-200 hover:underline"
              >
                <LinkSimpleIcon className="size-4" />
                Pegar enlace de descarga
              </button>
            )}

            {/* File count */}
            {files.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-footer font-semibold text-neutral-600">
                  {files.length} archivos
                </span>
                <span className="text-footer text-neutral-600">{totalSize} MB</span>
              </div>
            )}

            {/* File list */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-6 rounded-[10px] border border-neutral-400 p-2.5"
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ImagesSquare className="size-6" />
                      <span className="text-body font-semibold text-neutral-600">
                        {file.name.split('.')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="rounded-lg bg-blue-200 px-2.5 py-0.5 text-footer font-medium text-white">
                        {getExtension(file.name)}
                      </span>
                      <span className="text-footer text-neutral-600">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeFile(idx)} className="opacity-80">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Pedido #{selectedOrder?.number} - {selectedOrder?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-body">
              <div className="flex justify-between">
                <span className="text-neutral-300">Estado</span>
                <span className="font-medium">{selectedOrder?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Lotes</span>
                <span className="font-medium">{selectedOrder?.batches?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Imagenes</span>
                <span className="font-medium">{selectedOrder?.count ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Deadline</span>
                <span className="font-medium">
                  {selectedOrder?.deadline
                    ? new Date(selectedOrder.deadline).toLocaleString('es-ES', {
                        timeZone: 'Europe/Madrid',
                      })
                    : '-'}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => selectedOrder && navigate(`/orders/${selectedOrder.id}/edit`)}>
                Editar pedido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Template>
  )
}
