import { useEffect, useMemo, useRef } from 'react'
import { CloudArrowUp, ArrowSquareOut, X } from '@phosphor-icons/react'
import { formatSize } from '@/customers/orders/types/batch'

interface FilesCardProps {
  title: string
  files: File[]
  onFilesAdded?: (files: FileList | null) => void
  onRemove?: (index: number) => void
  onPreview?: (index: number) => void
  accept?: string
}

function getExtension(file: File): string {
  const ext = file.name.split('.').pop() ?? ''
  return ext.toUpperCase()
}

export default function FilesCard({
  title,
  files,
  onFilesAdded,
  onRemove,
  onPreview,
  accept = 'image/*',
}: FilesCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-[#b4b3b3] p-6">
      <h3 className="font-raleway text-[22px] font-medium leading-[26.4px]">{title}</h3>

      <div className="flex flex-col gap-4">
        {onFilesAdded && (
          <>
            <div
              role="button"
              tabIndex={0}
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] border border-dashed border-[#696867] p-6"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onFilesAdded(e.dataTransfer.files)
              }}
            >
              <CloudArrowUp className="size-8" />
              <p className="font-raleway text-base font-medium">Arrastra archivos aquí</p>
              <p className="font-raleway text-sm font-medium text-[#696867]">
                o haz clic para añadir
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={(e) => {
                onFilesAdded(e.target.files)
                e.target.value = ''
              }}
            />
          </>
        )}

        {files.length > 0 && (
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left font-raleway text-sm font-semibold">Nombre</th>
                <th className="p-2 text-left font-raleway text-sm font-semibold">Tipo</th>
                <th className="p-2 text-left font-raleway text-sm font-semibold">Tamaño</th>
                {(onPreview || onRemove) && <th className="w-20 p-2" />}
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="flex items-center gap-2.5 p-2">
                    {file.type.startsWith('image/') && (
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="h-[33px] w-[50px] shrink-0 rounded-[5px] object-cover"
                      />
                    )}
                    <span className="font-raleway text-sm font-medium">{file.name}</span>
                  </td>
                  <td className="p-2 font-raleway text-sm font-medium">{getExtension(file)}</td>
                  <td className="p-2 font-raleway text-sm font-medium">{formatSize(file.size)}</td>
                  {(onPreview || onRemove) && (
                    <td className="p-2">
                      <div className="flex items-center justify-end gap-1">
                        {onPreview && (
                          <button
                            type="button"
                            onClick={() => onPreview(index)}
                            className="cursor-pointer"
                            aria-label="Ver archivo"
                          >
                            <ArrowSquareOut className="size-6" />
                          </button>
                        )}
                        {onRemove && (
                          <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="cursor-pointer"
                            aria-label="Eliminar archivo"
                          >
                            <X className="size-6" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
