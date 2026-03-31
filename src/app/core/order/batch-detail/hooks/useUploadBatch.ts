import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUploadStore } from '@/app/stores/uploadStore'
import { uploadWithProgress } from '../../utils/uploadWithProgress'
import { createOrderApi } from '../../api/ordersApi'

export function useUploadBatch(orderId: string | undefined) {
  const navigate = useNavigate()
  const { addTask, updateTask } = useUploadStore()
  const [uploading, setUploading] = useState(false)

  const upload = async (files: File[]) => {
    if (files.length === 0) return
    setUploading(true)

    let resolvedOrderId = orderId

    // Si no hay orderId, primero crear el pedido
    if (!resolvedOrderId) {
      try {
        const order = await createOrderApi({ name: 'Nueva pedido' }).send()
        resolvedOrderId = String(order.id)
      } catch (err) {
        setUploading(false)
        throw err
      }
    }

    const taskId = crypto.randomUUID()
    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))

    addTask({
      id: taskId,
      name: `${files.length} imágenes`,
      progress: 0,
      status: 'uploading',
    })

    uploadWithProgress(`/orders/${resolvedOrderId}/batch`, formData, (percent) =>
      updateTask(taskId, { progress: percent }),
    )
      .then((res) => {
        updateTask(taskId, {
          status: 'processing',
          progress: 0,
          batchId: res.batch.id,
        })
        navigate(`/orders/${resolvedOrderId}`)
      })
      .catch((err) => {
        updateTask(taskId, { status: 'error', error: err.message })
        setUploading(false)
      })
  }

  return { upload, uploading }
}
