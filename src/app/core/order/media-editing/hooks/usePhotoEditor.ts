import { useRef, useState, useEffect, useCallback } from 'react'

interface UsePhotoEditorOptions {
  file?: File
  defaultBrightness?: number
  defaultContrast?: number
  defaultSaturate?: number
}

export function usePhotoEditor({
  file,
  defaultBrightness = 100,
  defaultContrast = 100,
  defaultSaturate = 100,
}: UsePhotoEditorOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef(new Image())

  const [imageSrc, setImageSrc] = useState('')
  const [brightness, setBrightness] = useState(defaultBrightness)
  const [contrast, setContrast] = useState(defaultContrast)
  const [saturate, setSaturate] = useState(defaultSaturate)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  // Create object URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageSrc(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  // Render canvas whenever relevant state changes
  const applyFilter = useCallback(() => {
    if (!imageSrc) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    img.src = imageSrc
    img.onload = () => {
      if (!canvas || !ctx) return
      const w = img.width * zoom
      const h = img.height * zoom
      const dx = (img.width - w) / 2
      const dy = (img.height - h) / 2

      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`
      ctx.save()

      if (flipHorizontal) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }
      if (flipVertical) {
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
      }

      ctx.translate(dx + offsetX, dy + offsetY)
      ctx.scale(zoom, zoom)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.restore()
      ctx.filter = 'none'
    }
  }, [
    imageSrc,
    brightness,
    contrast,
    saturate,
    flipHorizontal,
    flipVertical,
    zoom,
    offsetX,
    offsetY,
  ])

  useEffect(() => {
    applyFilter()
  }, [applyFilter])

  const generateEditedFile = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas || !file) {
        resolve(null)
        return
      }
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      let mimeType: string
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg'
          break
        default:
          mimeType = 'image/png'
      }
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: blob.type }))
        } else {
          resolve(null)
        }
      }, mimeType)
    })
  }, [file])

  const resetFilters = useCallback(() => {
    setBrightness(defaultBrightness)
    setContrast(defaultContrast)
    setSaturate(defaultSaturate)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setZoom(1)
    setOffsetX(0)
    setOffsetY(0)
    setPanStart(null)
    setIsDragging(false)
  }, [defaultBrightness, defaultContrast, defaultSaturate])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      const sx = e.clientX - (flipHorizontal ? -offsetX : offsetX)
      const sy = e.clientY - (flipVertical ? -offsetY : offsetY)
      setPanStart({ x: sx, y: sy })
    },
    [flipHorizontal, flipVertical, offsetX, offsetY],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging && panStart) {
        e.preventDefault()
        const dx = e.clientX - panStart.x
        const dy = e.clientY - panStart.y
        setOffsetX(flipHorizontal ? -dx : dx)
        setOffsetY(flipVertical ? -dy : dy)
      }
    },
    [isDragging, panStart, flipHorizontal, flipVertical],
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom((z) => z + 0.1)
    } else {
      setZoom((z) => Math.max(z - 0.1, 0.1))
    }
  }, [])

  return {
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
    zoom,
    setZoom,
    generateEditedFile,
    resetFilters,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
  }
}
