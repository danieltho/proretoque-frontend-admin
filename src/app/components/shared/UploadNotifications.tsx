import { useState, useRef, useEffect } from 'react'
import { useUploadStore } from '@/app/stores/uploadStore'
import {
  CheckCircleIcon,
  CircleNotchIcon,
  WarningCircleIcon,
  XIcon,
  CloudArrowUpIcon,
} from '@phosphor-icons/react'
import { getBatchProgressApi } from '@/app/core/order/api/batchesApi'

export default function UploadNotifications() {
  const tasks = useUploadStore((s) => s.tasks)
  const removeTask = useUploadStore((s) => s.removeTask)
  const clearCompleted = useUploadStore((s) => s.clearCompleted)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeTasks = tasks.filter((t) => t.status === 'uploading' || t.status === 'processing')
  const hasProcessingTasks = tasks.some((t) => t.status === 'processing' && t.batchId)

  // Polling para cerrar el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Actualiza el progreso de las tareas en proceso cada 3s. El intervalo lee el
  // estado vivo del store con getState(), por lo que se mantiene estable y solo
  // se re-crea cuando aparece/desaparece alguna tarea en proceso (no en cada
  // actualización de progreso).
  useEffect(() => {
    if (!hasProcessingTasks) return

    const interval = setInterval(async () => {
      const { tasks, updateTask } = useUploadStore.getState()
      const processingTasks = tasks.filter((t) => t.status === 'processing' && t.batchId)
      for (const task of processingTasks) {
        try {
          const res = await getBatchProgressApi(task.batchId!).send()
          if (res.finished) {
            updateTask(task.id, { status: 'completed', progress: 100 })
          } else {
            updateTask(task.id, { progress: res.progress })
          }
        } catch {
          // ignorar errores de polling
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [hasProcessingTasks])

  return (
    <div className="relative" ref={ref}>
      <button aria-label="Notificaciones" className="relative cursor-pointer">
        <CloudArrowUpIcon />
        {activeTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-blue-500  text-white">
            {activeTasks.length}
          </span>
        )}
      </button>

      {open && tasks.length > 0 && (
        <div className="bg-popover absolute top-full right-0 z-50 mt-2 w-80 rounded-md border shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-medium">Subidas</p>
            {tasks.some((t) => t.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="border-b px-3 py-2 last:border-0">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex-1 truncate text-sm">{task.name}</span>
                  <div className="ml-2 flex items-center gap-1">
                    {task.status === 'uploading' && (
                      <CircleNotchIcon className="animate-spin text-blue-500" />
                    )}
                    {task.status === 'processing' && (
                      <CircleNotchIcon className="animate-spin text-orange-500" />
                    )}
                    {task.status === 'completed' && <CheckCircleIcon className=" text-green-500" />}
                    {task.status === 'error' && <WarningCircleIcon className="text-destructive" />}
                    <button onClick={() => removeTask(task.id)}>
                      <XIcon className="text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
                {(task.status === 'uploading' || task.status === 'processing') && (
                  <div className="bg-muted h-1.5 w-full rounded-full">
                    <div
                      className={`h-1.5 rounded-full transition-all ${task.status === 'uploading' ? 'bg-blue-500' : 'bg-orange-500'}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.status === 'uploading' && (
                  <p className="text-muted-foreground mt-1 text-xs">Subiendo... {task.progress}%</p>
                )}
                {task.status === 'processing' && (
                  <p className="text-muted-foreground mt-1 text-xs">Procesando...</p>
                )}
                {task.status === 'error' && task.error && (
                  <p className="text-destructive mt-1 text-xs">{task.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
