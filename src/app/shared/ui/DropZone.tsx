import { useRef } from 'react'
import { CloudArrowUpIcon } from '@phosphor-icons/react'

interface DropZoneProps {
  onFilesAdded: (files: FileList | null) => void
  hasFiles?: boolean
}

export default function DropZone({ onFilesAdded, hasFiles = false }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        className="hover:border-primary/50 flex shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onFilesAdded(e.dataTransfer.files)
        }}
      >
        <CloudArrowUpIcon
          className={`text-muted-foreground ${hasFiles ? 'mb-1' : 'mb-3'}`}
          size={64}
          weight="thin"
        />
        <p className={`text-base font-medium`}>{hasFiles ? 'Agregar' : 'Arrastra'} archivos aquí</p>
        {!hasFiles && (
          <p className="text-muted-foreground text-xs">o haz clic para seleccionar archivos</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onFilesAdded(e.target.files)
          e.target.value = ''
        }}
      />
    </>
  )
}
